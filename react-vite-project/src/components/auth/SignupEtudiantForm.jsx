import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerEtudiant } from "../../services/api/EtudiantService";

const DISCIPLINES = [
  "Techniques de l'informatique",
  "Soins infirmiers",
  "Technologie de l'architecture",
  "Techniques de comptabilité et de gestion",
  "Techniques de génie civil"
];

export default function SignupEtudiantForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    matricule: "",
    email: "",
    discipline: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est obligatoire.";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est obligatoire.";
    }

    if (!formData.matricule.trim()) {
      newErrors.matricule = "Le matricule est obligatoire.";
    } else if (!/^\d{7}$/.test(formData.matricule.trim())) {
      newErrors.matricule = "Le matricule doit comporter exactement 7 chiffres.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Le courriel est obligatoire.";
    } else if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i.test(formData.email.trim())) {
      newErrors.email = "Format de courriel invalide.";
    }

    if (!formData.discipline) {
      newErrors.discipline = "Veuillez choisir une discipline.";
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est obligatoire.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "La confirmation est obligatoire.";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMessage("");

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        matricule: formData.matricule.trim(),
        email: formData.email.trim().toLowerCase(),
        discipline: formData.discipline,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };

      await registerEtudiant(payload);

      setSuccessMessage("Inscription réussie ! Redirection vers la page de connexion...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setServerError(err.message || "Erreur lors de la communication avec le serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-10 p-8 bg-white rounded-xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
        Inscription Étudiant
      </h2>
      <p className="text-center text-gray-500 text-sm mb-6">
        Remplissez ce formulaire pour créer votre compte étudiant.
      </p>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
          <strong>Erreur : </strong>{serverError}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-800 text-sm rounded">
          <strong>Succès : </strong>{successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Prénom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Ex: Jean"
              className={`w-full p-2.5 border rounded-lg ${errors.firstName ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Ex: Tremblay"
              className={`w-full p-2.5 border rounded-lg ${errors.lastName ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Matricule (7 chiffres) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="matricule"
            value={formData.matricule}
            onChange={handleChange}
            placeholder="Ex: 1234567"
            maxLength={7}
            className={`w-full p-2.5 border rounded-lg ${errors.matricule ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
          />
          {errors.matricule && (
            <p className="text-red-500 text-xs mt-1">{errors.matricule}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Adresse courriel <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Ex: 1234567@cegep.ca"
            className={`w-full p-2.5 border rounded-lg ${errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Discipline de stage <span className="text-red-500">*</span>
          </label>
          <select
            name="discipline"
            value={formData.discipline}
            onChange={handleChange}
            className={`w-full p-2.5 border rounded-lg bg-white ${errors.discipline ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
          >
            <option value="">-- Choisir une discipline --</option>
            {DISCIPLINES.map((disc, idx) => (
              <option key={idx} value={disc}>
                {disc}
              </option>
            ))}
          </select>
          {errors.discipline && (
            <p className="text-red-500 text-xs mt-1">{errors.discipline}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Au moins 8 caractères"
                className={`w-full p-2.5 pr-20 border rounded-lg ${errors.password ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer select-none"
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Confirmer mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Retapez le mot de passe"
                className={`w-full p-2.5 pr-20 border rounded-lg ${errors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer select-none"
              >
                {showConfirmPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 font-bold rounded-lg text-white transition ${isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer shadow"
              }`}
          >
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </button>
        </div>

        <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
          Vous avez déjà un compte ?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Se connecter
          </Link>
        </div>
      </form>
    </div>
  );
}