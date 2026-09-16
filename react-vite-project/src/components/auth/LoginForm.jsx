import {useContext, useState} from "react";
import {useNavigate} from "react-router-dom";
import {AuthServiceContext, LoginError} from "../../services/AuthService.tsx";
import {useTranslation} from "react-i18next";
import './LoginForm.css';

const LoginForm = () => {
  const authService = useContext(AuthServiceContext);
  const navigate = useNavigate();
  const { t } = useTranslation(["main", "auth"]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [warnings, setWarnings] = useState({
    email: '',
    password: '',
    result: '',
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
    return formData.password.length > 0; //
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
      try {
        await authService.login(formData.email.toLowerCase(), formData.password);
        navigate("/home");
      }

      catch(error) {
        if(error instanceof Error) {
          setWarnings({...warnings, result: error.message});
        }
      }
  }

  return (
    <>
      <h1>TO BE REDONE</h1>
      <div className="w-1/2 m-auto login-form">
        <h1 className="display-6 text-center mb-3">{t('auth:login.title')}</h1>
        <form onSubmit={handleSubmit} className={"grid gap-6 mb-6 md:grid-cols-2 py-4"}>
          <div className={"mx-4"}>
            <label htmlFor={"email"} className={"block mb-2.5 text-sm font-medium text-heading text-center"}>
              {t('auth:login.email')}
            </label>
            <input className={`w-full login-input ${warnings.email ? "is-invalid" : ""}`}
                   id={"email"} name={"email"} type={"email"}
                   onChange={handleChanges}
                   placeholder={"..."}

            />
            <div className="text-danger">{warnings.email}</div>
          </div>
          <div className={"mx-4"}>
            <label htmlFor={"email"} className={"block mb-2.5 text-sm font-medium text-heading text-center"}>
              {t('auth:login.password')}
            </label>
            <input className={`w-full login-input ${warnings.password ? "is-invalid" : ""}`}
                   id={"password"} name={"password"} type={"password"}
                   onChange={handleChanges}
                   placeholder={"..."}

            />
            <div className="text-danger">{warnings.password}</div>
          </div>
          <div className={"grid-cols-3"}>
            <button type={"submit"} className={"bg-blue-500 mx-auto"}>{t('auth:login.submit')}</button>
            <div className="text-danger">{warnings.result}</div>
          </div>
        </form>
      </div>
    </>
  )
}

export default LoginForm;
