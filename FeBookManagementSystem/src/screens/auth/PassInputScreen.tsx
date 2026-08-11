import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import {
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
import { userService } from '../../services/user.service';
import { ROUTES } from '../../constants/routes';

export const PassInputScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const { email } = route.params as { email: string };

  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isVisiblePassword, setIsVisiblePassword] = useState(false);
  const [isVisibleConfirmPassword, setIsVisibleConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [errors, setErrors] = useState({
    newPass: '',
    confirmPass: '',
  });

  const handleResetPassword = async () => {
    const newErrors = {
      newPass: '',
      confirmPass: '',
    };
    let isValid = true;

    if (!newPass.trim()) {
      newErrors.newPass = 'Please enter a new password.';
      isValid = false;
    } else if (newPass.length < 8) {
      newErrors.newPass = 'The password must be at least 8 characters long.';
      isValid = false;
    }

    if (!confirmPass.trim()) {
      newErrors.confirmPass = 'Please enter a new password.';
      isValid = false;
    } else if (confirmPass !== newPass) {
      newErrors.confirmPass = 'The confirmation password does not match.';
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) return;

    try {
      setIsResetting(true);
      await userService.forgotPass(email, newPass, confirmPass);
      Alert.alert('Success', 'Password reset successful! Please log in again.', [
        {
          text: 'Sign In',
          onPress: () => navigation.navigate(ROUTES.LOGIN),
        },
      ]);
    } catch (error: any) {
      console.log('Reset password error:', error);
      const message = error?.response?.data?.message || 'An error occurred during the password reset process.';
      Alert.alert('Error', message);
    } finally {
      setIsResetting(false);
    }
  };

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
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              {/* Header Section */}
              <View style={styles.topSection}>
                <Image
                  source={require('../../../assets/auth/logo.png')}
                  style={styles.logo}
                />
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
              </View>

              {/* Title Section */}
              <View style={styles.titleSection}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                  Enter your new password below for {email}
                </Text>
              </View>

              {/* Form Section */}
              <View style={styles.form}>
                {/* Input New Password */}
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordComponent}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your new password"
                    placeholderTextColor="#aaa"
                    secureTextEntry={!isVisiblePassword}
                    value={newPass}
                    onChangeText={setNewPass}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setIsVisiblePassword(!isVisiblePassword)}
                    style={styles.eyeIcon}
                    activeOpacity={0.7}
                  >
                    {isVisiblePassword ? <Eye size={22} color="#666" /> : <EyeOff size={22} color="#666" />}
                  </TouchableOpacity>
                </View>
                {errors.newPass ? <Text style={styles.error}>{errors.newPass}</Text> : null}

                {/* Input Confirm Password */}
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.passwordComponent}>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your new password"
                    placeholderTextColor="#aaa"
                    secureTextEntry={!isVisibleConfirmPassword}
                    value={confirmPass}
                    onChangeText={setConfirmPass}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setIsVisibleConfirmPassword(!isVisibleConfirmPassword)}
                    style={styles.eyeIcon}
                    activeOpacity={0.7}
                  >
                    {isVisibleConfirmPassword ? <Eye size={22} color="#666" /> : <EyeOff size={22} color="#666" />}
                  </TouchableOpacity>
                </View>
                {errors.confirmPass ? <Text style={styles.error}>{errors.confirmPass}</Text> : null}
              </View>

              {/* Submit Button */}
              <TouchableHighlight
                style={[styles.button, isResetting && { opacity: 0.7 }]}
                underlayColor="#227a43"
                onPress={handleResetPassword}
                disabled={isResetting}
              >
                <Text style={styles.buttonText}>
                  {isResetting ? 'Saving...' : 'Reset Password'}
                </Text>
              </TouchableHighlight>
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
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 50,
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
    resizeMode: 'contain',
  },
  loginButtonText: {
    color: '#2c9e56',
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleSection: {
    marginTop: 30,
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
    paddingRight: 50,
    marginBottom: 20,
  },
  passwordComponent: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 12,
  },
  button: {
    backgroundColor: '#2c9e56',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#2c9e56',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontSize: 13,
    marginTop: -15,
    marginBottom: 15,
    marginLeft: 10,
  },
});
