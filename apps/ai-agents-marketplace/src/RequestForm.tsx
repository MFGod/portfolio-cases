import { useRef, useState, type FormEvent } from 'react';
import type { Entry, Inquiry } from './data';
import { BackLink, Notice, Price } from './components';
import { kit, mutate, readInquiries } from './runtime';

export function RequestForm({ agent }: { agent: Entry }) {
  const [values, setValues] = useState({
    name: '',
    email: '',
    task: '',
    consent: false,
    training: true,
    updates: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState('');
  const [record, setRecord] = useState<Inquiry | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const set = (name: string, value: string | boolean) => {
    setValues((old) => ({ ...old, [name]: value }));
    setErrors((old) => ({ ...old, [name]: '' }));
    setFailure('');
  };
  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const invalid: Record<string, string> = {};
    if (values.name.trim().length < 2) invalid.name = 'Укажите имя, минимум 2 символа.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      invalid.email = 'Проверьте адрес почты.';
    if (values.task.trim().length < 15) invalid.task = 'Опишите задачу, минимум 15 символов.';
    if (!values.consent) invalid.consent = 'Нужно согласие на обработку данных.';
    setErrors(invalid);
    if (Object.keys(invalid).length) {
      requestAnimationFrame(() =>
        form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    setPending(true);
    setFailure('');
    try {
      const saved = await mutate(() => {
        const inquiry: Inquiry = {
          ...values,
          name: values.name.trim(),
          email: values.email.trim(),
          task: values.task.trim(),
          consent: true,
          training: true,
          id: crypto.randomUUID(),
          agentId: agent.id,
          agent: agent.title,
          created: new Date().toISOString(),
        };
        kit.store.set('inquiries', [...readInquiries(), inquiry]);
        return inquiry;
      });
      setRecord(saved);
    } catch (error) {
      setFailure(error instanceof Error ? error.message : 'Не удалось сохранить заявку.');
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <BackLink href={`#/agents/${agent.id}`}>К помощнику</BackLink>
      <h1 className="page-title">Заявка</h1>
      <p className="request-agent">
        {agent.title}, <Price value={agent.price} />
      </p>
      <div className="request-body">
        {record ? (
          <section className="success" aria-live="polite">
            <h2>Заявка отправлена</h2>
            <dl className="receipt">
              <dt>Почта</dt>
              <dd>{record.email}</dd>
              <dt>Задача</dt>
              <dd>{record.task}</dd>
            </dl>
            <div className="actions">
              <a className="button" href="#/editor/requests">
                Открыть в редакторе
              </a>
              <a className="button secondary" href="#/catalog">
                В каталог
              </a>
            </div>
          </section>
        ) : (
          <form
            ref={form}
            className="request-form"
            noValidate
            onSubmit={(event) => void submit(event)}
          >
            <fieldset disabled={pending}>
              <label>
                Имя
                <input
                  name="name"
                  autoComplete="off"
                  value={values.name}
                  maxLength={80}
                  onChange={(e) => set('name', e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'error-name' : undefined}
                />
                {errors.name && (
                  <small id="error-name" className="field-error">
                    {errors.name}
                  </small>
                )}
              </label>
              <label>
                Электронная почта
                <input
                  name="email"
                  type="email"
                  autoComplete="off"
                  value={values.email}
                  maxLength={120}
                  onChange={(e) => set('email', e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'error-email' : undefined}
                />
                {errors.email && (
                  <small id="error-email" className="field-error">
                    {errors.email}
                  </small>
                )}
              </label>
              <label>
                Задача
                <textarea
                  name="task"
                  value={values.task}
                  maxLength={2000}
                  rows={4}
                  onChange={(e) => set('task', e.target.value)}
                  aria-invalid={!!errors.task}
                  aria-describedby={errors.task ? 'error-task' : undefined}
                />
                {errors.task && (
                  <small id="error-task" className="field-error">
                    {errors.task}
                  </small>
                )}
              </label>
              <div className="checks">
                <label className="check-row">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={values.consent}
                    onChange={(e) => set('consent', e.target.checked)}
                    aria-invalid={!!errors.consent}
                    aria-describedby={errors.consent ? 'error-consent' : undefined}
                  />
                  <span>
                    Согласен на обработку персональных данных
                    {errors.consent && (
                      <small id="error-consent" className="field-error">
                        {errors.consent}
                      </small>
                    )}
                  </span>
                </label>
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={values.updates}
                    onChange={(e) => set('updates', e.target.checked)}
                  />
                  <span>Получать новости мастерской</span>
                </label>
              </div>
              <button className="button submit" type="submit">
                {pending ? 'Отправляем…' : 'Отправить заявку'}
              </button>
            </fieldset>
            <div aria-live="polite">
              {failure && (
                <Notice error retry={() => void submit()}>
                  {failure}
                </Notice>
              )}
              {pending && <span className="sr-only">Сохраняем заявку</span>}
            </div>
          </form>
        )}
      </div>
    </>
  );
}
