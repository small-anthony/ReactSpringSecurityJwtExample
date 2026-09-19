import AuthService from "../services/AuthService.tsx";

const ServiceHolder = ({children}) => {
    return (
        <>
            <AuthService>
                {children}
            </AuthService>
        </>
    );
}

export default ServiceHolder;