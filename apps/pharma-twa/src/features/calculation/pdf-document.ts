const encoder = new TextEncoder();
const pageWidth = 595.28;
const pageHeight = 841.89;

function pdfText(value: string): string {
  return (
    'FEFF' +
    Array.from(value, (character) => character.charCodeAt(0).toString(16).padStart(4, '0')).join('')
  );
}

export function createPdfDocument(
  jpeg: Uint8Array,
  pixelWidth: number,
  pixelHeight: number,
): Uint8Array<ArrayBuffer> {
  if (
    !Number.isInteger(pixelWidth) ||
    !Number.isInteger(pixelHeight) ||
    pixelWidth < 1 ||
    pixelHeight < 1 ||
    pixelWidth > 8192 ||
    pixelHeight > 8192 ||
    jpeg.length < 4 ||
    jpeg[0] !== 255 ||
    jpeg[1] !== 216 ||
    jpeg[jpeg.length - 2] !== 255 ||
    jpeg[jpeg.length - 1] !== 217
  ) {
    throw new Error('Не удалось подготовить изображение для PDF.');
  }
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0];
  let length = 0;
  const append = (value: string | Uint8Array) => {
    const bytes = typeof value === 'string' ? encoder.encode(value) : value;
    chunks.push(bytes);
    length += bytes.length;
  };
  const object = (id: number, value: string) => {
    offsets[id] = length;
    append(`${id} 0 obj\n${value}\nendobj\n`);
  };
  append('%PDF-1.4\n%');
  append(new Uint8Array([226, 227, 207, 211]));
  append('\n');
  object(1, '<< /Type /Catalog /Pages 2 0 R >>');
  object(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  object(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}]
/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
  );
  offsets[4] = length;
  append(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pixelWidth}
/Height ${pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8
/Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
  append(jpeg);
  append('\nendstream\nendobj\n');
  const content = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ\n`;
  object(5, `<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream`);
  object(6, `<< /Title <${pdfText('Практика. Динамика значений')}> /Creator (Praktika) >>`);
  const crossReference = length;
  append('xref\n0 7\n0000000000 65535 f \n');
  for (let id = 1; id <= 6; id += 1) {
    append(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`);
  }
  append(`trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>
startxref\n${crossReference}\n%%EOF\n`);
  const result = new Uint8Array(length);
  let position = 0;
  for (const chunk of chunks) {
    result.set(chunk, position);
    position += chunk.length;
  }
  return result;
}
