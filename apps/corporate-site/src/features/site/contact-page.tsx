import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';

import type { Content } from '../../domain/content';
import { t } from '../../domain/copy';
import { submitInquiry } from '../../domain/repository';
import { Icon } from '../../ui/icons';
import { StableLabel } from '../../ui/stable-label';

type Props = { content: Content; topic?: string; embedded?: boolean };
type Field = 'name' | 'company' | 'email' | 'topic' | 'message';
type Status = 'idle' | 'sending' | 'sent' | 'failed';

const OTHER = 'other';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactPage({ content, topic, embedded = false }: Props) {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  const previousStatus = useRef<Status>('idle');
  const initialTopic =
    topic && content.solutions.some((item) => item.slug === topic) ? topic : OTHER;
  const [values, setValues] = useState<Record<Field, string>>({
    name: '',
    company: '',
    email: '',
    topic: initialTopic,
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const Heading = embedded ? 'h2' : 'h1';

  useEffect(() => {
    if (status === 'sent') feedback.current?.focus();
    if (status === 'idle' && previousStatus.current === 'sent') {
      form.current?.querySelector<HTMLInputElement>('input')?.focus();
    }
    previousStatus.current = status;
  }, [status]);

  const set = (field: Field, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'sending') return;
    const found: Partial<Record<Field, string>> = {};
    for (const field of ['name', 'email', 'message'] as const) {
      if (!values[field].trim()) found[field] = t('required');
    }
    if (values.email.trim() && !EMAIL.test(values.email.trim())) {
      found.email = t('badEmail');
    }
    setErrors(found);
    const first = (['name', 'email', 'message'] as const).find((field) => found[field]);
    if (first) {
      form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus('sending');
    try {
      await submitInquiry({
        ...values,
        name: values.name.trim(),
        company: values.company.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      });
      setStatus('sent');
    } catch {
      setStatus('failed');
    }
  };

  const errorText = (field: Field) =>
    errors[field] && (
      <small className="field-error" id={`${id}-${field}-error`}>
        {errors[field]}
      </small>
    );

  const fieldProps = (field: Field) => ({
    id: `${id}-${field}`,
    name: field,
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${id}-${field}-error` : undefined,
  });

  const input = (field: Field, label: ReactNode, type = 'text') => (
    <div className="field">
      <label htmlFor={`${id}-${field}`}>{label}</label>
      <input
        {...fieldProps(field)}
        type={type}
        value={values[field]}
        autoComplete={field === 'company' ? 'organization' : field}
        required={field !== 'company'}
        maxLength={field === 'email' ? 254 : 160}
        onChange={(event) => set(field, event.target.value)}
      />
      {errorText(field)}
    </div>
  );

  return (
    <section
      className={embedded ? 'section contact contact-embedded' : 'section contact'}
      data-contact
    >
      <div className="contact-intro">
        <Heading tabIndex={-1}>{t('contactTitle')}</Heading>
      </div>
      {status === 'sent' ? (
        <div ref={feedback} className="contact-success" role="status" tabIndex={-1}>
          <Icon name="check" />
          <p>{t('sent')}</p>
          <button
            className="text-link"
            type="button"
            onClick={() => {
              setValues({ name: '', company: '', email: '', topic: initialTopic, message: '' });
              setStatus('idle');
            }}
          >
            {t('sendAnother')}
          </button>
        </div>
      ) : (
        <form
          ref={form}
          className="contact-form"
          noValidate
          onSubmit={submit}
          aria-busy={status === 'sending'}
        >
          <fieldset disabled={status === 'sending'} className="contact-fields">
            <legend className="sr-only">{t('contactTitle')}</legend>
            {input('name', t('name'))}
            {input('email', t('email'), 'email')}
            {input(
              'company',
              <>
                {t('companyField')} <span className="field-optional">{t('optional')}</span>
              </>,
            )}
            <div className="field">
              <label htmlFor={`${id}-topic`}>{t('topic')}</label>
              <select
                {...fieldProps('topic')}
                value={values.topic}
                onChange={(event) => set('topic', event.target.value)}
              >
                <option value={OTHER}>{t('otherTopic')}</option>
                {content.solutions.map((solution) => (
                  <option key={solution.slug} value={solution.slug}>
                    {solution.text.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="field wide">
              <label htmlFor={`${id}-message`}>{t('message')}</label>
              <textarea
                {...fieldProps('message')}
                rows={4}
                value={values.message}
                required
                maxLength={5000}
                onChange={(event) => set('message', event.target.value)}
              />
              {errorText('message')}
            </div>
            {status === 'failed' && (
              <p className="form-error wide" role="alert">
                {t('sendFailed')}
              </p>
            )}
            <button type="submit" className="button primary">
              <StableLabel
                labels={[t('send'), t('sending')]}
                current={status === 'sending' ? t('sending') : t('send')}
              />
            </button>
          </fieldset>
        </form>
      )}
    </section>
  );
}
