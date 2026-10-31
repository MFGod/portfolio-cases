---
name: Практика
description: Компактная бело-синяя система профессиональной библиотеки и рабочих форм
colors:
  paper: '#fdfdff'
  surface: '#ffffff'
  ink: '#1e2640'
  muted: '#58617c'
  ink-soft: '#414d6b'
  accent: '#223dcc'
  accent-hover: '#182da3'
  accent-ink: '#ffffff'
  accent-soft: '#e8edff'
  line: '#d9deed'
  control: '#8993af'
  danger: '#a12b3c'
  danger-soft: '#fff0f1'
  selection: '#d4dcff'
  avatar-sage: '#dce9e3'
  avatar-sage-ink: '#34574b'
  avatar-clay: '#efded3'
  avatar-clay-ink: '#75462e'
  avatar-blue: '#e0e6ff'
  avatar-blue-ink: '#223dcc'
typography:
  headline:
    fontFamily: 'Golos Text, system-ui, sans-serif'
    fontSize: '26px'
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: '-0.025em'
  headline-reading-wide:
    fontFamily: 'Golos Text, system-ui, sans-serif'
    fontSize: '32px'
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: '-0.025em'
  title:
    fontFamily: 'Golos Text, system-ui, sans-serif'
    fontSize: '22px'
    fontWeight: 500
    lineHeight: 1.3
  title-reading:
    fontFamily: 'Golos Text, system-ui, sans-serif'
    fontSize: '20px'
    fontWeight: 500
    lineHeight: 1.3
  title-list:
    fontFamily: 'Golos Text, system-ui, sans-serif'
    fontSize: '17px'
    fontWeight: 400
    lineHeight: 1.3
  body:
    fontFamily: 'Golos Text, system-ui, sans-serif'
    fontSize: '15px'
    fontWeight: 400
    lineHeight: 1.5
  reading:
    fontFamily: 'Golos Text, system-ui, sans-serif'
    fontSize: '15px'
    fontWeight: 400
    lineHeight: 1.65
  lead:
    fontFamily: 'Golos Text, system-ui, sans-serif'
    fontSize: '17px'
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: 'Golos Text, system-ui, sans-serif'
    fontSize: '13px'
    fontWeight: 400
    lineHeight: 1.5
  wordmark:
    fontFamily: 'Golos Text, system-ui, sans-serif'
    fontSize: '22px'
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: '-0.025em'
rounded:
  sm: '4px'
spacing:
  space-1: '4px'
  space-2: '8px'
  space-3: '12px'
  space-4: '16px'
  space-5: '24px'
  space-6: '32px'
  space-7: '48px'
components:
  button-primary:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.accent-ink}'
    rounded: '{rounded.sm}'
    padding: '8px 16px'
  button-primary-hover:
    backgroundColor: '{colors.accent-hover}'
    textColor: '{colors.accent-ink}'
  button-secondary:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.sm}'
    padding: '8px 16px'
  button-secondary-hover:
    backgroundColor: '{colors.accent-soft}'
  button-text:
    textColor: '{colors.accent}'
  button-icon:
    textColor: '{colors.muted}'
    rounded: '{rounded.sm}'
    size: '44px'
  input:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.sm}'
    padding: '8px 12px'
  search:
    textColor: '{colors.muted}'
    rounded: '{rounded.sm}'
    padding: '0 12px'
  navigation:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.muted}'
  material-row:
    textColor: '{colors.ink}'
    padding: '12px 0'
---

# Design System: Практика

## Overview

Опорный образ: «Открытый профессиональный индекс». Белый текстовый знак «практика» расположен на синей полосе; ниже расположена верхняя навигация. Светлое поле, короткие подписи и открытые строки дают библиотеке компактный ритм.

Система объединяет список, чтение, профиль и учебный расчёт. Поля и действия сохраняют обычные формы веб-интерфейса. Бренд задают цвет, кириллическая типографика и точные отступы.

- Открытые строки с тонкими разделителями.
- Один основной синий акцент для действий, навигации и графика.
- Golos Text с табличными цифрами.
- Верхняя навигация и область действия от 44 px.

## Colors

Белое поле сочетается с насыщенным синим и тёмными чернилами с холодным оттенком. Значения и имена палитры заданы во frontmatter и соответствуют custom properties в `src/styles.css`.

### Primary

accent окрашивает шапку, основные действия, активные ссылки и график. accent-hover показывает наведение и нажатие. accent-soft служит фоном строки или вторичного действия при наведении. accent-ink используется для белых надписей на синем. selection выделяет текст.

### Neutral

paper задаёт фон приложения, surface используется внутри полей. ink окрашивает основной текст, ink-soft вводный абзац и подписи форм, muted метаданные и неактивную навигацию. line отделяет строки и разделы, control очерчивает поля и вторичные кнопки.

### Semantic

danger и danger-soft обозначают ошибки, устаревший результат и восстановление данных. Пары avatar-sage, avatar-clay и avatar-blue ограничены цветом аватара и его инициалов.

### Named Rules

Общий синий. Шапка, активный раздел, основное действие и линия графика используют accent; hover использует accent-hover.

## Typography

