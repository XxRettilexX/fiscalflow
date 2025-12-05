import type { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
    Splash: undefined;
    AuthFlow: NavigatorScreenParams<AuthStackParamList>;
    MainApp: NavigatorScreenParams<MainTabParamList>;
    Support: undefined;
    About: undefined;
    Upgrade: undefined;
};
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    Statistics: undefined;
    AddExpense: undefined;
    Budget: undefined;
    Profile: undefined;
};