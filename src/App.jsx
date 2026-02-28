import { Navigate, Route, Routes } from 'react-router-dom';
import { BlogPage } from './pages/BlogPage';
import { LandingPage } from './pages/LandingPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
