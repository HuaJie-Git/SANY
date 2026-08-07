import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import './index.css';

// basename: localhost 开发时为 '/'，GitHub Pages 构建时为 '/SANY/'
const basename = import.meta.env.PROD ? (import.meta.env.BASE_URL || '/') : '/';

function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
