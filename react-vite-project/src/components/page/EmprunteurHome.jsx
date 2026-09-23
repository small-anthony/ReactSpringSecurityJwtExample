import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import CvUploadModal from '../modal/CvUploadModal.jsx';

const EmprunteurHome = () => {
  const { t } = useTranslation("main");
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const [cvUploaded, setCvUploaded] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
          Espace Étudiant
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Bienvenue sur votre portail
        </h1>
        <p className="text-blue-100 mt-2 max-w-xl text-sm sm:text-base">
          Gérez votre profil, déposez votre CV et postulez aux meilleures offres de stage.
        </p>
      </div>

      {/* Quick Actions / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CV Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl mb-4 font-bold">
            📄
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Curriculum Vitae (CV)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Déposez ou mettez à jour votre CV au format PDF afin de pouvoir postuler aux offres.
          </p>

          {cvUploaded ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <span>✓</span> CV téléversé avec succès !
              </div>
              <button
                onClick={() => setIsCvModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                Mettre à jour le CV
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsCvModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
            >
              {t('cv_upload.title') || "Téléverser mon CV"}
            </button>
          )}
        </div>

        {/* Job Offers Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl mb-4 font-bold">
            💼
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Offres de stage
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Consultez les offres de stage disponibles correspondant à votre domaine d'études.
          </p>
          <button
            disabled
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-sm font-semibold cursor-not-allowed"
          >
            Bientôt disponible
          </button>
        </div>
      </div>

      {/* Modal */}
      {isCvModalOpen && (
        <CvUploadModal
          onUploadSuccess={() => {
            setCvUploaded(true);
          }}
          onClose={() => setIsCvModalOpen(false)}
        />
      )}
    </div>
  );
};

export default EmprunteurHome;