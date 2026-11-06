import { useEffect, useState } from 'react';
import type { createCase } from '@cases/demo-kit';
import { useDraw } from './draw';
import { remainingCount } from './domain/history';
import { DrawJournal } from './features/journal/DrawJournal';
import { DrawResult } from './features/result/DrawResult';
import { categories, CategoryKey, isCategory } from './tickets';
import sodaImage from './assets/soda.webp';
import snacksImage from './assets/snacks.webp';
import drinksImage from './assets/drinks.webp';

const categoryImages = {
  [CategoryKey.Soda]: sodaImage,
  [CategoryKey.Snacks]: snacksImage,
  [CategoryKey.Drinks]: drinksImage,
};

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
    <>
      <header className="app-header">
        <h1>Розыгрыш призов</h1>
      </header>

      <main className="page">
        <section className="draw-column" aria-label="Розыгрыш">
          <nav className="tabs" aria-label="Категории">
            {tabs.map((tab) => (
              <a
                key={tab.key}
                href={`#/${tab.key}`}
                className="tab"
                aria-current={category === tab.key ? 'page' : undefined}
              >
                <span className="tab-copy">
                  <span className="tab-title">{tab.title}</span>
                  {countsKnown && <span className="tab-count">{tab.remaining}</span>}
                </span>
                <span
                  className={`category-art${tab.key === CategoryKey.All ? ' category-art-all' : ''}`}
                  aria-hidden="true"
                >
                  {Object.entries(categoryImages)
                    .filter(([key]) => tab.key === CategoryKey.All || tab.key === key)
                    .map(([key, src]) => (
                      <img
                        key={key}
                        src={src}
                        alt=""
                        className={`category-image category-image-${key}`}
                        decoding="async"
                      />
                    ))}
                </span>
              </a>
            ))}
          </nav>

          <DrawResult draw={draw} />
        </section>
        <DrawJournal draw={draw} />
      </main>
    </>
  );
};
