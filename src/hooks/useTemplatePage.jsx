import { useEffect, useMemo, useState } from 'react';

function parseHtmlDocument(rawHtml) {
  return new DOMParser().parseFromString(rawHtml, 'text/html');
}

function normalizeBodyHtml(bodyHtml) {
  return bodyHtml
    .replaceAll('href="index.html"', 'href="/"')
    .replaceAll('href="blog.html"', 'href="/blog"');
}

export function useTemplatePage(rawHtml) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Tukan Web Studio');
  const [scripts, setScripts] = useState([]);

  const doc = useMemo(() => parseHtmlDocument(rawHtml), [rawHtml]);

  useEffect(() => {
    const injectedHeadNodes = [];

    setTitle(doc.title || 'Tukan Web Studio');

    doc.head.querySelectorAll('link, style').forEach((node) => {
      const clone = node.cloneNode(true);
      document.head.appendChild(clone);
      injectedHeadNodes.push(clone);
    });

    const nextBodyHtml = normalizeBodyHtml(doc.body.innerHTML);
    const nextScripts = Array.from(doc.body.querySelectorAll('script')).map((script) => ({
      textContent: script.textContent || ''
    }));

    setContent(nextBodyHtml);
    setScripts(nextScripts);

    return () => {
      injectedHeadNodes.forEach((node) => node.remove());
    };
  }, [doc]);

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    if (!content || scripts.length === 0) {
      return undefined;
    }

    const injectedScriptNodes = [];
    const frameId = requestAnimationFrame(() => {
      scripts.forEach((script) => {
        const scriptTag = document.createElement('script');
        if (script.textContent) {
          scriptTag.textContent = script.textContent;
        }
        document.body.appendChild(scriptTag);
        injectedScriptNodes.push(scriptTag);
      });
    });

    return () => {
      cancelAnimationFrame(frameId);
      injectedScriptNodes.forEach((node) => node.remove());
    };
  }, [content, scripts]);

  return content;
}
