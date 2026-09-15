import React, {useContext, useEffect} from "react";
import './Header.css';
import {Link, useNavigate} from 'react-router-dom';
import {AuthServiceContext, UserRole} from "../services/AuthService.tsx";

function Header({user}) {
    const authService = useContext(AuthServiceContext);

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
        return roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase();
    };

    const isGestionnaire = () => {
        return user?.role === UserRole.Gestionnaire;
    }
    const isPrepose = () => {
        return user?.role === UserRole.Gestionnaire || user?.role === UserRole.Professeur;
    }
    const isEmprunteur = () => {
        return user?.role === UserRole.Gestionnaire || user?.role === UserRole.Etudiant;
    }

    return (
        <header className="header">
            <h1>My App</h1>
            <nav>
                <ul className="nav-links">
                    <li><Link to="/">Accueil</Link></li>
                    <li><Link to="/about">À propos</Link></li>
                    {isEmprunteur() && <li><Link to="/etudiant">Emprunteur</Link></li>}
                    {isPrepose() && <li><Link to="/professeur">Prepose</Link></li>}
                    {isGestionnaire() && <li><Link to="/gestionnaire">Gestionnaire</Link></li>}
                    <li>{user ? <a onClick={logOut}>Logout</a> : <Link to="/login">Login</Link>}</li>
                </ul>
                {user && (
                    <div className="user-info">
                        <p className="para-align">
                            Bonjour <span className="user-name">{user.firstName} {user.lastName}</span>
                            {user.role && (
                                <span className="user-role"> - {formatRole(user.role.toString())}</span>
                            )}
                        </p>
                    </div>
                )}
            </nav>
        </header>
    );
}

export default Header;