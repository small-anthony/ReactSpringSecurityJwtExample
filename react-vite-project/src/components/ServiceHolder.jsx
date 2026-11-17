import AuthService from "../services/AuthService.tsx";
import NotificationService from "../services/NotificationService/index.jsx";

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