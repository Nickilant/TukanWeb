import { useEffect, useRef } from 'react';
import blogMarkup from './blog-markup.html?raw';
import './blog.css';

export default function BlogPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    document.body.classList.add('blog-page');
    document.body.classList.remove('landing-page');
    containerRef.current.innerHTML = blogMarkup;
    return () => {
      document.body.classList.remove('blog-page');
    };
  }, []);

  return <div ref={containerRef} />;
}
