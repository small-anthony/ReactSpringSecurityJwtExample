import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import fetcher from "../../utils/fetcher";
import useFormValidation from "../../hooks/useFormValidation";

const DISCIPLINES = [
  "Techniques de l'informatique",
  "Soins infirmiers",
  "Technologie de l'architecture",
  "Techniques de comptabilité et de gestion",
  "Techniques de génie civil"
];

export default function SignupEtudiantForm() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialValues = {
    firstName: "",
    lastName: "",
    matricule: "",
    email: "",
    discipline: "",
    password: "",
    confirmPassword: ""
  };

  const validationRules = {
    firstName: (val) => (!val?.trim() ? "Le prénom est requis." : ""),
    lastName: (val) => (!val?.trim() ? "Le nom est requis." : ""),
    matricule: (val) => {
      if (!val?.trim()) return "Le matricule est requis.";
      if (!/^\d{7}$/.test(val.trim())) return "Le matricule doit comporter exactement 7 chiffres.";
      return "";
    },
    email: (val) => {
      if (!val?.trim()) return "Le courriel institutionnel est requis.";
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!emailRegex.test(val.trim())) return "Format de courriel invalide (ex: etudiant@cegep.ca).";
      return "";
    },
    discipline: (val) => (!val ? "Veuillez choisir une discipline de stage." : ""),
    password: (val) => {
      if (!val) return "Le mot de passe est requis.";
      const missing = [];
      if (val.length < 8) missing.push("au moins 8 caractères");
      if (!/[A-Z]/.test(val)) missing.push("une majuscule");
      if (!/[a-z]/.test(val)) missing.push("une minuscule");
      if (!/\d/.test(val)) missing.push("un chiffre");

      if (missing.length > 0) {
        return `Il manque : ${missing.join(", ")}.`;
      }
      return "";
    },
    confirmPassword: (val, allVals) => {
      if (!val) return "La confirmation du mot de passe est requise.";
      if (val !== allVals.password) return "Les mots de passe ne correspondent pas.";
      return "";
    }
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    isValid
  } = useFormValidation(initialValues, validationRules);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMsg("");

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        matricule: values.matricule.trim(),
        email: values.email.trim().toLowerCase(),
        discipline: values.discipline,
        password: values.password
      };

      const response = await fetcher("signup/etudiant", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 409) {
          const errData = await response.json().catch(() => null);
          throw new Error(errData?.message || "Ce courriel ou ce matricule est déjà utilisé.");
        } else if (response.status === 400) {
          const errData = await response.json().catch(() => null);
          throw new Error(errData?.message || "Données invalides envoyées au serveur.");
        } else {
          throw new Error("Erreur serveur lors de l'enregistrement.");
        }
      }

      setSuccessMsg("Inscription réussie ! Un courriel de validation a été envoyé. Redirection...");
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {
      setServerError(err.message || "Impossible de contacter le serveur backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-10 p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Inscription Étudiant
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Remplissez le formulaire ci-dessous pour accéder aux offres de stage
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r">
          <strong>Erreur : </strong>{serverError}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 text-sm rounded-r">
          <strong>Succès : </strong>{successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Prénom et Nom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Prénom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={values.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3.5 py-2.5 border rounded-lg transition focus:outline-none focus:ring-2 ${touched.firstName && errors.firstName
                ? "border-red-500 focus:ring-red-200 bg-red-50/20"
                : "border-gray-300 focus:ring-blue-200"
                }`}
              placeholder="Ex: Jean"
            />
            {touched.firstName && errors.firstName && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={values.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3.5 py-2.5 border rounded-lg transition focus:outline-none focus:ring-2 ${touched.lastName && errors.lastName
                ? "border-red-500 focus:ring-red-200 bg-red-50/20"
                : "border-gray-300 focus:ring-blue-200"
                }`}
              placeholder="Ex: Tremblay"
            />
            {touched.lastName && errors.lastName && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Matricule */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Numéro d'étudiant / Matricule (7 chiffres) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="matricule"
            value={values.matricule}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3.5 py-2.5 border rounded-lg transition focus:outline-none focus:ring-2 ${touched.matricule && errors.matricule
              ? "border-red-500 focus:ring-red-200 bg-red-50/20"
              : "border-gray-300 focus:ring-blue-200"
              }`}
            placeholder="Ex: 1234567"
          />
          {touched.matricule && errors.matricule && (
            <p className="text-red-500 text-xs mt-1 font-medium">{errors.matricule}</p>
          )}
        </div>

        {/* Courriel */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Adresse courriel <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3.5 py-2.5 border rounded-lg transition focus:outline-none focus:ring-2 ${touched.email && errors.email
              ? "border-red-500 focus:ring-red-200 bg-red-50/20"
              : "border-gray-300 focus:ring-blue-200"
              }`}
            placeholder="Ex: 1234567@cegep.ca"
          />
          {touched.email && errors.email && (
            <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>
          )}
        </div>

        {/* Discipline de stage */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Discipline de stage <span className="text-red-500">*</span>
          </label>
          <select
            name="discipline"
            value={values.discipline}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3.5 py-2.5 border rounded-lg bg-white transition focus:outline-none focus:ring-2 ${touched.discipline && errors.discipline
              ? "border-red-500 focus:ring-red-200 bg-red-50/20"
              : "border-gray-300 focus:ring-blue-200"
              }`}
          >
            <option value="">-- Choisir une discipline --</option>
            {DISCIPLINES.map((disc, idx) => (
              <option key={idx} value={disc}>
                {disc}
              </option>
            ))}
          </select>
          {touched.discipline && errors.discipline && (
            <p className="text-red-500 text-xs mt-1 font-medium">{errors.discipline}</p>
          )}
        </div>

        {/* Mots de passe */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full pr-16 px-3.5 py-2.5 border rounded-lg transition focus:outline-none focus:ring-2 ${touched.password && errors.password
                  ? "border-red-500 focus:ring-red-200 bg-red-50/20"
                  : "border-gray-300 focus:ring-blue-200"
                  }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer select-none"
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>

            {touched.password && errors.password && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Confirmer mot de passe */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Confirmer mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full pr-16 px-3.5 py-2.5 border rounded-lg transition focus:outline-none focus:ring-2 ${touched.confirmPassword && errors.confirmPassword
                  ? "border-red-500 focus:ring-red-200 bg-red-50/20"
                  : "border-gray-300 focus:ring-blue-200"
                  }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer select-none"
              >
                {showConfirmPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Bouton Soumettre */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`w-full py-3 px-4 font-bold rounded-lg transition duration-200 shadow-md ${!isValid || isSubmitting
              ? "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
              : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-blue-500/20 hover:shadow-lg"
              }`}
          >
            {isSubmitting ? "Enregistrement en cours..." : "S'inscrire"}
          </button>
        </div>

        <div className="text-center text-sm text-gray-500 mt-6 pt-4 border-t border-gray-100">
          Vous avez déjà un compte ?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Se connecter
          </Link>
        </div>
      </form>
    </div>
  );
}