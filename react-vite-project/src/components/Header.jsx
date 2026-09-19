import React, {useContext, useEffect} from "react";
import './Header.css';
import {Link, useNavigate} from 'react-router-dom';
import {AuthServiceContext, UserRole} from "../services/AuthService.tsx";
import {Trans, useTranslation} from "react-i18next";

function Header({user}) {
    const authService = useContext(AuthServiceContext);
    const { t } = useTranslation("main");

    function logOut() {
        authService.logout();
        useNavigate("/");
    }

    // Function to format role for display (remove ROLE_ prefix and capitalize)
    const formatRole = (roleString) => {
        if (!roleString) return '';
        // Remove ROLE_ prefix if present
        const roleName = roleString.replace('ROLE_', '');
        // Capitalize first letter, lowercase the rest
        return t(`role.${roleName.toLowerCase()}`);
    };

    return (
        <header className="header">
            <h1>{t("sitename")}</h1>
            <nav>
                <ul className="nav-links">
                    <li><Link to="/">{t("pagename.home")}</Link></li>
                    <li><Link to="/about">{t("pagename.about")}</Link></li>
                    <li>{user ? <a onClick={logOut}>Logout</a> : <Link to="/login">Login</Link>}</li>
                </ul>
                {user && (
                    <div className="user-info">
                        <p className="para-align">
                            <Trans t={t} i18nKey="hello-user"
                                   values={{
                                       firstName: user.firstName,
                                       lastName: user.lastName,
                                       role: formatRole(user?.role.toString()),
                                   }}
                                   components={{
                                       nameSpan: <span className="user-name"/>,
                                       roleSpan: <span className="user-role"/>,
                                   }}/>
                        </p>
                    </div>
                )}
            </nav>
        </header>
    );
}

export default Header;