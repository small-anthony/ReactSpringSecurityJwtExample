import {useNavigate} from "react-router-dom";
import {useCallback, useContext} from "react";
import {AuthServiceContext, UserRole} from "../AuthService";

/// Le type de notification qu'on reçoit. Aucune implication de fonctionnalité.
export enum NotificationType {
    Informative = "INFORMATIVE",
    Success = "SUCCESS",
    Failed = "FAILED",
    ActionRequired = "ACTION_REQUIRED",
}

/// Le type d'action que cette notification permet. Modifie la fonctionnalité.
export enum NotificationActionType {
    ViewResource = "VIEW_RESOURCE",
    SendResource = "SEND_RESOURCE",
}

export enum NotificationResourceType {
    Cv = "CV",
    OffreStage = "OFFRE_STAGE",
    Candidature = "CANDIDATURE",
    Convocation = "CONVOCATION",
    Contrat = "CONTRAT",
}

export default class Notification {
    public readonly id: number;
    public readonly type: NotificationType;
    public readonly action: NotificationActionType;
    public readonly message: string;
    public readonly dismissed: boolean;
    public readonly dateCreation: Date;

    private readonly _actionData: any;

    constructor({id, type, message, action, dateCreation, dismissed}) {
        this.id = id;
        this.type = type;
        this.message = message;
        this.dismissed = dismissed;
        this.dateCreation = new Date(dateCreation);

        this.action = action.type;
        this._actionData = action.payload;
    }

    useHandler() {
        return useCallback(_notificationActionToHandler[this.action](this, this._actionData));
    }
}

type _notificationActionHandler = (notification: Notification, payload: any) => (() => any);
/**
 * Table de fonctions pour générer un handler pour les notifications.
 *
 * Retourne une fonction qui prépare l'état React (useContext, useState, etc.),
 * et à son tour retourne une fonction qui serait appelée par la notification.
 * Ce pattern permet d'implémenter diverses façons de générer des actions pout les notifications
 * tout en respectant le Rule of Hooks de React.
 */
const _notificationActionToHandler: Record<NotificationActionType, _notificationActionHandler> = {
    [NotificationActionType.ViewResource]: (notification, payload) => {
        // Hooks
        const authService = useContext(AuthServiceContext);
        const navigate = useNavigate();
        const userData = authService.getUserData();

        // Callback
        const { type } = payload;
        return () => {
            switch (type) {
                case NotificationResourceType.OffreStage: {
                    switch (userData.role) {
                        case UserRole.Etudiant: return navigate("/etudiant");
                        case UserRole.Employeur: return navigate("/employeur");
                        case UserRole.Gestionnaire: return navigate("/gestionnaire/approbations/offres");
                    }
                    break;
                }
                case NotificationResourceType.Cv: {
                    switch (userData.role) {
                        case UserRole.Etudiant: return navigate("/etudiant");
                        case UserRole.Gestionnaire: return navigate("/gestionnaire/approbations/cv");
                    }
                    break;
                }
            }
        }
    },

    [NotificationActionType.SendResource]: (notification, payload) => {
        // Hooks
        const authService = useContext(AuthServiceContext);
        const navigate = useNavigate();
        const userData = authService.getUserData();

        // Callback
        const { type } = payload;
        return () => {
            switch (type) {
                case NotificationResourceType.OffreStage: {
                    switch (userData.role) {
                        case UserRole.Etudiant: return navigate("/etudiant");
                        case UserRole.Employeur: return navigate("/employeur");
                    }
                    break;
                }
                case NotificationResourceType.Cv: {
                    switch (userData.role) {
                        case UserRole.Etudiant: return navigate("/etudiant");
                    }
                    break;
                }
            }
        }
    }
}