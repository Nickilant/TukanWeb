import { useEffect, useRef } from 'react';
import landingMarkup from './landing-markup.html?raw';
import { initLanding } from './landing-script';
import './landing.css';

export default function LandingPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    document.body.classList.add('landing-page');
    document.body.classList.remove('blog-page');
    containerRef.current.innerHTML = landingMarkup;
    const cleanup = initLanding();
    return () => {
      cleanup?.();
      document.body.classList.remove('landing-page');
    };
  }, []);

  return <div ref={containerRef} />;
}
