import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
} from "react-native";

interface TermsConditionProps {
  fullImageModalVisible: boolean;
  setFullImageModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const TermsCondition: React.FC<TermsConditionProps> = ({
  fullImageModalVisible,
  setFullImageModalVisible,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Toggle the modal visibility
  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  // Get the current date and format it (e.g., "October 10, 2024")
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <View className="flex-1 justify-center items-center">
      {/* Modal for displaying Terms and Conditions */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={fullImageModalVisible}
        onRequestClose={toggleModal}
      >
        <View className="flex-1 h-full py-24 justify-center items-center bg-black/50">
          <View className="w-11/12 p-6 bg-white rounded-xl border-2 border-[#0C3B2D]">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              {/* Modal Content */}
              <Text className="text-2xl font-bold text-center mb-4">
                CRISP Terms and Conditions
              </Text>
              <Text className="text-sm italic text-center mb-6">
                Effective Date: {currentDate}
              </Text>

              <Text className="text-base text-justify">
                <Text className="font-bold text-center">
                  CRISP (Community Reporting Interface for Safety and
                  Prevention)
                </Text>
                <Text className="text-base italic mb-3">
                  {"\n"}"A Smarter Way to Protect Your Neighborhood"
                </Text>
                {"\n\n"}Welcome to CRISP, a mobile application designed to
                empower communities by enabling real-time reporting of
                incidents, crimes, and safety concerns. By using the CRISP app,
                you agree to these terms and conditions. Please read them
                carefully before using the app.{"\n"}
              </Text>

              <Text className="text-base mb-3 text-justify">
                <Text className="font-bold">1. Acceptance of Terms</Text>
                {"\n"}By downloading, installing, or using the CRISP application
                (the "App"), you agree to comply with and be bound by the
                following Terms and Conditions (the "Agreement"). If you do not
                agree with these terms, please do not use the App.
              </Text>

              <Text className="text-base mb-3 text-justify">
                <Text className="font-bold">
                  2. Privacy and User Information
                </Text>
                {"\n"}As part of your use of CRISP, the App may collect certain
                personal information, including but not limited to:
                {"\n"}• Location Data, Camera and Microphone Access, Gallery
                Access, User Information, etc. {"\n"}• Camera and Microphone
                Access: The App requires access to your device's camera and
                microphone for reporting incidents with images, videos, or audio
                recordings.
                {"\n"}• Gallery Access: The App may request permission to access
                your photo gallery to upload images relevant to the reports you
                make.
                {"\n"}• User Information: For authentication and safety
                purposes, you may need to provide personal information such as
                name, email address, phone number, and other relevant details to
                verify your identity as a verified user.
              </Text>

              <Text className="text-base mb-3 text-justify">
                <Text className="font-bold">3. Use of the CRISP App</Text>
                {"\n"}CRISP is intended for personal use to report community
                incidents and to receive notifications related to public safety.
                You agree to use the App only for lawful purposes and in a
                manner that does not infringe on the rights of others.
                {"\n"}• Incident Reporting: Verified users can submit incident
                reports, including but not limited to crimes, safety hazards,
                and community disturbances. Reports should be truthful,
                accurate, and reflect actual events.
                {"\n"}• Geo-Location Mapping: Your location will be
                automatically captured when submitting an incident report to
                assist authorities in tracking and responding to reports
                accurately.
                {"\n"}• SOS Feature: The App includes an SOS feature to send
                distress signals during emergencies. By activating the SOS
                feature, you consent to sharing your location with emergency
                responders.
              </Text>

              <Text className="text-base mb-3 text-justify">
                <Text className="font-bold">4. Permissions</Text>
                {"\n"}To provide the necessary functionality for reporting and
                notification, the CRISP app requires certain device permissions,
                including but not limited to:
                {"\n"}• Location Access: To automatically capture and map the
                location of reports and provide proximity alerts.
                {"\n"}• Camera Access: To allow users to take photos or videos
                when submitting reports.
                {"\n"}• Microphone Access: To allow users to record audio for
                reporting incidents.
                {"\n"}• Gallery Access: To allow users to upload images from
                their device's gallery for reports.
                {"\n"}• Push Notifications: To send real-time alerts regarding
                incidents and updates in your vicinity.
                {"\n"}By accepting these Terms and Conditions, you authorize
                CRISP to request and use these permissions on your device.
              </Text>

              <Text className="text-base mb-3 text-justify">
                <Text className="font-bold">5. Reporting Incidents</Text>
                {"\n"}When using the CRISP App, you agree to the following:
                {"\n"}• Incident Verification: Only verified users will be
                permitted to submit reports. Verification ensures the
                authenticity of the data and accountability.
                {"\n"}• Reporting Guidelines: You agree to submit only accurate,
                truthful, and relevant information. False or misleading reports
                may result in your account being suspended or revoked.
                {"\n"}• Prohibited Content: You agree not to submit harmful,
                offensive, illegal, or inappropriate content, including hate
                speech, threats, or content that violates the rights of others.
                {"\n"}• Data Accuracy: While we strive to ensure the accuracy of
                incident reports, the quality of data depends on user
                submissions. CRISP cannot guarantee that every report is fully
                accurate or complete.
              </Text>

              <Text className="text-base mb-3 text-justify">
                <Text className="font-bold">6. Notification System</Text>
                {"\n"}The App provides real-time notifications based on
                incidents in your vicinity. You agree to receive notifications
                about nearby incidents, including updates on reports you have
                made or reports made by others.
              </Text>

              <Text className="text-base mb-3 text-justify">
                <Text className="font-bold">
                  7. Responsibilities and Limitations
                </Text>
                {"\n"}While CRISP aims to enhance public safety, there are
                certain limitations:
                {"\n"}• Device Requirements: The performance of the App may vary
                depending on the device’s hardware capabilities. Older or
                incompatible devices may experience slow performance or crashes.
                {"\n"}• Internet Access: A stable internet connection is
                required to submit reports, receive notifications, and interact
                with the App. Without internet access, you will not be able to
                use the core features of the App.
                {"\n"}• Geographic Limitations: Authorities may only be able to
                respond to incidents within certain geographic regions based on
                their jurisdiction and resources.
                {"\n"}• Privacy Risks: By using the App, you acknowledge the
                inherent privacy risks of sharing personal information and
                location data, despite our best efforts to protect your data.
              </Text>

              <Text className="text-base mb-3 text-justify">
                <Text className="font-bold">8. Data Security</Text>
                {"\n"}We take reasonable steps to protect your personal data
                from unauthorized access, alteration, disclosure, or
                destruction. However, no security system is 100% secure, and we
                cannot guarantee the absolute security of your data. You agree
                to hold CRISP harmless for any unauthorized access to or loss of
                data.
              </Text>
              <Text className="text-base mb-3 text-justify">
                <Text className="font-bold">
                  9. Suspension or Termination of Account
                </Text>
                {"\n"}CRISP reserves the right to suspend or terminate your
                account if you violate any of the terms outlined in this
                Agreement, including submitting false reports, engaging in
                prohibited activities, or otherwise misusing the App. Suspended
                or terminated users may not have access to the App or its
                services.
              </Text>

              <Text className="text-base mb-3 text-justify">
                <Text className="font-bold">10. Limitations of Liability</Text>
                {"\n"}To the maximum extent permitted by law, CRISP and its
                affiliates will not be liable for any damages arising from:
                {"\n"}• Errors, inaccuracies, or omissions in incident reports.
                {"\n"}• Unauthorized access to or use of your personal data.
                {"\n"}• The inability to use the App due to hardware, software,
                or connectivity issues.
                {"\n"}• Any harm or injury resulting from actions taken by
                third-party authorities in response to reports.
              </Text>
              <Text className="text-base mb-3 text-justify">
                <Text className="font-bold">11. Changes to Terms</Text>
                {"\n"}CRISP reserves the right to update or change these Terms
                and Conditions at any time. Any such changes will be posted on
                this page, and the revised terms will be effective immediately
                upon posting. It is your responsibility to review these terms
                periodically.
              </Text>

              <Text className="text-base mb-3 text-justify">
                <Text className="font-bold">12. Governing Law</Text>
                {"\n"}These Terms and Conditions will be governed by and
                construed in accordance with the laws of the jurisdiction in
                which the App is deployed, without regard to its conflict of law
                principles.
              </Text>

              <Text className="text-base mb-3 text-justify">
                <Text className="font-bold">13. Contact Information</Text>
                {"\n"}If you have any questions or concerns regarding these
                Terms and Conditions, please contact us at:
                {"\n"}Email: crisp.ucc.bscs@gmail.com
              </Text>
            </ScrollView>

            {/* Close Button */}
            <TouchableOpacity
              className="bg-[#0C3B2D] py-3 px-5 rounded-lg mt-6"
              onPress={() => setFullImageModalVisible(false)}
            >
              <Text className="text-white font-bold text-md text-center">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TermsCondition;
