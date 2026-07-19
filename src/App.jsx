import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import AdminLayout from './pages/Admin/AdminLayout';
import TopicManagement from './pages/Admin/TopicManagement';
import ContentManagement from './pages/Admin/ContentManagement';
import ContentAudit from './pages/Admin/ContentAudit';
import './index.css';

// basename: localhost 开发时为 '/'，GitHub Pages 构建时为 '/SANY/'
const basename = import.meta.env.PROD ? (import.meta.env.BASE_URL || '/') : '/';

function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/topic" replace />} />
          <Route path="topic" element={<TopicManagement />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="audit" element={<ContentAudit />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
