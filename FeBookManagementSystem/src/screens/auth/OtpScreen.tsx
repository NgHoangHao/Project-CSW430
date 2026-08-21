import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../../services/auth.service';
import { userService } from '../../services/user.service';
import { ROUTES } from '../../constants/routes';

const OTP_LENGTH = 6;
const COUNTDOWN_SECONDS = 5 * 60; // 5 minutes

export const OtpScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const { email, isForgetPass } = route.params as { email: string; isForgetPass?: boolean };

  // OTP digits stored as an array of strings
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs to each digit input
  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));

  // Shake animation for wrong OTP
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ─── Timer ────────────────────────────────────────────────────────────────
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(COUNTDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isExpired = timeLeft === 0;

  // ─── Shake animation ──────────────────────────────────────────────────────
  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // ─── OTP input handlers ───────────────────────────────────────────────────
  const handleChange = (text: string, index: number) => {
    // Allow only single digit
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const otpValue = otp.join('');
  const isComplete = otpValue.length === OTP_LENGTH;

  // ─── Verify OTP ───────────────────────────────────────────────────────────
  const handleVerify = async () => {
    if (!isComplete) {
      Alert.alert('Incomplete OTP', 'Please enter all 6 digits.');
      return;
    }
    if (isExpired) {
      Alert.alert('OTP Expired', 'Your OTP has expired. Please request a new one.');
      return;
    }
    try {
      setIsVerifying(true);
      if (isForgetPass) {
        await userService.verifyForgetPass(email,otpValue);
        Alert.alert('Authentication successful', 'Valid OTP! Please set a new password.', [
          {
            text: 'Continue',
            onPress: () => navigation.navigate(ROUTES.FORGOT_PASSWORD, { email }),
          },
        ]);
      } else {
        await authApi.verifyOTP(email, otpValue);
        // Success → navigate to Login
        Alert.alert('Success', 'Your account has been verified!', [
          {
            text: 'Login now',
            onPress: () => navigation.navigate(ROUTES.LOGIN),
          },
        ]);
      }
    } catch (error: any) {
      triggerShake();
      const message =
        error?.response?.data?.message || 'Invalid OTP. Please try again.';
      Alert.alert('Verification Failed', message);
      // Clear inputs and reset focus
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      setActiveIndex(0);
    } finally {
      setIsVerifying(false);
    }
  };

  // ─── Resend OTP ───────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (isResending) return;
    try {
      setIsResending(true);
      await authApi.resendOTP(email);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      setActiveIndex(0);
      startTimer();
      Alert.alert('OTP Sent', `A new OTP has been sent to ${email}`);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Failed to resend OTP. Please try again.';
      Alert.alert('Resend Failed', message);
    } finally {
      setIsResending(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.inner}>
              {/* ── Header ── */}
              <View style={styles.topSection}>
                <Image
                  source={require('../../../assets/auth/logo.png')}
                  style={styles.logo}
                />
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
              </View>

              {/* ── Title ── */}
              <View style={styles.titleSection}>
                <Text style={styles.title}>Verify your email</Text>
                <Text style={styles.subtitle}>
                  We sent a 6-digit code to
                </Text>
                <Text style={styles.emailText}>{email}</Text>
              </View>

              {/* ── OTP Inputs ── */}
              <Animated.View
                style={[
                  styles.otpRow,
                  { transform: [{ translateX: shakeAnim }] },
                ]}
              >
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={ref => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpBox,
                      activeIndex === index && styles.otpBoxActive,
                      digit !== '' && styles.otpBoxFilled,
                      isExpired && styles.otpBoxExpired,
                    ]}
                    value={digit}
                    onChangeText={text => handleChange(text, index)}
                    onKeyPress={e => handleKeyPress(e, index)}
                    onFocus={() => setActiveIndex(index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    editable={!isExpired}
                  />
                ))}
              </Animated.View>

              {/* ── Countdown ── */}
              <View style={styles.timerContainer}>
                {isExpired ? (
                  <Text style={styles.timerExpired}>OTP expired</Text>
                ) : (
                  <>
                    <Text style={styles.timerLabel}>Code expires in </Text>
                    <Text
                      style={[
                        styles.timerValue,
                        timeLeft <= 60 && styles.timerValueWarning,
                      ]}
                    >
                      {formatTime(timeLeft)}
                    </Text>
                  </>
                )}
              </View>

              {/* ── Verify Button ── */}
              <TouchableHighlight
                style={[
                  styles.button,
                  (!isComplete || isExpired || isVerifying) && styles.buttonDisabled,
                ]}
                underlayColor="#227a43"
                onPress={handleVerify}
                disabled={!isComplete || isExpired || isVerifying}
              >
                <Text style={styles.buttonText}>
                  {isVerifying ? 'Verifying…' : 'Verify OTP'}
                </Text>
              </TouchableHighlight>

              {/* ── Resend OTP ── */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendLabel}>Didn't receive the code?</Text>
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={isResending}
                  style={styles.resendButton}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.resendText,
                      isResending && styles.resendTextDisabled,
                    ]}
                  >
                    {isResending ? 'Sending…' : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ── Back to Register ── */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate(ROUTES.REGISTER)}
              >
                <Text style={styles.backText}>← Back to Register</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  inner: {
    flex: 1,
  },
  // ── Header
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 70,
    width: '100%',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  loginButtonText: {
    color: '#2c9e56',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // ── Title
  titleSection: {
    marginTop: 30,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  emailText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2c9e56',
    marginTop: 4,
    textAlign: 'center',
  },
  // ── OTP boxes
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d0e8d8',
    backgroundColor: '#daf0df',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
  },
  otpBoxActive: {
    borderColor: '#2c9e56',
    backgroundColor: '#edf9f0',
    shadowColor: '#2c9e56',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  otpBoxFilled: {
    borderColor: '#2c9e56',
    backgroundColor: '#c8edd3',
  },
  otpBoxExpired: {
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
    color: '#bbb',
  },
  // ── Timer
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  timerLabel: {
    fontSize: 14,
    color: '#888',
  },
  timerValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c9e56',
  },
  timerValueWarning: {
    color: '#e05555',
  },
  timerExpired: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e05555',
  },
  // ── Verify button
  button: {
    backgroundColor: '#2c9e56',
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: '#2c9e56',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 28,
  },
  buttonDisabled: {
    backgroundColor: '#9ecfb0',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // ── Resend
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resendButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#2c9e56',
    backgroundColor: '#edf9f0',
  },
  resendText: {
    color: '#2c9e56',
    fontWeight: '700',
    fontSize: 14,
  },
  resendTextDisabled: {
    color: '#9ecfb0',
  },
  // ── Back
  backButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  backText: {
    color: '#888',
    fontSize: 14,
  },
});
