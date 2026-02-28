import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage';
import BlogPage from './BlogPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
