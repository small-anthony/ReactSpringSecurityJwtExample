import {
    ArrowRightIcon,
    BellDotIcon,
    BellIcon,
    CircleAlertIcon, CircleCheckIcon, CircleQuestionMarkIcon, CircleXIcon,
    Ellipsis,
    InfoIcon,
} from "lucide-react";
import React, {useContext, useRef, useState} from "react";
import {NotificationServiceContext} from "../../services/NotificationService/index.jsx";
import {useTranslation} from "react-i18next";
import Notification, {NotificationType} from "../../services/NotificationService/Notification.js";
import i18n from "i18next";

export function NotificationButton() {
    const notificationService = useContext(NotificationServiceContext);
    const notifications = notificationService.getNotifications();

    const buttonRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);

    async function onNotificationHandle(notification, handler) {
        await handler();
        setIsOpen(false);
    }

    function pickBellIcon(className) {
        if(!notifications) {
            return <Ellipsis className={className}/>
        }
        const notDismissed = notifications.find((notif) => !notif.dismissed);
        if(notDismissed) {
            return <BellDotIcon className={className}/>
        }
        else {
            return <BellIcon className={className}/>
        }
    }

    return (
        <div ref={buttonRef} className="bg-gray-50 border px-2 py-1 border-gray-200 rounded-full flex items-center relative">
            <button className="cursor-pointer select-none" type="button" onClick={() => {setIsOpen(!isOpen)}}>
                {pickBellIcon("w-5")}
            </button>
            {isOpen && (<NotificationPopover notifications={notifications} onInteraction={onNotificationHandle}/>)}
        </div>
    );
}

function NotificationCard({
    notification = new Notification(),
    t = useTranslation(['main', 'notification']).t,

    onInteraction
}) {
    const handler = notification.useHandler();

    const locale = i18n.language;
    const formattedDate = Intl.DateTimeFormat(locale, {dateStyle: "long", timeStyle: "short"}).format(notification.dateCreation);

    function onButtonClick() {
        onInteraction(notification, handler);
    }

    function NotificationIcon({className}) {
        switch(notification.type) {
            case NotificationType.Failed: return <CircleXIcon className={`${className} text-red-400`}/>;
            case NotificationType.Success: return <CircleCheckIcon className={`${className} text-green-600`}/>;
            case NotificationType.Informative: return <InfoIcon className={`${className} text-blue-600`}/>;
            case NotificationType.ActionRequired: return <CircleAlertIcon className={`${className} text-yellow-600`}/>;
            default: return <CircleQuestionMarkIcon className={`${className}`}/>;
        }
    }

    function InfoSpacer() {
        return <div className="bg-gray-300 rounded-full w-0.5 mx-2 h-full"/>;
    }

    return (
        <div className={`flex flex-col h-20 rounded-2xl overflow-clip border border-gray-400 ${notification.dismissed && "bg-gray-200"}`}>
            <div className="flex items-center h-full p-1 px-2.5">
                <div className="shrink">
                    <NotificationIcon className="h-6"/>
                </div>
                <InfoSpacer/>
                <div className="grow text-xs line-clamp-3">
                    {t(notification.message, {ns: 'notification'})}
                </div>
                <InfoSpacer/>
                <div className="shrink">
                    <button onClick={onButtonClick} type="button" className="text-xs p-1 rounded-2xl cursor-pointer text-white bg-blue-500 hover:bg-blue-700 transition">
                        <ArrowRightIcon className="w-4"/>
                    </button>
                </div>
            </div>
            <div className="text-xs italic px-4 border-t-2 border-gray-300 text-gray-400 text-center">
                {formattedDate}
            </div>
        </div>
    );
}

function NotificationPopover({
    notifications,
    onInteraction,
}) {
    const { t } = useTranslation(['main', 'notification'])

    function onButtonClick(notification, handler) {
        onInteraction(notification, handler);
    }

    return (
        <div className="absolute right-0 w-80 h-100 top-full z-40 drop-shadow-md">
            <div className="border border-gray-200 bg-white rounded-2xl h-full flex flex-col overflow-clip">
                <header className="bg-blue-600 text-white py-1 px-3 h-8">
                    <h1>{t('notifications.titre')}</h1>
                </header>
                <div className="flex flex-col gap-1 overflow-y-scroll scrollbar-thin grow p-2 border-y">
                    {notifications.map((notification) =>
                        <NotificationCard
                            key={notification.id}
                            notification={notification}
                            onInteraction={onButtonClick}
                            t={t}
                        />
                    )}
                </div>
                <footer className="h-4 bg-gray-200"/>
            </div>
        </div>
    );
}