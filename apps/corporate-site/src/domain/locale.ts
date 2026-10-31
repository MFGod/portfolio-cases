export const Locale = { Ru: 'ru', En: 'en' } as const;
export type Locale = (typeof Locale)[keyof typeof Locale];

export const locales: readonly Locale[] = [Locale.Ru, Locale.En];

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export type Localized<T> = Record<Locale, T>;

export const localeNames: Localized<string> = { ru: 'Русский', en: 'English' };

let active: Locale = Locale.Ru;

export const activeLocale = () => active;
export const setActiveLocale = (locale: Locale) => {
  active = locale;
};
