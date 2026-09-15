import {useContext, useState} from "react";
import {useNavigate} from "react-router-dom";
import {AuthServiceContext} from "../../services/AuthService.tsx";


const LoginForm = ({user, setUser, setError}) => {
  const authService = useContext(AuthServiceContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [warnings, setWarnings] = useState({
    email: '',
    password: ''
  });

  const validateUser = () => {
    let isValid = true;
    let updatedWarnings = {...warnings};

    if (!validateEmail()) {
      updatedWarnings.email = "courriel invalide";
      isValid = false;
    } else {
      updatedWarnings.email = "";
    }

    if (!validatePassword()) {
      updatedWarnings.password = "mot de passe invalide";
      isValid = false;
    } else {
      updatedWarnings.password = "";
    }

    setWarnings(updatedWarnings);
    return isValid;
  };

  const validateEmail = () => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(formData.email);
  }

  const validatePassword = () => {
    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    // return passwordRegex.test(formData.password);
    return true;
  }

  const handleChanges = (e) => {
    const {name, value} = e.target;
    setWarnings({...warnings, [name]: ""});
    setFormData({...formData, [name]: value.trim()});
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateUser()) {
      fetchFunc();
    }
  }

  const fetchFunc = async () => {
      const response = await authService.login(formData.email.toLowerCase(), formData.password);
      if (!response.ok) {
        switch (response.status) {
          case 401:
            throw new Error("Not authorized");
          case 404:
            throw new Error("No server available");
          default:
            throw new Error("Not ok")
        }
      }

      navigate("/")
  }

  return (
    <>
      {user?.isLoggedIn ? (
        user.role === "ROLE_EMPRUNTEUR" ? navigate("/emprunteur") :
          user.role === "ROLE_PREPOSE" ? navigate("/prepose") :
            user.role === "ROLE_GESTIONNAIRE" ? navigate("/gestionnaire") :
              navigate("/")
      ) : (
        <div className="container mt-5">
          <h1 className="display-6 text-center mb-3">Projet Etudiant</h1>

            <div className="row">
              <div className="col-9 mx-auto">
                <form id="login-form" className="form-group" onSubmit={handleSubmit}>
                  <label htmlFor="email" className="mt-3">email</label>
                  <input id="email" type="email"
                         className={`form-control ${warnings.email ? "is-invalid" : ""} `}
                         placeholder="placeHolderEmail" name="email" onChange={handleChanges} required/>
                  <div className="text-danger">{warnings.email}</div>
                  <label htmlFor="password" className="mt-3">password</label>
                  <input id="password" type="password"
                         className={`form-control ${warnings.password ? "is-invalid" : ""} `}
                         placeholder="placeHolderPassword" name="password" onChange={handleChanges} required/>
                  <div className="text-danger">{warnings.password}</div>
                  <div className="row col-6 mx-auto">
                    <button type="submit" className="btn btn-outline-ose my-5 mx-auto">loginSubmit</button>
                  </div>
                </form>
              </div>
            </div>

        </div>
      )}
    </>
  )
}

export default LoginForm;
