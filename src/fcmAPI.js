import {appier as AppSettings} from '../app.json';
import notification from './notifications';

const SERVER_KEY = AppSettings.fcm.serverKey;
const LEGACY_API_URL = 'https://fcm.googleapis.com/fcm/send';

export const sendMessage = ({fcmToken, messageType}) => {
  const messagePayload = notification.getPayload().legacy[messageType];
  return sendMessageLegacy(fcmToken, messagePayload);
};

const sendMessageLegacy = (fcmToken, messagePayload) => {
  console.log('Send message by FCM Legacy HTTP API...');
  const auth = `key=${SERVER_KEY}`;
  const body = {
    to: fcmToken,
    ...messagePayload,
  };
  return makePostRequest(LEGACY_API_URL, auth, body);
};

const makePostRequest = (url, auth, body) => {
  return new Promise(resolve => {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
      body: JSON.stringify(body),
    })
      .then(resp => resp.json())
      .then(data => {
        if (data?.error) {
          if (data?.error.message) {
            console.error('Failed to send the message:', data);
          }
        } else {
          console.log('Message sent successfully:', data);
        }
        resolve(data);
      })
      .catch(error => {
        console.error('Exception catched:', error);
        resolve(error);
      });
  });
};
