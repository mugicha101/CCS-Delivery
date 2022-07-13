import { useEffect, useState } from 'react';
import { UserContext } from './contexts/UserContext';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/navigation/NavBar'

import Home from './components/Home';
import Store from './components/Store';

import {onAuthStateChanged, getAuth} from 'firebase/auth';

function App() {
    const auth = getAuth();
    const [user, setUser] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        onAuthStateChanged(auth, (u) => {
            if (u) {
                setUser(u);
            } else {
                setUser(null)
            }
            setIsLoaded(true);
        });
    }, [])

    return (
        <main>
            <UserContext.Provider value={{isLoaded: isLoaded, user: user}}>
                <NavBar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/store" element={<Store isLoaded={isLoaded} user={user}/>} />
                </Routes>
            </UserContext.Provider>
        </main>
    );
}

export default App;
