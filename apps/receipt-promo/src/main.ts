import '@fontsource/commissioner/cyrillic-400.css';
import '@fontsource/commissioner/latin-400.css';
import '@fontsource/commissioner/cyrillic-500.css';
import '@fontsource/commissioner/latin-500.css';
import '@fontsource/commissioner/cyrillic-700.css';
import '@fontsource/commissioner/latin-700.css';
import './styles.css';
import logo from './assets/logo.webp';
import {
  kit,
  me,
  samples,
  statusNames,
  points,
  money,
  date,
  escape as h,
  loadReceipts,
  loadPhoto,
  submitReceipt,
  moderateReceipt,
  sha256,
  detectReceipt,
  samplePhoto,
  csvContent,
  type Receipt,
  type Sample,
  type Status,
  type Basket,
} from './data';

await kit.boot();
const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('App root is missing');
const app = root;
const iconPaths = {
  receipt: 'M7 3h10v18l-2-1.5-3 1.5-3-1.5L7 21V3Zm3 5h4m-4 4h4m-4 4h3',
  upload: 'M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  check: 'm5 12 4 4L19 6',
  close: 'm6 6 12 12M6 18 18 6',
  clock: 'M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  search: 'm16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  grid: 'M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z',
  download: 'M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4',
  back: 'm14 5-7 7 7 7',
  image: 'M3 3h18v18H3V3Zm0 14 6-6 4 4 3-3 5 5M15 7h.01',
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
};
function icon(name: keyof typeof iconPaths, size = 22): string {
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  for (const [attribute, value] of Object.entries({
    width: String(size),
    height: String(size),
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.7',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
    focusable: 'false',
  }))
    svg.setAttribute(attribute, value);
  const path = document.createElementNS(namespace, 'path');
  path.setAttribute('d', iconPaths[name] ?? iconPaths.receipt);
  svg.append(path);
  return svg.outerHTML;
}
let records: Receipt[] = [];
let loading = true;
let loadError = '';
let routeVersion = 0;
let notice = '';
let pending = false;
let draft: {
  sample: Sample | null;
  recognised?: boolean;
  blob: Blob;
  hash: string;
  url: string;
  name: string;
} | null = null;
let uploadError = '';
let uploadStep = '';
let uploadSuccess: Receipt | null = null;
let filterStatus = 'all';
let historyStatus = 'all';
let search = '';
let sort = 'newest';
let minimum = '';
const route = () =>
  ['#/upload', '#/history', '#/admin'].includes(location.hash) ? location.hash : '#/upload';
const own = () => records.filter((receipt) => receipt.owner === me);
const balance = () => own().reduce((sum, receipt) => sum + points(receipt), 0);
const pointRules = new Intl.PluralRules('ru');
const pointWords: Partial<Record<Intl.LDMLPluralRule, string>> = {
  one: 'балл',
  few: 'балла',
};
const pointsLabel = (count: number) =>
  `${count} ${pointWords[pointRules.select(count)] ?? 'баллов'}`;
const badge = (status: Status) => `<span class="badge ${status}">${statusNames[status]}</span>`;
const errorText = (error: unknown) =>
  error instanceof Error ? error.message : 'Не удалось выполнить действие.';
const ready = () => !loading && !loadError;

