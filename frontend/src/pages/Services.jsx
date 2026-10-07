import { useLanguage } from '../i18n/LanguageContext'
import identityCard from '../assets/recto.png'
import identityCardBack from '../assets/verso.png'
import fgpDatabase from '../assets/fgp-database.png'
import fgpSource from '../../infos onip?raw'
import './Services.css'

const [fgpTitle, ...fgpParagraphs] = fgpSource.trim().split(/\n+/).filter(Boolean)

const content = {
  fr: {
    fgpTitle: fgpTitle.replace(/^Le /, ''),
    fgpParagraphs: fgpParagraphs.map(paragraph => paragraph.includes('«') ? `${paragraph} »` : paragraph),
    fgpAlt: 'Base de données centrale reliée aux informations biographiques, biométriques, à l’état civil et aux administrations',
    fgpCaption: 'Le FGP, la base de données mère de l’identité en RDC.',
    title: 'Carte d’Identité Nationale',
    paragraphs: [
      'Une carte d’identité est un document administratif officiel destiné à attester de l’identité d’une personne.',
      'En République Démocratique du Congo, la Carte d’Identité Nationale (CIN) est créée par le Décret 22/08 du 2 mars 2022. Elle est produite et délivrée par l’Office National d’Identification de la Population (ONIP). Elle est obligatoire pour tout citoyen congolais majeur.',
      'La Carte d’Identité Nationale est délivrée à tout Congolais préalablement enregistré dans le Fichier Général de la Population, à travers les opérations d’identification de la population.',
      'Elle contient des informations à caractère personnel lisibles à l’œil nu (noms, adresse…) et des informations à caractère personnel lisibles électroniquement (empreintes, iris…).',
    ],
  },
  en: {
    fgpTitle: 'General Population Register',
    fgpParagraphs: [
      'The General Population Register (FGP) was established by Decree 22/07 of 2 March 2022 creating a General Population Register in the Democratic Republic of the Congo. Article 2 defines the FGP as a system for processing individual data containing biographical and biometric information relating to the identity of individuals, as well as civil registration information.',
      'It continuously records, processes, stores and communicates information relating to the identification of individuals residing in the Democratic Republic of the Congo and Congolese citizens living abroad, in accordance with applicable personal data protection legislation.',
      'The FGP is the central identity database in the DRC. It sits at the heart of a large network interconnected with various services and administrations.',
    ],
    fgpAlt: 'Central database connected to biographical information, biometric data, civil registration and public administrations',
    fgpCaption: 'The FGP, the central identity database in the DRC.',
    title: 'National Identity Card',
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

  return <section className="container services-page" lang={language === 'en' ? 'en' : 'fr'} aria-label="Services">
    <article className="services-presentation" aria-labelledby="services-card-title">
      <div className="services-heading">
        <h2 className="services-image-title" id="services-card-title">{copy.title}</h2>
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
    <article className="services-presentation services-fgp" aria-labelledby="services-fgp-title">
      <figure className="services-fgp-figure">
        <h2 className="services-image-title" id="services-fgp-title">{copy.fgpTitle}</h2>
        <img src={fgpDatabase} alt={copy.fgpAlt} width="1254" height="1254" loading="lazy" />
        <figcaption>{copy.fgpCaption}</figcaption>
      </figure>
      <div className="services-text">
        <div className="services-body">
          {copy.fgpParagraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </div>
    </article>
  </section>
}
