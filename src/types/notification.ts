import * as Notifications from "expo-notifications";

export type PaymentAlert = {
    id: string;            // id fattura
    title: string;         // es. "F24 IVA"
    body: string;          // es. "Scade domani alle 12:00"
    when: Date;            // data/ora di promemoria
};

export async function schedulePaymentReminder(alert: PaymentAlert) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: alert.title,
            body: alert.body,
            data: { invoiceId: alert.id },
            sound: "default",
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: alert.when,
        },
    });
}


export async function cancelReminderById(identifier: string) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
}

export async function cancelAllReminders() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}
