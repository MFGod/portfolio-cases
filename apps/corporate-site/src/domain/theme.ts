import { useEffect, useState } from 'react';

import { kit } from '../runtime';

export const Theme = { System: 'system', Light: 'light', Dark: 'dark' } as const;
export type Theme = (typeof Theme)[keyof typeof Theme];
export type Scheme = Exclude<Theme, 'system'>;

export const themes: readonly Theme[] = [Theme.System, Theme.Light, Theme.Dark];

const THEME_KEY = 'theme';
const darkQuery = '(prefers-color-scheme: dark)';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => kit.store.get<Theme>(THEME_KEY, Theme.System));
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(darkQuery).matches);

  useEffect(() => {
    const query = window.matchMedia(darkQuery);
    const sync = () => setSystemDark(query.matches);
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const choose = (next: Theme) => {
    kit.store.set(THEME_KEY, next);
    setTheme(next);
  };

  const scheme: Scheme = theme === Theme.System ? (systemDark ? Theme.Dark : Theme.Light) : theme;
  return { theme, scheme, choose };
};
