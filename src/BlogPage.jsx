import { useEffect, useRef } from 'react';
import blogMarkup from './blog-markup.html?raw';
import './blog.css';

export default function BlogPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = blogMarkup;
  }, []);

  return <div ref={containerRef} />;
}
