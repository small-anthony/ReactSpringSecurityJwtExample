import "./App.css";
import PageLayout from "./components/PageLayout.jsx";
import React, {useContext, useEffect, useState} from "react";
import {Route, Routes, useNavigate} from "react-router-dom";
import MainContainer from "./components/MainContainer.jsx";
import About from "./components/About.jsx";
import LoginForm from "./components/auth/LoginForm.jsx";
import ErrorPage from "./components/ErrorPage.jsx";
import EmprunteurHome from "./components/page/EmprunteurHome.jsx";
import PreposeHome from "./components/page/PreposeHome.jsx";
import GestionnaireHome from "./components/page/GestionnaireHome.jsx";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<PageLayout/>}>
          <Route index element={<MainContainer/>}/>
          <Route path='about' element={<About/>}/>
          <Route path='login' element={<LoginForm/>}/>
          <Route path='etudiant' element={<EmprunteurHome/>}/>
          <Route path='professeur' element={<PreposeHome/>}/>
          <Route path='gestionnaire' element={<GestionnaireHome/>}/>
          <Route path='error' element={<ErrorPage/>}/>
        </Route>
      </Routes>

    </div>
  );
}

export default App;
