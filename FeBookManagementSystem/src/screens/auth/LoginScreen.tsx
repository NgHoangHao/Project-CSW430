import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Eye,
  EyeOff,
  Lock,
  Mail,
} from 'lucide-react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';

import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { useAuth } from '../../store/authProvider';
import { authApi } from '../../services/auth.service';
import { ROUTES } from '../../constants/routes';

export const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isVisiblePassword, setIsVisiblePassword] = useState(false);

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const isLoading =
    isLoggingIn ||
    isGoogleLoading ||
    isSendingOtp;

  const { login, loginGG } = useAuth();

  // =========================
  // SPLASH ANIMATION
  // =========================

  const splashOpacity = useRef(
    new Animated.Value(1),
  ).current;

  const loginOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),

        Animated.timing(loginOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSplash(false);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [splashOpacity, loginOpacity]);

  // =========================
  // VALIDATE LOGIN
  // =========================

  const validateLogin = () => {
    const newErrors = {
      email: '',
      password: '',
    };

    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'Please enter your email.';
      isValid = false;
    } else {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email.trim())) {
        newErrors.email =
          'Please enter a valid email address.';
        isValid = false;
      }
    }

    if (!password.trim()) {
      newErrors.password =
        'Please enter your password.';
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async () => {
    if (!validateLogin()) return;

    try {
      setIsLoggingIn(true);

      await login({
        email: email.trim(),
        password,
      });
    } catch (error: any) {
      console.log('Login error:', error);

      const message =
        error?.response?.data?.message ||
        'Login failed. Please check your credentials and try again.';

      Alert.alert(
        'Login failed',
        message,
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  // =========================
  // FORGOT PASSWORD
  // =========================

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert(
        'Email required',
        'Please enter your email address first.',
      );

      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      Alert.alert(
        'Invalid email',
        'Please enter a valid email address.',
      );

      return;
    }

    try {
      setIsSendingOtp(true);

      await authApi.resendOTP(
        email.trim(),
      );

      navigation.navigate(
        ROUTES.OTP_VERIFY,
        {
          email: email.trim(),
          isForgetPass: true,
        },
      );
    } catch (error: any) {
      console.log(
        'Forgot password error:',
        error,
      );

      const message =
        error?.response?.data?.message ||
        'Unable to send the verification code. Please try again.';

      Alert.alert(
        'Error',
        message,
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  // =========================
  // GOOGLE LOGIN
  // =========================

  const signInGoogle = async () => {
    try {
      setIsGoogleLoading(true);

      await GoogleSignin.hasPlayServices();

      // Remove previous account if available
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        console.log(
          'Google sign out skipped',
        );
      }

      const signInResponse =
        await GoogleSignin.signIn();

      let idToken =
        (signInResponse as any)?.data?.idToken ||
        (signInResponse as any)?.idToken;

      const tokens =
        await GoogleSignin.getTokens();

      idToken =
        idToken ||
        tokens.idToken;

      const accessToken =
        tokens.accessToken;

      if (!idToken) {
        throw new Error(
          'Google sign-in did not return an ID token.',
        );
      }

      const googleCredential =
        auth.GoogleAuthProvider.credential(
          idToken,
          accessToken,
        );

      await auth().signInWithCredential(
        googleCredential,
      );

      const currentUser =
        auth().currentUser;

      if (!currentUser) {
        throw new Error(
          'No authenticated Firebase user found.',
        );
      }

      const firebaseToken =
        await currentUser.getIdToken();

      await loginGG(firebaseToken);
    } catch (error: any) {
      console.log(
        'Google login error:',
        error,
      );

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Google login failed. Please try again.';

      Alert.alert(
        'Google login failed',
        message,
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <View style={styles.rootContainer}>

      {/* =====================
          LOGIN SCREEN
      ====================== */}

      <Animated.View
        style={[
          styles.loginScreen,
          {
            opacity: loginOpacity,
          },
        ]}
      >
        <SafeAreaView style={styles.container}>

          <KeyboardAvoidingView
            behavior={
              Platform.OS === 'ios'
                ? 'padding'
                : undefined
            }
            style={styles.keyboardContainer}
          >

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={
                styles.scrollContent
              }
            >

              {/* HEADER */}

              <View style={styles.topSection}>

                <View style={styles.logoContainer}>
                  <Image
                    source={require('../../../assets/auth/logo.png')}
                    style={styles.logo}
                  />

                  <Text style={styles.logoText}>
                    K2H
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    navigation.navigate(
                      'Register',
                    )
                  }
                >
                  <Text
                    style={
                      styles.registerButtonText
                    }
                  >
                    Sign up
                  </Text>
                </Pressable>

              </View>

              {/* TITLE */}

              <View style={styles.titleSection}>

                <Text style={styles.title}>
                  Welcome back
                </Text>

                <Text style={styles.subtitle}>
                  Sign in to continue to your account.
                </Text>

              </View>

              {/* FORM */}

              <View style={styles.form}>

                {/* EMAIL */}

                <Text style={styles.label}>
                  Email address
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    errors.email &&
                    styles.inputContainerError,
                  ]}
                >

                  <Mail
                    size={20}
                    color="#6B7280"
                  />

                  <TextInput
                    style={styles.inputField}
                    placeholder="name@example.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    onChangeText={text => {
                      setEmail(text);

                      if (errors.email) {
                        setErrors(prev => ({
                          ...prev,
                          email: '',
                        }));
                      }
                    }}
                  />

                </View>

                {errors.email ? (
                  <Text style={styles.error}>
                    {errors.email}
                  </Text>
                ) : null}

                {/* PASSWORD */}

                <Text style={styles.label}>
                  Password
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    errors.password &&
                    styles.inputContainerError,
                  ]}
                >

                  <Lock
                    size={20}
                    color="#6B7280"
                  />

                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={
                      !isVisiblePassword
                    }
                    value={password}
                    autoCapitalize="none"
                    editable={!isLoading}
                    onChangeText={text => {
                      setPassword(text);

                      if (errors.password) {
                        setErrors(prev => ({
                          ...prev,
                          password: '',
                        }));
                      }
                    }}
                  />

                  <TouchableOpacity
                    onPress={() =>
                      setIsVisiblePassword(
                        !isVisiblePassword,
                      )
                    }
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                  >
                    {isVisiblePassword ? (
                      <Eye
                        size={20}
                        color="#6B7280"
                      />
                    ) : (
                      <EyeOff
                        size={20}
                        color="#6B7280"
                      />
                    )}
                  </TouchableOpacity>

                </View>

                {errors.password ? (
                  <Text style={styles.error}>
                    {errors.password}
                  </Text>
                ) : null}

                {/* FORGOT PASSWORD */}

                <TouchableOpacity
                  onPress={
                    handleForgotPassword
                  }
                  style={
                    styles.forgotPasswordContainer
                  }
                  disabled={isLoading}
                  activeOpacity={0.7}
                >

                  {isSendingOtp ? (
                    <ActivityIndicator
                      size="small"
                      color="#15803D"
                    />
                  ) : (
                    <Text
                      style={
                        styles.forgotPasswordText
                      }
                    >
                      Forgot password?
                    </Text>
                  )}

                </TouchableOpacity>

                {/* LOGIN BUTTON */}

                <TouchableOpacity
                  style={[
                    styles.button,
                    isLoading &&
                    styles.disabledButton,
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >

                  {isLoggingIn ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={
                        styles.buttonText
                      }
                    >
                      Sign in
                    </Text>
                  )}

                </TouchableOpacity>

                {/* DIVIDER */}

                <View
                  style={
                    styles.dividerContainer
                  }
                >

                  <View
                    style={
                      styles.dividerLine
                    }
                  />

                  <Text
                    style={
                      styles.dividerText
                    }
                  >
                    or continue with
                  </Text>

                  <View
                    style={
                      styles.dividerLine
                    }
                  />

                </View>

                {/* GOOGLE LOGIN */}

                <TouchableOpacity
                  style={[
                    styles.googleButton,
                    isLoading &&
                    styles.disabledGoogleButton,
                  ]}
                  onPress={signInGoogle}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >

                  {isGoogleLoading ? (
                    <ActivityIndicator
                      size="small"
                      color="#374151"
                    />
                  ) : (
                    <>

                      {/* Replace this with a real
                          Google logo asset if available */}

                      <View
                        style={
                          styles.googleIconPlaceholder
                        }
                      >
                        <Text
                          style={
                            styles.googleIconText
                          }
                        >
                          G
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.googleButtonText
                        }
                      >
                        Continue with Google
                      </Text>

                    </>
                  )}

                </TouchableOpacity>

                {/* FOOTER */}

                <View
                  style={
                    styles.footerSection
                  }
                >

                  <Text
                    style={
                      styles.footerText
                    }
                  >
                    Don't have an account?{' '}
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate(
                        'Register',
                      )
                    }
                    disabled={isLoading}
                  >

                    <Text
                      style={
                        styles.footerLink
                      }
                    >
                      Create account
                    </Text>

                  </TouchableOpacity>

                </View>

              </View>

            </ScrollView>

          </KeyboardAvoidingView>

        </SafeAreaView>
      </Animated.View>

      {/* =====================
          SPLASH SCREEN
      ====================== */}

      {showSplash && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.splashContainer,
            {
              opacity: splashOpacity,
            },
          ]}
        >

          <Image
            source={require(
              '../../../assets/animation/books.jpg'
            )}
            style={styles.splashImage}
            resizeMode="cover"
          />

          <View
            style={
              styles.splashOverlay
            }
          />

        </Animated.View>
      )}

    </View>
  );
};


