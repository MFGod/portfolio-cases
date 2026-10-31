import type { Content, Inquiry } from '../../domain/content';

const topicTitle = (draft: Content, slug: string) =>
  draft.solutions.find((item) => item.slug === slug)?.text.title ?? 'Другое';

export function InquiriesView({ draft, inquiries }: { draft: Content; inquiries: Inquiry[] }) {
  if (inquiries.length === 0) {
    return <p className="muted">Заявок пока нет</p>;
  }
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th scope="col">Когда</th>
          <th scope="col">Кто</th>
          <th scope="col">Задача</th>
          <th scope="col">Сообщение</th>
        </tr>
      </thead>
      <tbody>
        {inquiries.map((inquiry) => (
          <tr key={inquiry.id}>
            <td className="mono">{new Date(inquiry.at).toLocaleString('ru-RU')}</td>
            <td>
              {inquiry.name}
              <br />
              <span className="muted">
                {[inquiry.company, inquiry.email].filter(Boolean).join(', ')}
              </span>
            </td>
            <td>{topicTitle(draft, inquiry.topic)}</td>
            <td>{inquiry.message}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
