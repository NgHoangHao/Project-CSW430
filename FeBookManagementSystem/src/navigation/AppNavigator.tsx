import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { UserNavigator } from './UserNavigator';
import { AdminNavigator } from './AdminNavigator';
import { useAuth } from '../store/authProvider';

export const AppNavigator = () => {
  const { isLoggedIn, userRole } = useAuth();
  return (
    <NavigationContainer>
      {isLoggedIn ? (
        userRole?.includes('ADMIN') ? (
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
