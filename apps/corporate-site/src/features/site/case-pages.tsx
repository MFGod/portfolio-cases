import { MediaKey, industryName, type Content, type Industry } from '../../domain/content';
import { t, weeks } from '../../domain/copy';
import { mediaTitle } from '../../domain/media';
import { filterCases, membersOf } from '../../domain/queries';
import { href, type CaseFilter } from '../../domain/route';
import { Icon } from '../../ui/icons';
import { MissingPage } from './missing-page';
import { WorkVisual } from './support-example';
import { ContactPage } from './contact-page';
import { ProjectShot } from './project-shot';
import { FilterLinks, IndexList, People, SectionHead, StepList } from './parts';

type Props = { content: Content };

export function CasesPage({ content, filter }: Props & { filter: CaseFilter }) {
  const shown = filterCases(content.cases, filter);
  const industries = [...new Set(content.cases.map((item) => item.industry))] as Industry[];
  const noIndustry = (industry?: string) =>
    filterCases(content.cases, { ...filter, industry }).length === 0;
  const noSolution = (solution?: string) =>
    filterCases(content.cases, { ...filter, solution }).length === 0;

  return (
    <>
      <section className="page-head">
        <h1>{t('cases')}</h1>
      </section>
      <div className="filters">
        <FilterLinks
          label={t('industry')}
          current={filter.industry}
          link={(industry) => href.cases({ ...filter, industry })}
          options={[
            { label: t('all'), empty: noIndustry() },
            ...industries.map((industry) => ({
              value: industry,
              label: industryName(industry),
              empty: noIndustry(industry),
            })),
          ]}
        />
        <FilterLinks
          label={t('solution')}
          current={filter.solution}
          link={(solution) => href.cases({ ...filter, solution })}
          options={[
            { label: t('all'), empty: noSolution() },
            ...content.solutions.map((item) => ({
              value: item.slug,
              label: item.text.title,
              empty: noSolution(item.slug),
            })),
          ]}
        />
      </div>
      <p className="results-line" role="status">
        {t('found', { n: shown.length })}
      </p>
      {shown.length > 0 ? (
        <IndexList
          label={t('cases')}
          entries={shown.map((item) => ({
            key: item.slug,
            href: href.case(item.slug),
            kind: industryName(item.industry),
            title: item.text.title,
            meta: item.text.approach,
            cover: item.cover,
          }))}
        />
      ) : (
        <div className="empty">
          <p>{t('noCases')}</p>
          <a className="text-link" href={href.cases()}>
            {t('resetFilters')}
          </a>
        </div>
      )}
    </>
  );
}

export function CasePage({ content, slug }: Props & { slug: string }) {
  const study = content.cases.find((item) => item.slug === slug);
  if (!study) return <MissingPage />;

  const text = study.text;
  const solution = content.solutions.find((item) => item.slug === study.solution);
  const team = membersOf(content, study.team);

  return (
    <article>
      <a className="back-link" href={href.cases()}>
        <Icon name="back" size={16} />
        {t('allCases')}
      </a>
      <header className="page-head">
        <h1>{text.title}</h1>
        <p className="lead">{text.summary}</p>
      </header>
      <dl className="facts case-facts">
        <div>
          <dt>{t('industry')}</dt>
          <dd>{industryName(study.industry)}</dd>
        </div>
        <div>
          <dt>{t('year')}</dt>
          <dd>{study.year}</dd>
        </div>
        <div>
          <dt>{t('term')}</dt>
          <dd>{weeks(study.weeks)}</dd>
        </div>
        {solution && (
          <div>
            <dt>{t('solution')}</dt>
            <dd>
              <a className="text-link" href={href.solution(solution.slug)}>
                {solution.text.title}
              </a>
            </dd>
          </div>
        )}
      </dl>

      {study.cover === MediaKey.Product ? (
        <div className="project-showcase">
          <WorkVisual />
        </div>
      ) : (
        <ProjectShot cover={study.cover} alt={mediaTitle(study.cover)} />
      )}

      {text.metrics.length > 0 && (
        <section className="section">
          <SectionHead title={t('results')} />
          <table className="metrics">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">{t('results')}</span>
                </th>
                <th scope="col">{t('before')}</th>
                <th scope="col">{t('after')}</th>
              </tr>
            </thead>
            <tbody>
              {text.metrics.map((metric) => (
                <tr key={metric.label}>
                  <th scope="row">{metric.label}</th>
                  <td>{metric.before}</td>
                  <td>{metric.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="section split">
        <div>
          <h2>{t('task')}</h2>
          <p className="body-text">{text.task}</p>
        </div>
        <div>
          <h2>{t('approach')}</h2>
          <p className="body-text">{text.approach}</p>
        </div>
      </section>

      <section className="section">
        <SectionHead title={t('timeline')} />
        <StepList
          label={t('timeline')}
          entries={text.timeline.map((step, index) => ({
            key: String(index),
            when: step.when,
            title: step.title,
            text: step.text,
          }))}
        />
      </section>

      {team.length > 0 && (
        <section className="section">
          <SectionHead title={t('projectTeam')} />
          <People members={team} label={t('projectTeam')} />
        </section>
      )}

      <ContactPage key={study.slug} content={content} topic={study.solution} embedded />
    </article>
  );
}
