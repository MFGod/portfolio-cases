# portfolio-cases

Интерактивные демо кейсов из портфолио. Каждое демо написано заново: данные, бренды и люди вымышлены, кода заказчиков здесь нет.

```bash
npm ci
npm run check
npm run serve
```

Кейс открывается по адресу `/<slug>/`, сценарий задаётся через `#/путь`. Параметр `embed=1` прячет панель «Демо», `reset=1` сбрасывает данные кейса.

## GitHub Pages

Workflow `.github/workflows/pages.yml` собирает `dist` и публикует его на GitHub Pages после отправки в `main`. В настройках репозитория нужно выбрать **Settings → Pages → GitHub Actions**.

Для project site workflow автоматически задаёт `CASES_BASE=/<имя-репозитория>`. Для локальной проверки такой сборки:

```bash
CASES_BASE=/portfolio-cases npm run build
CASES_BASE=/portfolio-cases npm run serve
```

После публикации адрес `https://<аккаунт>.github.io/<репозиторий>` без завершающего `/` задаётся в `NEXT_PUBLIC_CASES_ORIGIN` основного портфолио.
