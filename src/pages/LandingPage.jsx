import { useTemplatePage } from '../hooks/useTemplatePage';
import landingTemplate from '../templates/landing.html?raw';

export function LandingPage() {
  const html = useTemplatePage(landingTemplate);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
