import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '701473766143-p11qjluq9ul2ucc4vqhbooeendaj0d2g.apps.googleusercontent.com',
    offlineAccess: true,
  });
};