function header(admin: boolean): string {
  return `<header class="topbar">
    <a class="brand" href="#/upload" aria-label="Квиток, загрузить чек">
      <img class="brand-symbol" src="${logo}" alt="" />квиток
    </a>
    <a class="role-link" href="${admin ? '#/upload' : '#/admin'}">
      ${icon(admin ? 'back' : 'grid', 16)}${admin ? 'К акции' : 'Модерация'}
    </a>
  </header>`;
}
function navigation(): string {
  const current = (path: string) => (route() === path ? 'aria-current="page"' : '');
  return `<nav class="participant-nav" aria-label="Разделы акции">
    <a href="#/upload" ${current('#/upload')}>${icon('upload', 18)}Загрузить чек</a>
    <a href="#/history" ${current('#/history')}>
      ${icon('receipt', 18)}Мои чеки
      ${ready() ? `<span class="nav-count">${own().length}</span>` : ''}
    </a>
  </nav>`;
}
function loadingState(): string {
  return `<div class="skeleton-stack" aria-busy="true" aria-label="Загрузка">
    <span class="skeleton tall"></span><span class="skeleton"></span><span class="skeleton"></span>
  </div>`;
}
function emptyState(admin: boolean): string {
  const action = admin
    ? '<button class="button secondary" data-action="clear-filters">Сбросить фильтры</button>'
    : '<a class="button primary" href="#/upload">Загрузить чек</a>';
  return `<div class="state-panel">
    <h2>${admin ? 'Чеков не найдено' : 'Чеков пока нет'}</h2>${action}
  </div>`;
}
function render(): void {
  const admin = route() === '#/admin';
  const participantView = route() === '#/history' ? historyView() : uploadView();
  document.body.classList.toggle('admin-page', admin);
  app.innerHTML = `${header(admin)}
    <main id="main" class="${admin ? 'admin-shell' : 'phone-shell'}">
      ${admin ? adminView() : navigation() + participantView}
    </main>
    <div class="toast ${notice ? 'visible' : ''}" role="status" aria-live="polite">
      ${icon('check', 18)}${h(notice)}
    </div>`;
  bindInputs();
}
function dataState(): string {
  if (loading) return loadingState();
  if (loadError)
    return `<div class="state-panel error-state" role="alert">
      <h2>Чеки не загрузились</h2><p>${h(loadError)}</p>
      <button class="button primary" data-action="reload">Повторить</button>
    </div>`;
  return '';
}
function successView(receipt: Receipt): string {
  return `<section class="success-panel" aria-live="polite">
    <span class="success-mark">${icon('check', 28)}</span>
    <h1>Чек ${h(receipt.id)} на проверке</h1>
    <p>Проверка занимает до двух дней.</p>
    <a href="#/history" class="button primary">Мои чеки</a>
    <button class="button secondary" data-action="another">Загрузить ещё</button>
  </section>`;
}
function uploadView(): string {
  if (uploadSuccess) return successView(uploadSuccess);
  const total = ready()
    ? `<a class="tape-total" href="#/history"><span>Итого</span>${pointsLabel(balance())}</a>`
    : '';
  return `<section class="campaign tape">
      <h1>Баллы за чеки</h1>
      <p>До 31 октября</p>
      <dl class="tape-rules">
        <div><dt>Напиток</dt><dd>3</dd></div>
        <div><dt>Снек</dt><dd>2</dd></div>
        <div><dt>Лимонад</dt><dd>1</dd></div>
      </dl>
      ${total}
    </section>
    ${dataState() || uploadForm()}`;
}
function photoPicker(): string {
  if (draft)
    return `<div class="photo-draft">
      <img src="${draft.url}" alt="Выбранное фото чека">
      <div>
        <strong>${h(draft.name)}</strong>
        <button class="text-button" data-action="remove-photo" ${pending ? 'disabled' : ''}>
          Выбрать другое фото
        </button>
      </div>
    </div>`;
  return `<button class="dropzone" data-action="choose-file" ${pending ? 'disabled' : ''}>
    ${icon('upload', 28)}
    <strong>Добавить фото чека</strong>
    <small>Видны дата, товары и QR‑код. JPG, PNG или WebP до 10 МБ</small>
  </button>`;
}
function recognition(): string {
  if (!draft) return '';
  if (!draft.sample)
    return '<p class="fallback-note">QR‑код не прочитан. Выберите чек из списка ниже.</p>';
  const { sample } = draft;
  return `<div class="fiscal-summary">
    ${icon('check', 18)}
    <div>
      <strong>${draft.recognised ? 'Чек распознан' : 'Реквизиты выбраны'}</strong>
      <span>${h(sample.shop)}, ${money(sample.total)}</span>
      <span>${date(sample.purchased)}, ФД ${h(sample.fiscal.split('/')[1] ?? '')}</span>
    </div>
  </div>`;
}
function sampleList(): string {
  const options = samples
    .map(
      (sample) => `<button
        class="sample-button" aria-pressed="${draft?.sample?.id === sample.id}"
        data-sample="${sample.id}" ${pending ? 'disabled' : ''}
      >
        <span>${h(sample.shop)}<small>${money(sample.total)}</small></span>${icon('arrow', 17)}
      </button>`,
    )
    .join('');
  return `<section class="sample-section" aria-labelledby="samples-title">
    <h2 id="samples-title">${draft && !draft.sample ? 'Выберите чек' : 'Примеры чеков'}</h2>
    <div class="sample-buttons">${options}</div>
    <button class="inline-button" data-action="download-sample" ${pending ? 'disabled' : ''}>
      Скачать пример как фото
    </button>
  </section>`;
}
function submitButton(): string {
  return `<button class="button primary full-width" data-action="submit"
    ${pending || !draft?.sample ? 'disabled' : ''}>
    ${pending ? 'Обрабатываем…' : 'Отправить на проверку'}
  </button>`;
}
function uploadForm(): string {
  const error = uploadError ? `<div class="inline-error" role="alert">${h(uploadError)}</div>` : '';
  const progress = pending
    ? `<p class="progress-message" role="status">
        <span class="spinner small"></span>${h(uploadStep)}
      </p>`
    : '';
  return `<div class="upload-form tape" ${pending ? 'aria-busy="true"' : ''}>
    ${photoPicker()}
    <input class="visually-hidden" id="receipt-photo" type="file"
      accept="image/jpeg,image/png,image/webp" aria-label="Фото чека" ${pending ? 'disabled' : ''}>
    ${recognition()}${error}${progress}
    ${draft ? submitButton() : ''}
    ${sampleList()}
  </div>`;
}
function receiptCard(receipt: Receipt): string {
  const earned = points(receipt);
  const comment = receipt.comment
    ? `<span class="receipt-comment">${h(receipt.comment)}</span>`
    : '';
  return `<button class="receipt-card" data-receipt="${h(receipt.id)}">
    <span class="receipt-row"><strong>${h(receipt.shop)}</strong>${badge(receipt.status)}</span>
    <span class="receipt-row receipt-meta">
      <span>${date(receipt.purchased)}, ${h(receipt.id)}, ${money(receipt.total)}</span>
      ${earned ? `<span class="receipt-points">+${pointsLabel(earned)}</span>` : ''}
    </span>
    ${comment}
  </button>`;
}
function historyView(): string {
  const mine = own();
  const filtered = mine.filter(
    (receipt) => historyStatus === 'all' || receipt.status === historyStatus,
  );
  const tabs = [
    ['all', 'Все'],
    ['pending', 'На проверке'],
    ['accepted', 'Приняты'],
    ['rejected', 'Отклонены'],
  ]
    .map(
      ([value, label]) =>
        `<button data-history-status="${value}" aria-pressed="${historyStatus === value}">
          ${label}
        </button>`,
    )
    .join('');
  const list = filtered.length
    ? `<div class="receipt-list">${filtered.map(receiptCard).join('')}</div>`
    : historyStatus === 'all'
      ? emptyState(false)
      : '<div class="state-panel"><h2>Таких чеков нет</h2></div>';
  return `<div class="page-heading">
      <h1>Мои чеки</h1>
      ${ready() ? `<strong class="balance-total">${pointsLabel(balance())}</strong>` : ''}
    </div>
    <div class="history-tools">
      <div class="history-tabs" role="group" aria-label="Статус чеков">${tabs}</div>
      <button class="icon-button" data-action="reload" aria-label="Обновить историю">
        ${icon('refresh', 18)}
      </button>
    </div>
    ${dataState() || list}`;
}
function filteredRecords(): Receipt[] {
  const query = search.trim().toLocaleLowerCase('ru');
  return records
    .filter(
      (receipt) =>
        (filterStatus === 'all' || receipt.status === filterStatus) &&
        (!minimum || receipt.total >= Number(minimum)) &&
        (!query ||
          `${receipt.id} ${receipt.owner} ${receipt.shop} ${receipt.comment}`
            .toLocaleLowerCase('ru')
            .includes(query)),
    )
    .sort((a, b) =>
      sort === 'amount'
        ? b.total - a.total
        : sort === 'points'
          ? points(b) - points(a)
          : sort === 'oldest'
            ? a.submitted.localeCompare(b.submitted)
            : b.submitted.localeCompare(a.submitted),
    );
}
function statusFilter(): string {
  const count = (status: Status) => records.filter((receipt) => receipt.status === status).length;
  const options: [string, string, number][] = [
    ['all', 'Все', records.length],
    ['pending', 'На проверке', count('pending')],
    ['accepted', 'Приняты', count('accepted')],
    ['rejected', 'Отклонены', count('rejected')],
  ];
  return `<div class="status-filter" role="group" aria-label="Статус чеков">${options
    .map(
      ([value, label, total]) =>
        `<button data-admin-status="${value}" aria-pressed="${filterStatus === value}">
          ${label}${ready() ? `<span>${total}</span>` : ''}
        </button>`,
    )
    .join('')}</div>`;
}
function filterBar(): string {
  const sortOptions = [
    ['newest', 'Сначала новые'],
    ['oldest', 'Сначала старые'],
    ['amount', 'По сумме'],
    ['points', 'По баллам'],
  ]
    .map(
      ([value, label]) =>
        `<option value="${value}" ${sort === value ? 'selected' : ''}>${label}</option>`,
    )
    .join('');
  return `<div class="filter-bar">
    <label class="search-field">${icon('search', 18)}
      <input type="search" id="admin-search" placeholder="Номер, участник или магазин"
        aria-label="Поиск по чекам" value="${h(search)}">
    </label>
    <label class="filter-field"><span>Сумма от, ₽</span>
      <input type="number" min="0" step="1" id="admin-minimum" placeholder="0"
        value="${h(minimum)}">
    </label>
    <label class="filter-field"><span>Сортировка</span>
      <select id="admin-sort">${sortOptions}</select>
    </label>
  </div>`;
}
function adminView(): string {
  const exportDisabled = !ready() || !filteredRecords().length;
  return `<div class="admin-heading">
      <h1>Модерация чеков</h1>
      <div class="admin-actions">
        <button class="button secondary" data-action="reload">
          ${icon('refresh', 18)} Обновить
        </button>
        <button class="button primary" data-action="export" ${exportDisabled ? 'disabled' : ''}>
          ${icon('download', 18)} Скачать CSV
        </button>
      </div>
    </div>
    ${statusFilter()}
    <section class="admin-table-panel" aria-label="Чеки">
      ${filterBar()}<div id="admin-results">${adminResults()}</div>
    </section>`;
}
function moderationRow(receipt: Receipt): string {
  const earned = points(receipt);
  const year = new Date(receipt.purchased).getFullYear();
  return `<tr>
    <td data-label="Чек"><strong>${h(receipt.id)}</strong>
      <span>${h(receipt.owner)}${receipt.owner === me ? ', вы' : ''}</span></td>
    <td data-label="Магазин"><strong>${h(receipt.shop)}</strong>
      <span>${date(receipt.purchased)} ${year}</span></td>
    <td data-label="Сумма" class="amount-cell">${money(receipt.total)}</td>
    <td data-label="Статус">${badge(receipt.status)}</td>
    <td data-label="Баллы" class="points-cell ${earned ? '' : 'zero'}">${earned ? `+${earned}` : '0'}</td>
    <td><button class="review-button" data-receipt="${h(receipt.id)}">
      ${receipt.status === 'pending' ? 'Проверить' : 'Открыть'}
    </button></td>
  </tr>`;
}
function adminResults(): string {
  const filtered = filteredRecords();
  const table = `<table class="moderation-table">
    <thead><tr>
      <th scope="col">Чек, участник</th><th scope="col">Магазин, дата</th>
      <th scope="col">Сумма</th><th scope="col">Статус</th><th scope="col">Баллы</th>
      <th scope="col"><span class="visually-hidden">Действия</span></th>
    </tr></thead>
    <tbody>${filtered.map(moderationRow).join('')}</tbody>
  </table>`;
  return (
    dataState() ||
    `${filtered.length ? table : emptyState(true)}
    <p class="table-footer">Показано ${filtered.length} из ${records.length}</p>`
  );
}
function updateAdminResults(): void {
  const results = document.querySelector('#admin-results');
  if (results) results.innerHTML = adminResults();
  const exportButton = document.querySelector<HTMLButtonElement>('[data-action="export"]');
  if (exportButton) exportButton.disabled = loading || !!loadError || !filteredRecords().length;
}
function bindInputs(): void {
  document.querySelector('#receipt-photo')?.addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) void preparePhoto(file);
  });
  document.querySelector('#admin-search')?.addEventListener('input', (event) => {
    search = (event.target as HTMLInputElement).value;
    updateAdminResults();
  });
  document.querySelector('#admin-minimum')?.addEventListener('input', (event) => {
    minimum = (event.target as HTMLInputElement).value;
    updateAdminResults();
  });
  document.querySelector('#admin-sort')?.addEventListener('change', (event) => {
    sort = (event.target as HTMLSelectElement).value;
    updateAdminResults();
  });
}
async function refresh(): Promise<void> {
  const version = ++routeVersion;
  loading = true;
  loadError = '';
  render();
  try {
    const next = await loadReceipts();
    if (version === routeVersion) records = next;
  } catch (error) {
    if (version === routeVersion) loadError = errorText(error);
  } finally {
    if (version === routeVersion) {
      loading = false;
      render();
    }
  }
}
function clearDraft(): void {
  if (draft) URL.revokeObjectURL(draft.url);
  draft = null;
  uploadError = '';
}
async function preparePhoto(file: File): Promise<void> {
  if (pending) return;
  clearDraft();
  pending = true;
  uploadError = '';
  uploadStep = 'Проверяем фото…';
  render();
  try {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
      throw new Error('Выберите JPG, PNG или WebP.');
    if (!file.size || file.size > 10 * 1024 * 1024)
      throw new Error('Файл пустой или больше 10 МБ.');
    const hash = await sha256(file);
    const latest = await loadReceipts();
    records = latest;
    if (latest.some((receipt) => receipt.hash === hash))
      throw new Error('Это фото уже загружено. Найдите чек в истории.');
    const known = kit.store.get<Record<string, string>>('sample-photos', {})[hash];
    let sample: Sample | null = samples.find((entry) => entry.id === known) ?? null;
    try {
      sample ??= await detectReceipt(file);
    } catch {
      throw new Error('Фото не открывается. Выберите другое изображение.');
    }
    draft = {
      sample,
      recognised: !!sample,
      blob: file,
      hash,
      name: file.name,
      url: URL.createObjectURL(file),
    };
  } catch (error) {
    uploadError = errorText(error);
  } finally {
    pending = false;
    render();
  }
}
async function chooseSample(id: string): Promise<void> {
  if (pending) return;
  const sample = samples.find((item) => item.id === id);
  if (!sample) return;
  uploadError = '';
  pending = true;
  uploadStep = 'Готовим чек';
  render();
  try {
    if (draft && !draft.sample) {
      draft.sample = sample;
      draft.recognised = false;
    } else {
      const blob = await samplePhoto(sample);
      const hash = await sha256(blob);
      clearDraft();
      draft = { sample, blob, hash, name: `${sample.shop}.png`, url: URL.createObjectURL(blob) };
    }
  } catch (error) {
    uploadError = errorText(error);
  } finally {
    pending = false;
    render();
  }
}
async function sendReceipt(): Promise<void> {
  if (pending || !draft?.sample) return;
  pending = true;
  uploadStep = 'Отправляем…';
  uploadError = '';
  render();
  try {
    const receipt = await submitReceipt(draft.sample, draft.blob, draft.hash);
    records = [receipt, ...records];
    uploadSuccess = receipt;
    clearDraft();
  } catch (error) {
    uploadError = errorText(error);
  } finally {
    pending = false;
    render();
  }
}
function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function toast(message: string): void {
  notice = message;
  render();
  setTimeout(() => {
    if (notice === message) {
      notice = '';
      render();
    }
  }, 5000);
}

