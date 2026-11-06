import type { Member } from '../content';
import anna from '../../assets/team/anna.webp';
import ilya from '../../assets/team/ilya.webp';
import olga from '../../assets/team/olga.webp';
import pavel from '../../assets/team/pavel.webp';
import timur from '../../assets/team/timur.webp';
import vera from '../../assets/team/vera.webp';

export const team: Member[] = [
  {
    slug: 'anna-orlova',
    since: 2019,
    stack: ['TypeScript', 'PostgreSQL', 'Kubernetes'],
    photo: anna,
    text: {
      name: 'Анна Орлова',
      role: 'Технический руководитель',
      bio: 'Проектирует архитектуру продукта и согласует технические решения. Организует проверку кода и передачу проекта в сопровождение.',
    },
  },
  {
    slug: 'ilya-shatrov',
    since: 2020,
    stack: ['TypeScript', 'Node.js', 'PostgreSQL'],
    photo: ilya,
    text: {
      name: 'Илья Шатров',
      role: 'Разработчик веб-сервисов',
      bio: 'Разрабатывает серверную логику, работу с данными и права доступа. Проверяет основные сценарии и обработку ошибок.',
    },
  },
  {
    slug: 'vera-kim',
    since: 2021,
    stack: ['TypeScript', 'React', 'Playwright'],
    photo: vera,
    text: {
      name: 'Вера Ким',
      role: 'Фронтенд-разработчик',
      bio: 'Разрабатывает интерфейсы сайтов и веб-сервисов. Работает с адаптивной вёрсткой, доступностью и тестами пользовательских сценариев.',
    },
  },
  {
    slug: 'timur-gaziev',
    since: 2020,
    stack: ['Go', 'Kafka', 'PostgreSQL'],
    photo: timur,
    text: {
      name: 'Тимур Газиев',
      role: 'Инженер интеграций',
      bio: 'Соединяет продукты с CRM, платёжными сервисами и внутренними системами. Проектирует обмен данными и восстановление после ошибок.',
    },
  },
  {
    slug: 'olga-reshetova',
    since: 2022,
    stack: ['SQL', 'OpenAPI', 'BPMN'],
    photo: olga,
    text: {
      name: 'Ольга Решетова',
      role: 'Системный аналитик',
      bio: 'Описывает процессы, роли пользователей и требования к продукту. Согласует сценарии интеграций и условия приёмки.',
    },
  },
  {
    slug: 'pavel-dronov',
    since: 2021,
    stack: ['TypeScript', 'React Native', 'API'],
    photo: pavel,
    text: {
      name: 'Павел Дронов',
      role: 'Разработчик мобильных приложений',
      bio: 'Разрабатывает мобильные интерфейсы, уведомления и работу с API. Проверяет состояния приложения и сценарии на устройствах.',
    },
  },
];
