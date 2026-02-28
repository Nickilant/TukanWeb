import { useTemplatePage } from '../hooks/useTemplatePage';
import blogTemplate from '../templates/blog.html?raw';

export function BlogPage() {
  const html = useTemplatePage(blogTemplate);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
