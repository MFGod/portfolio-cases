import { createCase } from '@cases/demo-kit';
import manifest from '../case.json';

export const kit = createCase(manifest);
export type Status = 'pending' | 'accepted' | 'rejected';
export type Basket = { drinks: number; snacks: number; lemonade: number };
export type Receipt = {
  id: string;
  owner: string;
  shop: string;
  purchased: string;
  submitted: string;
  total: number;
  fiscal: string;
  hash: string;
  status: Status;
  comment: string;
  basket: Basket;
  photo: boolean;
};
export type Sample = {
  id: string;
  shop: string;
  purchased: string;
  total: number;
  fiscal: string;
  basket: Basket;
};
export const samples: Sample[] = [
  {
    id: 'morning',
    shop: 'Магазин у дома',
    purchased: '2026-10-18T10:42',
    total: 748,
    fiscal: '810000004271/101/710031',
    basket: { drinks: 2, snacks: 1, lemonade: 0 },
  },
  {
    id: 'picnic',
    shop: 'Супермаркет №7',
    purchased: '2026-10-19T15:20',
    total: 1260,
    fiscal: '810000004272/102/710032',
    basket: { drinks: 1, snacks: 3, lemonade: 2 },
  },
  {
    id: 'evening',
    shop: 'Продукты 24',
    purchased: '2026-10-20T18:05',
    total: 392,
    fiscal: '810000004273/103/710033',
    basket: { drinks: 0, snacks: 1, lemonade: 2 },
  },
];
export const me = 'Участник 024';
export const statusNames: Record<Status, string> = {
  pending: 'На проверке',
  accepted: 'Принят',
  rejected: 'Отклонён',
};
export const points = (receipt: Receipt) =>
  receipt.status === 'accepted'
    ? receipt.basket.drinks * 3 + receipt.basket.snacks * 2 + receipt.basket.lemonade
    : 0;
export const money = (value: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(value);
export const date = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(value));
export const escape = (value: string | number) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char,
  );

function seed(): Receipt[] {
  return Array.from({ length: 9 }, (_, index) => ({
    id: `KV-${String(241 + index).padStart(4, '0')}`,
    owner: index < 3 ? me : `Участник ${String(31 + index).padStart(3, '0')}`,
    shop: ['Магазин у дома', 'Супермаркет №7', 'Продукты 24'][index % 3] ?? 'Магазин у дома',
    purchased: `2026-10-${String(17 - index).padStart(2, '0')}T12:30`,
    submitted: `2026-10-${String(18 - index).padStart(2, '0')}T09:15:00`,
    total: [864, 532, 1180, 690, 340, 1490, 725, 960, 472][index] ?? 500,
    fiscal: `8200000000${index}/20${index}/60000${index}`,
    hash: '',
    status:
      index === 1 || index === 4 || index === 8
        ? 'accepted'
        : index === 2 || index === 6
          ? 'rejected'
          : 'pending',
    comment:
      index === 2 || index === 6 ? 'На фото не видна дата покупки. Загрузите полный чек.' : '',
    basket: { drinks: 2, snacks: 1, lemonade: 1 },
    photo: false,
  }));
}

function readRecords(): Receipt[] {
  const stored = kit.store.get<Receipt[] | null>('receipts-v1', null);
  if (stored) return stored;
  const initial = seed();
  kit.store.set('receipts-v1', initial);
  return initial;
}

function openPhotos(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(kit.store.database('photos'), 1);
    request.onupgradeneeded = () => request.result.createObjectStore('images');
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () =>
      reject(new Error('Не удалось открыть хранилище фото. Повторите действие.'));
    request.onblocked = () => reject(new Error('Закройте другие вкладки и повторите.'));
  });
}

async function photoTransaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openPhotos();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction('images', mode);
      const request = operation(transaction.objectStore('images'));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = transaction.onerror = () =>
        reject(new Error('Фото не сохранено. Освободите место и повторите действие.'));
    });
  } finally {
    db.close();
  }
}

export const loadReceipts = () => kit.demo.request(readRecords);
export const loadPhoto = (hash: string) =>
  kit.demo.request(() =>
    photoTransaction<Blob | undefined>('readonly', (store) => store.get(hash)),
  );

