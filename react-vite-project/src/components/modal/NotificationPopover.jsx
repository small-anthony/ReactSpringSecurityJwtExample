import {BellIcon, CheckCircle2, Info, AlertTriangle, XCircle, X,} from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { getNotifications, dismissNotificationApi, deleteNotificationApi } from "../../services/api/NotificationAPI.js";
import i18n from "i18next";

function getIconStyle(type) {
    switch (type) {
        case "SUCCESS":
            return { Icon: CheckCircle2, classes: "bg-emerald-50 text-emerald-600" };
        case "FAILED":
            return { Icon: XCircle, classes: "bg-rose-50 text-rose-600" };
        case "ACTION_REQUIRED":
            return { Icon: AlertTriangle, classes: "bg-amber-50 text-amber-600" };
        default:
            return { Icon: Info, classes: "bg-blue-50 text-blue-600" };
    }
}

export function NotificationButton() {
    const { t } = useTranslation(['main', 'notification']);
    const navigate = useNavigate();
    const authService = useContext(AuthServiceContext);

    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!authService.isAuthed()) return;

        getNotifications(authService.buildAuthHeader())
            .then((data) => setNotifications(data || []))
            .catch(() => setNotifications([]));
    }, [authService]);

    const handleAction = async (notification) => {
        if (!notification.dismissed) {
            await dismissNotificationApi(notification.id, authService.buildAuthHeader());
            setNotifications((prev) =>
                prev.map((n) => (n.id === notification.id ? { ...n, dismissed: true } : n))
            );
        }

        const actionsContrat = {
            SIGNER_CONTRAT: "signer",
            REVISER_CONTRAT: "reviser",
        };
        const actionType = notification.action?.type;
        if (actionType === "VOIR_OFFRES") {
            navigate("/etudiant?tab=toutes");
        } else if (actionType === "TELEVERSER_CV") {
            navigate("/etudiant?uploadCv=true");
        } else if (actionType === "APPROUVER_CV") {
            navigate("/gestionnaire/approbations/cvs");
        } else if (notification.action?.type === "VOIR_CONVOCATIONS") {
            navigate("/etudiant?tab=convocations");
        } else if (actionsContrat[actionType]) {
            const contratId = notification.action?.referenceId;
            navigate(
                contratId
                    ? `/gestionnaire/contrats?contratId=${contratId}&action=${actionsContrat[actionType]}`
                    : "/gestionnaire/contrats"
            );
        }
        setIsOpen(false);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        await deleteNotificationApi(id, authService.buildAuthHeader());
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const nbNonLues = notifications.filter((n) => !n.dismissed).length;
    const locale = i18n.language || "fr";

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 h-8 px-2.5 rounded-full border text-xs font-bold transition cursor-pointer ${
                    nbNonLues > 0
                        ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        : "bg-slate-50 border-slate-200/90 text-slate-600 hover:bg-slate-100"
                }`}
            >
                <BellIcon className="w-4 h-4" />
                {nbNonLues > 0 && <span>{nbNonLues}</span>}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                            <h3 className="text-sm font-bold text-slate-900">
                                {t('notifications.titre')}
                            </h3>
                            {nbNonLues > 0 && (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                    {nbNonLues} {nbNonLues > 1 ? "nouvelles" : "nouvelle"}
                                </span>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                            {notifications.length === 0 ? (
                                <div className="py-10 px-4 text-center">
                                    <BellIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-xs text-slate-400">Aucune notification pour le moment.</p>
                                </div>
                            ) : (
                                notifications.map((notif) => {
                                    const { Icon, classes } = getIconStyle(notif.type);
                                    const date = Intl.DateTimeFormat(locale, {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    }).format(new Date(notif.dateCreation));

                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => handleAction(notif)}
                                            className={`w-full text-left px-4 py-3 flex items-start gap-3 transition cursor-pointer ${
                                                notif.dismissed
                                                    ? "bg-white opacity-60 hover:bg-slate-50"
                                                    : "bg-blue-50/35 hover:bg-blue-50/70"
                                            }`}
                                        >
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${classes}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs leading-relaxed break-words ${notif.dismissed ? "text-slate-600" : "text-slate-900 font-medium"}`}>
                                                    {t(notif.message, { ns: 'notification' })}
                                                </p>
                                                <span className="text-[11px] text-slate-400 mt-1 block">
                                                    {date}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0 self-center">
                                                {!notif.dismissed && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDelete(e, notif.id)}
                                                    title="Supprimer"
                                                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}