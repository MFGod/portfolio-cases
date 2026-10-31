import type { Role } from '../domain/workspace';

export type RouteId = 'vacancies' | 'pipeline' | 'report';
const navItems: { id: RouteId; label: string }[] = [
  { id: 'vacancies', label: 'Вакансии' },
  { id: 'pipeline', label: 'Кандидаты' },
  { id: 'report', label: 'Отчёт' },
];
const people: Record<Role, string> = { recruiter: 'Анна Котова', manager: 'Марк Соколов' };

export function Sidebar({
  route,
  role,
  pending,
  onRoleChange,
}: {
  route: RouteId;
  role: Role;
  pending: boolean;
  onRoleChange: (role: Role) => void;
}) {
  return (
    <header className="app-header">
      <a className="brand" href="#/vacancies">
        лист найма
      </a>
      <p className="company">Техноком</p>
      <nav aria-label="Разделы">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#/${item.id}`}
            className="nav-item"
            aria-current={route === item.id ? 'page' : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <label className="account">
        <span className="account-name">{people[role]}</span>
        <select
          aria-label="Роль"
          value={role}
          disabled={pending}
          onChange={(event) => onRoleChange(event.target.value as Role)}
        >
          <option value="recruiter">Рекрутер</option>
          <option value="manager">Руководитель</option>
        </select>
      </label>
    </header>
  );
}
