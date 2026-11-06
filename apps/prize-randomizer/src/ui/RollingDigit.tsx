import { useEffect, useEffectEvent, useRef, useState } from 'react';

const drum = ' 0123456789';
const after = (char: string) => drum[(drum.indexOf(char) + 1) % drum.length]!;
const stepMs = () =>
  Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--digit-step'));

type RollingDigitProps = {
  char: string;
  spinning: boolean;
  animate: boolean;
  settleSteps: number;
  onSettled: () => void;
};

export const RollingDigit = ({
  char,
  spinning,
  animate,
  settleSteps,
  onSettled,
}: RollingDigitProps) => {
  const [frame, setFrame] = useState({ shown: char, previous: char, flips: 0 });
  const shown = useRef(char);
  const hasSpun = useRef(false);
  const element = useRef<HTMLSpanElement>(null);
  const notifySettled = useEffectEvent(onSettled);

  useEffect(() => {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    if (spinning) hasSpun.current = true;
    const flipTo = (next: string) => {
      const previous = shown.current;
      shown.current = next;
      setFrame((current) => ({
        shown: next,
        previous,
        flips: current.flips + 1,
      }));
    };

    if (!animate || !hasSpun.current || reducedMotion.matches) {
      shown.current = char;
      setFrame({ shown: char, previous: char, flips: 0 });
      if (!spinning) {
        hasSpun.current = false;
        notifySettled();
      }
      return undefined;
    }

    let steps = 0;
    let active = true;
    const timer = setInterval(() => {
      if (!spinning && steps >= settleSteps && shown.current === char) {
        clearInterval(timer);
        const animations = element.current?.getAnimations({ subtree: true }) ?? [];
        void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
          if (!active) return;
          hasSpun.current = false;
          notifySettled();
        });
        return;
      }
      flipTo(after(shown.current));
      steps += 1;
    }, stepMs());
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [char, spinning, animate, settleSteps]);

  return (
    <span className="digit" ref={element} aria-hidden="true">
      {animate && frame.flips > 0 && (
        <span key={`out-${frame.flips}`} className="digit-card digit-out">
          {frame.previous}
        </span>
      )}
      <span
        key={`in-${frame.flips}`}
        className={`digit-card${animate && frame.flips > 0 ? ' digit-in' : ''}`}
      >
        {animate ? frame.shown : char}
      </span>
    </span>
  );
};
