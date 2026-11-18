import { useEffect, useState } from "react";

export function useSessionSelection(fetchAnnees, authService) {
    const [annees, setAnnees] = useState([]);
    const [anneeChoisie, setAnneeChoisie] = useState(null);
    const [anneesChargees, setAnneesChargees] = useState(false);

    useEffect(() => {
        let actif = true;
        const charger = async () => {
            try {
                const res = await fetchAnnees?.(authService.buildAuthHeader());
                if (!actif) return;
                const liste = Array.isArray(res) ? res : [];
                setAnnees(liste);
                if (liste.length > 0) {
                    setAnneeChoisie((prev) => prev ?? liste[0]);
                }
            } catch {
                if (actif) setAnnees([]);
            } finally {
                if (actif) setAnneesChargees(true);
            }
        };
        charger();
        return () => {
            actif = false;
        };
    }, [fetchAnnees, authService]);

    return { annees, anneeChoisie, setAnneeChoisie, anneesChargees };
}
