import { useLanguage } from "../i18n/LanguageContext";
export default function Services() {
  const { t } = useLanguage();
  return <section className="empty-page services-page" aria-label={t("Services")} />;
}
