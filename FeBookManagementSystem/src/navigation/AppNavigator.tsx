import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { UserNavigator } from './UserNavigator';

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      {/* <AuthNavigator /> */}
      <UserNavigator />
    </NavigationContainer>
  );
};
