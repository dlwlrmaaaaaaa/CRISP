# CRISP

Overview
CRISP (Community Reporting Interface for Safety and Prevention) is an innovative mobile application designed to empower community members by enabling the real-time reporting of crimes, safety concerns, and other incidents. This crowdsourced platform facilitates the prompt notification of relevant authorities, significantly reducing response times and enhancing the overall safety of the community. Additionally, CRISP provides residents with real-time updates on reported incidents, fostering greater awareness and proactive engagement in community safety efforts of Caloocan City.

## FEATURES
- The platform will automatically capture and store the GPS coordinates of reported incidents for accurate location mapping
- CRISP will support the reporting of a variety of incidents, including but not limited to, crimes, safety hazards, and community disturbances.
- CRISP will include an emergency response feature that directly connects users with local emergency services through an SOS button.
- The platform will incorporate mechanisms for verifying and validating incident reports, as well as tools to flag and manage potentially false or misleading submissions..
- CRISP will display the reports made by the users on a map within the app.
- Reported incidents will be automatically assigned to the appropriate departments or agencies, ensuring rapid notification and response.
- The app will notify the user when the user is within the radius of an active report and will provide real-time proximity alerts, notifying users when they enter an area with an active or recent report.


## TECHNOLOGIES USED
- FRONTEND: `REACT-NATIVE`, `EXPO`, `REACT.JS`
- BACKEND: `DJANGO`, `PYTHON`, 
- MACHINE LEARNING: `CHATGPT HAHAHAHAH`
- REAL-TIME: `FIREBASE`

## INSTALLATION
1. Clone the repository:
   ```git
   git clone https://github.com/SiyanLuwi/Crisp
   ```
2. Install and Start `EXPO GO` or `APP DEV CLIENT CRISP`
3. Open the link given in the EXPO TERMINAL usually `YOUR_IP_ADDRESS:8081` or `SCAN THE QR CODE GIVEN BY THE EXPO TERMINAL`

### ***CRISP INSTALLATION*** 
   1. Navigate to project directory
      ```bash
      cd CRISP
      ```
   2. Install necessary dependencies:
      ```bash
      npm install
      ```
   3. To start the application run
      ```bash
      npm expo start
      ```
      or
      ```bash
      npx expo start -c --dev-client --reset-cache  
      ```
      if you're using dev client
   4. Open the link given in the EXPO TERMINAL usually `YOUR_IP_ADDRESS:8081` or `SCAN THE QR CODE GIVEN BY THE EXPO TERMINAL`
### ***CREATION OF APK***
   1. IF CREATING AN APK DEV-CLIENT USE:
      
      First use
      ```bash
      npx expo-doctor
      ```
      to check for dependencies
      then
      ```bash
      npm install --check
      ```
      to update dependencies
      then
      ```bash
      eas build --platform android --profile development
      ```
      (REFER TO THE APP.JSON)
      
   3. IF CREATING AN APK FOR PRODUCTION:
      ```bash
      eas build -p android --profile product
      ```
      (REFER TO THE APP.JSON)
