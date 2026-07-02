import { Eye, EyeIcon, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import {
  Button,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVisiblePassword, setIsVisiblePassword] = useState(false);

  const handleLogin = () => {
    // Xử lý đăng nhập
    console.log('Đăng nhập thành công');
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <Image
          source={require('../../../assets/auth/logo.png')}
          style={styles.logo}
        />
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Register');
          }}
        >
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.titleSection}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Login to your account to continue</Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.form}
      >
        <View>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={'#aaa'}
          />
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordComponent}>
            <TextInput
              style={[styles.input]}
              placeholder="Enter your password"
              placeholderTextColor="#aaa"
              secureTextEntry={isVisiblePassword == false}
            />
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
        </View>
        <TouchableHighlight
          style={[styles.button, { marginTop: 30, borderRadius: 50 }]}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableHighlight>
        <View style={styles.footerSection}>
          <Text>You already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={{ color: '#2c9e56ff', fontWeight: 'bold' }}>
              Register
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 100,
    width: '100%',
  },
  logo: {
    width: 50,
    height: 50,
  },
  registerButtonText: {
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
  footerSection: {
    top: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
