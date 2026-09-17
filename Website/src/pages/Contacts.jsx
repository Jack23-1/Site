import { useLanguage } from "../i18n/LanguageContext";
export default function Contacts() {
  const { t } = useLanguage();
  return <section className="empty-page contacts-page" aria-label={t("Contacts")} />;
}
