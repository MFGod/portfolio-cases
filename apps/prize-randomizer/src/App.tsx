import { useEffect, useState } from 'react';
import type { createCase } from '@cases/demo-kit';
import { useDraw } from './draw';
import { remainingCount } from './domain/history';
import { DrawJournal } from './features/journal/DrawJournal';
import { DrawResult } from './features/result/DrawResult';
import { categories, CategoryKey, isCategory } from './tickets';

const categoryFromHash = (): CategoryKey => {
  const value = location.hash.replace(/^#\/?/, '');
  return isCategory(value) ? value : CategoryKey.All;
};

export const App = ({ kit }: { kit: ReturnType<typeof createCase> }) => {
  const [category, setCategory] = useState<CategoryKey>(categoryFromHash);
  const draw = useDraw(kit, category);
  const tabs = (Object.keys(categories) as CategoryKey[]).map((key) => ({
    key,
    title: categories[key].title,
    remaining: remainingCount(draw.history, key).toLocaleString('ru-RU'),
  }));
  const countsKnown = !draw.loading && draw.failure !== 'corrupt';

  useEffect(() => {
    const syncCategory = () => setCategory(categoryFromHash());
    window.addEventListener('hashchange', syncCategory);
    return () => window.removeEventListener('hashchange', syncCategory);
  }, []);

  return (
    <main className="page">
      <h1 className="visually-hidden">Розыгрыш призов</h1>

      <nav className="tabs" aria-label="Категории">
        {tabs.map((tab) => (
          <a
            key={tab.key}
            href={`#/${tab.key}`}
            className="tab"
            aria-current={category === tab.key ? 'page' : undefined}
          >
            {tab.title}
            {countsKnown && <span className="tab-count">{tab.remaining}</span>}
          </a>
        ))}
      </nav>

      <DrawResult draw={draw} />
      <DrawJournal draw={draw} />
    </main>
  );
};
