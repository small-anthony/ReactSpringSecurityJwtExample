import PageLayout from "./components/PageLayout.jsx";
import React, { useContext } from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import MainContainer from "./components/MainContainer.jsx";
import About from "./components/About.jsx";
import LoginForm from "./components/auth/LoginForm.jsx";
import SignupProfesseurForm from "./components/auth/SignupProfesseurForm.jsx";
import SignupEtudiantForm from "./components/auth/SignupEtudiantForm.jsx";
import SignupEmployeurForm from "./components/auth/SignupEmployeurForm.jsx";
import CreateOffreForm from "./components/auth/CreateOffreForm.jsx";
import GestionnaireHome from "./components/page/GestionnaireHome.jsx";
import EmployeurHome from "./components/page/EmployeurHome.jsx";
import PreposeHome from "./components/page/PreposeHome.jsx";
import { AuthServiceContext } from "./services/AuthService.tsx";
import EtudiantProfile from "./components/page/EtudiantProfile.jsx";


function App() {
  const authService = useContext(AuthServiceContext);
  const userData = authService.getUserData();
  const token = authService.getAuth();

  const role = userData?.role ? userData.role.toString().replace("ROLE_", "") : null;

  return (
      <div>
        <Routes>
          <Route path="/" element={<PageLayout user={userData} />}>
            <Route index element={<MainContainer user={userData} />} />
            <Route path="about" element={<About />} />
            <Route path="login" element={token ? <Navigate to="/" /> : <LoginForm />} />
            <Route path="signup" element={token ? <Navigate to="/" /> : <SignupEtudiantForm />} />
            <Route path="signup/etudiant" element={token ? <Navigate to="/" /> : <SignupEtudiantForm />} />
            <Route path="signup/employeur" element={token ? <Navigate to="/" /> : <SignupEmployeurForm />} />
            <Route path="signup/professeur" element={token ? <Navigate to="/" /> : <SignupProfesseurForm />} />

            <Route
                path="etudiant"
                element={
                  !token ? <Navigate to="/login" /> :
                      !userData ? null :
                          role === "ETUDIANT" ? <EtudiantProfile /> :
                              <Navigate to="/" />
                }
            />
            <Route
                path="employeur"
                element={
                  !token ? <Navigate to="/login" /> :
                      !userData ? null :
                          role === "EMPLOYEUR" ? <EmployeurHome /> :
                              <Navigate to="/" />
                }
            />
            <Route
                path="employeur/creer-offre"
                element={
                  !token ? <Navigate to="/login" /> :
                      !userData ? null :
                          role === "EMPLOYEUR" ? <CreateOffreForm /> :
                              <Navigate to="/" />
                }
            />
            <Route
                path="professeur"
                element={
                  !token ? <Navigate to="/login" /> :
                      !userData ? null :
                          role === "PROFESSEUR" ? <PreposeHome /> :
                              <Navigate to="/" />
                }
            />
            <Route
                path="gestionnaire"
                element={
                  !token ? <Navigate to="/login" /> :
                      !userData ? null :
                          role === "GESTIONNAIRE" ? <GestionnaireHome /> :
                              <Navigate to="/" />
                }
            />
          </Route>
        </Routes>
      </div>
  );
}

export default App;