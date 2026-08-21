import HomeScreen from '../screens/user/HomeScreen';
import BorrowedBookScreen from '../screens/user/BorrowedBookScreen';
import BookDetailScreen from '../screens/book/BookDetailScreen';
import UpdateProfileScreen from '../screens/user/UpdateProfileScreen';
import AboutScreen from '../screens/user/AboutScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/user/ProfileScreen';
import { book, borrowBook, home, user,about } from '../constants/icon';
import { USER_ROUTES } from '../constants/routes';
import { UserStackParamList, UserTabParamList } from './types';
import BookScreen from '../screens/user/BookScreen';
import { StyleSheet, View } from 'react-native';

const Tab = createBottomTabNavigator<UserTabParamList>();
const Stack = createNativeStackNavigator<UserStackParamList>();

// Bottom Tab Navigator
function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#27AE60',
        tabBarInactiveTintColor: '#828282',
        tabBarStyle: {
          height: 85,                
          paddingTop: 10,             
          paddingBottom: 15,          
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
        },
        tabBarIcon: ({ color, focused }) => {
          let IconComponent: any = home;
          if (route.name === USER_ROUTES.HOME) IconComponent = home;
          else if (route.name == USER_ROUTES.ABOUT) IconComponent = about;
          else if (route.name == USER_ROUTES.BOOKS) IconComponent = book;
          else if (route.name == USER_ROUTES.BORROW) IconComponent = borrowBook;
          else if (route.name == USER_ROUTES.PROFILE) IconComponent = user;
          return (
            <View
              style={[
                styles.iconContainer,
                focused && styles.activeIconContainer, // Chỉ áp dụng khi focused là true
              ]}
            >
              <IconComponent color={color} size={24} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
       <Tab.Screen name="About" component={AboutScreen} />
      <Tab.Screen name="Books" component={BookScreen} />
      <Tab.Screen name="Borrow" component={BorrowedBookScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export const UserNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={UserTabs} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} />
    </Stack.Navigator>
  );
};

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
