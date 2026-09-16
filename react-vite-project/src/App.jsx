import PageLayout from "./components/PageLayout.jsx";
import React, {useContext, useEffect, useState} from "react";
import {Route, Routes, useNavigate} from "react-router-dom";
import MainContainer from "./components/MainContainer.jsx";
import About from "./components/About.jsx";
import LoginForm from "./components/auth/LoginForm.jsx";
import ErrorPage from "./components/ErrorPage.jsx";
import HomePage from "./components/page/HomePage.jsx";
import {AuthServiceContext} from "./services/AuthService.tsx";

function App() {
  const authService = useContext(AuthServiceContext);
  const userData = authService.getUserData();

  return (
    <div>
      <Routes>
        <Route path="/" element={<PageLayout user={userData}/>}>
          <Route index element={<MainContainer/>}/>
          <Route path='home' element={<HomePage user={userData}/>}/>
          <Route path='about' element={<About/>}/>
          <Route path='login' element={<LoginForm/>}/>
          <Route path='error' element={<ErrorPage/>}/>
        </Route>
      </Routes>

    </div>
  );
}

export default App;
