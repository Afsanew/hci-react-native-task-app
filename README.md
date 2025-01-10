# HCI Course Project: Task Management App

This app was developed as part of the Human-Computer Interaction (HCI) course at ETH Zurich. The focus of the course was on **designing user-centered solutions**, with less emphasis on the coding aspect. When starting this project, I had no prior knowledge of React or React Native and learned everything on the go during the roughly **three-week development period**. Special thanks to AI tools like ChatGPT and GitHub Copilot, which were crucial in speeding up my learning and coding process :) 

## Running the App
### How to Run the App
1. Download and install the **Expo Go app** from the App Store or Google Play Store.
2. Scan the QR code above with your phone to launch the app directly.
3. For the best experience, use an **iPhone** :).

![QR Code to App](./expo-qr-code.svg) <!-- Replace with the actual QR code image -->

### Running Locally
1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/gtamrazyan04/hci-react-native-task-app
   cd hci-react-native-task-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Download and install the **Expo Go app** from the App Store or Google Play Store.
5. Scan the QR code displayed in your terminal or browser to open the app.

## About the App

This app is a **task management tool** that aims to help users organize their daily responsibilities while reducing decision fatigue. It incorporates a **habit-building system** and motivational features to ensure tasks are completed effectively. 

### Key Functionalities
1. **Prioritized Task Management**: 
   - Highlights the **three most important tasks** for the day to keep users focused. (-> amount of daily tasks is customizable)
   - Allows categorization of tasks to keep a good structure.
   - Allows deadline and flag setting to establish prioritites.

2. **Streak Tracking**:
   - Encourages habit formation by tracking how many days users consistently complete their daily tasks.
   - Includes motivational feedback and animations when daily tasks are completed.

3. **Customizable Features**:
   - Users can adjust task categories, change the number of daily tasks, and toggle preferences like streak tracking.
   - Designed to adapt to individual and shared task management needs. (Shared task features are only "simulated" and not implemented as there is no backend to the app and there was no plan to publish it)

4. **User Experience First**:
   - Simple and intuitive interface tailored for iPhone users.
   - Focuses on reducing mental load by automating task prioritization.


## Acknowledgements
This app was influenced by insights gathered from user interviews and need-finding sessions during the HCI course. It is a testament to the power of **learning by doing** and leveraging modern tools to overcome challenges. A big shoutout to ChatGPT and GitHub Copilot for their invaluable assistance in navigating React Native and solving coding challenges :)