export async function submitReceipt(draft: Sample, blob: Blob, hash: string): Promise<Receipt> {
  return kit.demo.request(async () => {
    const current = readRecords();
    if (current.some((receipt) => receipt.hash === hash))
      throw new Error('Это фото уже загружено. Найдите чек в истории.');
    if (current.some((receipt) => receipt.fiscal === draft.fiscal))
      throw new Error('Чек с такими реквизитами уже участвует в акции.');
    await photoTransaction('readwrite', (store) => store.put(blob, hash));
    const latest = readRecords();
    if (latest.some((receipt) => receipt.hash === hash || receipt.fiscal === draft.fiscal)) {
      throw new Error('Этот чек уже добавлен. Обновите историю.');
    }
    const receipt: Receipt = {
      ...draft,
      id: `KV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      owner: me,
      hash,
      photo: true,
      status: 'pending',
      comment: '',
      submitted: new Date().toISOString(),
    };
    try {
      kit.store.set('receipts-v1', [receipt, ...latest]);
    } catch {
      throw new Error('Не удалось сохранить чек. Освободите место и повторите отправку.');
    }
    return receipt;
  });
}

export async function moderateReceipt(
  id: string,
  status: Status,
  comment: string,
  basket: Basket,
): Promise<void> {
  return kit.demo.request(() => {
    if (!comment.trim()) throw new Error('Добавьте комментарий к решению.');
    if (Object.values(basket).some((value) => !Number.isInteger(value) || value < 0 || value > 100))
      throw new Error('Количество товаров должно быть целым числом от 0 до 100.');
    const records = readRecords();
    if (!records.some((receipt) => receipt.id === id))
      throw new Error('Чек больше не найден. Обновите список.');
    kit.store.set(
      'receipts-v1',
      records.map((receipt) =>
        receipt.id === id ? { ...receipt, status, comment: comment.trim(), basket } : receipt,
      ),
    );
  });
}

export async function sha256(blob: Blob): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join(
    '',
  );
}

export function readFiscal(raw: string): Sample | null {
  const query = raw.includes('?') ? raw.slice(raw.indexOf('?') + 1) : raw;
  const params = new URLSearchParams(query);
  const timestamp = params.get('t') ?? '';
  const sum = params.get('s') ?? '';
  const fields = ['fn', 'i', 'fp'].map((key) => params.get(key) ?? '');
  if (
    !/^\d{8}T\d{4}(\d{2})?$/.test(timestamp) ||
    !/^\d+(\.\d{1,2})?$/.test(sum) ||
    fields.some((value) => !/^\d{1,20}$/.test(value))
  )
    return null;
  const day = `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}`;
  const purchased = `${day}T${timestamp.slice(9, 11)}:${timestamp.slice(11, 13)}`;
  const parsed = new Date(purchased);
  if (
    !Number.isFinite(parsed.getTime()) ||
    parsed.getFullYear() !== Number(timestamp.slice(0, 4)) ||
    parsed.getMonth() + 1 !== Number(timestamp.slice(4, 6)) ||
    parsed.getDate() !== Number(timestamp.slice(6, 8)) ||
    Number(timestamp.slice(11, 13)) > 59 ||
    Number(timestamp.slice(13) || '0') > 59 ||
    Number(sum) <= 0 ||
    Number(sum) > 1000000
  )
    return null;
  return {
    id: 'scanned',
    shop: 'Магазин из QR',
    purchased,
    total: Number(sum),
    fiscal: fields.join('/'),
    basket: { drinks: 0, snacks: 0, lemonade: 0 },
  };
}

interface Detector {
  detect(source: ImageBitmap): Promise<{ rawValue: string }[]>;
}
type DetectorConstructor = new (options: { formats: string[] }) => Detector;
export async function detectReceipt(blob: Blob): Promise<Sample | null> {
  const DetectorClass = (
    globalThis as typeof globalThis & { BarcodeDetector?: DetectorConstructor }
  ).BarcodeDetector;
  const bitmap = await createImageBitmap(blob);
  try {
    if (!DetectorClass) return null;
    const results = await new DetectorClass({ formats: ['qr_code'] }).detect(bitmap);
    for (const result of results) {
      const fiscal = readFiscal(result.rawValue);
      if (fiscal) return fiscal;
    }
    return null;
  } catch {
    return null;
  } finally {
    bitmap.close();
  }
}

export async function samplePhoto(sample: Sample): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 1040;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Браузер не поддерживает создание фото.');
  ctx.fillStyle = '#ede9e0';
  ctx.fillRect(0, 0, 720, 1040);
  ctx.fillStyle = '#fffef8';
  ctx.fillRect(90, 40, 540, 960);
  ctx.fillStyle = '#292631';
  ctx.textAlign = 'center';
  ctx.font = 'bold 32px monospace';
  ctx.fillText('КВИТОК', 360, 110);
  ctx.font = '22px monospace';
  ctx.fillText(sample.shop, 360, 160);
  ctx.font = '18px monospace';
  ctx.fillText('КАССОВЫЙ ЧЕК', 360, 210);
  ctx.textAlign = 'left';
  ctx.fillText(date(sample.purchased) + '  ' + sample.purchased.slice(11), 130, 270);
  ctx.fillText('--------------------------------', 130, 310);
  const lines: [string, number][] = [
    ['Напитки', sample.basket.drinks],
    ['Снеки', sample.basket.snacks],
    ['Лимонад', sample.basket.lemonade],
  ];
  lines.forEach(([label, count], index) => {
    ctx.fillText(label, 130, 370 + index * 65);
    ctx.fillText(`${count} шт.`, 510, 370 + index * 65);
  });
  ctx.fillText('--------------------------------', 130, 590);
  ctx.font = 'bold 28px monospace';
  ctx.fillText('ИТОГ', 130, 650);
  ctx.textAlign = 'right';
  ctx.fillText(money(sample.total), 590, 650);
  ctx.textAlign = 'center';
  ctx.font = '18px monospace';
  ctx.fillText('ФН / ФД / ФП', 360, 750);
  ctx.fillText(sample.fiscal, 360, 790);
  ctx.fillText('Спасибо за покупку', 360, 890);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Не удалось создать фото.'))),
      'image/png',
    ),
  );
}

export function csvContent(records: Receipt[]): string {
  const cell = (value: string | number) => {
    const text = String(value);
    const safe = /^[\s\uFEFF]*[=+@-]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const rows = records.map((receipt) => [
    receipt.id,
    receipt.owner,
    receipt.shop,
    receipt.purchased,
    receipt.total,
    statusNames[receipt.status],
    points(receipt),
    receipt.comment,
  ]);
  return (
    '\uFEFF' +
    [
      ['Номер', 'Участник', 'Магазин', 'Дата покупки', 'Сумма', 'Статус', 'Баллы', 'Комментарий'],
      ...rows,
    ]
      .map((row) => row.map(cell).join(';'))
      .join('\r\n')
  );
}