const dialog = document.createElement('dialog');
dialog.className = 'receipt-dialog';
dialog.setAttribute('aria-labelledby', 'dialog-title');
document.body.append(dialog);
let dialogPhotoUrl = '';
let dialogGeneration = 0;
let focusedReceipt = '';
let dialogBusy = false;
let modalReceipt: Receipt | null = null;
dialog.addEventListener('cancel', (event) => {
  if (dialogBusy) event.preventDefault();
});
dialog.addEventListener('close', () => {
  dialogGeneration++;
  if (dialogPhotoUrl) URL.revokeObjectURL(dialogPhotoUrl);
  dialogPhotoUrl = '';
  const opener = Array.from(app.querySelectorAll<HTMLButtonElement>('[data-receipt]')).find(
    (button) => button.dataset.receipt === focusedReceipt,
  );
  opener?.focus();
});
function closeDialog(): void {
  if (!dialogBusy) dialog.close();
}
const basketItems = [
  ['drinks', 'Напитки', 3],
  ['snacks', 'Снеки', 2],
  ['lemonade', 'Лимонад', 1],
] as const;
const basketPoints = (basket: Basket) => basket.drinks * 3 + basket.snacks * 2 + basket.lemonade;
function basketInputs(receipt: Receipt): string {
  const fields = basketItems
    .map(
      ([key, label, value]) => `<label>
        <span>${label}<small>${pointsLabel(value)} за шт.</small></span>
        <input name="${key}" type="number" min="0" max="100" step="1" required
          value="${receipt.basket[key]}">
      </label>`,
    )
    .join('');
  return `<fieldset class="basket-fields"><legend>Товары акции</legend>${fields}</fieldset>
    <p class="points-preview">После принятия
      <strong id="points-preview">${pointsLabel(basketPoints(receipt.basket))}</strong>
    </p>`;
}
function moderationForm(receipt: Receipt): string {
  return `<form id="moderation-form" novalidate>
    ${basketInputs(receipt)}
    <label class="comment-label">
      <span>Комментарий к решению <span class="required" aria-hidden="true">*</span></span>
      <textarea name="comment" rows="3" maxlength="500" required
        aria-describedby="moderation-error"
        placeholder="Что проверили или почему отклонили">${h(receipt.comment)}</textarea>
    </label>
    <div id="moderation-error" role="alert"></div>
    <div class="decision-actions">
      <button type="submit" name="decision" value="accepted" class="button primary">
        ${icon('check', 18)} Принять
      </button>
      <button type="submit" name="decision" value="rejected" class="button danger">
        Отклонить
      </button>
    </div>
    <p id="moderation-progress" role="status" aria-live="polite"></p>
  </form>`;
}
function participantResult(receipt: Receipt): string {
  const comment = receipt.comment ? `<p>${h(receipt.comment)}</p>` : '';
  return `<div class="participant-result">
    <strong>${pointsLabel(points(receipt))}</strong>${comment}
  </div>`;
}
function receiptDialog(receipt: Receipt, admin: boolean): string {
  const year = new Date(receipt.purchased).getFullYear();
  return `<div class="dialog-top">
      <h2 id="dialog-title">${h(receipt.id)}</h2>
      <button class="icon-button" data-dialog-close aria-label="Закрыть">${icon('close')}</button>
    </div>
    <div class="dialog-body">
      <div id="photo-view" class="receipt-photo-view" aria-live="polite">
        <span class="spinner"></span><p>Загружаем фото</p>
      </div>
      <div class="receipt-info">
        ${badge(receipt.status)}
        <h3>${h(receipt.shop)}</h3>
        <dl class="receipt-facts">
          <div><dt>Дата покупки</dt><dd>${date(receipt.purchased)} ${year}</dd></div>
          <div><dt>Сумма</dt><dd>${money(receipt.total)}</dd></div>
          <div><dt>Участник</dt><dd>${h(receipt.owner)}</dd></div>
          <div><dt>Реквизиты</dt><dd class="fiscal-value">${h(receipt.fiscal)}</dd></div>
        </dl>
        ${admin ? moderationForm(receipt) : participantResult(receipt)}
      </div>
    </div>`;
}
async function showReceipt(id: string): Promise<void> {
  if (dialogBusy) return;
  const receipt = records.find((item) => item.id === id);
  if (!receipt) return;
  modalReceipt = receipt;
  focusedReceipt = id;
  const admin = route() === '#/admin';
  dialog.innerHTML = receiptDialog(receipt, admin);
  dialog.querySelector('[data-dialog-close]')?.addEventListener('click', closeDialog);
  const form = dialog.querySelector<HTMLFormElement>('#moderation-form');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveModeration(event as SubmitEvent);
  });
  form?.addEventListener('input', () => {
    const values = new FormData(form);
    const sum = basketPoints({
      drinks: Math.max(0, Number(values.get('drinks'))),
      snacks: Math.max(0, Number(values.get('snacks'))),
      lemonade: Math.max(0, Number(values.get('lemonade'))),
    });
    const preview = dialog.querySelector('#points-preview');
    if (preview) preview.textContent = pointsLabel(sum);
  });
  dialog.showModal();
  await renderPhoto(receipt);
}
async function renderPhoto(receipt: Receipt): Promise<void> {
  const generation = ++dialogGeneration;
  const holder = dialog.querySelector('#photo-view');
  if (!holder) return;
  holder.innerHTML = '<span class="spinner"></span><p>Загружаем фото</p>';
  try {
    const blob = receipt.photo
      ? await loadPhoto(receipt.hash)
      : await kit.demo.request(() => samplePhoto({ ...receipt }));
    if (generation !== dialogGeneration || !dialog.open) return;
    if (!blob) throw new Error('Фото не найдено в браузере.');
    if (dialogPhotoUrl) URL.revokeObjectURL(dialogPhotoUrl);
    dialogPhotoUrl = URL.createObjectURL(blob);
    holder.innerHTML = `<img src="${dialogPhotoUrl}" alt="Фото чека ${h(receipt.id)}">`;
  } catch (error) {
    if (generation !== dialogGeneration || !dialog.open) return;
    holder.innerHTML = `<p role="alert">${h(errorText(error))}</p>
      <button class="button secondary" id="retry-photo">Повторить</button>`;
    holder
      .querySelector('#retry-photo')
      ?.addEventListener('click', () => void renderPhoto(receipt));
  }
}
async function saveModeration(event: SubmitEvent): Promise<void> {
  const form = event.target as HTMLFormElement;
  const receipt = modalReceipt;
  if (!receipt || dialogBusy) return;
  const values = new FormData(form);
  const status = (event.submitter as HTMLButtonElement | null)?.value;
  if (status !== 'accepted' && status !== 'rejected') return;
  const basket: Basket = {
    drinks: Number(values.get('drinks')),
    snacks: Number(values.get('snacks')),
    lemonade: Number(values.get('lemonade')),
  };
  const comment = String(values.get('comment') ?? '').trim();
  const errorBox = dialog.querySelector<HTMLElement>('#moderation-error');
  if (!errorBox) return;
  if (Object.values(basket).some((count) => !Number.isInteger(count) || count < 0 || count > 100)) {
    errorBox.textContent = 'Количество товаров: целое число от 0 до 100.';
    return;
  }
  if (!comment) {
    errorBox.textContent = 'Добавьте комментарий к решению.';
    dialog.querySelector<HTMLTextAreaElement>('textarea[name="comment"]')?.focus();
    return;
  }
  errorBox.textContent = '';
  dialogBusy = true;
  dialog
    .querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement>(
      'button, input, textarea',
    )
    .forEach((control) => {
      control.disabled = true;
    });
  const progress = dialog.querySelector('#moderation-progress');
  if (progress) progress.textContent = 'Сохраняем решение…';
  try {
    await moderateReceipt(receipt.id, status, comment, basket);
    records = records.map((item) =>
      item.id === receipt.id ? { ...item, status, comment, basket } : item,
    );
    dialogBusy = false;
    dialog.close();
    toast(status === 'accepted' ? 'Чек принят' : 'Чек отклонён');
    const nextFocus = Array.from(app.querySelectorAll<HTMLButtonElement>('[data-receipt]')).find(
      (button) => button.dataset.receipt === receipt.id,
    );
    nextFocus?.focus();
  } catch (error) {
    const message = `${errorText(error)} Ввод сохранён. Повторите решение.`;
    errorBox.innerHTML = `<p class="inline-error">${h(message)}</p>`;
  } finally {
    dialogBusy = false;
    dialog
      .querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement>(
        'button, input, textarea',
      )
      .forEach((control) => {
        control.disabled = false;
      });
    if (progress) progress.textContent = '';
  }
}

