import clinic from '../assets/clinic.webp';
import product from '../assets/plates/work-visual-1721.webp';
import documents from '../assets/documents.webp';
import support from '../assets/support.webp';
import finance from '../assets/screens/finance.webp';
import freight from '../assets/screens/freight.webp';
import returns from '../assets/screens/returns.webp';
import school from '../assets/screens/school.webp';
import team from '../assets/team.webp';
import triage from '../assets/triage.webp';
import { MediaKey } from './content';
import { activeLocale, type Localized } from './locale';

export type MediaFit = 'screen' | 'plate' | 'photo';

export const media: Record<MediaKey, { src: string; title: Localized<string>; fit: MediaFit }> = {
  [MediaKey.Support]: {
    src: support,
    title: { ru: 'Оператор поддержки', en: 'Support agent' },
    fit: 'photo',
  },
  [MediaKey.Documents]: {
    src: documents,
    title: { ru: 'Работа с договором', en: 'Working on a contract' },
    fit: 'photo',
  },
  [MediaKey.Triage]: {
    src: triage,
    title: { ru: 'Диспетчер заявок', en: 'Request dispatcher' },
    fit: 'photo',
  },
  [MediaKey.Clinic]: {
    src: clinic,
    title: { ru: 'Регистратура клиники', en: 'Clinic front desk' },
    fit: 'photo',
  },
  [MediaKey.Product]: {
    src: product,
    title: { ru: 'Личный кабинет и приложение', en: 'Client account and app' },
    fit: 'plate',
  },
  [MediaKey.Team]: {
    src: team,
    title: { ru: 'Команда за разбором', en: 'Team in a review' },
    fit: 'photo',
  },
  [MediaKey.Returns]: {
    src: returns,
    title: { ru: 'Заявки на возврат', en: 'Return requests' },
    fit: 'screen',
  },
  [MediaKey.Freight]: {
    src: freight,
    title: { ru: 'Кабинет логистики', en: 'Logistics account' },
    fit: 'screen',
  },
  [MediaKey.Finance]: {
    src: finance,
    title: { ru: 'Сайт финансовой компании', en: 'Financial company website' },
    fit: 'screen',
  },
  [MediaKey.School]: {
    src: school,
    title: { ru: 'Кабинет ученика', en: 'Student account' },
    fit: 'screen',
  },
};

export const mediaTitle = (key: MediaKey) => media[key].title[activeLocale()];
