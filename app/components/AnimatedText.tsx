'use client';

import { useEffect, useState } from 'react';

type Props = {
  text: string;
  delay?: number;
  className?: string;
};

export function AnimatedText({ text, delay = 0.05, className = '' }: Props) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length && isAnimating) {
      const timeout = setTimeout(() => {
        setDisplayedText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay * 1000);

      return () => clearTimeout(timeout);
    } else if (currentIndex >= text.length) {
      setIsAnimating(false);
    }
  }, [currentIndex, delay, isAnimating, text]);

  useEffect(() => {
    // Reset animation when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    setIsAnimating(true);
  }, [text]);

  return (
    <span className={className}>
      {displayedText}
      {isAnimating && <span className="animate-blink">|</span>}
    </span>
  );
} 