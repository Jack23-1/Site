import { useLanguage } from "../i18n/LanguageContext";
export default function Apropos() {
  const { t } = useLanguage();
  return <section className="empty-page apropos-page" aria-label={t("À propos")} />;
}
