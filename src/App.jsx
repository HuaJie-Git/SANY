import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './pages/Admin/AdminLayout';
import ContentAudit from './pages/Admin/ContentAudit';
import ContentManagement from './pages/Admin/ContentManagement';
import TopicManagement from './pages/Admin/TopicManagement';
import CommentManagement from './pages/Admin/CommentManagement';
import QuickLinkSettings from './pages/Admin/QuickLinkSettings';
import RoleWorkbenchSettings from './pages/Admin/RoleWorkbenchSettings';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/topic" replace />} />
          <Route path="topic" element={<TopicManagement />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="audit" element={<ContentAudit />} />
          <Route path="comments" element={<CommentManagement />} />
          <Route path="quick-links" element={<QuickLinkSettings />} />
          <Route path="role-workbench" element={<RoleWorkbenchSettings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
