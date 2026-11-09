import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function SectionActionsPrioritaires({ actionsPrioritaires, t }) {
    return (
        <section className="ds-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>{t("etudiant_dashboard.todo.title")}</span>
                </h2>
            </div>

            {actionsPrioritaires.length === 0 ? (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="text-xs">
                        <p className="font-bold">
                            {t("etudiant_dashboard.todo.all_caught_up_title")}
                        </p>
                        <p className="text-emerald-700 mt-0.5">
                            {t("etudiant_dashboard.todo.all_caught_up_desc")}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {actionsPrioritaires.map((item) => {
                        const {
                            id,
                            icon: Icon,
                            tone,
                            iconTone,
                            badgeTone,
                            badge,
                            title,
                            desc,
                            onAction,
                            ctaClass,
                            ctaLabel
                        } = item;
                        return (
                            <div
                                key={id}
                                className={`p-4 rounded-xl border ${tone} flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all`}
                            >
                                <div className="flex items-start gap-3 min-w-0">
                                    <div
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconTone}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeTone}`}
                                            >
                                                {badge}
                                            </span>
                                            <h3 className="text-sm font-bold text-slate-900">
                                                {title}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            {desc}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onAction}
                                    className={`${ctaClass} shrink-0`}
                                >
                                    <span>{ctaLabel}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

