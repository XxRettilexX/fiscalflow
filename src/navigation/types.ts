import type { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
    Splash: undefined;
    AuthFlow: NavigatorScreenParams<AuthStackParamList>;
    MainApp: NavigatorScreenParams<MainTabParamList>;
    Invoices: undefined;
    InvoiceDetail: { id: string };
    EditInvoice: { id: number };
    NewInvoice: undefined;
    Support: undefined;
    About: undefined;
};
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    Statistics: undefined;
    AddExpense: undefined;
    Profile: undefined;
};