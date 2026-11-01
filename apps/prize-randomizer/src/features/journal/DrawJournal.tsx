import type { DrawController } from '../../draw';
import { categories } from '../../tickets';
import { clockTime, ticketNumber } from '../../ui/format';

export const DrawJournal = ({ draw }: { draw: DrawController }) => {
  const { history, pending, loading, operation, failure } = draw;

  return (
    <section className="journal" aria-labelledby="journal-title">
      <div className="journal-head">
        <h2 id="journal-title" className="subtitle">
          Журнал
        </h2>
        <button
          type="button"
          className="secondary"
          disabled={pending || history.length === 0}
          onClick={draw.downloadCsv}
        >
          {operation === 'export' ? 'Готовим файл…' : 'Скачать CSV'}
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
