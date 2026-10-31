import {
  formatCalculationDate,
  formatCalculationDays,
  formatCalculationValue,
  type CalculationResult,
} from '../../domain/calculation';
import { calculationChartPoints } from './chart-data';
import { createPdfDocument } from './pdf-document';

const palette = {
  paper: '#ffffff',
  ink: '#1e2640',
  muted: '#58617c',
  accent: '#223dcc',
  line: '#d9deed',
};

function drawReport(context: CanvasRenderingContext2D, result: CalculationResult) {
  const text = (
    value: string,
    x: number,
    y: number,
    size = 12,
    weight = 400,
    color = palette.ink,
    alignment: CanvasTextAlign = 'left',
  ) => {
    context.fillStyle = color;
    context.font = `${weight} ${size}px "Golos Text"`;
    context.textAlign = alignment;
    context.fillText(value, x, y);
  };
  const rule = (y: number) => {
    context.strokeStyle = palette.line;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(48, y);
    context.lineTo(547, y);
    context.stroke();
  };
  context.fillStyle = palette.paper;
  context.fillRect(0, 0, 595.28, 841.89);
  text('Практика', 48, 58, 20, 600, palette.accent);
  text('Динамика значений', 48, 112, 28, 600);
  text(
    `${formatCalculationDate(result.startDate)} - ${formatCalculationDate(result.endDate)}`,
    48,
    142,
    12,
    400,
    palette.muted,
  );
  rule(164);
  const rows = [
    ['Начальная дата', formatCalculationDate(result.startDate)],
    ['Начальное значение', formatCalculationValue(result.startValue)],
    ['Конечная дата', formatCalculationDate(result.endDate)],
    ['Конечное значение', formatCalculationValue(result.endValue)],
  ];
  rows.forEach(([label, value], index) => {
    const y = 195 + index * 31;
    text(label!, 48, y, 12, 400, palette.muted);
    text(value!, 547, y, 13, 500, palette.ink, 'right');
  });
  rule(311);
  text('Результат', 48, 347, 18, 600);
  const metrics = [
    ['Интервал', formatCalculationDays(result.intervalDays)],
    ['Разница', formatCalculationValue(result.absoluteChange, true)],
    ['Изменение', `${formatCalculationValue(result.percentageChange, true)} %`],
  ];
  metrics.forEach(([label, value], index) => {
    const y = 380 + index * 31;
    text(label!, 48, y, 12, 400, palette.muted);
    text(value!, 547, y, 15, 600, palette.ink, 'right');
  });
  text('График значений', 48, 495, 18, 600);
  const bounds = { left: 75, right: 520, top: 550, bottom: 697 };
  const [first, second] = calculationChartPoints(result, bounds);
  context.lineWidth = 1;
  context.strokeStyle = palette.line;
  [bounds.top, bounds.bottom].forEach((y) => {
    context.beginPath();
    context.moveTo(bounds.left, y);
    context.lineTo(bounds.right, y);
    context.stroke();
  });
  text('0', 59, bounds.bottom + 4, 11, 400, palette.muted, 'right');
  context.strokeStyle = palette.accent;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(first.x, first.y);
  context.lineTo(second.x, second.y);
  context.stroke();
  [first, second].forEach((point, index) => {
    context.fillStyle = palette.accent;
    context.beginPath();
    context.arc(point.x, point.y, 4, 0, Math.PI * 2);
    context.fill();
    const alignment = index === 0 ? 'left' : 'right';
    text(
      formatCalculationValue(point.value),
      point.x,
      point.y - 13,
      12,
      500,
      palette.ink,
      alignment,
    );
    text(formatCalculationDate(point.date), point.x, 726, 11, 400, palette.muted, alignment);
  });
}

export async function createCalculationPdf(result: CalculationResult): Promise<Blob> {
  const fonts = await Promise.all(
    [400, 500, 600].map((weight) => document.fonts.load(`${weight} 16px "Golos Text"`, 'Практика')),
  );
  if (fonts.some((faces) => faces.length === 0)) {
    throw new Error('Шрифт не загрузился. Обновите страницу и повторите.');
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1191;
  canvas.height = 1684;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Не удалось подготовить график.');
  context.scale(canvas.width / 595.28, canvas.height / 841.89);
  drawReport(context, result);
  const image = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('PDF не подготовился.'))),
      'image/jpeg',
      0.96,
    );
  });
  if (image.type !== 'image/jpeg') throw new Error('PDF не подготовился.');
  const jpeg = new Uint8Array(await image.arrayBuffer());
  const bytes = createPdfDocument(jpeg, canvas.width, canvas.height);
  return new Blob([bytes], { type: 'application/pdf' });
}

export function downloadCalculationPdf(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'praktika-calculation.pdf';
  document.body.append(link);
  try {
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
