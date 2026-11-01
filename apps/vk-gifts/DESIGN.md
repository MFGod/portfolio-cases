---
name: 'Хочу'
description: 'Теплая предметная галерея личных списков желаний'
colors:
  page: '#fbfaf7'
  surface: '#ffffff'
  ink: '#302d2f'
  muted: '#6b6267'
  placeholder: '#70646b'
  line: '#e7e1dc'
  line-strong: '#c6b5be'
  outline: '#a3939b'
  hover: '#f8f3f5'
  accent: '#b03954'
  accent-dark: '#8f2841'
  accent-ink: '#ffffff'
  danger: '#9b2935'
  danger-dark: '#76222c'
  error-bg: '#faecef'
  error: '#912c40'
  booked: '#355b46'
  booked-bg: '#e9f1ec'
  tag: '#f0ecee'
  tag-ink: '#68565e'
  friend-ink: '#5f615c'
  toast: '#282126'
  toast-ink: '#ffffff'
  skeleton: '#f0eaed'
  scrim: '#28212666'
  shadow: '#28212629'
  focus: '#b03954'
  selection: '#edd4de'
  sage: '#eaf0e8'
  sand: '#eee9df'
  peach: '#f5e9e2'
  sage-ink: '#355b46'
  lilac: '#eeebf3'
  lilac-ink: '#665172'
  rose: '#f4e7eb'
  rose-ink: '#7d2946'
typography:
  display:
    fontFamily: 'Comfortaa, Montserrat, sans-serif'
    fontSize: '32px'
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: '-0.025em'
  headline:
    fontFamily: 'Comfortaa, Montserrat, sans-serif'
    fontSize: '22px'
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: '-0.025em'
  title:
    fontFamily: 'Comfortaa, Montserrat, sans-serif'
    fontSize: '18px'
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: 'Montserrat, system-ui, sans-serif'
    fontSize: '14px'
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: 'Montserrat, system-ui, sans-serif'
    fontSize: '14px'
    fontWeight: 500
    lineHeight: 1.25
  helper:
    fontFamily: 'Montserrat, system-ui, sans-serif'
    fontSize: '13px'
    fontWeight: 400
    lineHeight: 1.5
  price:
    fontFamily: 'Montserrat, system-ui, sans-serif'
    fontSize: '22px'
    fontWeight: 400
    lineHeight: 1.5
  wordmark:
    fontFamily: 'Comfortaa, Montserrat, sans-serif'
    fontSize: '24px'
    fontWeight: 700
    letterSpacing: '-0.025em'
rounded:
  sm: '6px'
  control: '8px'
  dialog: '16px'
  pill: '999px'
spacing:
  space-1: '4px'
  space-2: '8px'
  space-3: '12px'
  space-4: '16px'
  space-5: '20px'
  space-6: '24px'
  space-8: '32px'
  space-10: '40px'
components:
  button-primary:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.accent-ink}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: '8px 16px'
    height: '44px'
  button-primary-hover:
    backgroundColor: '{colors.accent-dark}'
  button-secondary:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: '8px 16px'
    height: '44px'
  button-quiet:
    textColor: '{colors.muted}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: '8px 16px'
    height: '44px'
  button-danger:
    backgroundColor: '{colors.danger}'
    textColor: '{colors.accent-ink}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: '8px 16px'
    height: '44px'
  input:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: '11px 12px'
    height: '48px'
  booking-tag:
    backgroundColor: '{colors.tag}'
    textColor: '{colors.tag-ink}'
    rounded: '{rounded.sm}'
    padding: '4px 8px'
  booking-tag-mine:
    backgroundColor: '{colors.booked-bg}'
    textColor: '{colors.booked}'
---

# Design System: Хочу

## Overview

Creative North Star: "Теплая предметная галерея"

Теплая светлая поверхность и компактная шапка со знаком подарка объединяют интерфейс «Хочу». Крупные предметные фотографии лежат на мягких пастельных полях со скруглением; названия, цены и текст брони остаются открытыми под изображением.

