import React from 'react';
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom';
import AdminLayout from './pages/Admin/AdminLayout';
import ContentAudit from './pages/Admin/ContentAudit';
import ContentManagement from './pages/Admin/ContentManagement';
import TopicManagement from './pages/Admin/TopicManagement';
import CommentManagement from './pages/Admin/CommentManagement';
import QuickLinkSettings from './pages/Admin/QuickLinkSettings';
import RoleWorkbenchSettings from './pages/Admin/RoleWorkbenchSettings';

// 路径和默认重定向保持，使用 data router 支持工作台的离开保护。
const router = createHashRouter([{
  path: '/',
  element: <AdminLayout />,
  children: [
    { index: true, element: <Navigate to="/topic" replace /> },
    { path: 'topic', element: <TopicManagement /> },
    { path: 'content', element: <ContentManagement /> },
    { path: 'audit', element: <ContentAudit /> },
    { path: 'comments', element: <CommentManagement /> },
    { path: 'quick-links', element: <QuickLinkSettings /> },
    { path: 'role-workbench', element: <RoleWorkbenchSettings /> },
  ],
}]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
