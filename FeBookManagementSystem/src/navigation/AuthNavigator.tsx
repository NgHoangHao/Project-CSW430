import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackParamList } from "./types";
import { ROUTES } from "../constants/routes";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { OtpScreen } from "../screens/auth/OtpScreen";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen}/>
            <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen}/>
            <Stack.Screen name={ROUTES.OTP_VERIFY} component={OtpScreen}/>
        </Stack.Navigator>
    )
}