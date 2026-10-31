import { industryName, type Content } from '../../domain/content';
import { t } from '../../domain/copy';
import { casesOfMember, stacksOf } from '../../domain/queries';
import { href } from '../../domain/route';
import { Icon } from '../../ui/icons';
import { MissingPage } from './missing-page';
import { FilterLinks, IndexList, SectionHead } from './parts';

type Props = { content: Content };

export function TeamPage({ content, stack }: Props & { stack?: string }) {
  const shown = stack
    ? content.team.filter((member) => member.stack.includes(stack))
    : content.team;
  const empty = (value?: string) =>
    value ? !content.team.some((member) => member.stack.includes(value)) : false;

  return (
    <>
      <section className="page-head">
        <h1>{t('team')}</h1>
      </section>
      <div className="filters">
        <FilterLinks
          label={t('stack')}
          current={stack}
          link={(value) => href.team(value)}
          options={[
            { label: t('all'), empty: empty() },
            ...stacksOf(content).map((value) => ({ value, label: value, empty: empty(value) })),
          ]}
        />
      </div>
      <IndexList
        label={t('team')}
        entries={shown.map((member) => ({
          key: member.slug,
          href: href.member(member.slug),
          kind: member.text.role,
          title: member.text.name,
          meta: member.stack.join(', '),
          end: String(casesOfMember(content, member.slug).length || ''),
        }))}
      />
    </>
  );
}

export function MemberPage({ content, slug }: Props & { slug: string }) {
  const member = content.team.find((item) => item.slug === slug);
  if (!member) return <MissingPage />;

  const text = member.text;
  const projects = casesOfMember(content, slug);

  return (
    <article>
      <a className="back-link" href={href.team()}>
        <Icon name="back" size={16} />
        {t('allTeam')}
      </a>
      <header className="member-head">
        <div>
          <h1>{text.name}</h1>
          <p className="muted">{text.role}</p>
        </div>
      </header>
      <div className="split">
        <p className="body-text">{text.bio}</p>
        <dl className="meta-list">
          <div>
            <dt>{t('stack')}</dt>
            <dd>
              <ul className="tags">
                {member.stack.map((value) => (
                  <li key={value}>
                    <a href={href.team(value)}>{value}</a>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </div>
      {projects.length > 0 && (
        <section className="section">
          <SectionHead title={t('memberCases')} />
          <IndexList
            label={t('memberCases')}
            entries={projects.map((item) => ({
              key: item.slug,
              href: href.case(item.slug),
              kind: industryName(item.industry),
              title: item.text.title,
              meta: item.text.approach,
            }))}
          />
        </section>
      )}
    </article>
  );
}
