import { useLanguage } from "../i18n/LanguageContext";
export default function Actualites() {
  const { t } = useLanguage();
  return <section className="empty-page actualites-page" aria-label={t("Actualités")} />;
}
