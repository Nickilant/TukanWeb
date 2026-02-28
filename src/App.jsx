import { useEffect, useRef } from 'react';
import landingMarkup from './landing-markup.html?raw';
import { initLanding } from './landing-script';
import './landing.css';

function App() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    containerRef.current.innerHTML = landingMarkup;
    const cleanup = initLanding();
    return () => cleanup?.();
  }, []);

  return <div ref={containerRef} />;
}

export default App;
