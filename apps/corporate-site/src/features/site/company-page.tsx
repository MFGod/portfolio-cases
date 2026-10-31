import type { Content } from '../../domain/content';
import { t } from '../../domain/copy';
import { media } from '../../domain/media';
import { href } from '../../domain/route';
import { People, SectionHead } from './parts';

export function CompanyPage({ content }: { content: Content }) {
  const company = content.company;
  return (
    <>
      <section className="page-head">
        <h1>{company.title}</h1>
        <p className="lead">{company.intro}</p>
      </section>

      <dl className="facts">
        {company.facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      <img className="photo" src={media[content.company.image].src} alt="" />

      <section className="section">
        <SectionHead title={t('principles')} />
        <ul className="principles">
          {company.principles.map((principle) => (
            <li key={principle.title}>
              <h3>{principle.title}</h3>
              <p>{principle.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <SectionHead title={t('team')} link={{ href: href.team(), label: t('allTeam') }} />
        <People members={content.team} label={t('team')} />
      </section>
    </>
  );
}
