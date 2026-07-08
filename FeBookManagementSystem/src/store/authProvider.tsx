import { createContext, useContext, useEffect, useState } from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import api from '../lib/axios';
import { authApi } from '../services/auth.service';
import { LoginDTO } from '../types/auth';
import { ActivityIndicator, View } from 'react-native';

export interface UserProfile {
  userId?: string;
  userName?: string;
  email?: string;
  phone?: string;
  status?: string;
  credit?: number;
  [key: string]: any;
}

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: string[];
  user: UserProfile | null;
  login: (data: LoginDTO) => Promise<void>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const accessToken = await EncryptedStorage.getItem('accessToken');
        const savedRole = await EncryptedStorage.getItem('userRole');
        if (accessToken && savedRole) {
          setLoggedIn(true);
          setUserRole(JSON.parse(savedRole));
          try {
            const res = await api.get('/user/profile');
            if (res.data) {
              setUser(res.data);
            }
          } catch (profileError) {
            console.log('Error fetching profile on bootstrap:', profileError);
          }
        }
      } catch (error) {
        console.log('Error get token', error);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapAuth();
  }, []);

  const logout = async () => {
    try {
      await authApi.logout();
      setLoggedIn(false);
      setUserRole([]);
      setUser(null);
      await EncryptedStorage.removeItem('accessToken');
      await EncryptedStorage.removeItem('refreshToken');
    } catch (error) {
      console.log('Error logout', error);
      setLoggedIn(false);
      setUserRole([]);
      setUser(null);
      await EncryptedStorage.clear();
      throw error;
    }
  };

  const login = async (data: LoginDTO) => {
    try {
      const res = await authApi.login(data);
      const { accessToken, refreshToken, roleNames } = res.data;
      setLoggedIn(true);
      setUserRole(roleNames);
      await EncryptedStorage.setItem('accessToken', accessToken);
      await EncryptedStorage.setItem('refreshToken', refreshToken);
      await EncryptedStorage.setItem('userRole', JSON.stringify(roleNames));
      try {
        const profileRes = await api.get('/user/profile');
        if (profileRes.data) {
          setUser(profileRes.data);
        }
      } catch (profileError) {
        console.log('Error fetching profile after login:', profileError);
      }
    } catch (error) {
      console.log('Error login', error);
      setLoggedIn(false);
      setUserRole([]);
      setUser(null);
      await EncryptedStorage.clear();
      throw error;
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }
  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