Comfortaa задает характер заголовков и текстового знака. Montserrat используется в подписях, полях, навигации и действиях. Обычный вес цен сохраняет ровный ритм галереи. На телефоне три раздела доступны в нижней панели; широкий экран использует навигацию в шапке.

Key Characteristics:

- Светлая шапка со знаком подарка и малиновые действия.
- Мягкие пастельные поля фотографий и открытые подписи.
- Comfortaa в заголовках, Montserrat в рабочем интерфейсе.
- Нижняя навигация телефона с резервом под безопасную область.

## Colors

### Primary

Малиновый accent обозначает знак подарка, основные кнопки, активную навигацию и фокус. Accent-dark используется при наведении и нажатии основной кнопки; белый accent-ink обеспечивает текст на акцентном фоне.

### Secondary

Booked и booked-bg обозначают собственную бронь. Sand, peach, sage, lilac и rose задают мягкие поля фотографий в сетке. Sage, lilac и rose вместе с соответствующим ink также используются для аватаров друзей. Danger с темным состоянием и пара error-bg/error выделяют удаление и ошибки.

### Neutral

Page задает теплый почти белый фон страницы, шапки и нижней панели. Surface сохраняет белый фон полей и диалога. Ink принадлежит основному тексту, muted пояснениям, placeholder подсказкам полей. Line разделяет строки, outline обводит элементы ввода. Tag и tag-ink показывают чужую бронь. Toast инвертирует текст сообщения. Scrim и shadow используются у временных слоев; skeleton принадлежит загрузке, selection выделению текста.

Правило «Поле фотографии». Пастельная подложка и скругление принадлежат полю фотографии; подпись, цена и бронь остаются на общей поверхности без рамки и тени.

## Typography

Локальные Comfortaa и Montserrat. Заголовки h1, h2, h3 и знак используют Comfortaa с резервом Montserrat, sans-serif и весом 700. Рабочий текст использует Montserrat с резервом system-ui, sans-serif: 400 для текста и цен, 500 для действий и подписей полей, 600 для активной навигации и выделенных строк. Числа используют tabular-nums; синтез начертаний отключен.

- Display: заголовок страницы на широком экране, роль display.
- Wordmark: текстовый знак, роль wordmark; от 700px размер calc(var(--text-brand) + var(--space-1)).
- Headline: обычный заголовок h1 на телефоне, роль headline. Заголовок списка использует calc(var(--text-xl) - 1px).
- Title: заголовки секций h2, роль title.
- Body: подписи предметов и основной текст, роль body. От 700px название предмета использует text-lg и две строки по leading.
- Label: действия и подписи полей, роль label. Поля ввода используют text-md и вес 400.
- Helper: счетчики, вспомогательные подписи и метки брони, роль helper.
- Price: цена в диалоге и в широкой сетке, роль price. В телефонной сетке используется text-md, от 700px text-lg, от 1100px text-xl.

Базовая навигация использует text-xs, от 700px text-sm. Подпись получателя и пояснение приватности используют text-sm. Короткие служебные строки могут наследовать обычный браузерный интерлиньяж; leading применяется явно в текстовых блоках.

Правило «Обычный вес цены». Цена во всех размерах сохраняет вес 400.

## Layout

Контент ограничен content-width (1360px), формы form-width (600px), диалог dialog-width (640px). Минимальная ширина страницы 320px. Внешний отступ начинается с space-4, от 375px становится space-5, от 700px space-8, от 1100px space-10.

Сетка содержит две колонки на телефоне с разрывами space-6 по вертикали и space-3 по горизонтали. От 700px используются три колонки с разрывами space-8 и space-6; от 1100px четыре колонки. Предметное поле квадратное до 1100px, затем имеет высоту calc(var(--space-10) * 8). Подпись располагается под изображением, цена следующей строкой. Категории и сортировка представлены двумя отдельными селекторами. Категория занимает свободную ширину и показывает текущее значение, сортировка обозначена иконкой в квадратной кнопке target с доступной подписью. Каждый открывает собственное оформленное меню. Пояснение приватности находится в диалоге бронирования рядом с действием, а не в шапке списка.

