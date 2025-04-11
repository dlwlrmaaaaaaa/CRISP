import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import LOGO from "../../assets/android-icon-square.png";
import Map from "./Maps2";

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 50,
    paddingVertical: 20,
    fontFamily: "Helvetica",
  },
  logo: {
    marginBottom: 10,
    width: 50,
    height: 50,
    alignSelf: "center",
  },
  header: {
    fontSize: 12,
    marginVertical: 3,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    color: "#333",
  },
  title: {
    fontSize: 12,
    marginBottom: 10,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    color: "#000000",
  },
  section: {
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  column: {
    width: "48%",
    gap: 5,
  },
  label: {
    fontSize: 10,
    marginTop: 5,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },
  value: {
    fontSize: 8,
    marginTop: 2,
    padding: 5,
    backgroundColor: "#f7f7f7",
    borderRadius: 4,
    border: 1,
  },
  mapImage: {
    width: "auto",
    height: 100,
    marginTop: 2,
    borderRadius: 4,
    border: 1,
  },
  placeholderText: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
});

const convertToDaysHoursMinutes = (time) => {
  if (!time) return "N/A";

  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;
  const days = Math.floor(totalMinutes / 1440);
  const remainingMinutes = totalMinutes % 1440;
  const hoursLeft = Math.floor(remainingMinutes / 60);
  const minutesLeft = remainingMinutes % 60;

  let result = "";
  if (days > 0) result += `${days} day${days > 1 ? "s" : ""}`;
  if (hoursLeft > 0)
    result += `${result ? ", " : ""}${hoursLeft} hour${
      hoursLeft > 1 ? "s" : ""
    }`;
  if (minutesLeft > 0 || (!days && !hoursLeft))
    result += `${result ? ", " : ""}${minutesLeft} minute${
      minutesLeft > 1 ? "s" : ""
    }`;
  return result;
};

const ReportPDF = ({
  userName,
  location,
  reportType,
  description,
  date,
  reportStatus,
  assignedTo,
  attachment,
  upvote,
  downvote,
  feedback,
  proof,
  reportId,
  reportedType,
  reportValidated,
  openTime,
  lat,
  long,
  closedTime,
  respondTime,
  validationTime,
  workers,
  mapImage,
  workerFeedbackDesc,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image
          style={styles.logo}
          src={LOGO} // Use your image URL here
        />
        <Text style={styles.header}>
          COMMUNITY REPORTING INTERFACE FOR SAFETY AND PREVENTION
        </Text>
      </View>

      {/* Report Details Section */}
      <View style={styles.section}>
        <Text style={styles.title}>REPORT DETAILS</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Report Type</Text>
            <Text style={styles.value}>{reportType}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Reported by</Text>
            <Text style={styles.value}>{userName}</Text>
          </View>
        </View>

        <View>
          <Text style={styles.label}>Report ID</Text>
          <Text style={styles.value}>{reportId}</Text>
        </View>

        <View>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{description}</Text>
        </View>

        <View>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{location}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Date & Time</Text>
            <Text style={styles.value}>{date}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{reportStatus}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Assigned Department</Text>
            <Text style={styles.value}>{assignedTo}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Assigned Worker/s</Text>
            <Text style={styles.value}>
              {Array.isArray(workers) ? workers.join(", ") : workers || "None"}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Validation Time</Text>
            <Text style={styles.value}>
              {validationTime
                ? convertToDaysHoursMinutes(validationTime)
                : "Not yet validated"}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Likes</Text>
            <Text style={styles.value}>{upvote}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Dislikes</Text>
            <Text style={styles.value}>{downvote}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Report Open For</Text>
            <Text style={styles.value}>
              {closedTime
                ? convertToDaysHoursMinutes(closedTime)
                : openTime
                ? openTime
                : "Not yet opened"}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Responding Time</Text>
            <Text style={styles.value}>
              {respondTime
                ? convertToDaysHoursMinutes(respondTime)
                : "Not responded yet"}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Report Close Time</Text>
            <Text style={styles.value}>
              {closedTime
                ? convertToDaysHoursMinutes(closedTime)
                : "Report is still open"}
            </Text>
          </View>
        </View>

        <View>
          <Text style={styles.label}>Worker Remarks</Text>
          <Text style={styles.value}>{workerFeedbackDesc}</Text>
        </View>

        <Text style={styles.header}>Attachments</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Before</Text>
            {attachment && attachment.length > 0 ? (
              <View>
                <Image style={styles.mapImage} src={attachment[0]} />
                {/* <Text style={styles.label}>{attachment}</Text> */}
              </View>
            ) : (
              <View style={styles.mapImage}>
                {/* If no image, show the placeholder text */}
                <Text style={styles.placeholderText}>No Image Available</Text>
              </View>
            )}
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>After</Text>
            {attachment && attachment.length > 0 ? (
              <View>
                <Image style={styles.mapImage} src={attachment[0]} />
                {/* <Text style={styles.label}>{attachment}</Text> */}
              </View>
            ) : (
              <View style={styles.mapImage}>
                {/* If no image, show the placeholder text */}
                <Text style={styles.placeholderText}>No Image Available</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.header}>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Map</Text>
              {mapImage && <Image style={styles.mapImage} src={mapImage} />}
            </View>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

export default ReportPDF;
