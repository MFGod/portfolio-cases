import { Icon } from '../Art';
import type { Notice } from '../model';

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

type Props = {
  notices: Notice[];
  unread: number;
  busy: boolean;
  error: string;
  onReadAll: () => void;
};

export function NoticesHead({ unread, busy, onReadAll }: Omit<Props, 'notices' | 'error'>) {
  return (
    <div className="page-heading">
      <h1>Уведомления</h1>
      {unread > 0 && (
        <button className="text-button" disabled={busy} onClick={onReadAll}>
          {busy ? 'Сохраняем…' : 'Прочитать все'}
        </button>
      )}
    </div>
  );
}

export function NoticesList({ notices, error, busy, onReadAll }: Omit<Props, 'unread'>) {
  return (
    <>
      {notices.length ? (
        <ul className="notices-list">
          {notices.map((notice) => (
            <li key={notice.id} className={`notice ${notice.read ? '' : 'unread'}`}>
              <span className={`notice-icon ${notice.kind}`}>
                <Icon name={notice.kind === 'booking' ? 'gift' : 'heart'} size={20} />
              </span>
              <div>
                <p>{notice.text}</p>
                <time dateTime={notice.date}>{dateFormat.format(new Date(notice.date))}</time>
              </div>
              {!notice.read && <span className="unread-dot" role="img" aria-label="Не прочитано" />}
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <h2>Уведомлений нет</h2>
        </div>
      )}
      {error && (
        <p role="alert" className="error-message">
          {error}
          <button className="text-button" disabled={busy} onClick={onReadAll}>
            Повторить
          </button>
        </p>
      )}
    </>
  );
}
