import React from "react";
import { Link } from "react-router-dom";

function MainContainer() {
  return (
    <div className="maincontainer max-w-2xl mx-auto text-center py-12 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Gestion des Stages</h1>
      <p className="text-gray-600 mb-8">
        Bienvenue sur la plateforme de gestion des stages.
      </p>

      <div className="flex justify-center gap-4">
        <Link
          to="/signup/professeur"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow transition duration-200"
        >
          S'inscrire comme professeur
        </Link>
        <Link
          to="/login"
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 px-6 rounded-lg shadow-sm transition duration-200"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}

export default MainContainer;
