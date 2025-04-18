from rest_framework import serializers
from ..models import Report, Department
from datetime import datetime
from firebase_admin import storage
from app.firebase import db, bucket
from django.core.files.base import ContentFile
import uuid
import base64
from django.contrib.auth import get_user_model
from math import radians, sin, cos, sqrt, atan2
from django.utils.timezone import now, timedelta
from geopy.distance import geodesic
import logging
import time
import math
User = get_user_model()

DUPLICATE_RADIUS_KM = 0.05
EMERGENCY_THRESHOLD_MINUTES = 60
NON_EMERGENCY_THRESHOLD_DAYS = 2
IMAGE_UPLOAD_PATH = "images_report/"

logger = logging.getLogger(__name__)

class AddReportSerializer(serializers.ModelSerializer):
    image_path = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Report
        fields = ['report_id','type_of_report', 'report_description', 'longitude', 'latitude', 'is_emergency', 'image_path', 'custom_type', 'floor_number', 'location', 'force_submit']

    @staticmethod
    def calculate_distance(lat1, lon1, lat2, lon2):
        """Calculate the Haversine distance between two points."""
        return geodesic((lat1, lon1), (lat2, lon2)).kilometers

    def check_duplicate_reports(self, validated_data):
        """Check for duplicate reports within a certain radius and time."""
        report_lat = float(validated_data['latitude'])
        report_lon = float(validated_data['longitude'])
        report_type = validated_data['type_of_report']

        is_emergency = validated_data["is_emergency"]

        time_threshold = (
            now() - timedelta(minutes=EMERGENCY_THRESHOLD_MINUTES)
            if is_emergency == "emergency"
            else now() - timedelta(days=NON_EMERGENCY_THRESHOLD_DAYS)
        )
        
        

        # Query Firestore for recent reports of the same type
        collection_path = "reports"
        document_id = report_type.lower()
        doc_ref = db.collection(collection_path).document(document_id)
        recent_reports = doc_ref.collection("reports").where(
            "report_date", ">=", time_threshold.isoformat()
        ).stream()

        for report in recent_reports:
            report_data = report.to_dict()
            existing_lat = float(report_data["latitude"])
            existing_lon = float(report_data["longitude"])

            # Calculate distance to detect duplicates
            distance = self.calculate_distance(report_lat, report_lon, existing_lat, existing_lon)
            if distance <= DUPLICATE_RADIUS_KM:
                return True, report_data

        return False, None

    def validate_image_path(self, value):
        """Ensure image_path is a valid base64 string."""
        if value and not isinstance(value, str):
            raise serializers.ValidationError("Image path must be a valid string.")
        return value
    
    def process_image_upload(self, image_data, report_uuid):
        """Process and upload the image to Firebase."""
        try:
            image_format, imgstr = image_data.split(";base64,")
            ext = image_format.split("/")[-1]
            image_file = ContentFile(base64.b64decode(imgstr), name=f"{report_uuid}.{ext}")
            bucket = storage.bucket()
            image_blob = bucket.blob(f"{IMAGE_UPLOAD_PATH}{report_uuid}.{ext}")
            image_blob.upload_from_file(image_file)
            image_blob.make_public()
            return image_blob.public_url
        except Exception as e:
            logger.error(f"Image upload failed: {e}")
            raise serializers.ValidationError({"detail": "Failed to upload image."})
        
    def create(self, validated_data):
        try:
            start_checking_duplicate = time.time()
            is_duplicate, duplicate_report = self.check_duplicate_reports(validated_data)
            end_checking_duplicate = time.time()
            print(f"Checking for duplicates took {end_checking_duplicate - start_checking_duplicate} seconds.")  # Debugging
            user = self.context['request'].user
            force_submit = validated_data.get('force_submit', "false")
            print("FORECE_SUBMIT: ", validated_data.get('force_submit'))
            force_submit = str(force_submit).lower() == "true"
            if is_duplicate:
                # Check if the same user submitted the report
                user_ids = duplicate_report.get('user_ids', [])
                if isinstance(user_ids, str):
                    try:
                        user_ids = eval(user_ids)
                    except:
                        raise serializers.ValidationError({
                            "detail": "Invalid 'user_ids' format in duplicate report."
                        })
                
                if user.id in [int(id) for id in user_ids]:
                    raise serializers.ValidationError({
                        "detail": "You've already reported or verified this incident.",
                        "existing_report": duplicate_report
                    })
                else:
                    # Handle forced submission for duplicates
                    if force_submit:
                        report_id = duplicate_report.get('report_id')
                        if not report_id:
                            raise serializers.ValidationError({
                                "detail": "The duplicate report is missing a 'report_id'.",
                                "duplicate_report": duplicate_report
                            })
                        
                        # Increment the report count
                        report_count = int(duplicate_report.get('report_count', 1)) + 1
                        collection_path = 'reports'
                        document_id = validated_data['type_of_report'].lower()

                        try:
                            doc_ref = db.collection(collection_path).document(document_id)
                            report_ref = doc_ref.collection('reports').document(report_id)

                            existing_report = report_ref.get()
                            if existing_report.exists:
                                existing_data = existing_report.to_dict()
                                user_ids = existing_data.get('user_ids', [])
                                if user.id not in user_ids:
                                    user_ids.append(user.id)
                                usernames = existing_data.get('usernames', [])
                                if user.username not in usernames:
                                    usernames.append(user.username)
                                report_ref.update({
                                    'report_count': report_count,
                                    'usernames': usernames,
                                    'user_ids': user_ids,
                                })
                                validation_ref = report_ref.collection('validation').document(str(user.id))
                                validation_data = {
                                    'user_id': user.id,
                                    'validated': "validated",
                                }
                                validation_ref.set(validation_data)
                            validated_data['report_count'] = report_count
                            return duplicate_report

                        except Exception as e:
                            raise serializers.ValidationError({
                                "detail": "Failed to update the existing report in Firestore.",
                                "error": str(e)
                            })
                    else:
                        raise serializers.ValidationError({
                            "detail": "A similar report already exists.",
                            "existing_report": duplicate_report
                        })
            print("isEmeregency1: ", validated_data['is_emergency'])           
            
           
            report_lat = validated_data['latitude']
            report_lon = validated_data['longitude']
            report_type = validated_data['type_of_report']
            print(f"Report details - Latitude: {report_lat}, Longitude: {report_lon}, Type: {report_type}")  # Debugging

                # Map report type to department ID
            report_type_to_department_id = {
                "Fire Accident": 1,
                "Flood": 6,
                "Road Accident": 3,
                "Street Light": 4,
                "Fallen Tree": 7,
                "Pothole": 5,     
                "Others": 6       
            }
                
            target_department_id = report_type_to_department_id.get(report_type)
            print(f"Target Department ID: {target_department_id}")  # Debugging

            if not target_department_id:
                raise serializers.ValidationError({"detail": f"Unknown report type: {report_type}"})

                # Filter for department admins
            start_find_admins = time.time()
            department_admins = User.objects.filter(
                    role='department_admin',
                    department_id=target_department_id
            ).values('id', 'station_address', 'username')
            end_find_admins = time.time()
            print(f"Finding admins took {end_find_admins - start_find_admins} seconds.")  # Debugging
            print(f"Found {department_admins.count()} department admins for type '{report_type}'.")  # Debugging
            print(f"Department Admins: {department_admins}")  # Debugging
            nearest_admin, min_distance = None, float('inf')
            workers = User.objects.filter(role='worker', department_id=target_department_id).values('id', 'station_address', 'username')
            for admin in department_admins:
                print(f"Checking admin: {admin['username']}, Station Address: {admin['station_address']}")  # Debugging
                if admin['station_address']:  # Ensure the admin has station coordinates
                    try:
                        station_lat, station_lon = map(float, admin['station_address'].split(','))
                        print(f"Admin Station - Latitude: {station_lat}, Longitude: {station_lon}")  # Debugging
                        start_calculate_distance = time.time()
                        distance = self.calculate_distance(report_lat, report_lon, station_lat, station_lon)
                        end_calculate_distance = time.time()
                        print(f"Calculating distance took {end_calculate_distance - start_calculate_distance} seconds.")  # Debugging
                        print(f"Distance to admin {admin['username']}: {distance}")  # Debugging

                        if distance < min_distance:
                            min_distance = distance
                            nearest_admin = admin
                            print(f"Nearest admin updated to: {admin['username']} with distance: {min_distance}")  # Debugging
                    except ValueError as e:
                        print(f"Error parsing station address for admin {admin['username']}: {e}")  # Debugging

            if nearest_admin:
                 print("Nearest admin found: ", nearest_admin)  # Debugging
                 print(f"Nearest admin selected: {nearest_admin['username']}, Department ID: {nearest_admin['id']}")  # Debugging
                 validated_data['assigned_to_id'] = nearest_admin['id']
                 validated_data['status'] = "Ongoing"
            else:
                print("No suitable admin found.") 
                validated_data['assigned_to_id'] = None
                validated_data['status'] = "Pending"
                
               

                                    
            report_uuid = uuid.uuid4()
            validated_data["image_path"] = self.process_image_upload(
                validated_data.get("image_path", ""), report_uuid
            )
            worker_lists = list(workers)
            report_data = {
                'report_id': str(report_uuid),
                'user_id': user.id,
                'username': user.username,
                'type_of_report': validated_data['type_of_report'],
                'report_description': validated_data['report_description'],
                'is_emergency': validated_data['is_emergency'],
                'longitude': validated_data['longitude'],
                'latitude': validated_data['latitude'],
                'location': validated_data['location'],
                'upvote': 0,
                'downvote': 0,
                'status': validated_data.get('status'),
                'report_date': datetime.now().isoformat(),
                'image_path': validated_data["image_path"],
                'custom_type': validated_data['custom_type'],
                'floor_number': validated_data['floor_number'],
                'is_validated': False,
                'update_date': datetime.now().isoformat(),
                'assigned_to_id': validated_data.get('assigned_to_id'),
                'report_count': validated_data.get('report_count', 1),
                'usernames': [validated_data.get('username', user.username)],
                'user_ids': [validated_data.get('user_id', user.id)],
                'workers': worker_lists,
                'department_id': target_department_id,
            }

            # Add the report to Firestore
            collection_path = 'reports'
            document_id = validated_data['type_of_report'].lower()
            try:
                start_batch = time.time()
                batch = db.batch()
                doc_ref = db.collection(collection_path).document(document_id)
                batch.set(doc_ref.collection('reports').document(str(report_uuid)), report_data)
                batch.commit()
                end_batch = time.time()
                print(f"Adding report to Firestore took {end_batch - start_batch} seconds.")  # Debugging
            except Exception as e:
                print(f"Error adding report to Firestore: {e}")
                raise e

            # Save the report in the database
            report = Report(
                report_id=report_uuid,
                user_id=user.id,
                image_path=validated_data["image_path"],
                type_of_report=validated_data['type_of_report'],
                report_description=validated_data['report_description'],
                is_emergency=validated_data['is_emergency'],
                longitude=validated_data['longitude'],
                latitude=validated_data['latitude'],
                location=validated_data['location'],
                upvote=0,
                downvote=0,
                status=validated_data.get('status'),
                custom_type=validated_data['custom_type'],
                floor_number=validated_data['floor_number'],
                report_date=datetime.now(),
                assigned_to_id=validated_data.get('assigned_to_id'),
            )
            start_report_save = time.time()
            report.save()
            end_report_save = time.time()
            print(f"Saving the report took {end_report_save - start_report_save} seconds.")  # Debugging
            print(report)
            return report
        except serializers.ValidationError as e:
            raise e
        

class UpdateReportSerializer(serializers.ModelSerializer):
       
       class Meta:
            model = Report
            fields = ['type_of_report', 'report_description', 'is_emergency']
      
       def update(self, instance, validated_data):
             request = self.context.get('request')
             user = request.user 
             if instance.user == user or user.role.lower() == 'citizen':
                return super().update(instance, validated_data)
             else:
                raise serializers.ValidationError("You are not authorized to update this report.")



     


             
        

      
        
    