app.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLElement>('button, [data-receipt]');
  if (!button || (button instanceof HTMLButtonElement && button.disabled)) return;
  if (button.dataset.receipt) {
    void showReceipt(button.dataset.receipt);
    return;
  }
  if (button.dataset.sample) {
    void chooseSample(button.dataset.sample);
    return;
  }
  if (button.dataset.historyStatus) {
    historyStatus = button.dataset.historyStatus;
    render();
    return;
  }
  if (button.dataset.adminStatus) {
    filterStatus = button.dataset.adminStatus;
    render();
    return;
  }
  switch (button.dataset.action) {
    case 'choose-file':
      document.querySelector<HTMLInputElement>('#receipt-photo')?.click();
      break;
    case 'remove-photo':
      clearDraft();
      render();
      break;
    case 'reload':
      void refresh();
      break;
    case 'submit':
      void sendReceipt();
      break;
    case 'another':
      uploadSuccess = null;
      render();
      break;
    case 'clear-filters':
      filterStatus = 'all';
      search = '';
      sort = 'newest';
      minimum = '';
      render();
      break;
    case 'export':
      download(
        new Blob([csvContent(filteredRecords())], { type: 'text/csv;charset=utf-8' }),
        'kvitok-receipts.csv',
      );
      toast(`Скачано чеков: ${filteredRecords().length}`);
      break;
    case 'download-sample': {
      const sample = draft?.sample ?? samples[0];
      if (sample)
        void samplePhoto(sample)
          .then(async (blob) => {
            const photos = kit.store.get<Record<string, string>>('sample-photos', {});
            kit.store.set('sample-photos', { ...photos, [await sha256(blob)]: sample.id });
            download(blob, `kvitok-${sample.id}.png`);
          })
          .catch((error) => {
            uploadError = errorText(error);
            render();
          });
      break;
    }
  }
});
window.addEventListener('hashchange', () => {
  if (dialog.open) dialog.close();
  void refresh();
  window.scrollTo({ top: 0 });
});
window.addEventListener('storage', (event) => {
  if (event.key?.startsWith('receipt-promo:') && !pending && !dialog.open) void refresh();
});
await refresh();
