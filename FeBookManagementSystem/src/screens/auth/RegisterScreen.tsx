import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { ROUTES } from '../../constants/routes';
export const RegisterScreen = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [isVisiblePassword, setIsVisiblePassword] = useState(false);
  const [isVisibleConfirmPassword, setIsVisibleConfirmPassword] =
    useState(false);
  const [errors, setErrors] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isRegistering, setIsRegistering] = useState(false);
  const handleRegister = async () => {
    const newErrors = {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
    let isValid = true;
    if (!userName.trim()) {
      newErrors.userName = "Vui lòng nhập họ và tên";
      isValid = false;
    }
    if (!email.trim()) {
      newErrors.email = "Vui lòng nhập email";
      isValid = false;
    }
    if (!password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu";
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
      isValid = false;
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
      isValid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Mật khẩu nhập lại không khớp";
      isValid = false;
    }
    setErrors(newErrors);
    if (!isValid) return;
    try {
      setIsRegistering(true);
      await authApi.register({ email, password, userName, confirmPassword });
      setIsRegistering(false);
      navigation.navigate(ROUTES.OTP_VERIFY, { email });
    } catch (error: any) {
      setIsRegistering(false);
      console.log("Đăng ký lỗi:", error);
      const message =
        error?.response?.data?.message || "Đăng ký không thành công. Vui lòng thử lại.";
      Alert.alert("Đăng ký thất bại", message);
    }
  };
  return (
    <SafeAreaView style={[styles.container]}>
      <KeyboardAvoidingView
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS == 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              <View style={styles.topSection}>
                <Image
                  source={require('../../../assets/auth/logo.png')}
                  style={styles.logo}
                />
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('Login');
                  }}
                >
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.titleSection}>
                <Text style={styles.title}>Create an account</Text>
                <Text style={styles.subtitle}>
                  Create account to be a member
                </Text>
              </View>
              <View style={styles.form}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Cristiano Ronaldo"
                  placeholderTextColor={'#aaa'}
                  value={userName}
                  onChangeText={setUserName}
                />
                {errors.userName ? (
                  <Text style={styles.error}>{errors.userName}</Text>
                ) : null}
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={'#aaa'}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email ? (
                  <Text style={styles.error}>{errors.email}</Text>
                ) : null}
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordComponent}>
                  <TextInput
                    style={[styles.input]}
                    placeholder="Enter your password"
                    placeholderTextColor="#aaa"
                    secureTextEntry={isVisiblePassword == false}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                  />
                  {errors.password ? (
                    <Text style={styles.error}>{errors.password}</Text>
                  ) : null}
                  {isVisiblePassword ? (
                    <TouchableOpacity
                      onPress={() => {
                        setIsVisiblePassword(!isVisiblePassword);
                      }}
                      style={styles.eyeIcon}
                    >
                      <Eye />
                    </TouchableOpacity>
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
                    <TouchableOpacity
                      onPress={() => {
                        setIsVisibleConfirmPassword(!isVisibleConfirmPassword);
                      }}
                      style={styles.eyeIcon}
                    >
                      <Eye />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        setIsVisibleConfirmPassword(!isVisibleConfirmPassword);
                      }}
                      style={styles.eyeIcon}
                    >
                      <EyeOff />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              {isRegistering ? (
                <ActivityIndicator size="large" color="#2c9e56" style={{ marginVertical: 15 }} />
              ) : (
                <TouchableHighlight
                  style={[
                    styles.button,
                    { marginTop: 30, borderRadius: 50 },
                  ]}
                  onPress={handleRegister}
                >
                  <Text style={styles.buttonText}>Register</Text>
                </TouchableHighlight>
              )}
              <View style={styles.footerSection}>
                <Text>You already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={{ color: '#2c9e56ff', fontWeight: 'bold' }}>
                    Login
                  </Text>
                </TouchableOpacity>
              </View>
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
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  error: {
    color: "red",
    fontSize: 13,
    marginTop: -15,
    marginBottom: 15,
    marginLeft: 10,
  },
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
  },
  loginButtonText: {
    color: '#2c9e56ff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleSection: {
    marginTop: 30,
    width: '100%',
  },
  title: {
    fontSize: 25,
    color: '#000',
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  form: {
    marginTop: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#daf0df',
    color: '#000',
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 15,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2c9e56ff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  passwordComponent: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 10,
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
});
