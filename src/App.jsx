import { useEffect, useMemo, useState } from 'react';

function useLegacyPage(path) {
  const [content, setContent] = useState('');

  useEffect(() => {
    let mounted = true;
    const injected = [];

    const load = async () => {
      const res = await fetch(path);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      document.title = doc.title || 'Tukan Web Studio';

      doc.head.querySelectorAll('link, style').forEach((node) => {
        const clone = node.cloneNode(true);
        document.head.appendChild(clone);
        injected.push(clone);
      });

      doc.body.querySelectorAll('script').forEach((script) => {
        const scriptTag = document.createElement('script');
        if (script.textContent) {
          scriptTag.textContent = script.textContent;
        }
        document.body.appendChild(scriptTag);
        injected.push(scriptTag);
        script.remove();
      });

      let bodyHtml = doc.body.innerHTML;
      bodyHtml = bodyHtml.replaceAll('href="index.html"', 'href="/"');
      bodyHtml = bodyHtml.replaceAll('href="blog.html"', 'href="/blog"');

      if (mounted) {
        setContent(bodyHtml);
      }
    };

    load();

    return () => {
      mounted = false;
      injected.forEach((node) => node.remove());
    };
  }, [path]);

  return content;
}

export function App() {
  const isBlog = useMemo(() => window.location.pathname === '/blog', []);
  const html = useLegacyPage(isBlog ? '/legacy/blog.html' : '/legacy/index.html');

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
