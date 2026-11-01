import { useEffect, useEffectEvent, useRef, useState } from 'react';

const drum = ' 0123456789';
const after = (char: string) => drum[(drum.indexOf(char) + 1) % drum.length]!;
const stepMs = () =>
  Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--digit-step'));

type RollingDigitProps = {
  char: string;
  spinning: boolean;
  settleSteps: number;
  onSettled: () => void;
};

export const RollingDigit = ({ char, spinning, settleSteps, onSettled }: RollingDigitProps) => {
  const [frame, setFrame] = useState({ shown: ' ', previous: ' ', flips: 0 });
  const shown = useRef(' ');
  const notifySettled = useEffectEvent(onSettled);

  useEffect(() => {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const flipTo = (next: string) => {
      const previous = shown.current;
      shown.current = next;
      setFrame((current) => ({
        shown: next,
        previous,
        flips: current.flips + 1,
      }));
    };

    if (reducedMotion.matches) {
      shown.current = char;
      setFrame((current) => ({ ...current, shown: char, previous: char }));
      if (!spinning) notifySettled();
      return undefined;
    }

    let steps = 0;
    const timer = setInterval(() => {
      if (!spinning && steps >= settleSteps && shown.current === char) {
        clearInterval(timer);
        notifySettled();
        return;
      }
      flipTo(after(shown.current));
      steps += 1;
    }, stepMs());
    return () => clearInterval(timer);
  }, [char, spinning, settleSteps]);

  return (
    <span className="digit" aria-hidden="true">
      {frame.flips > 0 && (
        <span key={`out-${frame.flips}`} className="digit-card digit-out">
          {frame.previous}
        </span>
      )}
      <span key={`in-${frame.flips}`} className={`digit-card${frame.flips > 0 ? ' digit-in' : ''}`}>
        {frame.shown}
      </span>
    </span>
  );
};
