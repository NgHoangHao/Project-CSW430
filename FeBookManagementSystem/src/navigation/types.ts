export type RootStackParamList = {
    AuthStack: undefined;
}

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    OtpVerify: { email: string };
    // ForgotPassword: undefined;
    // ResetPassword: undefined;
}

export type UserTabParamList = {
    Home: undefined;
    Books: undefined;
    Borrow: undefined;
    Profile: undefined;
}

export type UserStackParamList = UserTabParamList & {
    BookSearch: undefined;
    BookDetail: { bookId: string };
}

export type AdminStackParamList = {
    Dashboard: undefined;
    Books: undefined;
    User: undefined;
}