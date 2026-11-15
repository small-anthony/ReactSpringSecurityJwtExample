import React from "react";
import { useParams } from "react-router-dom";
import FormulaireEvaluationMilieuStage from "../widget/FormulaireEvaluationMilieuStage.jsx";

export default function EvaluationMilieuStage({ mode = "professeur" }) {
    const { etudiantId } = useParams();

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
            <FormulaireEvaluationMilieuStage etudiantId={etudiantId} mode={mode} />
        </div>
    );
}
