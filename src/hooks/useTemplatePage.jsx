import { useEffect, useMemo, useState } from 'react';

function parseHtmlDocument(rawHtml) {
  return new DOMParser().parseFromString(rawHtml, 'text/html');
}

export function useTemplatePage(rawHtml) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Tukan Web Studio');

  const doc = useMemo(() => parseHtmlDocument(rawHtml), [rawHtml]);

  useEffect(() => {
    const injectedNodes = [];

    setTitle(doc.title || 'Tukan Web Studio');

    doc.head.querySelectorAll('link, style').forEach((node) => {
      const clone = node.cloneNode(true);
      document.head.appendChild(clone);
      injectedNodes.push(clone);
    });

    let bodyHtml = doc.body.innerHTML;
    bodyHtml = bodyHtml.replaceAll('href="index.html"', 'href="/"');
    bodyHtml = bodyHtml.replaceAll('href="blog.html"', 'href="/blog"');
    setContent(bodyHtml);

    doc.body.querySelectorAll('script').forEach((script) => {
      const scriptTag = document.createElement('script');
      if (script.textContent) {
        scriptTag.textContent = script.textContent;
      }
      document.body.appendChild(scriptTag);
      injectedNodes.push(scriptTag);
    });

    return () => {
      injectedNodes.forEach((node) => node.remove());
    };
  }, [doc]);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return content;
}
