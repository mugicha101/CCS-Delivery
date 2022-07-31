import { useEffect, useState } from 'react';
import { UserContext } from './contexts/UserContext';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/navigation/NavBar'
import { getDatabase, ref, get, set, child } from "firebase/database";

import Home from './components/Home';
import Store from './components/store/Store';

import {onAuthStateChanged, getAuth} from 'firebase/auth';

import { initializeApp } from 'firebase/app';
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
connectFunctionsEmulator(functions, "localhost", 5001);
const newUser = httpsCallable(functions, 'newUser');

const db = getDatabase();
const dbRef = ref(db);

function App() {
    const auth = getAuth();
    const [user, setUser] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [data, setData] = useState(null);

    useEffect(() => {
        onAuthStateChanged(auth, async (u) => {
            if (u) {
                setUser(u);
                get(ref(db, 'users/' + u.uid)).then((snapshot) => {
                    if (snapshot.exists()) {
                        console.log(snapshot.val());
                        setData(snapshot.val());
                    } else {
                        // CREATE NEW USER
                    }
                    newUser()
                    .then((result) => {
                        console.log("NEW USER RESULT:", result);
                    });
                });
            } else {
                setUser(null);
                setData(null);
            }
            setIsLoaded(true);
        });
    }, [])

    return (
        <main>
            <UserContext.Provider value={{isLoaded: isLoaded, user: user, data: data}}>
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
