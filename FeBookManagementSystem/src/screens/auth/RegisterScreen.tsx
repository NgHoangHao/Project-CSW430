import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from 'lucide-react-native';

import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authApi } from '../../services/auth.service';
import { ROUTES } from '../../constants/routes';

export const RegisterScreen = ({
  navigation,
}: {
  navigation: any;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');
  const [userName, setUserName] = useState('');

  const [isVisiblePassword, setIsVisiblePassword] =
    useState(false);

  const [
    isVisibleConfirmPassword,
    setIsVisibleConfirmPassword,
  ] = useState(false);

  const [isRegistering, setIsRegistering] =
    useState(false);

  const [errors, setErrors] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });


  const clearError = (
    field:
      | 'userName'
      | 'email'
      | 'password'
      | 'confirmPassword',
  ) => {
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };


  const validateRegister = () => {
    const newErrors = {
      userName: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    let isValid = true;

    if (!userName.trim()) {
      newErrors.userName =
        'Please enter your full name.';
      isValid = false;
    } else if (userName.trim().length < 2) {
      newErrors.userName =
        'Name must be at least 2 characters.';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email =
        'Please enter your email address.';
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
        'Please enter a password.';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password =
        'Password must be at least 8 characters.';
      isValid = false;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword =
        'Please confirm your password.';
      isValid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword =
        'Passwords do not match.';
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  };



  const handleRegister = async () => {
    if (isRegistering) return;

    if (!validateRegister()) {
      return;
    }

    try {
      Keyboard.dismiss();

      setIsRegistering(true);

      await authApi.register({
        email: email.trim(),
        password,
        userName: userName.trim(),
        confirmPassword,
      });

      navigation.navigate(
        ROUTES.OTP_VERIFY,
        {
          email: email.trim(),
        },
      );
    } catch (error: any) {
      console.log(
        'Registration error:',
        error,
      );

      const message =
        error?.response?.data?.message ||
        'Registration failed. Please try again.';

      Alert.alert(
        'Registration failed',
        message,
      );
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        style={styles.keyboardContainer}
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
        >
          <ScrollView
            contentContainerStyle={
              styles.scrollContainer
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

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
                  navigation.navigate('Login')
                }
                disabled={isRegistering}
              >
                <Text
                  style={styles.loginButtonText}
                >
                  Sign in
                </Text>
              </Pressable>
            </View>


            <View style={styles.titleSection}>
              <Text style={styles.title}>
                Create account
              </Text>

              <Text style={styles.subtitle}>
                Create your account and start
                exploring K2H.
              </Text>
            </View>

            <View style={styles.form}>

              <Text style={styles.label}>
                Full name
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  errors.userName &&
                  styles.inputContainerError,
                ]}
              >
                <User
                  size={20}
                  color="#6B7280"
                />

                <TextInput
                  style={styles.inputField}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  value={userName}
                  editable={!isRegistering}
                  autoCapitalize="words"
                  onChangeText={text => {
                    setUserName(text);
                    clearError('userName');
                  }}
                />
              </View>

              {errors.userName ? (
                <Text style={styles.error}>
                  {errors.userName}
                </Text>
              ) : null}

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
                  editable={!isRegistering}
                  onChangeText={text => {
                    setEmail(text);
                    clearError('email');
                  }}
                />
              </View>

              {errors.email ? (
                <Text style={styles.error}>
                  {errors.email}
                </Text>
              ) : null}

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
                  placeholder="At least 8 characters"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={
                    !isVisiblePassword
                  }
                  value={password}
                  editable={!isRegistering}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={text => {
                    setPassword(text);
                    clearError('password');

                    if (
                      errors.confirmPassword
                    ) {
                      clearError(
                        'confirmPassword',
                      );
                    }
                  }}
                />

                <TouchableOpacity
                  onPress={() =>
                    setIsVisiblePassword(
                      prev => !prev,
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
                    <TouchableOpacity
                      onPress={() => {
                        setIsVisiblePassword(!isVisiblePassword);
                      }}
                      style={styles.eyeIcon}
                    >
                      <EyeOff />
                    </TouchableOpacity>
                  )}
              </View>
              <Text style={styles.label}>Confirm password</Text>
              <View style={styles.passwordComponent}>
                <TextInput
                  style={[styles.input]}
                  placeholder="Enter your password"
                  placeholderTextColor="#aaa"
                  secureTextEntry={isVisibleConfirmPassword == false}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                />
                {errors.confirmPassword ? (
                  <Text style={styles.error}>{errors.confirmPassword}</Text>
                ) : null}
                {isVisibleConfirmPassword ? (
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

            {errors.confirmPassword ? (
              <Text style={styles.error}>
                {errors.confirmPassword}
              </Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.button,
                isRegistering &&
                styles.disabledButton,
              ]}
              onPress={handleRegister}
              disabled={isRegistering}
              activeOpacity={0.85}
            >
              {isRegistering ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={styles.buttonText}
                >
                  Create account
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.footerSection}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Login')
                }
                disabled={isRegistering}
              >
                <Text style={styles.footerLink}>
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
    </SafeAreaView >
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },

  // HEADER

  topSection: {
    height: 64,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  loginButtonText: {
    fontSize: 15,
    fontWeight: '700',

    color: '#15803D',
  },

  // TITLE

  titleSection: {
    marginTop: 32,
  },

  title: {
    fontSize: 30,
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

  // FORM

  form: {
    marginTop: 36,
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

  // REGISTER BUTTON

  button: {
    height: 56,

    marginTop: 8,

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

  disabledButton: {
    opacity: 0.55,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '800',

    color: '#FFFFFF',
  },

  // FOOTER

  footerSection: {
    flexDirection: 'row',

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 28,
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