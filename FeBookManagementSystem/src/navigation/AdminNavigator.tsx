import HomeScreen from '../screens/user/HomeScreen';
import BookScreen from '../screens/user/BookScreen';
import BorrowedBookScreen from '../screens/user/BorrowedBookScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { book, borrowBook, home, profile } from '../constants/icon';
import { ADMIN_ROUTES } from '../constants/routes';

const Tab = createBottomTabNavigator();

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
          return <IconComponent color={color} size={24} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} />
      <Tab.Screen name="Books" component={BookScreen} />
      <Tab.Screen name="User" component={BorrowedBookScreen} />
    </Tab.Navigator>
  );
};
