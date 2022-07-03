import {useEffect, useState} from 'react';
import './App.css';
import { NavLink, Routes, Route } from 'react-router-dom';

import Home from './components/Home';
import Store from './components/Store';

function App() {
  return (
    <main>
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
      </Routes>
    </main>
  );
}

export default App;
