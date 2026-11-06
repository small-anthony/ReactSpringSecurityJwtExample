/// Le type de notification qu'on reçoit. Aucune implication de fonctionalité.
import {useNavigate} from "react-router-dom";

export enum NotificationType {
    Informative = "Informative",
    Success = "Success",
    Failed = "Failed",
    ActionRequired = "ActionRequired",
}

/// Le type d'action que cette notification permet. Modifie la fonctionalité.
export enum NotificationActionType {
    ViewCv = "ViewCv",
    SubmitCv = "SubmitCv",
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
    [NotificationActionType.ViewCv]: async (notification, payload) => {
        const { id } = payload;
        const navigate = useNavigate();
        navigate("/gestionnaire/approbations/cvs");
    },

    [NotificationActionType.SubmitCv]: async (notification, any) => {

    }
}