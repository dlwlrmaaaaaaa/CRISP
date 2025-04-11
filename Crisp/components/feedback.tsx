import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { app } from "@/firebase/firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import uuid from "react-native-uuid";

const db = getFirestore(app);
const storage = getStorage(app);

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  reportId: string;
  category: string;
  userId: string; // Pass USER_ID as prop
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  reportId,
  category,
  userId,
}) => {
  const [description, setDescription] = useState<string>("");
  const [proof, setProof] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);
  const [errors, setErrors] = useState("");

  const handleConfirm = async () => {
    if (description.trim() === "") {
      setTimeout(() => {
        setErrors("Please provide a description.");
      }, 3000);
      return;
    }

    if (!proof) {
      setTimeout(() => {
        setErrors("Please provide proof (take a photo).");
      }, 3000);
      return;
    }

    try {
      // Save the description and proof in Firebase under the feedback path
      const feedbackRef = doc(
        db,
        `reports/${category}/reports/${reportId}/workerFeedback/${userId}`
      );

      const localDate = new Date();
      const localOffset = localDate.getTimezoneOffset() * 60000;
      const localTimeAdjusted = new Date(localDate.getTime() - localOffset);
      const localDateISOString = localTimeAdjusted.toISOString().slice(0, -1);

      const feedbackData = {
        description,
        proof,
        submited_at: localDateISOString,
      };

      // Store feedback data in Firestore
      await setDoc(feedbackRef, feedbackData);

      // Get the report creation time (you should have stored this previously)
      const reportRef = doc(db, `reports/${category}/reports/${reportId}`);

      // Fetch the existing report data to get the created_at timestamp
      const reportSnapshot = await getDoc(reportRef);
      if (!reportSnapshot.exists()) {
        throw new Error("Report does not exist");
      }

      const reportData = reportSnapshot.data();
      const createdAt = new Date(reportData.report_date); // Report creation timestamp

      // Calculate the time difference between the current time and the report creation time
      const validationTime = new Date(localDateISOString);
      const timeDiffInMilliseconds =
        validationTime.getTime() - createdAt.getTime();
      const timeDiffInMinutes = timeDiffInMilliseconds / (1000 * 60);
      const hours = Math.floor(timeDiffInMinutes / 60);
      const minutes = Math.floor(timeDiffInMinutes % 60);

      // Format the elapsed time as "hours:minutes"
      const formattedTime = `${hours}:${minutes.toString().padStart(2, "0")}`;

      console.log(
        `Report status changed to "reviewing" after ${formattedTime}.`
      );

      // Update the report with the new status and elapsed time
      const updatedReportData = {
        update_date: localDateISOString, // Use the same timestamp for the update date
        status: "Under Review",
        review_elapsed_time: formattedTime, // Store the formatted elapsed time
      };

      // Update the report data
      await updateDoc(reportRef, updatedReportData);

      setFeedbackSuccess(true);
    } catch (error) {
      console.error("Error submitting feedback: ", error);
      alert("Failed to submit feedback. Please try again.");
    }
  };

  const handleClose = () => {
    setDescription(""); // Reset the description state
    setProof(null); // Reset the proof state
    setFeedbackSuccess(false); // Reset feedback success state
    onClose();
  };

  const takeProof = async () => {
    const permission = await Camera.requestCameraPermissionsAsync();
    if (permission.granted) {
      let result = await ImagePicker.launchCameraAsync();
      if (!result.canceled) {
        const imageUri = result.assets[0].uri;

        // Upload the image to Firebase Storage
        const uploadResult = await uploadImageToStorage(imageUri);

        if (uploadResult) {
          setProof(uploadResult); // Set the proof to the uploaded URL
        }
      }
    }
  };

  // Function to upload image to Firebase Storage and get public URL
  const uploadImageToStorage = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const imageName = `${uuid.v4()}.jpg`;

      const imageRef = ref(storage, `feedback_images/${imageName}`);
      await uploadBytes(imageRef, blob);

      // Get the public URL of the uploaded image
      const imageUrl = await getDownloadURL(imageRef);

      return imageUrl; // Return the public URL of the image
    } catch (error) {
      console.error("Error uploading image to Firebase Storage:", error);
      return null;
    }
  };

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // Adjust this value if needed
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="w-4/5 py-5 px-3 bg-white rounded-xl items-start border-2 border-[#0C3B2D]">
              {feedbackSuccess ? ( // Conditional rendering for success message
                <View className="full p-3 bg-white rounded-xl items-start">
                  <Text className="text-xl font-bold text-[#0C3B2D] mb-5">
                    Your feedback has been submitted successfully!
                  </Text>
                  <View className="flex flex-row justify-end w-full ">
                    <TouchableOpacity
                      className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                      onPress={handleClose}
                    >
                      <Text className="text-md font-semibold text-white px-4">
                        Close
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <Text className="text-2xl font-extrabold text-[#0C3B2D] px-3">
                    Feedback Form
                  </Text>
                  <View className="flex flex-col justify-center w-full mt-3 px-3">
                    <TextInput
                      className="w-full bg-slate-50 text-md p-3 rounded-lg mb-4 items-center justify-center text-[#0C3B2D] font-semibold border border-[#0C3B2D]"
                      placeholderTextColor="#888"
                      placeholder="Description"
                      multiline={true}
                      scrollEnabled={true}
                      value={description}
                      onChangeText={setDescription}
                      style={{
                        maxHeight: 150,
                        height: 150,
                        textAlignVertical: "top",
                      }}
                    />
                    <View className="w-full bg-white mb-4 rounded-lg flex flex-row justify-between border border-[#0C3B2D]">
                      <TextInput
                        className="w-3/5 text-md p-4 text-[#0C3B2D] font-semibold items-center justify-center"
                        value={proof || ""}
                        editable={false}
                        placeholderTextColor="#888"
                        placeholder="Proof"
                      />
                      <TouchableOpacity
                        onPress={takeProof}
                        className="bg-[#0C3B2D] border border-[#8BC34A] p-4 rounded-lg items-center justify-center"
                      >
                        <Text className="text-white text-md font-normal">
                          Take Photo
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {errors ? (
                    <Text className="text-md text-red-800 font-semibold flex w-full text-right mt-2 pr-2">
                      {errors}
                    </Text>
                  ) : null}
                  <View className="flex flex-row justify-end w-full mt-6 px-3">
                    <TouchableOpacity
                      onPress={handleConfirm}
                      className="bg-[#0C3B2D] p-2 rounded-lg h-auto items-center justify-center"
                    >
                      <Text className="text-md font-semibold text-white px-4">
                        Confirm
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleClose}
                      className="bg-white border-[#0C3B2D] border-2 p-2 rounded-lg h-auto items-center justify-center ml-3"
                    >
                      <Text className="text-md font-semibold text-[#0C3B2D] px-4">
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default FeedbackModal;
