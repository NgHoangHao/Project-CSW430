import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackParamList } from "./types";
import { ROUTES } from "../constants/routes";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { OtpScreen } from "../screens/auth/OtpScreen";
import { PassInputScreen } from "../screens/auth/PassInputScreen";
import SplashScreen from "../screens/auth/SplashScreen";


const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="Login">
            <Stack.Screen name={ROUTES.SPLASH} component={SplashScreen}/>
            <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen}/>
            <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen}/>
            <Stack.Screen name={ROUTES.OTP_VERIFY} component={OtpScreen}/>
            <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={PassInputScreen}/>
        </Stack.Navigator>
    )
}