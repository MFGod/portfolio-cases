const rules = new Intl.PluralRules('ru-RU');
const wishForms: Record<string, string> = {
  one: 'желание',
  few: 'желания',
  many: 'желаний',
  other: 'желания',
};

export const wishCount = (count: number) => `${count} ${wishForms[rules.select(count)]}`;
