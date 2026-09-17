import { useLanguage } from "../i18n/LanguageContext";
export default function Galerie() {
  const { t } = useLanguage();
  return <section className="empty-page galerie-page" aria-label={t("Galerie")} />;
}
