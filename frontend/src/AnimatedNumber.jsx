import { useLanguage } from "./i18n/LanguageContext";
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

export default function AnimatedNumber({ value, animationValue = value, decimals = 0, suffix = "", delay = 0 }) {
  const { locale, t } = useLanguage();
  const element = useRef(null);
  const [number, setNumber] = useState(0);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame;
    let observer;
    const finish = () => {
      cancelAnimationFrame(frame);
      setNumber(value);
      observer?.disconnect();
    };
    const onPreference = () => { if (preference.matches) finish(); };

    if (preference.matches || !("IntersectionObserver" in window)) {
      finish();
      return;
    }

    observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now() + delay;
      const tick = now => {
        const progress = Math.min(1, Math.max(0, (now - start) / 2200));
        const eased = 1 - Math.pow(1 - progress, 3);
        const precision = 10 ** decimals;
        setNumber(progress === 1 ? value : Math.floor(animationValue * eased * precision) / precision);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    observer.observe(element.current);
    preference.addEventListener("change", onPreference);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      preference.removeEventListener("change", onPreference);
    };
  }, [value, animationValue, decimals, delay]);

  const format = amount => amount.toLocaleString(locale, {
    minimumFractionDigits: amount === 0 ? 0 : decimals,
    maximumFractionDigits: decimals,
  }) + t(suffix);

  return (
    <strong ref={element} className="animated-number" aria-label={format(value)}>
      <span className="number-reserve" aria-hidden="true">{format(Math.max(value, animationValue))}</span>
      <span className="number-value" aria-hidden="true">{format(number)}</span>
    </strong>
  );
}

AnimatedNumber.propTypes = {
  value: PropTypes.number.isRequired,
  animationValue: PropTypes.number,
  decimals: PropTypes.number,
  suffix: PropTypes.string,
  delay: PropTypes.number,
};
