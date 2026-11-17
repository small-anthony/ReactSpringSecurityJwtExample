import React, { createContext, useContext, useState} from "react";
import {AuthServiceContext} from "../AuthService";
import APIHelper from "../../utils/APIHelper";
import Notification from "./Notification.js";

export const NotificationServiceContext = createContext(undefined);
const NotificationService = ({ children }) => {
    const authService = useContext(AuthServiceContext);
    const [notifications, setNotifications] = useState(undefined);

    const notificationService = {
        async refreshNotifications() {
            if(!authService.isAuthed()) {
                setNotifications(undefined);
                return true;
            }

            const response = await APIHelper.get("/notifications", authService.buildAuthHeader());
            if(!response.ok) {
                throw new Error(await response.text());
            }

            const rawData = await response.json();
            setNotifications(rawData.map((data) => new Notification(data)))
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
                throw new Error(await response.text())
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