import {useNavigate} from "react-router-dom";
import {useCallback, useContext} from "react";
import {AuthServiceContext, UserRole} from "../AuthService";
import {NotificationServiceContext} from "./index";

export const NotificationType = Object.freeze({
    Informative: "INFORMATIVE",
    Success: "SUCCESS",
    Failed: "FAILED",
    ActionRequired: "ACTION_REQUIRED",
})

export const NotificationActionType = Object.freeze({
    ViewResource: "VIEW_RESOURCE",
    SendResource: "SEND_RESOURCE",
})

export const NotificationResourceType = Object.freeze({
    Cv: "CV",
    OffreStage: "OFFRE_STAGE",
    Candidature: "CANDIDATURE",
    Convocation: "CONVOCATION",
    Contrat: "CONTRAT",
})

export default class Notification {
    id;
    type;
    action;
    message;
    dismissed;
    dateCreation;

    _actionData;

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

const _notificationActionToHandler = {
    [NotificationActionType.ViewResource]: (notification, payload) => {
        const authService = useContext(AuthServiceContext);
        const notificationService = useContext(NotificationServiceContext);
        const navigate = useNavigate();
        const userData = authService.getUserData();

        const { type } = payload;
        return async () => {
            await notificationService.dismissNotification(notification.id);
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
        const authService = useContext(AuthServiceContext);
        const notificationService = useContext(NotificationServiceContext);
        const navigate = useNavigate();
        const userData = authService.getUserData();

        const { type } = payload;
        return async () => {
            await notificationService.dismissNotification(notification.id);
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