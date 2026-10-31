import type { Profile } from '../../domain/content';
import type { Material } from '../../domain/content';

export function PrintSheet({ profile, selected }: { profile: Profile; selected: Material[] }) {
  return (
    <section className="print-sheet" aria-label="Профиль для печати">
      <p className="brand">практика</p>
      <h1>{profile.name || 'Имя не указано'}</h1>
      <dl>
        <div>
          <dt>Специальность</dt>
          <dd>{profile.specialty || 'Не указана'}</dd>
        </div>
        <div>
          <dt>Город</dt>
          <dd>{profile.city || 'Не указан'}</dd>
        </div>
      </dl>
      <h2>Цель на месяц</h2>
      <p className="print-goal">{profile.goal || 'Не указана'}</p>
      <h2>Избранное: {selected.length}</h2>
      {selected.length ? (
        <ol>
          {selected.map((item) => (
            <li key={item.id}>
              <h3>{item.title}</h3>
              <p>
                {item.category}, {item.minutes} мин. {item.summary}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p>В избранном пока нет материалов.</p>
      )}
      <footer>Практика, {new Date().toLocaleDateString('ru')}</footer>
    </section>
  );
}
