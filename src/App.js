import { useEffect, useState } from 'react';
import { UserContext } from './contexts/UserContext';
import './App.css';
import { NavLink, Routes, Route } from 'react-router-dom';
import NavBar from './components/navigation/NavBar'

import Home from './components/Home';
import Store from './components/Store';

import {onAuthStateChanged, getAuth} from 'firebase/auth';

function App() {
  const auth = getAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (u) => {
      if (u) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          // ...
          setUser(u);
      } else {
          // User is signed out
          // ...
          setUser(null);
      }
    });
  }, [])

  return (
    <main>
      <UserContext.Provider value={user}>
        <NavBar />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/store" element={<Store />} />
        </Routes>
      </UserContext.Provider>
    </main>
  );
}

export default App;
