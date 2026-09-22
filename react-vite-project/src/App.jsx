import PageLayout from "./components/PageLayout.jsx";
import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
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
import SignupEtudiantForm from "./components/auth/SignupEtudiantForm.jsx";
import SignupEmployeurForm from "./components/auth/SignupEmployeurForm.jsx";
import { AuthServiceContext } from "./services/AuthService.tsx";
import EtudiantProfile from "./components/page/EtudiantProfile.jsx";

function App() {
  const authService = useContext(AuthServiceContext);
  const userData = authService.getUserData();

  return (
    <div>
      <Routes>
        <Route path="/" element={<PageLayout user={userData} />}>
          <Route index element={<MainContainer user={userData} />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<LoginForm />} />
          <Route path='etudiant' element={<EtudiantProfile />} />
          <Route path="employeur" element={<EmployeurHome />} />
          <Route path="professeur" element={<PreposeHome />} />
          <Route path="gestionnaire" element={<GestionnaireHome />} />
          <Route path="employeur/creer-offre" element={<CreateOffreForm />} />
          <Route path="signup" element={<SignupEtudiantForm />} />
          <Route path="signup/etudiant" element={<SignupEtudiantForm />} />
          <Route path="signup/employeur" element={<SignupEmployeurForm />} />
          <Route path="signup/professeur" element={<SignupProfesseurForm />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
