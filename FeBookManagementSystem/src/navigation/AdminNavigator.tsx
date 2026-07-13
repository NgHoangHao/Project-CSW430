import HomeScreen from '../screens/user/HomeScreen';
import BookScreen from '../screens/user/BookScreen';
import BorrowedBookScreen from '../screens/user/BorrowedBookScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { book, borrowBook, home, profile } from '../constants/icon';
import { ADMIN_ROUTES } from '../constants/routes';
import { AdminStackParamList } from './types';
import ProfileScreen from '../screens/admin/ProfileScreen';

const Tab = createBottomTabNavigator<AdminStackParamList>();

export const AdminNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#27AE60',
        tabBarInactiveTintColor: '#828282',
        tabBarIcon: ({ color }) => {
          let IconComponent: any = home;
          if (route.name === ADMIN_ROUTES.DASHBOARD) IconComponent = home;
          else if (route.name == ADMIN_ROUTES.BOOKS) IconComponent = book;
          else if (route.name == ADMIN_ROUTES.USER) IconComponent = borrowBook;
          else if (route.name == ADMIN_ROUTES.PROFILE) IconComponent = profile;
          return <IconComponent color={color} size={24} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} />
      <Tab.Screen name="Books" component={BookScreen} />
      <Tab.Screen name="User" component={BorrowedBookScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen}/>
    </Tab.Navigator>
  );
};
