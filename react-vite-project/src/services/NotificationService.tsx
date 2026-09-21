import React, {useState} from "react";
import {createContext} from "react";

type NotificationData = {
    id: number;
    icon: string;
    title: string;
    summary: string;
}

interface INotificationService {
    getNotifications(): Promise<NotificationData[]>;
    dismissNotification(id: number): Promise<void>;
}

export const NotificationServiceContext = createContext<INotificationService>(undefined);
const NotificationService = ({children}) => {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);

    const notificationService: INotificationService = {
        async getNotifications() {
            // TODO
            return [];
        },
        async dismissNotification(id) {
            // TODO
        }
    }

    return (
        <NotificationServiceContext.Provider value={notificationService}>
            {children}
        </NotificationServiceContext.Provider>
    )
}

export default NotificationService;