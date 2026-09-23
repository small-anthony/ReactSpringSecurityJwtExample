import AuthService from "../services/AuthService.tsx";
import NotificationService from "../services/NotificationService.tsx";

const ServiceHolder = ({children}) => {
    return (
        <>
            <AuthService>
                <NotificationService>
                    {children}
                </NotificationService>
            </AuthService>
        </>
    );
}

export default ServiceHolder;