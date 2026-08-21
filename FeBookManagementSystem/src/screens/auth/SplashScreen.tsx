import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  StatusBar,
} from 'react-native';

const SplashScreen = ({ navigation }: any) => {
  const imageOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Image fades in
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // After 2.5 seconds, fade image out
    const timer = setTimeout(() => {
      Animated.timing(imageOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // After fade-out, go to Login
        navigation.replace('Login');
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, imageOpacity]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <Animated.Image
        source={require('../../../assets/animation/books.jpg')}
        style={[
          styles.image,
          {
            opacity: imageOpacity,
          },
        ]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  image: {
    width: '100%',
    height: '100%',
  },
});

export default SplashScreen;