Телефонная шапка высотой header-height (60px) содержит знак подарка и слово «хочу». Нижняя навигация закреплена у края экрана: mobile-nav-height (68px) плюс safe-bottom. Нижний отступ контента равен calc(var(--mobile-nav-height) + var(--safe-bottom) + var(--space-8)); toast располагается над панелью с дополнительным отступом space-4. От 700px высота шапки становится 72px, навигация входит в ее ряд, mobile-nav-height становится 0px. Диалог занимает экран телефона; от 700px становится центрированным окном с внутренним отступом space-6. Двухколоночная часть формы включается от 375px.

## Elevation & Depth

Тени принадлежат всплывающему сообщению и настольному диалогу; постоянная сетка остается плоской.

Тень сообщения: 0 var(--space-3) var(--space-8) var(--color-shadow). Тень настольного диалога: 0 var(--space-5) var(--space-10) var(--color-shadow). Подложка модального слоя использует scrim. Разделители списков и контуры полей имеют толщину 1px.

## Shapes

Кнопки и поля используют control, метки брони sm, настольный диалог dialog. Аватары, счетчик и точка уведомления используют pill. Телефонный диалог заполняет экран без скругления. Поле фотографии в сетке имеет радиус dialog (16px) и скрывает выступающие края; фотографии сохраняют пропорции через contain. Рамка и тень у этого поля отсутствуют. Подпись располагается снаружи пастельного поля. Фильтры списка имеют радиус pill.

## Components

### Buttons

Основная кнопка малиновая, вторичная белая с контуром outline, quiet использует muted, опасная danger. Общая высота не менее target, горизонтальный отступ space-4, вертикальный space-2. Наведение затемняет primary и danger; secondary, quiet и кнопка-иконка получают hover. Нажатие primary повторяет темный фон. Недоступное действие имеет opacity 0.55.

### Inputs / Fields

Поля имеют контур outline, белый фон, радиус control и высоту от 48px. Подпись остается над полем. Невалидное поле использует danger для контура. Select открывает оформленный список на surface с подсветкой hover и малиновой отметкой выбранного пункта; клавиатура, Escape и возврат фокуса работают как у системного списка. Фокус имеет контур 2px и внешний отступ 3px; в темном сообщении он белый. В светлой шапке сохраняется accent.

### Navigation

Три ссылки с SVG-иконками и подписями остаются видимыми. На телефоне иконка располагается над текстом, активная ссылка использует accent и вес 600. От 700px иконка и текст выстраиваются в ряд, активная ссылка получает нижний контур accent толщиной 2px. Наведение подчеркивает текст; минимальная высота ссылки target. Счетчик уведомлений расположен у иконки, имеет фон accent и белый текст. Переключатель формы использует нижний контур accent на светлом фоне.

### Cards / Containers

Карточка подарка является кнопкой с пастельным полем предметного изображения и открытой подписью. Подложки sand, peach, sage, lilac и rose назначаются только полю фотографии. Наведение подчеркивает название. Pending сохраняет непрозрачность фотографии и меняет курсор на progress. Текст брони расположен под ценой; собственная бронь получает booked-bg и booked. Карточки друзей и строки уведомлений разделены тонкими линиями.

### Dialog and feedback

Диалог показывает крупный предмет, цену обычного веса, примечание и действия. Ошибка появляется в error-bg; повтор остается у соответствующего действия. Toast появляется снизу с перемещением на space-2 и изменением прозрачности за duration. Skeleton пульсирует с loading-duration. Режим prefers-reduced-motion отключает анимации, переходы и плавную прокрутку.

## Do's and Don'ts

### Do:

- Do сохранять предмет целиком через object-fit: contain.
- Do использовать существующие CSS-токены, видимый фокус и область действия от 44px.
- Do показывать бронь текстом и выделять собственную бронь зеленым.
- Do сохранять вес цен 400, Comfortaa в заголовках и Montserrat в рабочем тексте.
- Do резервировать высоту нижней навигации и safe area в контенте и позиции toast.

### Don't:

- Don't распространять пастельную подложку фотографии на подпись карточки.
- Don't добавлять декоративные надзаголовки, слоганы и вымышленные показатели.
- Don't заменять фотографии подарков декоративными пиктограммами.
