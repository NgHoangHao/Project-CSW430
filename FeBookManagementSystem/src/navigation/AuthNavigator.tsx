import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackParamList } from "./types";
import { ROUTES } from "../constants/routes";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen}/>
            <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen}/>
        </Stack.Navigator>
    )
}