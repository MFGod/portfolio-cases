import { AppLink } from './app-link';

const sections = [
  { path: '/library', label: 'Библиотека' },
  { path: '/calculation', label: 'Расчёт' },
  { path: '/profile', label: 'Профиль' },
];

export function SectionNav({ route }: { route: string }) {
  const section = route === '/favorites' || route.startsWith('/material/') ? '/library' : route;
  return (
    <nav className="section-nav" aria-label="Разделы">
      {sections.map(({ path, label }) => (
        <AppLink key={path} to={path} current={section === path}>
          {label}
        </AppLink>
      ))}
    </nav>
  );
}
