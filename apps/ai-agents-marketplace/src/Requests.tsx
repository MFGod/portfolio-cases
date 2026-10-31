import { useEffect, useState } from 'react';
import type { Inquiry } from './data';
import { InquirySkeleton, Notice } from './components';
import { contentEvent, kit, readInquiries } from './runtime';

type LoadStatus = 'loading' | 'ready' | 'error';

export function RequestList() {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    async function load() {
      setStatus('loading');
      try {
        const data = await kit.demo.request(readInquiries);
        if (active) {
          setRows(data);
          setStatus('ready');
        }
      } catch {
        if (active) setStatus('error');
      }
    }
    void load();
    const refresh = () => void load();
    window.addEventListener('storage', refresh);
    window.addEventListener(contentEvent, refresh);
    return () => {
      active = false;
      window.removeEventListener('storage', refresh);
      window.removeEventListener(contentEvent, refresh);
    };
  }, [attempt]);
  if (status === 'loading' && rows.length === 0) return <InquirySkeleton />;
  if (status === 'error')
    return (
      <Notice error retry={() => setAttempt((n) => n + 1)}>
        Не удалось загрузить заявки.
      </Notice>
    );
  if (rows.length === 0)
    return (
      <div className="empty-state">
        <p>Заявок пока нет</p>
        <a href="#/request/meeting" className="button secondary">
          Заполнить заявку
        </a>
      </div>
    );
  return (
    <ul className="inquiry-list">
      {[...rows].reverse().map((row) => (
        <li key={row.id} className="inquiry">
          <div className="inquiry-head">
            <h2>{row.name}</h2>
            <time dateTime={row.created}>
              {new Date(row.created).toLocaleString('ru-RU', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </time>
          </div>
          <a href={`#/agents/${row.agentId}`}>{row.agent}</a>
          <p>{row.task}</p>
          <span className="inquiry-contact">
            {row.email}
            {row.updates && ', подписан на новости'}
          </span>
        </li>
      ))}
    </ul>
  );
}
