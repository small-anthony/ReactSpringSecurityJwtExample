import { Shield } from "lucide-react";
import SidePanelGestionnaire from "../widget/SidePanelGestionnaire.jsx";

const GestionnaireHome = () => {
    return (
        <main className="flex flex-col md:flex-row w-full bg-gray-50/30 overflow-hidden">
            <SidePanelGestionnaire activeTab="accueil" />

            <div className="flex-1 p-8 md:p-12 animate-in fade-in duration-300 flex flex-col justify-center items-center text-center">
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-200 max-w-2xl">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8" strokeWidth={2} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Bienvenue dans votre Espace Gestionnaire</h2>
                    <p className="text-gray-500 text-lg leading-relaxed mb-8">
                        Gérez les offres de stage, supervisez les étudiants et suivez les contrats en toute simplicité. Sélectionnez une action dans le menu pour commencer.
                    </p>
                </div>
            </div>

        </main>
    );
}

export default GestionnaireHome;