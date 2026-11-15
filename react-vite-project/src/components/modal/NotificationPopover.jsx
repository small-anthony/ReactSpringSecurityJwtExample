import React, { useContext, useEffect, useRef, useState } from "react";
import { Bell, ChevronRight, CircleAlert, CircleCheck, CircleHelp, CircleX, Info, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { NotificationServiceContext } from "../../services/NotificationService/index.jsx";
import Notification, { NotificationType } from "../../services/NotificationService/Notification.js";

const TYPE_STYLES = {
    [NotificationType.Failed]: { Icon: CircleX, wrapper: "bg-rose-50 text-rose-600" },
    [NotificationType.Success]: { Icon: CircleCheck, wrapper: "bg-emerald-50 text-emerald-600" },
    [NotificationType.Informative]: { Icon: Info, wrapper: "bg-blue-50 text-blue-600" },
    [NotificationType.ActionRequired]: { Icon: CircleAlert, wrapper: "bg-amber-50 text-amber-600" }
};

export function NotificationButton() {
    const notificationService = useContext(NotificationServiceContext);
    const notifications = notificationService.getNotifications();
    const containerRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);

    const nonLues = Array.isArray(notifications) ? notifications.filter((n) => !n.dismissed).length : 0;

    useEffect(() => {
        if (!isOpen) return undefined;
        const handleOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
        };
        const handleEscape = (e) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        document.addEventListener("mousedown", handleOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    return (
        <div ref={containerRef} className="relative flex items-center">
            <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((prev) => !prev)}
                className={`relative w-9 h-9 rounded-full border flex items-center justify-center transition cursor-pointer shadow-2xs ${
                    isOpen ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                }`}
            >
                {!notifications ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <Bell className="w-4 h-4" />}
                {nonLues > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                        {nonLues > 9 ? "9+" : nonLues}
                    </span>
                )}
            </button>
            {isOpen && (
                <NotificationPopover notifications={notifications || []} nonLues={nonLues} onClose={() => setIsOpen(false)} />
            )}
        </div>
    );
}

function NotificationCard({ notification = new Notification(), t, onClose }) {
    const handler = notification.useHandler();
    const { Icon, wrapper } = TYPE_STYLES[notification.type] || { Icon: CircleHelp, wrapper: "bg-gray-100 text-gray-500" };
    let dateFormatee = "";
    if (notification.dateCreation) {
        try {
            const d = notification.dateCreation instanceof Date ? notification.dateCreation : new Date(notification.dateCreation);
            dateFormatee = Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" }).format(d);
        } catch {
            dateFormatee = "";
        }
    }
    const nonLue = !notification.dismissed;
    const handleClick = async () => {
        if (handler) await handler();
        onClose?.();
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`group w-full text-left px-4 py-3.5 flex items-start gap-3 transition cursor-pointer ${
                nonLue ? "bg-blue-50/35 hover:bg-blue-50/70" : "bg-white hover:bg-gray-50/80 opacity-80"
            }`}
        >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${wrapper}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-xs leading-relaxed text-gray-800 ${nonLue ? "font-semibold" : "font-normal"}`}>
                    {t(notification.message, { ns: "notification" })}
                </p>
                {dateFormatee && <span className="block text-[11px] text-gray-400 mt-1">{dateFormatee}</span>}
            </div>
            <div className="flex items-center gap-1.5 shrink-0 self-center">
                {nonLue && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
            </div>
        </button>
    );
}

function NotificationPopover({ notifications, nonLues, onClose }) {
    const { t } = useTranslation(["main", "notification"]);

    return (
        <div className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 z-50 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            <header className="px-4 py-3.5 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-bold text-gray-900">{t("notifications.titre")}</h2>
                </div>
                <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        nonLues > 0 ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                >
                    {nonLues > 0 ? t("notifications.non_lues_count", { count: nonLues }) : t("notifications.tout_lu")}
                </span>
            </header>
            {notifications.length === 0 ? (
                <div className="py-10 px-6 text-center space-y-2">
                    <div className="w-11 h-11 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                        <Bell className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">{t("notifications.vide_titre")}</p>
                    <p className="text-xs text-gray-400">{t("notifications.vide_description")}</p>
                </div>
            ) : (
                <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                    {notifications.map((notification) => (
                        <NotificationCard key={notification.id} notification={notification} t={t} onClose={onClose} />
                    ))}
                </div>
            )}
        </div>
    );
}
