import { useLanguage } from '../i18n/LanguageContext'
import './Apropos.css'

const content = {
  fr: {
    name: 'Office National d’Identification de la Population',
    heading: 'Quid de l’ONIP',
    introduction: 'L’Office National d’Identification de la Population est un établissement public à caractère administratif et technique, doté d’une personnalité juridique et d’une autonomie financière.',
    history: 'Il est créé par le Décret 011/48 du 31 décembre 2011 portant création et fixation des statuts d’un établissement public dénommé « Office National d’Identification de la Population », « ONIP » en sigle. Il est placé sous la tutelle du Ministère de l’Intérieur et Sécurité. Ses premiers mandataires n’ont été nommés qu’en 2014, soit trois ans après la création de l’ONIP.',
    missionsTitle: 'Nos missions',
    missionsIntro: 'Dans les conditions prévues par les lois et règlements, l’Office exerce sur l’étendue du territoire national toutes les missions et prérogatives relatives à l’application des législations en matière de constitution du Fichier Général de la Population. À ce titre et conformément au décret portant sa création, l’ONIP est chargé notamment de :',
    missions: [
      'L’identification systématique et effective de la population ;',
      'La constitution et l’entretien du Fichier Général de la Population ;',
      'La délivrance de la carte d’identité nationale et d’autres imprimés produits à partir de la base de données du Fichier Général de la Population ;',
      'La réalisation, par lui-même ou par un tiers, des études sur l’évolution des méthodologies, de la constitution et de l’entretien du Fichier Général de la Population, d’une part, et de la production des imprimés produits à partir de la base de données du fichier constitué, d’autre part ;',
      'L’émission des avis sur la politique de l’État en matière de constitution et de gestion du Fichier Général de la Population.',
    ],
  },
  en: {
    name: 'National Office for Population Identification',
    heading: 'Understanding ONIP',
    introduction: 'The National Office for Population Identification is a public institution of an administrative and technical nature, with legal personality and financial autonomy.',
    history: 'It was established by Decree 011/48 of 31 December 2011 creating and defining the statutes of a public institution named the “National Office for Population Identification”, abbreviated as “ONIP”. It operates under the supervision of the Ministry of the Interior and Security. Its first officeholders were only appointed in 2014, three years after ONIP was established.',
    missionsTitle: 'Our missions',
    missionsIntro: 'Under the conditions laid down by laws and regulations, the Office carries out, throughout the national territory, all missions and powers relating to the implementation of legislation governing the establishment of the General Population Register. In this capacity, and in accordance with its founding decree, ONIP is responsible in particular for:',
    missions: [
      'The systematic and effective identification of the population;',
      'The establishment and maintenance of the General Population Register;',
      'The issuance of national identity cards and other printed documents produced from the General Population Register database;',
      'Conducting studies, itself or through a third party, on developments in methodologies for establishing and maintaining the General Population Register, on the one hand, and for producing printed documents from the established register’s database, on the other;',
      'Providing opinions on State policy concerning the establishment and management of the General Population Register.',
    ],
  },
}

export default function Apropos() {
  const { language } = useLanguage()
  const copy = content[language] || content.fr

  return <section className="container apropos-page" lang={language === 'en' ? 'en' : 'fr'} aria-labelledby="apropos-introduction-title">
    <section className="apropos-introduction" aria-labelledby="apropos-introduction-title">
      <div className="apropos-identity">
        <h1 id="apropos-introduction-title">{copy.heading}</h1>
        <div className="tricolor" />
      </div>
      <div className="apropos-story">
        <p className="apropos-lead">{copy.introduction}</p>
        <p>{copy.history}</p>
      </div>
    </section>
    <section className="apropos-missions" aria-labelledby="apropos-missions-title">
      <h2 id="apropos-missions-title">{copy.missionsTitle}</h2>
      <p>{copy.missionsIntro}</p>
      <ol>{copy.missions.map((mission, index) => <li key={index}>
        <span className="apropos-mission-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <p>{mission}</p>
      </li>)}</ol>
    </section>
  </section>
}
