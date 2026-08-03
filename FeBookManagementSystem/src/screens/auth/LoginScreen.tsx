import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../store/authProvider';
import { authApi } from '../../services/auth.service';
import { ROUTES } from '../../constants/routes';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVisiblePassword, setIsVisiblePassword] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const { login, loginGG } = useAuth();

  const handleLogin = async () => {
    const newErrors = {
      email: '',
      password: '',
    };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'Please enter the email';
      isValid = false;
    }
    if (!password.trim()) {
      newErrors.password = 'Please enter the password';
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) return;

    try {
      setIsLoading(true);
      await login({ email: email.trim(), password });
    } catch (error: any) {
      console.log(error);
      const message = error?.response?.data?.message || 'Login failed. Please check again.';
      Alert.alert('Login failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Please enter your email', 'Enter your email to recover your password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid email', 'Please enter a valid email format.');
      return;
    }

    try {
      setIsSendingOtp(true);
      await authApi.resendOTP(email.trim());
      navigation.navigate(ROUTES.OTP_VERIFY, { email: email.trim(), isForgetPass: true });
    } catch (error: any) {
      console.log('Forgot password OTP send error:', error);
      const message = error?.response?.data?.message || 'Unable to send the verification code. Please try again.';
      Alert.alert('Lỗi', message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const signInGoogle = async () => {
  try {
    setIsLoading(true);
    await GoogleSignin.hasPlayServices();
    try {
      await GoogleSignin.signOut();
    } catch (e) {
      // Bỏ qua lỗi nếu trước đó chưa từng đăng nhập
    }
    
    // 1. Thực hiện đăng nhập
    const signInResponse = await GoogleSignin.signIn();

    // 2. Lấy idToken từ response (tương thích v11+ và bản cũ)
    let idToken = 
      (signInResponse as any)?.data?.idToken || 
      (signInResponse as any)?.idToken;

    // 3. Lấy đầy đủ tokens từ GoogleSignin.getTokens()
    const tokens = await GoogleSignin.getTokens();
    idToken = idToken || tokens.idToken;
    const accessToken = tokens.accessToken;

    if (!idToken) {
      throw new Error('Google sign-in did not return an idToken');
    }

    // 4. Truyền accessToken (hoặc null nếu undefined) vào credential
    const googleCredential = auth.GoogleAuthProvider.credential(idToken, accessToken);
    
    // 5. Đăng nhập vào Firebase
    await auth().signInWithCredential(googleCredential);

    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    const firebaseToken = await currentUser.getIdToken();
    await loginGG(firebaseToken);

  } catch (error: any) {
    console.log('Google login error:', error);
    const message =
      error?.response?.data?.message ||
      error.message ||
      'Google login failed. Please try again.';
    Alert.alert('Login failed', message);
  } finally {
    setIsLoading(false);
  }
};
  return (
    <SafeAreaView style={styles.container}>
      {/* Đưa KeyboardAvoidingView ra ngoài cùng để đẩy toàn màn hình mượt mà hơn */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Section */}
          <View style={styles.topSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/auth/logo.png')}
                style={styles.logo}
              />
              <Text style={styles.logoText}>K2H</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>
              Login to your account to continue
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            {/* Input Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={'#aaa'}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: '' }));
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? (
              <Text style={styles.error}>{errors.email}</Text>
            ) : null}

            {/* Input Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#aaa"
                secureTextEntry={!isVisiblePassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setIsVisiblePassword(!isVisiblePassword)}
                style={styles.eyeIcon}
                activeOpacity={0.7}
              >
                {isVisiblePassword ? (
                  <Eye size={22} color="#666" />
                ) : (
                  <EyeOff size={22} color="#666" />
                )}
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.error}>{errors.password}</Text>
            ) : null}

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordContainer}
              disabled={isSendingOtp || isLoading}
              activeOpacity={0.7}
            >
              {isSendingOtp ? (
                <ActivityIndicator size="small" color="#2c9e56" style={{ marginRight: 10 }} />
              ) : (
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              )}
            </TouchableOpacity>

            {/* Button Login */}
            {isLoading ? (
              <ActivityIndicator size="large" color="#2c9e56" style={{ marginVertical: 15 }} />
            ) : (
              <>
                <TouchableHighlight
                  style={styles.button}
                  underlayColor="#227a43"
                  onPress={handleLogin}
                >
                  <Text style={styles.buttonText}>Login</Text>
                </TouchableHighlight>

                <TouchableHighlight
                  style={styles.googleButton}
                  underlayColor="#f5f5f5"
                  onPress={signInGoogle}
                >
                  <Text style={styles.googleButtonText}>Login with Google</Text>
                </TouchableHighlight>
              </>
            )}

            {/* Footer Section */}
            <View style={styles.footerSection}>
              <Text style={styles.footerText}>
                You already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.footerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Thêm nền trắng chủ đạo cho sạch sẽ
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
    marginRight: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c9e56',
  },
  registerButtonText: {
    color: '#2c9e56',
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleSection: {
    marginTop: 20,
    width: '100%',
  },
  title: {
    fontSize: 28,
    color: '#000',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
    marginTop: 5,
  },
  error: {
    color: 'red',
    fontSize: 13,
    marginTop: -15,
    marginBottom: 15,
    marginLeft: 10,
  },
  form: {
    marginTop: 30,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#daf0df',
    color: '#000',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#daf0df',
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1, // Để ô input chiếm hết khoảng trống trừ icon mắt
    color: '#000',
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    paddingRight: 50, // Tránh chữ đè lên icon mắt khi gõ dài
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    height: '100%',
    justifyContent: 'center', // Căn giữa icon mắt theo chiều dọc chuẩn 100%
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -5,
  },
  forgotPasswordText: {
    color: '#2c9e56',
    fontWeight: 'bold',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2c9e56',
    paddingVertical: 15,
    borderRadius: 30, // Bo tròn thanh lịch
    alignItems: 'center',
    shadowColor: '#2c9e56', // Thêm chút shadow giúp nút nổi bật hơn
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  googleButtonText: {
    color: '#444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerSection: {
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  footerLink: {
    color: '#2c9e56',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
