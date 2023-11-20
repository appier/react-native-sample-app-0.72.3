/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import RNAiqua from '@appier/react-native-sdk';
import messaging from '@react-native-firebase/messaging';
import {sendMessage} from './src/fcmAPI';
import config from './app.json';

function App(): JSX.Element {
  const [fcmToken, setFcmToken] = useState(null);
  const [isSending, setIsSending] = useState(false);
  useEffect(() => {
    console.log('init appier sdk');
    RNAiqua.configure({
      appId: config.appier.appId,
      senderId: config.appier.fcm.senderId,
      appGroup: config.appier.ios.appGroup,
      isDev: config.appier.ios.isDev,
    });

    getFCMToken();
  }, []);

  const getFCMToken = async () => {
    let registered = messaging().isDeviceRegisteredForRemoteMessages;
    if (!registered) {
      await messaging()
        .registerDeviceForRemoteMessages()
        .then(async resp => {
          console.log(resp);
          registered = true;
        })
        .catch(erorr => console.error(erorr));
    }
    if (registered) {
      const token = await messaging().getToken();
      console.log('FCM token:', token);
      RNAiqua.setFCMToken(token);
      setFcmToken(token);
    }
  };

  const onSendEventPress = () => {
    RNAiqua.logEvent('app_launched');
    RNAiqua.flush();
  };

  const onSendPushPress = () => {
    setIsSending(true);
    sendMessage({fcmToken: fcmToken, messageType: 'basic'}).then(resp => {
      setIsSending(false);
      if (resp?.failure) {
        const error = resp.results[0]?.error;
        if (error === 'MismatchSenderId') {
          Alert.alert(
            'Error',
            `It seems that the 'serverKey' and '${Platform.select({
              ios: 'GoogleService-info.plist',
              android: 'google-service.json',
            })}' you have provided come from different FCM projects.\n\nPlease double-check the information you have provided.`,
          );
        }
      }
      if (resp?.name === 'SyntaxError') {
        Alert.alert(
          'Error',
          "It seems that the 'serverKey' you have provided is in the wrong format. \n\nPlease double-check the information you have provided.",
        );
      }
    });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text style={{fontSize: 32, color: '#222'}}>Hello World</Text>
      <TouchableOpacity
        style={{
          marginTop: 40,
          height: 48,
          backgroundColor: '#eee',
          borderRadius: 4,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 10,
          opacity: !fcmToken || isSending ? 0.5 : 1,
        }}
        disabled={!fcmToken || isSending}
        onPress={onSendPushPress}>
        {isSending ? (
          <ActivityIndicator animating />
        ) : (
          <Text style={{fontWeight: '700'}}>
            Send a Testing Push Notification
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          marginTop: 24,
          height: 48,
          backgroundColor: '#eee',
          borderRadius: 4,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 10,
        }}
        onPress={onSendEventPress}>
        <Text style={{fontWeight: '700'}}>{`Send \`app_launched\` Event`}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default App;
