import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Icon, ProductArt } from '../Art';
import { errorText, type Gift } from '../model';
import { categories } from './categories';

type FormError = { field: 'title' | 'price' | 'photo' | 'save'; message: string };
type Props = {
  initial?: Gift;
  editing?: boolean;
  disabled?: boolean;
  onSave: (gift: Gift, editing: boolean, original?: Gift) => Promise<void>;
  onCancel: () => void;
};

async function decodePhoto(file: File) {
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('Не удалось прочитать фото.'));
    reader.onerror = () => reject(new Error('Не удалось прочитать фото. Попробуйте другой файл.'));
    reader.readAsDataURL(file);
  });
  const image = new Image();
  image.src = data;
  try {
    await image.decode();
  } catch {
    throw new Error('Файл не удалось открыть как изображение.');
  }
  if (!image.naturalWidth || !image.naturalHeight) {
    throw new Error('Файл не удалось открыть как изображение.');
  }
  return data;
}

export function GiftForm({ initial, editing = false, disabled = false, onSave, onCancel }: Props) {
  const original = useRef(initial).current;
  const [title, setTitle] = useState(original?.title ?? '');
  const [price, setPrice] = useState(original ? String(original.price) : '');
  const [note, setNote] = useState(original?.note ?? '');
  const [category, setCategory] = useState<Gift['category']>(original?.category ?? 'home');
  const [photo, setPhoto] = useState(original?.photo);
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<FormError>();
  const pending = useRef<'save' | 'photo' | undefined>(undefined);
  const requestVersion = useRef(0);
  const titleRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const photoHintId = useId();
  const locked = disabled || busy || reading;
  useEffect(
    () => () => {
      requestVersion.current += 1;
    },
    [],
  );

  function clearFieldError(field: FormError['field']) {
    setError((current) => (current?.field === field ? undefined : current));
  }
  async function readPhoto(file?: File) {
    if (!file || pending.current || disabled) return;
    setError(undefined);
    if (
      !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setError({ field: 'photo', message: 'Выберите PNG, JPEG или WebP размером до 2 МБ.' });
      return;
    }
    pending.current = 'photo';
    const version = ++requestVersion.current;
    setReading(true);
    try {
      const data = await decodePhoto(file);
      if (version === requestVersion.current) setPhoto(data);
    } catch (cause) {
      if (version === requestVersion.current) {
        setError({ field: 'photo', message: errorText(cause) });
      }
    } finally {
      if (version === requestVersion.current) {
        pending.current = undefined;
        setReading(false);
      }
    }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending.current || disabled) return;
    if (!title.trim()) {
      setError({ field: 'title', message: 'Напишите название желания.' });
      titleRef.current?.focus();
      return;
    }
    const validPrice = /^\d+(?:[,.]\d{1,2})?$/.test(price.trim());
    const amount = Number(price.trim().replace(',', '.'));
    if (!validPrice || !Number.isFinite(amount) || amount > 10000000) {
      setError({
        field: 'price',
        message: 'Укажите цену от 0 до 10 000 000 ₽, до двух знаков после запятой.',
      });
      priceRef.current?.focus();
      return;
    }
    pending.current = 'save';
    const version = ++requestVersion.current;
    setBusy(true);
    setError(undefined);
    try {
      await onSave(
        {
          id: original?.id ?? '',
          title: title.trim(),
          price: Math.round(amount * 100) / 100,
          note: note.trim(),
          category,
          art: original?.art ?? 'gift',
          color: original?.color ?? 'rose',
          ...(photo ? { photo } : {}),
          ...(original?.link ? { link: original.link } : {}),
        },
        editing,
        original,
      );
    } catch (cause) {
      if (version === requestVersion.current) {
        setError({ field: 'save', message: errorText(cause) });
      }
    } finally {
      if (version === requestVersion.current) {
        pending.current = undefined;
        setBusy(false);
      }
    }
  }
  return (
    <form
      className="wish-form"
      noValidate
      aria-busy={busy || reading}
      onSubmit={(event) => void submit(event)}
    >
      <fieldset disabled={locked}>
        <div className="photo-row">
          <div className={`photo-preview ${original?.color ?? 'rose'}`}>
            <ProductArt
              art={original?.art ?? 'gift'}
              photo={photo}
              title={title || 'Фото желания'}
            />
          </div>
          <div className="photo-controls">
            <label className="button secondary upload-button">
              {photo ? 'Заменить фото' : 'Загрузить фото'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                aria-label="Фото желания"
                aria-invalid={error?.field === 'photo'}
                aria-describedby={`${photoHintId}${error?.field === 'photo' ? ` ${errorId}` : ''}`}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  void readPhoto(file);
                }}
              />
            </label>
            <small id={photoHintId}>PNG, JPEG или WebP, до 2 МБ</small>
            {photo && (
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  setPhoto(undefined);
                  clearFieldError('photo');
                }}
              >
                Убрать фото
              </button>
            )}
          </div>
        </div>
        <label>
          Название желания
          <input
            ref={titleRef}
            required
            maxLength={80}
            value={title}
            aria-invalid={error?.field === 'title'}
            aria-describedby={error?.field === 'title' ? errorId : undefined}
            onChange={(event) => {
              setTitle(event.target.value);
              clearFieldError('title');
            }}
          />
        </label>
        <div className="form-columns">
          <label>
            Цена, ₽
            <input
              ref={priceRef}
              required
              inputMode="decimal"
              value={price}
              placeholder="0"
              aria-invalid={error?.field === 'price'}
              aria-describedby={error?.field === 'price' ? errorId : undefined}
              onChange={(event) => {
                setPrice(event.target.value);
                clearFieldError('price');
              }}
            />
          </label>
          <label>
            Категория
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as Gift['category'])}
            >
              {categories
                .filter((entry) => entry.id !== 'all')
                .map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.title}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <label>
          Пожелания к подарку <span className="optional">необязательно</span>
          <textarea
            maxLength={350}
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
      </fieldset>
      <div aria-live="polite">
        {reading && <p className="helper">Читаем фото…</p>}
        {error && (
          <p id={errorId} className="error-message" role="alert">
            {error.message}
          </p>
        )}
      </div>
      <button className="button primary full" disabled={locked} type="submit">
        <Icon name={editing ? 'check' : 'plus'} size={20} />
        {busy ? 'Сохраняем…' : editing ? 'Сохранить изменения' : 'Добавить в список'}
      </button>
      <button className="button quiet full" type="button" disabled={locked} onClick={onCancel}>
        Отмена
      </button>
    </form>
  );
}
