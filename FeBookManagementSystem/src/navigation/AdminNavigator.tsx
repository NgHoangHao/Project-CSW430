import BookScreen from '../screens/user/BookScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { book, home, loan, request, user, users } from '../constants/icon';
import { ADMIN_ROUTES } from '../constants/routes';
import { AdminStackParamList } from './types';
import ProfileScreen from '../screens/admin/ProfileScreen';
import RequestScreen from '../screens/admin/RequestManagementScreen';
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
        tabBarIcon: ({ color }) => {
          let IconComponent: any = home;
          if (route.name === ADMIN_ROUTES.DASHBOARD) IconComponent = home;
          else if (route.name == ADMIN_ROUTES.BOOKS) IconComponent = book;
          else if (route.name == ADMIN_ROUTES.USER) IconComponent = users;
          else if (route.name == ADMIN_ROUTES.REQUEST) IconComponent = request;
          else if (route.name == ADMIN_ROUTES.LOAN) IconComponent = loan;
          else if (route.name == ADMIN_ROUTES.PROFILE) IconComponent = user;
          return <IconComponent color={color} size={24} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Books" component={BookScreen} />
      {userRole?.includes('ADMIN') && (
        <Tab.Screen name="User" component={UserManagement} />
      )}
      <Tab.Screen name="Loan" component={LoanManagement} />
      <Tab.Screen name="Request" component={RequestScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
