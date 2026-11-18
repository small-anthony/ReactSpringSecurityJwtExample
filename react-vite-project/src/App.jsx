import PageLayout from "./components/PageLayout.jsx";
import React, {useContext, useEffect} from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PageAccueilStagify from "./components/page/PageAccueilStagify.jsx";
import About from "./components/About.jsx";
import LoginForm from "./components/auth/LoginForm.jsx";
import SignupProfesseurForm from "./components/auth/SignupProfesseurForm.jsx";
import SignupEtudiantForm from "./components/auth/SignupEtudiantForm.jsx";
import SignupEmployeurForm from "./components/auth/SignupEmployeurForm.jsx";
import CreerOffre from "./components/page/CreerOffre.jsx";
import ProfileEmployeur from "./components/page/ProfileEmployeur.jsx";
import { AuthServiceContext } from "./services/AuthService.tsx";
import CandidaturesOffre from "./components/page/CandidaturesOffre.jsx";
import ApprobationOffres from "./components/page/ApprobationOffres.jsx";
import ApprobationCvs from "./components/page/ApprobationCvs.jsx";
import OffreStagesEtudiant from "./components/page/OffreStagesEtudiant.jsx";
import GestionnaireContrats from "./components/page/GestionnaireContrats.jsx";
import RapportsEtudiants from "./components/page/RapportsEtudiants.jsx";
import EmployeurContrats from "./components/page/EmployeurContrats.jsx";
import EmployeurStagiaires from "./components/page/EmployeurStagiaires.jsx";
import EvaluationStagiaire from "./components/page/EvaluationStagiaire.jsx";
import FormulaireEvaluationMilieuStage from "./components/widget/FormulaireEvaluationMilieuStage.jsx";
import AssignationProfesseurs from "./components/page/AssignationProfesseurs.jsx";
import ProfesseurEtudiants from "./components/page/ProfesseurEtudiants.jsx";

