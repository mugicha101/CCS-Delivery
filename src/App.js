import { useEffect, useState } from 'react';
import { UserContext } from './contexts/UserContext';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/navigation/NavBar'
import { getDatabase, ref, get, set, child, connectDatabaseEmulator } from "firebase/database";

import Home from './components/Home';
import Store from './components/store/Store';
import Cart from './components/cart/Cart';

import {onAuthStateChanged, getAuth} from 'firebase/auth';

import { initializeApp } from 'firebase/app';
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import UserBalanceEditor from './components/roles/UserBalanceEditor';

const db = getDatabase();
if (window.location.hostname === "localhost" && window.location.port === "5000") {
    connectDatabaseEmulator(db, "localhost", 9000);
}

const functions = getFunctions();
if (window.location.hostname === "localhost" && window.location.port === "5000") {
    connectFunctionsEmulator(functions, "localhost", 5001);
}
const newUser = httpsCallable(functions, 'newUser');
const EMULATOR_DB_SETUP = httpsCallable(functions, 'EMULATOR_DB_SETUP');

// initialize emulator data
if (window.location.hostname === "localhost" && window.location.port === "5000") {
    get(ref(db, "store")).then((snap) => {
        if (!snap.exists()) {
            EMULATOR_DB_SETUP();
        }
    });
}

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
                        newUser()
                        .then((result) => {
                            console.log("NEW USER RESULT:", result);
                        });
                    }
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
            <UserContext.Provider value={{isLoaded: isLoaded, user: user, data: data, db: db}}>
                <NavBar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/store" element={<Store isLoaded={isLoaded} user={user} db={db}/>} />
                    <Route path="/cart" element={<Cart isLoaded={isLoaded} user={user} userData={data}/>} />
                    <Route path="/balance_editor" element={<UserBalanceEditor user={user} userData={data}/>} />
                </Routes>
            </UserContext.Provider>
        </main>
    );
}

export default App;
