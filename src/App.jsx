import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './pages/Admin/AdminLayout';
import ContentAudit from './pages/Admin/ContentAudit';
import ContentManagement from './pages/Admin/ContentManagement';
import TopicManagement from './pages/Admin/TopicManagement';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/topic" replace />} />
          <Route path="topic" element={<TopicManagement />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="audit" element={<ContentAudit />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
