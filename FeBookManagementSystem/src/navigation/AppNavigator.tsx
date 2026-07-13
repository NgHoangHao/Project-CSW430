import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { UserNavigator } from './UserNavigator';
import { AdminNavigator } from './AdminNavigator';
import { useAuth } from '../store/authProvider';

export const AppNavigator = () => {
  const { isLoggedIn, userRole } = useAuth();
  const isAdminOrLibrarian = userRole?.includes('ADMIN') || userRole?.includes('LIBRARIAN');
  return (
    <NavigationContainer>
      {isLoggedIn ? (
        isAdminOrLibrarian ? (
          <AdminNavigator />
        ) : (
          <UserNavigator />
        )
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};
