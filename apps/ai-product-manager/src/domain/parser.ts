import type { Task } from '../domain';

export function analyze(source: string): Task[] {
  let epic = 'Общие требования';
  let previous: Task | undefined;
  const tasks: Task[] = [];
  const seen = new Map<string, Task>();
  for (const match of source.matchAll(/[^\r\n]+/g)) {
    const raw = match[0];
    const line = raw.trim();
    if (!line) continue;
    const criterion = /^(?:[-*•]\s*)?(?:критерий|критерии|проверка)\s*:\s*(.*)$/i.exec(line);
    if (criterion) {
      const text = criterion[1]?.trim();
      if (text && previous && !previous.criteria.includes(text)) previous.criteria.push(text);
      continue;
    }
    const heading = /^(?:#{1,6}\s+(.+)|([^.!?]{2,100}):)$/.exec(line);
    if (heading) {
      epic = (heading[1] ?? heading[2] ?? epic).trim();
      previous = undefined;
      continue;
    }
    const marker = /^(?:[-*•]\s+|\d+[.)]\s+)/.exec(line)?.[0] ?? '';
    const text = line.slice(marker.length);
    const lineStart = match.index + raw.indexOf(line) + marker.length;
    let cursor = 0;
    for (const sentence of text.split(/(?<=[.!?])\s+/)) {
      const position = text.indexOf(sentence, cursor);
      cursor = position + sentence.length;
      const title = sentence.trim();
      if (!title) continue;
      const key = `${epic}:${title}`;
      const existing = seen.get(key);
      if (existing) {
        previous = existing;
        continue;
      }
      if (tasks.length >= 200)
        throw new Error(
          'В документе больше 200 требований. Разделите его на несколько документов.',
        );
      const start = lineStart + position + sentence.indexOf(title);
      previous = {
        id: `task-${tasks.length + 1}`,
        epic,
        title,
        priority: /ошиб|занят|недоступ|обязательн/i.test(title) ? 'high' : 'medium',
        criteria: [],
        source: { start, end: start + title.length },
        version: 0,
      };
      seen.set(key, previous);
      tasks.push(previous);
    }
  }
  return tasks;
}
