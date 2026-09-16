import React from "react";
import './Header.css';
import { Link } from 'react-router-dom';

function Header({ user }) {
    // Function to format role for display (remove ROLE_ prefix and capitalize)
    const formatRole = (roleString) => {
        if (!roleString) return '';
        const roleName = roleString.replace('ROLE_', '');
        return roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase();
    };

    const userRole = user?.role ? user.role.toString().toUpperCase().replace('ROLE_', '') : '';

    const isEtudiant = user?.isLoggedIn && (userRole === 'ETUDIANT' || userRole === 'EMPRUNTEUR' || userRole === 'GESTIONNAIRE');
    const isProfesseur = user?.isLoggedIn && (userRole === 'PROFESSEUR' || userRole === 'PREPOSE' || userRole === 'GESTIONNAIRE');
    const isEmployeur = user?.isLoggedIn && (userRole === 'EMPLOYEUR' || userRole === 'GESTIONNAIRE');
    const isGestionnaire = user?.isLoggedIn && userRole === 'GESTIONNAIRE';

    return (
        <header className="header">
            <h1 className="text-xl font-bold tracking-tight">
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Gestion des Stages</Link>
            </h1>
            <nav className="flex items-center gap-4">
                <ul className="nav-links">
                    <li><Link to="/">Accueil</Link></li>
                    <li><Link to="/about">À propos</Link></li>
                    {isEtudiant && <li><Link to="/etudiant">Espace Étudiant</Link></li>}
                    {isProfesseur && <li><Link to="/professeur">Espace Enseignant</Link></li>}
                    {isEmployeur && <li><Link to="/employeur">Espace Employeur</Link></li>}
                    {isGestionnaire && <li><Link to="/gestionnaire">Espace Gestionnaire</Link></li>}

                    {user?.isLoggedIn ? (
                        <li><Link to="/logout">Déconnexion</Link></li>
                    ) : (
                        <>
                            <li><Link to="/login">Connexion</Link></li>
                            <li><Link to="/signup" className="btn-signup-nav">S'inscrire</Link></li>
                        </>
                    )}
                </ul>
                {user?.isLoggedIn && (
                    <div className="user-info">
                        <p className="para-align text-sm">
                            Bonjour <span className="user-name font-semibold">{user.firstName} {user.lastName}</span>
                            {user.role && (
                                <span className="user-role opacity-80"> - {formatRole(user.role.toString())}</span>
                            )}
                        </p>
                    </div>
                )}
            </nav>
        </header>
    );
}

export default Header;