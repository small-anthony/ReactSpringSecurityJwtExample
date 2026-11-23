import { useEffect, useMemo, useState } from "react";

export function estSessionPassee(anneeChoisie, annees) {
    if (anneeChoisie === null || anneeChoisie === undefined) return false;
    if (!Array.isArray(annees) || annees.length === 0) return false;
    const numeriques = annees.map(Number).filter((n) => !Number.isNaN(n));
    if (numeriques.length === 0) return false;
    const anneeCouranteRef = Math.max(...numeriques);
    return Number(anneeChoisie) < anneeCouranteRef;
}

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

    const estAncienneSession = useMemo(
        () => estSessionPassee(anneeChoisie, annees),
        [anneeChoisie, annees]
    );

    return { annees, anneeChoisie, setAnneeChoisie, anneesChargees, estAncienneSession };
}
