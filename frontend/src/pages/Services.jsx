import { useLanguage } from '../i18n/LanguageContext'
import identityCard from '../assets/recto.png'
import identityCardBack from '../assets/verso.png'
import './Services.css'

const content = {
  fr: {
    title: 'La Carte d’Identité Nationale',
    paragraphs: [
      'Une carte d’identité est un document administratif officiel destiné à attester de l’identité d’une personne.',
      'En République Démocratique du Congo, la Carte d’Identité Nationale (CIN) est créée par le Décret 22/08 du 2 mars 2022. Elle est produite et délivrée par l’Office National d’Identification de la Population (ONIP). Elle est obligatoire pour tout citoyen congolais majeur.',
      'La Carte d’Identité Nationale est délivrée à tout Congolais préalablement enregistré dans le Fichier Général de la Population, à travers les opérations d’identification de la population.',
      'Elle contient des informations à caractère personnel lisibles à l’œil nu (noms, adresse…) et des informations à caractère personnel lisibles électroniquement (empreintes, iris…).',
    ],
  },
  en: {
    title: 'The National Identity Card',
    paragraphs: [
      'An identity card is an official administrative document used to establish a person’s identity.',
      'In the Democratic Republic of the Congo, the National Identity Card (CIN) was established by Decree 22/08 of 2 March 2022. It is produced and issued by the National Office for Population Identification (ONIP). It is mandatory for every adult Congolese citizen.',
      'The National Identity Card is issued to every Congolese citizen who has been registered in the General Population Register through population identification operations.',
      'It contains personal information readable with the naked eye (names, address…) and electronically readable personal information (fingerprints, iris data…).',
    ],
  },
}

export default function Services() {
  const { language } = useLanguage()
  const copy = content[language] || content.fr

  return <section className="container services-page" lang={language === 'en' ? 'en' : 'fr'} aria-label={copy.title}>
    <article className="services-presentation">
      <div className="services-heading">
        <div className="services-card-frame">
        <img
          className="services-card-image"
          src={identityCard}
          alt={language === 'en' ? 'Front of the National Identity Card' : 'Recto de la Carte d’Identité Nationale'}
          width="1536"
          height="1024"
        />
        </div>
        <div className="services-card-frame services-card-frame-back">
          <img
            className="services-card-image"
            src={identityCardBack}
            alt={language === 'en' ? 'Back of the National Identity Card' : 'Verso de la Carte d’Identité Nationale'}
            width="1536"
            height="1024"
          />
        </div>
      </div>
      <div className="services-text">
        <p className="services-lead">{copy.paragraphs[0]}</p>
        <div className="services-body">
          {copy.paragraphs.slice(1).map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </div>
    </article>
  </section>
}
