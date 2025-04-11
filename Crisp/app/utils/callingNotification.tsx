import * as Notifications from 'expo-notifications';

export const callNotification = async (title: string, body:string, screen: string) => {
  await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Incoming Call',
        body: 'Do you want to answer?',
        categoryIdentifier: 'call', 
      },
      trigger: { seconds: 1 },
    });      
}

// Define the actions for the notification
export const registerNotificationActions = async () => {
  await Notifications.setNotificationCategoryAsync('CALL_ACTIONS', [
    {
      identifier: 'ANSWER_CALL',
      buttonTitle: 'Answer',
      options: { opensAppToForeground: true }, 
    },
    {
      identifier: 'DECLINE_CALL',
      buttonTitle: 'Decline',
      options: { opensAppToForeground: false }, 
    },
  ]);
};
