import type { DrawController } from '../../draw';
import { categories } from '../../tickets';
import { clockTime, ticketNumber } from '../../ui/format';

export const DrawJournal = ({ draw }: { draw: DrawController }) => {
  const { journalHistory: history, pending, loading, operation, failure } = draw;

  return (
    <section className="journal" aria-labelledby="journal-title">
      <div className="journal-head">
        <h2 id="journal-title" className="subtitle">
          История
        </h2>
        <button
          type="button"
          className="secondary export-button"
          aria-label={operation === 'export' ? 'Готовим CSV' : 'Скачать CSV'}
          disabled={pending || history.length === 0}
          onClick={draw.downloadCsv}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M12 3v12m-4-4 4 4 4-4M5 17v4h14v-4" />
          </svg>
          CSV
        </button>
      </div>

      {loading ? (
        <div className="journal-skeleton" role="status" aria-label="Загружаем историю">
          {[1, 2].map((item) => (
            <span key={item} className="skeleton" />
          ))}
        </div>
      ) : history.length === 0 && failure !== 'corrupt' ? (
        <p className="muted">Розыгрышей ещё не было</p>
      ) : (
        history.length > 0 && (
          <table className="journal-table" role="table" aria-labelledby="journal-title">
            <thead role="rowgroup">
              <tr role="row">
                <th scope="col" role="columnheader">
                  Билет
                </th>
                <th scope="col" role="columnheader">
                  Участник
                </th>
                <th scope="col" role="columnheader">
                  Категория
                </th>
                <th scope="col" role="columnheader">
                  Время
                </th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {history.map((pick, index) => (
                <tr
                  key={pick.number}
                  className={`record${index === 0 ? ' is-latest' : ''}`}
                  role="row"
                >
                  <td role="cell" className="record-number">
                    {ticketNumber(pick.number)}
                  </td>
                  <td role="cell" className="record-name">
                    {pick.name}
                  </td>
                  <td role="cell" className="record-category muted">
                    {categories[pick.category].title}
                  </td>
                  <td role="cell" className="record-time">
                    <time dateTime={pick.at}>{clockTime(pick.at)}</time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </section>
  );
};
