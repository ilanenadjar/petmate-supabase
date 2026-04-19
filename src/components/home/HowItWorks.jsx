import { UserPlus, Search, Handshake } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "../i18n/LanguageContext";

export default function HowItWorks() {
  const { t } = useLang();

  const steps = [
    { icon: UserPlus, titleKey: "step1Title", descKey: "step1Desc", color: "from-orange-400 to-rose-400" },
    { icon: Search, titleKey: "step2Title", descKey: "step2Desc", color: "from-rose-400 to-purple-400" },
    { icon: Handshake, titleKey: "step3Title", descKey: "step3Desc", color: "from-purple-400 to-indigo-400" },
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t("howTitle")}</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">{t("howSub")}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.titleKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="text-center group"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <step.icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-sm font-bold text-orange-500 mb-2">{t("step")} {i + 1}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t(step.titleKey)}</h3>
              <p className="text-slate-500 leading-relaxed">{t(step.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}