Golos Text используется во всех ролях с резервным стеком system-ui, sans-serif. Числа табличные. Основные начертания regular, medium и strong соответствуют 400, 500 и 600. Отдельного декоративного display-шрифта нет.

Иерархия во frontmatter отражает заголовок страницы, заголовок материала на широком экране, заголовки разделов интерфейса и чтения, название строки, основной текст, чтение, вводный абзац, подписи и текстовый знак. На телефоне заголовок материала использует headline. От 600 px он переходит к headline-reading-wide, а названия строк списка к размеру title, сохраняя вес 400. Чтение имеет интерлиньяж 1.65; заголовки остаются плотными. Заголовок раздела статьи использует title-reading.

## Layout

Минимальная ширина приложения 320 px. Контейнер шапки и основного содержимого ограничен 860 px и центрирован. Боковой отступ на телефоне равен space-4, от 600 px равен space-6. Нижний отступ содержимого space-7; верхний растёт с space-4 до space-6. Сетка использует общую шкалу space-1…space-7.

Текст материала ограничен меньшим из 680 px и 70ch; форма профиля ограничена 680 px. Между блоками чтения используется space-4. Расчёт получает такое же ограничение от 600 px; график ограничен 440 px. Поля расчёта идут одной колонкой, от 600 px двумя. Фильтры библиотеки занимают две равные колонки на всех размерах. В строке списка основная колонка гибкая, правая имеет ширину 44 px. Вертикальный отступ строки растёт с space-3 до space-5.

Верхняя навигация на телефоне делит ширину поровну между тремя ссылками. От 600 px ссылки выравниваются влево и получают боковые отступы space-5. Порядок чтения сохраняется.

## Elevation & Depth

Тени отсутствуют. Разделители толщиной 1 px, свободное поле и мягкая заливка при наведении разделяют уровни. Уведомление появляется поверх страницы у нижнего края, имеет фон ink и текст paper. Скелетон загрузки использует движущийся градиент paper/accent-soft. Переходы фона и прозрачности занимают 160 ms с cubic-bezier(0.16, 1, 0.3, 1); цикл скелетона 1.4 s. При reduced motion анимации и переходы отключаются.

### Named Rules

Открытая строка. Материал отделён линиями. Справа закреплены время чтения и закладка, категория остаётся под названием.

## Shapes

У полей, кнопок и уведомления малое скругление sm. Список и результат расчёта остаются открытыми, с прямыми разделителями. Круг используется для аватара и образцов его цвета: аватар 56 px, цветовой образец 28 px внутри кнопки 44 px. Выбор цвета показан обводкой ink. Иконки нарисованы SVG.

## Components

### Buttons

Основная кнопка заполнена accent, вторичная имеет фон paper и границу control. Обе используют medium, скругление sm, отступы space-2 по вертикали и space-4 по горизонтали, минимальную высоту 44 px. Наведение и нажатие основной затемняют синий, вторичной добавляют accent-soft. Текстовое действие использует accent без рамки. Иконная кнопка занимает квадрат 44 px. Неактивная кнопка получает opacity 0.45.

### Inputs / Fields

Поле светлое, с границей control толщиной 1 px, скруглением sm, отступами space-2/space-3 и минимальной высотой 44 px. Подпись находится сверху. Невалидное поле получает границу danger и текст ошибки. Поиск объединяет SVG и input в одной рамке; фокус обводит весь контейнер. Select сохраняет нативное поведение и имеет CSS-стрелку. В библиотеке его рамка и фон прозрачны.

### Navigation

Три текстовые ссылки располагаются под синей шапкой. Выбранный раздел получает accent, strong и нижнюю линию 2 px. Внутри библиотеки подборки «Все» и «Избранное» имеют отдельную строку с числами и тонкой общей границей; выбранная подборка использует medium и синюю нижнюю линию. Глобальный focus-visible показывает обводку accent толщиной 2 px с отступом 2 px; у белого знака на синем обводка белая.

### Material row

Название переносится в основной колонке, категория расположена ниже. Время чтения и закладка собраны справа. Ссылка распространяется на строку, закладка остаётся отдельным действием. При наведении ссылка окрашивается accent-hover и строка получает accent-soft. Сохранённая закладка окрашена accent и заполнена currentColor.

### Calculation result

Результат начинается с верхнего разделителя и отступа space-5. Строки показателей разделены линиями: подписи слева muted, значения справа medium. График использует синие линию и точки, светлые направляющие и muted для подписей. После изменения исходных значений результат получает текстовое предупреждение danger; PDF доступен для подтверждённого расчёта.

## Do's and Don'ts

### Do:

- сохранять общую шкалу отступов и области действий от 44 px.
- обозначать выбранный раздел цветом, начертанием и подчёркиванием.
- сохранять правую колонку времени и закладки при переносе названия.
- показывать ошибку текстом рядом с полем и сохранять видимый фокус.

### Don't:

- добавлять слоганы, декоративные надзаголовки и растровый логотип вместо согласованного текстового знака.
- превращать библиотеку в декоративную сетку карточек или переносить навигацию в плавающий док.
- добавлять к плоским поверхностям тени и градиентную отделку; градиент используется только в скелетоне загрузки.
