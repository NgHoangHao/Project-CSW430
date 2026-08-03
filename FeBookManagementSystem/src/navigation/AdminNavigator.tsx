import React from 'react';
import { View, StyleSheet } from 'react-native'; // Import thêm View và StyleSheet
import BookManagementScreen from '../screens/admin/BookManagementScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { book, home, loan, user, users } from '../constants/icon';
import { ADMIN_ROUTES } from '../constants/routes';
import { AdminStackParamList } from './types';
import ProfileScreen from '../screens/admin/ProfileScreen';
import Dashboard from '../screens/admin/DashBoardAdminScreen';
import UserManagement from '../screens/admin/UserManagementScreen';
import { useAuth } from '../store/authProvider';
import LoanManagement from '../screens/admin/LoanManagementScreen';

const Tab = createBottomTabNavigator<AdminStackParamList>();

export const AdminNavigator = () => {
  const { userRole } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#27AE60',
        tabBarInactiveTintColor: '#828282',
        tabBarStyle: {
          height: 90,                 // Tăng chiều cao tổng thể của thanh bottom bar (bạn có thể tăng lên 90 nếu muốn cao hơn nữa)
          paddingTop: 10,             // Đẩy icon xuống một chút cho đỡ sát mép trên
          paddingBottom: 15,          // Đẩy chữ lên một chút cho đỡ sát mép dưới
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
        },
        tabBarIcon: ({ color, focused }) => {
          let IconComponent: any = home;
          if (route.name === ADMIN_ROUTES.DASHBOARD) IconComponent = home;
          else if (route.name === ADMIN_ROUTES.BOOKS) IconComponent = book;
          else if (route.name === ADMIN_ROUTES.USER) IconComponent = users;
          else if (route.name === ADMIN_ROUTES.LOAN) IconComponent = loan;
          else if (route.name === ADMIN_ROUTES.PROFILE) IconComponent = user;

          return (
            /* Bọc Icon trong một View để tạo hình nền tròn */
            <View style={[
              styles.iconContainer,
              focused && styles.activeIconContainer // Chỉ áp dụng khi focused là true
            ]}>
              <IconComponent color={color} size={24} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Books" component={BookManagementScreen} />
      {userRole?.includes('ADMIN') && (
        <Tab.Screen name="User" component={UserManagement} />
      )}
      <Tab.Screen name="Loan" component={LoanManagement} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Tạo Styles để code sạch sẽ hơn
const styles = StyleSheet.create({
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Mặc định không có nền
  },
  activeIconContainer: {
    backgroundColor: '#E8F8EE', // Màu nền xanh nhạt khi active (bạn có thể đổi màu tùy ý)
  },
});