// =========================
// STYLES
// =========================

const styles = StyleSheet.create({

  rootContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  loginScreen: {
    flex: 1,
  },

  splashContainer: {
    ...StyleSheet.absoluteFill,

    backgroundColor: '#000000',

    zIndex: 999,
    elevation: 999,
  },

  splashImage: {
    width: '100%',
    height: '100%',
  },

  splashOverlay: {
    ...StyleSheet.absoluteFill,

    backgroundColor:
      'rgba(0, 0, 0, 0.35)',
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,

    paddingHorizontal: 24,

    paddingTop: 8,
    paddingBottom: 32,
  },

  // =====================
  // HEADER
  // =====================

  topSection: {
    height: 64,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 42,
    height: 42,

    resizeMode: 'contain',
  },

  logoText: {
    marginLeft: 8,

    fontSize: 22,
    fontWeight: '800',

    color: '#15803D',

    letterSpacing: 0.5,
  },

  registerButtonText: {
    fontSize: 15,
    fontWeight: '700',

    color: '#15803D',
  },

  // =====================
  // TITLE
  // =====================

  titleSection: {
    marginTop: 48,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',

    color: '#111827',

    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: 8,

    fontSize: 16,
    lineHeight: 24,

    color: '#6B7280',
  },

  // =====================
  // FORM
  // =====================

  form: {
    marginTop: 40,
  },

  label: {
    marginBottom: 8,

    fontSize: 14,
    fontWeight: '700',

    color: '#374151',
  },

  inputContainer: {
    height: 56,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 16,

    backgroundColor: '#F9FAFB',

    borderWidth: 1,
    borderColor: '#E5E7EB',

    borderRadius: 14,

    marginBottom: 8,
  },

  inputContainerError: {
    borderColor: '#EF4444',

    backgroundColor: '#FEF2F2',
  },

  inputField: {
    flex: 1,

    height: '100%',

    marginLeft: 12,

    fontSize: 16,

    color: '#111827',
  },

  eyeButton: {
    width: 40,
    height: 48,

    justifyContent: 'center',
    alignItems: 'center',
  },

  error: {
    marginLeft: 4,
    marginBottom: 18,

    fontSize: 13,

    color: '#DC2626',
  },

  // =====================
  // FORGOT PASSWORD
  // =====================

  forgotPasswordContainer: {
    alignSelf: 'flex-end',

    minHeight: 30,

    justifyContent: 'center',

    marginTop: 2,
    marginBottom: 28,
  },

  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '700',

    color: '#15803D',
  },

  // =====================
  // PRIMARY BUTTON
  // =====================

  button: {
    height: 56,

    borderRadius: 16,

    backgroundColor: '#16A34A',

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.1,

    shadowRadius: 8,

    elevation: 4,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '800',

    color: '#FFFFFF',
  },

  disabledButton: {
    opacity: 0.55,
  },

  // =====================
  // DIVIDER
  // =====================

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    marginVertical: 24,
  },

  dividerLine: {
    flex: 1,
    height: 1,

    backgroundColor: '#E5E7EB',
  },

  dividerText: {
    marginHorizontal: 12,

    fontSize: 13,

    color: '#9CA3AF',
  },

  // =====================
  // GOOGLE BUTTON
  // =====================

  googleButton: {
    height: 56,

    flexDirection: 'row',

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#E5E7EB',

    borderRadius: 16,
  },

  disabledGoogleButton: {
    opacity: 0.55,
  },

  googleIconPlaceholder: {
    width: 24,
    height: 24,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,

    backgroundColor: '#F3F4F6',
  },

  googleIconText: {
    fontSize: 15,
    fontWeight: '800',

    color: '#4285F4',
  },

  googleButtonText: {
    fontSize: 16,
    fontWeight: '700',

    color: '#374151',
  },

  // =====================
  // FOOTER
  // =====================

  footerSection: {
    flexDirection: 'row',

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 32,
  },

  footerText: {
    fontSize: 14,

    color: '#6B7280',
  },

  footerLink: {
    fontSize: 14,
    fontWeight: '800',

    color: '#15803D',
  },

});