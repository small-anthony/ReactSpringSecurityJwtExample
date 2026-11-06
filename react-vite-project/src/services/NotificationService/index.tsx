import React, { createContext, useContext, useState} from "react";
import {AuthServiceContext, IAuthService} from "../AuthService";
import APIHelper from "../../utils/APIHelper";
import Notification from "./Notification";

interface INotificationService {
    refreshNotifications(): Promise<true>;
    getNotifications(): Notification[];
    dismissNotification(id: number): Promise<void>;
}

export const NotificationServiceContext = createContext<INotificationService>(undefined);
const NotificationService = ({ children }) => {
    const authService: IAuthService = useContext(AuthServiceContext);
    const [notifications, setNotifications] = useState<Notification[]>(undefined);

    const notificationService: INotificationService = {
        async refreshNotifications() {
            if(!authService.isAuthed()) {
                setNotifications(undefined);
                return true;
            }

            const response = await APIHelper.get("/notifications", authService.buildAuthHeader());
            if(!response.ok) {
                throw new Error(await response.text());
            }

            const rawData: Record<string, any>[] = await response.json();
            setNotifications(rawData.map((data) => new Notification(data as any)))
            return true;
        },

        getNotifications() {
            return notifications;
        },

        async dismissNotification(id) {
            if(!authService.isAuthed()) {
                return;
            }

            const response = await APIHelper.post("/notifications/dismiss", authService.buildAuthHeader(), {id: id});
            if(!response.ok) {
                return;
            }
        }
    }

    return (
        <NotificationServiceContext.Provider value={notificationService}>
            {children}
        </NotificationServiceContext.Provider>
    )
}

export default NotificationService;