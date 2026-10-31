import { useState } from 'react';
import { Icon } from '../ui/icons';

const questions = [
  { title: 'Какие предложения вам интереснее?', options: ['Впечатления', 'Вещи', 'Цифровое'] },
  { title: 'Как часто вы играете?', options: ['Каждый день', 'Несколько раз в неделю', 'Редко'] },
  { title: 'Как сообщать о новых предложениях?', options: ['Уведомлением', 'Не сообщать'] },
];

type Props = { done: boolean; busy: boolean; onComplete: () => void };

export function TaskQuiz({ done, busy, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  if (done)
    return (
      <div className="state-card done-card">
        <span className="result-symbol">
          <Icon name="check" />
        </span>
        <h2 className="reward-pill">+15 баллов</h2>
        <a className="primary" href="#/offers">
          К предложениям
        </a>
      </div>
    );

  return (
    <section className="task-card">
      {questions.map((question, index) => (
        <fieldset key={question.title}>
          <legend>
            {index + 1}. {question.title}
          </legend>
          {question.options.map((option, value) => (
            <label key={option} className="answer">
              <input
                type="radio"
                name={`question-${index}`}
                checked={answers[index] === value}
                onChange={() => setAnswers({ ...answers, [index]: value })}
                disabled={busy}
              />
              {option}
            </label>
          ))}
        </fieldset>
      ))}
      <button
        className="primary full"
        disabled={Object.keys(answers).length !== questions.length || busy}
        onClick={onComplete}
      >
        {busy ? 'Отправляем…' : 'Отправить'}
      </button>
    </section>
  );
}
