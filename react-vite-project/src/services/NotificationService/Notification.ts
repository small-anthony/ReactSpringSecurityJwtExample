/// Le type de notification qu'on reçoit. Aucune implication de fonctionalité.
import {useNavigate} from "react-router-dom";

export enum NotificationType {
    Informative = "INFORMATIVE",
    Success = "SUCCESS",
    Failed = "FAILED",
    ActionRequired = "ACTION_REQUIRED",
}

/// Le type d'action que cette notification permet. Modifie la fonctionalité.
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
    public readonly dateCreation: Date;
    public readonly dismissed: boolean;

    private readonly _actionData: any;
    private readonly _actionHandler: _notificationActionHandler;

    constructor({id, type, message, action, dateCreation, dismissed}) {
        this.id = id;
        this.type = type;
        this.message = message;
        this.dateCreation = dateCreation;
        this.dismissed = dismissed;

        this.action = action.type;
        this._actionData = action.payload;
        this._actionHandler = _notificationActionToHandler[action.type];
    }

    async handle() {
        return this._actionHandler(this, this._actionData);
    }
}

type _notificationActionHandler = (notification: Notification, payload: any) => Promise<void>;
const _notificationActionToHandler: Record<NotificationActionType, _notificationActionHandler> = {
    [NotificationActionType.ViewResource]: async (notification, payload) => {

    },

    [NotificationActionType.SendResource]: async (notification, any) => {

    }
}