function App() {
    const authService = useContext(AuthServiceContext);

    const userData = authService.getUserData();
    const token = authService.getAuth();

    const role = userData?.role ? userData.role.toString().replace("ROLE_", "") : null;

    const getHomePath = () => {
        switch (role) {
            case "ETUDIANT": return "/etudiant";
            case "EMPLOYEUR": return "/employeur";
            case "GESTIONNAIRE": return "/gestionnaire";
            case "PROFESSEUR": return "/professeur";
            default: return "/";
        }
    };

    return (
        <div>
            <Routes>
                <Route path="/" element={<PageLayout user={userData} />}>

                    <Route
                        index
                        element={token ? (userData ? <Navigate to={getHomePath()} replace /> : null) : (<PageAccueilStagify/>)}
                    />

                    <Route
                        path="about"
                        element={token ? (userData ? <Navigate to={getHomePath()} replace /> : null) : (<About />)}
                    />

                    <Route
                        path="login"
                        element={token ? (userData ? <Navigate to={getHomePath()} replace /> : null) : (<LoginForm />)}
                    />

                    <Route
                        path="signup"
                        element={token ? (userData ? <Navigate to={getHomePath()} replace /> : null) : (<SignupEtudiantForm />)}
                    />

                    <Route
                        path="signup/etudiant"
                        element={token ? (userData ? <Navigate to={getHomePath()} replace /> : null) : (<SignupEtudiantForm />)}
                    />

                    <Route
                        path="signup/employeur"
                        element={token ? (userData ? <Navigate to={getHomePath()} replace /> : null) : (<SignupEmployeurForm />)}
                    />

                    <Route
                        path="signup/professeur"
                        element={token ? (userData ? <Navigate to={getHomePath()} replace /> : null) : (<SignupProfesseurForm />)}
                    />

                    <Route
                        path="etudiant"
                        element={!token ? (<Navigate to="/login" />) : (!userData ? null : (role === "ETUDIANT" ? <OffreStagesEtudiant /> : <Navigate to="/" />))}
                    />

                    <Route
                        path="etudiant/convocations"
                        element={!token ? <Navigate to="/login" /> : !userData ? null : role === "ETUDIANT" ? <Navigate to="/etudiant?tab=convocations" replace /> : <Navigate to="/" />}
                    />

                    <Route
                        path="etudiant/contrats"
                        element={!token ? <Navigate to="/login" /> : !userData ? null : role === "ETUDIANT" ? <Navigate to="/etudiant?tab=contrats" replace /> : <Navigate to="/" />}
                    />
                    <Route
                        path="employeur"
                        element={!token ? (<Navigate to="/login" />) : (!userData ? null : (role === "EMPLOYEUR" ? <ProfileEmployeur /> : <Navigate to="/" />))}
                    />

                    <Route
                        path="employeur/creer-offre"
                        element={!token ? (<Navigate to="/login" />) : (!userData ? null : (role === "EMPLOYEUR" ? <CreerOffre /> : <Navigate to="/" />))}
                    />

                    <Route
                        path="employeur/offres/:offreId/candidatures"
                        element={!token ? (<Navigate to="/login" />) : (!userData ? null : (role === "EMPLOYEUR" ? <CandidaturesOffre /> : <Navigate to="/" />))}
                    />

                    <Route
                        path="employeur/contrats"
                        element={!token ? (<Navigate to="/login" />) : (!userData ? null : (role === "EMPLOYEUR" ? <EmployeurContrats /> : <Navigate to="/" />))}
                    />

                    <Route
                        path="employeur/stagiaires"
                        element={!token ? (<Navigate to="/login" />) : (!userData ? null : (role === "EMPLOYEUR" ? <EmployeurStagiaires /> : <Navigate to="/" />))}
                    />

                    <Route
                        path="employeur/stagiaires/:contratId/evaluation"
                        element={!token ? (<Navigate to="/login" />) : (!userData ? null : (role === "EMPLOYEUR" ? <EvaluationStagiaire /> : <Navigate to="/" />))}
                    />

                    <Route
                        path="professeur"
                        element={!token ? (<Navigate to="/login" />) : (!userData ? null : (role === "PROFESSEUR" ? <ProfesseurEtudiants /> : <Navigate to="/" />))}
                    />

                    <Route
                        path="professeur/etudiants/:etudiantId/evaluation-milieu"
                        element={!token ? (<Navigate to="/login" />) : (!userData ? null : (role === "PROFESSEUR" ? <div className="min-h-screen bg-gray-50/70 py-8 px-4 sm:px-6"><FormulaireEvaluationMilieuStage mode="professeur" /></div> : <Navigate to="/" />))}
                    />

                    <Route
                        path="gestionnaire"
                        element={!token ? (<Navigate to="/login" />) : (!userData ? null : (role === "GESTIONNAIRE" ? <RapportsEtudiants /> : <Navigate to="/" />))}
                    />

                    <Route
                        path="gestionnaire/approbations/offres"
                        element={!token ? (<Navigate to="/login" />) : (!userData ? null : (role === "GESTIONNAIRE" ? <ApprobationOffres /> : <Navigate to="/" />))}
                    />

                    <Route
                        path="gestionnaire/approbations/cvs"
                        element={!token ? (<Navigate to="/login" />) : (!userData ? null : (role === "GESTIONNAIRE" ? <ApprobationCvs /> : <Navigate to="/" />))}
                    />
                    <Route
                        path="gestionnaire/rapports" element={<Navigate to="/gestionnaire" replace />} />
                    <Route
                        path="gestionnaire/contrats"
                        element={!token ? <Navigate to="/login" /> : !userData ? null : role === "GESTIONNAIRE" ? <GestionnaireContrats /> : <Navigate to="/" />}
                    />
                    <Route
                        path="gestionnaire/assignation-professeurs"
                        element={!token ? <Navigate to="/login" /> : !userData ? null : role === "GESTIONNAIRE" ? <AssignationProfesseurs /> : <Navigate to="/" />}
                    />
                    <Route
                        path="gestionnaire/etudiants/:etudiantId/evaluation-milieu"
                        element={!token ? <Navigate to="/login" /> : !userData ? null : role === "GESTIONNAIRE" ? <div className="min-h-screen bg-gray-50/70 py-8 px-4 sm:px-6"><FormulaireEvaluationMilieuStage mode="gestionnaire" /></div> : <Navigate to="/" />}
                    />
                </Route>
            </Routes>
        </div>
    );
}

export default App;