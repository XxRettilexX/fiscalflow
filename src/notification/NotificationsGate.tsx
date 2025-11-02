import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import { Platform } from "react-native";

const BACKEND_URL = "https://TUO_BACKEND/push/register";

// ✅ Compatibile con SDK 52+
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("Le notifiche richiedono un dispositivo reale.");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Permessi per notifiche negati.");
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("reminders", {
      name: "Promemoria",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }

  return token;
}

async function sendTokenToBackend(token: string) {
  try {
    await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  } catch (err) {
    console.warn("Errore durante l'invio del token:", err);
  }
}

export default function NotificationsGate() {
  useEffect(() => {
    (async () => {
      const saved = await SecureStore.getItemAsync("expo_push_token");
      if (saved) return;

      const token = await registerForPushNotificationsAsync();
      if (token) {
        await SecureStore.setItemAsync("expo_push_token", token);
        await sendTokenToBackend(token);
      }
    })();

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notifica toccata:", response.notification.request.content);
    });

    return () => sub.remove();
  }, []);

  return null;
}
