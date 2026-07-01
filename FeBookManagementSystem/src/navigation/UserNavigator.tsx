import HomeScreen from '../screens/user/HomeScreen';
import BookScreen from '../screens/user/BookScreen';
import BorrowedBookScreen from '../screens/user/BorrowedBookScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from '../screens/user/ProfileScreen';
import { ROUTES } from '../constants/routes';
import { book, borrowBook, home, profile } from '../constants/icon';

const Tab = createBottomTabNavigator();

export const UserNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#27AE60',
        tabBarInactiveTintColor: '#828282',
        tabBarIcon: ({ color }) => {
          let IconComponent: any = home;
          if (route.name === ROUTES.HOME) IconComponent = home;
          else if (route.name == ROUTES.BOOKS) IconComponent = book;
          else if (route.name == ROUTES.BORROW) IconComponent = borrowBook;
          else if (route.name == ROUTES.PROFILE) IconComponent = profile;
          return <IconComponent color={color} size={24} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Books" component={BookScreen} />
      <Tab.Screen name="Borrow" component={BorrowedBookScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
