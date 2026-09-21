import React from "react";
import {useTranslation} from "react-i18next";
import './SidePanel.css';

type SidePanelArgs = {
    routes: any[],
    notifications: any[],
}

const SidePanel = ({routes, notifications}: SidePanelArgs) => {
    const { t } = useTranslation("main")

    function renderNotifications() {
        if(!notifications || notifications.length == 0) {
            return (<h1 className={"emptyNotificationsHeader flex-1"}>{t('notification.empty')}</h1>)
        }
    }

    return (
        <div className={"flex flex-col sidePanel"}>
            <div className={"flex flex-col flex-1/6"}>
                <div className={"flex-1/2 flex flex-col routes"}>
                    {routes}
                </div>
                <div className={"flex-1/2 flex flex-col notifications"}>
                    {renderNotifications()}
                </div>
            </div>
        </div>
    );
}

export default SidePanel;