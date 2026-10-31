import { t } from '../../domain/copy';
import { href } from '../../domain/route';

export function MissingPage() {
  return (
    <section className="page-head">
      <h1>{t('missing')}</h1>
      <a className="text-link" href={href.home()}>
        {t('toHome')}
      </a>
    </section>
  );
}
