export type RootStackParamList = {
    AuthStack: undefined;
}

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    OtpVerify: { email: string; isForgetPass?: boolean };
    ForgotPassword: { email: string };
    ResetPassword: { email: string };
}

export type UserTabParamList = {
    Home: undefined;
    Books: undefined;
    Borrow: undefined;
    Profile: undefined;
    About:undefined;
}

export type UserStackParamList = UserTabParamList & {
    BookSearch: undefined;
    BookDetail: { bookId: string };
    UpdateProfile: undefined;
}

export type AdminTabParamList = {
    Dashboard: undefined;
    Books: undefined;
    User: undefined;
    Loan: undefined;
    Request: undefined;
    Profile: undefined;
}

export type AdminStackParamList = AdminTabParamList & {
    UpdateProfile: undefined;
}