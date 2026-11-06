import { useState } from 'react';
import { Icon, type IconName } from './icons';

const ICONS: Partial<Record<string, IconName>> = {
  'Этап изменён': 'arrow',
  'Вакансия создана': 'briefcase',
  'Вакансия сохранена': 'briefcase',
  'CSV скачан': 'download',
  'Данные восстановлены': 'refresh',
};

export function Toast({ message }: { message: string }) {
  const [shown, setShown] = useState('');
  if (message && message !== shown) setShown(message);
  return (
    <div className={message ? 'toast toast-visible' : 'toast'} role="status" aria-live="polite">
      {shown && (
        <>
          <span>{shown}</span>
          <span className="toast-icon" aria-hidden="true">
            <Icon name={ICONS[shown] ?? 'check'} size={14} />
          </span>
        </>
      )}
    </div>
  );
}
