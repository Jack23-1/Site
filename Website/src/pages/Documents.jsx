import { useLanguage } from "../i18n/LanguageContext";
export default function Documents() {
  const { t } = useLanguage();
  return <section className="empty-page documents-page" aria-label={t("Documents")} />;
}
