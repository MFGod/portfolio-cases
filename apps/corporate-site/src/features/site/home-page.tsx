import { Fragment, type CSSProperties, type PointerEvent } from 'react';

import { industryName, type Content } from '../../domain/content';
import { fromWeeks, t } from '../../domain/copy';
import { membersOf } from '../../domain/queries';
import { href } from '../../domain/route';
import { Icon } from '../../ui/icons';
import { ContactLink } from './contact-link';
import { ContactPage } from './contact-page';
import { SectionHead, StepList } from './parts';
import { ProjectShot } from './project-shot';
import { WorkVisual } from './support-example';

type Props = { content: Content };

function followPointer(event: PointerEvent<HTMLAnchorElement>) {
  const tile = event.currentTarget;
  const box = tile.getBoundingClientRect();
  tile.style.setProperty('--spot-x', `${event.clientX - box.left}px`);
  tile.style.setProperty('--spot-y', `${event.clientY - box.top}px`);
}

const HOME_PROJECTS = 3;

export function HomePage({ content }: Props) {
  const home = content.home;
  return (
    <div className="home-content">
      <section className="showcase-hero">
        <div className="showcase-copy">
          <h1>
            {home.title.split(' ').map((word, index) => (
              <Fragment key={index}>
                {index > 0 && ' '}
                <span className="showcase-word" style={{ '--i': index } as CSSProperties}>
                  {word}
                </span>
              </Fragment>
            ))}
          </h1>
          <p>{home.lead}</p>
          <div className="showcase-actions">
            <a className="button primary" href={href.cases()}>
              {t('viewCases')}
            </a>
            <ContactLink className="button secondary" />
          </div>
        </div>
        <WorkVisual />
      </section>
      <div className="home-details">
        <section className="section home-services">
          <SectionHead title={t('solutions')} />
          <ul className="service-tiles" aria-label={t('solutions')}>
            {content.solutions.map((item) => (
              <li key={item.slug}>
                <a
                  className="service-tile"
                  href={href.solution(item.slug)}
                  onPointerMove={followPointer}
                >
                  <h3>{item.text.title}</h3>
                  <p>{item.text.summary}</p>
                  <span className="service-tile-foot">
                    <span className="service-tile-stack">
                      {item.stack.map((name) => (
                        <span key={name}>{name}</span>
                      ))}
                    </span>
                    <span className="service-tile-end">
                      {fromWeeks(item.weeks)}
                      <Icon name="arrow" size={20} />
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
        {content.cases.length > 0 && (
          <section className="section home-projects">
            <SectionHead title={t('cases')} link={{ href: href.cases(), label: t('allCases') }} />
            <ul className="project-cards" aria-label={t('cases')}>
              {content.cases.slice(0, HOME_PROJECTS).map((item) => (
                <li key={item.slug}>
                  <a className="project-card" href={href.case(item.slug)}>
                    <ProjectShot cover={item.cover} />
                    <span className="project-card-text">
                      <span className="project-card-kind">{industryName(item.industry)}</span>
                      <h3>{item.text.title}</h3>
                      <span className="project-card-summary">{item.text.summary}</span>
                      <span className="project-card-team">
                        {membersOf(content, item.team)
                          .map((member) => member.text.name)
                          .join(', ')}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="section home-delivery">
          <SectionHead title={t('howWeWork')} />
          <StepList
            label={t('howWeWork')}
            entries={home.stages.map((stage, index) => ({
              key: String(index),
              title: stage.title,
              when: stage.when,
              lead: stage.note,
              text: stage.artifact,
            }))}
          />
        </section>
        <ContactPage content={content} embedded />
      </div>
    </div>
  );
}
