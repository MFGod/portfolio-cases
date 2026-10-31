import { industryName, type Content } from '../../domain/content';
import { t } from '../../domain/copy';
import { buildersOf, casesOfSolution } from '../../domain/queries';
import { href } from '../../domain/route';
import { Icon } from '../../ui/icons';
import { MissingPage } from './missing-page';
import { ContactPage } from './contact-page';
import { IndexList, People, SectionHead, StepList } from './parts';

type Props = { content: Content };

export function SolutionsPage({ content }: Props) {
  return (
    <>
      <section className="page-head">
        <h1>{t('solutions')}</h1>
      </section>
      <IndexList
        label={t('solutions')}
        entries={content.solutions.map((item) => ({
          key: item.slug,
          href: href.solution(item.slug),
          title: item.text.title,
          meta: item.text.summary,
        }))}
      />
    </>
  );
}

export function SolutionPage({ content, slug }: Props & { slug: string }) {
  const solution = content.solutions.find((item) => item.slug === slug);
  if (!solution) return <MissingPage />;

  const text = solution.text;
  const related = casesOfSolution(content, slug);
  const builders = buildersOf(content, slug);

  return (
    <article>
      <a className="back-link" href={href.solutions()}>
        <Icon name="back" size={16} />
        {t('allSolutions')}
      </a>
      <header className="page-head">
        <h1>{text.title}</h1>
        <p className="lead">{text.summary}</p>
      </header>

      <div className="split">
        <p className="body-text">{text.body}</p>
        <dl className="meta-list">
          <div>
            <dt>{t('stack')}</dt>
            <dd className="mono">{solution.stack.join(', ')}</dd>
          </div>
        </dl>
      </div>

      <section className="section">
        <SectionHead title={t('howItWorks')} />
        <StepList
          label={t('howItWorks')}
          entries={text.steps.map((step, index) => ({
            key: String(index),
            title: step.title,
            text: step.text,
          }))}
        />
      </section>

      {related.length > 0 && (
        <section className="section">
          <SectionHead title={t('relatedCases')} />
          <IndexList
            label={t('relatedCases')}
            entries={related.map((item) => ({
              key: item.slug,
              href: href.case(item.slug),
              kind: industryName(item.industry),
              title: item.text.title,
              meta: item.text.approach,
            }))}
          />
        </section>
      )}

      {builders.length > 0 && (
        <section className="section">
          <SectionHead title={t('builtBy')} />
          <People members={builders} label={t('builtBy')} />
        </section>
      )}

      <ContactPage key={solution.slug} content={content} topic={solution.slug} embedded />
    </article>
  );
}
