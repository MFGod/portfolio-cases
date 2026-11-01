import { Failure } from '../../ui/feedback';
import { Icon } from '../../ui/icons';
import type { useProfile } from './use-profile';

type Editor = ReturnType<typeof useProfile>;

const avatarColors = [
  ['sage', 'шалфейный'],
  ['clay', 'терракотовый'],
  ['blue', 'голубой'],
] as const;
const specialties = [
  'Общая врачебная практика',
  'Организация здравоохранения',
  'Медицинское образование',
];

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');

function saveMessage(editor: Editor) {
  if (editor.storageError) return 'Черновик не записался на устройство';
  switch (editor.saveState) {
    case 'saved':
      return 'Сохранено';
    case 'invalid':
      return 'Не сохранено, исправьте имя';
    case 'error':
      return 'Не удалось сохранить, черновик остался на устройстве';
    case 'saving':
      return 'Сохраняем…';
    default:
      return 'Черновик';
  }
}

export function ProfilePage({ editor }: { editor: Editor }) {
  const { profile } = editor;
  const failed = editor.saveState === 'error' || editor.storageError;
  return (
    <>
      <div className="page-heading">
        <h1>Профиль</h1>
      </div>
      {editor.recoveryWarning && (
        <div className="failure" role="alert">
          <p>{editor.recoveryWarning}</p>
          <button className="text-button" onClick={editor.recoverProfile}>
            Восстановить профиль
          </button>
        </div>
      )}
      {editor.conflict && (
        <div className="failure" role="alert">
          <p>{editor.conflict}</p>
          <button className="text-button" onClick={editor.keepLocalProfile}>
            Сохранить мой вариант
          </button>
          <button className="text-button" onClick={editor.useStoredProfile}>
            Открыть сохранённый
          </button>
        </div>
      )}
      {editor.loadState === 'loading' && (
        <p className="sr-only" role="status">
          Загружаем профиль
        </p>
      )}
      {editor.loadState === 'error' && (
        <Failure retry={editor.retryLoad}>Профиль не загрузился. Черновик на месте.</Failure>
      )}
      <div className="avatar-row" aria-busy={editor.loadState === 'loading'}>
        <span className={`avatar avatar-${profile.avatar}`} aria-hidden="true">
          {initials(profile.name) || <Icon name="user" />}
        </span>
        <fieldset className="swatches">
          <legend className="sr-only">Цвет аватара</legend>
          {avatarColors.map(([color, label]) => (
            <button
              type="button"
              className={`swatch avatar-${color}`}
              key={color}
              aria-label={`Цвет аватара: ${label}`}
              aria-pressed={profile.avatar === color}
              onClick={() => editor.update('avatar', color)}
              disabled={!!editor.recoveryWarning}
            />
          ))}
        </fieldset>
      </div>
      <form
        className="profile-form"
        aria-busy={editor.loadState === 'loading'}
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset className="profile-fields" disabled={!!editor.recoveryWarning}>
          <legend className="sr-only">Данные профиля</legend>
          <label>
            Имя и фамилия
            <input
              autoComplete="name"
              value={profile.name}
              maxLength={90}
              aria-invalid={!!editor.nameError}
              aria-describedby={editor.nameError ? 'name-error' : undefined}
              onChange={(event) => editor.update('name', event.target.value)}
            />
            {editor.nameError && (
              <span id="name-error" className="field-error" role="alert">
                {editor.nameError}
              </span>
            )}
          </label>
          <label>
            Специальность
            <input
              list="specialties"
              value={profile.specialty}
              maxLength={100}
              onChange={(event) => editor.update('specialty', event.target.value)}
            />
            <datalist id="specialties">
              {specialties.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </label>
          <label>
            Город
            <input
              autoComplete="address-level2"
              value={profile.city}
              maxLength={80}
              onChange={(event) => editor.update('city', event.target.value)}
            />
          </label>
          <label>
            Цель на месяц
            <textarea
              rows={3}
              value={profile.goal}
              maxLength={500}
              onChange={(event) => editor.update('goal', event.target.value)}
            />
          </label>
        </fieldset>
      </form>
      <div
        className={`save-status status-${editor.saveState}`}
        aria-live="polite"
        hidden={editor.loadState === 'loading'}
      >
        {editor.saveState === 'saved' && !editor.storageError && <Icon name="check" size={18} />}
        <span>{saveMessage(editor)}</span>
        {failed && (
          <button className="text-button" onClick={editor.retrySave}>
            Повторить
          </button>
        )}
      </div>
    </>
  );
}
