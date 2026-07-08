import HomeScreen from '../screens/user/HomeScreen';
import BookScreen from '../screens/user/BookScreen';
import BorrowedBookScreen from '../screens/user/BorrowedBookScreen';
import BookSearch from '../screens/book/BookSearch';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/user/ProfileScreen';
import { book, borrowBook, home, profile } from '../constants/icon';
import { USER_ROUTES } from '../constants/routes';
import { UserStackParamList, UserTabParamList } from './types';

const Tab = createBottomTabNavigator<UserTabParamList>();
const Stack = createNativeStackNavigator<UserStackParamList>();

// Bottom Tab Navigator (nested inside Stack)
function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#27AE60',
        tabBarInactiveTintColor: '#828282',
        tabBarIcon: ({ color }) => {
          let IconComponent: any = home;
          if (route.name === USER_ROUTES.HOME) IconComponent = home;
          else if (route.name == USER_ROUTES.BOOKS) IconComponent = book;
          else if (route.name == USER_ROUTES.BORROW) IconComponent = borrowBook;
          else if (route.name == USER_ROUTES.PROFILE) IconComponent = profile;
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
}

export const UserNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={UserTabs} />
      <Stack.Screen
        name="BookSearch"
        component={BookSearch}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};
