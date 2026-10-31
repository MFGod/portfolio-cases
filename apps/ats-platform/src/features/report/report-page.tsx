import type { CSSProperties } from 'react';
import { downloadReport, funnel, percent, type Workspace } from '../../domain/workspace';
import { ActionError, Empty } from '../../ui/feedback';
import { Icon } from '../../ui/icons';

export function ReportPage({
  workspace,
  filter,
  pending,
  error,
  onFilterChange,
  onDownload,
}: {
  workspace: Workspace;
  filter: string;
  pending: boolean;
  error: string;
  onFilterChange: (filter: string) => void;
  onDownload: (download: () => Promise<void>) => void;
}) {
  const candidates = workspace.candidates.filter(
    (person) => filter === 'all' || person.vacancyId === filter,
  );
  const rows = funnel(candidates);
  const total = rows[0]?.count ?? 0;
  const title = workspace.vacancies.find((item) => item.id === filter)?.title ?? 'Все вакансии';

  const download = () => onDownload(() => downloadReport(title, candidates));

  return (
    <>
      <div className="registry-toolbar report-toolbar">
        <label className="inline-select">
          <span className="sr-only">Вакансия в отчёте</span>
          <select value={filter} onChange={(event) => onFilterChange(event.target.value)}>
            <option value="all">Все вакансии</option>
            {workspace.vacancies.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="button secondary toolbar-action"
          disabled={pending || !candidates.length}
          onClick={download}
        >
          <Icon name="download" size={18} />
          {pending ? 'Готовим CSV…' : 'Скачать CSV'}
        </button>
      </div>
      <ActionError message={error} retry={download} pending={pending || !candidates.length} />
      {candidates.length ? (
        <table className="funnel-table">
          <caption className="sr-only">Воронка найма: {title}</caption>
          <thead>
            <tr>
              <th scope="col">Этап</th>
              <th scope="col" className="numeric reach-column">
                Дошли до этапа
              </th>
              <th scope="col" className="numeric share-column">
                Доля от откликов
              </th>
              <th scope="col" className="numeric current-column">
                Сейчас на этапе
              </th>
              <th scope="col" className="numeric step-column">
                Из предыдущего
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const previous = rows[index - 1]?.count;
              const current = candidates.filter((person) => person.stage === index).length;
              return (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td className="numeric reach-column">
                    <span className="report-cell-label" aria-hidden="true">
                      Дошли до этапа
                    </span>
                    <span className="report-cell-value">{row.count}</span>
                  </td>
                  <td className="numeric share-column">
                    <span className="report-cell-label" aria-hidden="true">
                      Доля от откликов
                    </span>
                    <span className="report-cell-value">{percent(row.count, total)}%</span>
                    <span
                      className="share-bar"
                      aria-hidden="true"
                      style={{ '--share': `${percent(row.count, total)}%` } as CSSProperties}
                    />
                  </td>
                  <td className="numeric current-column">
                    <span className="report-cell-label" aria-hidden="true">
                      Сейчас на этапе
                    </span>
                    <span className="report-cell-value">{current}</span>
                  </td>
                  <td className="numeric step-column">
                    <span className="report-cell-label" aria-hidden="true">
                      Из предыдущего
                    </span>
                    <span className="report-cell-value">
                      {previous === undefined ? '—' : `${percent(row.count, previous)}%`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <Empty title="По этой вакансии нет кандидатов" />
      )}
    </>
  );
}
