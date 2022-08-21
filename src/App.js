import { useEffect, useState } from 'react';
import { UserContext } from './contexts/UserContext';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/navigation/NavBar'
import { getDatabase, ref, get, set, child, connectDatabaseEmulator } from "firebase/database";

import Home from './components/Home';
import Store from './components/store/Store';
import Cart from './components/cart/Cart';
import Orders from './components/orders/Orders';

import {onAuthStateChanged, getAuth} from 'firebase/auth';

import { initializeApp } from 'firebase/app';
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import UserBalanceEditor from './components/roles/UserBalanceEditor';
import UserRoleEditor from './components/roles/UserRoleEditor';
import { createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';

const db = getDatabase();
if (window.location.hostname === "localhost" && window.location.port === "5000") {
    connectDatabaseEmulator(db, "localhost", 9000);
    console.log("emulator database connected");
}

const functions = getFunctions();
if (window.location.hostname === "localhost" && window.location.port === "5000") {
    connectFunctionsEmulator(functions, "localhost", 5001);
    console.log("emulator functions connected");
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

const theme = createTheme({
    palette: {
      primary: {
        main: '#2F2963',
        dark: '#454372'
      },
      secondary: {
        main: '#5d6329',
      },
    },
  });

function App() {
    const auth = getAuth();
    const [user, setUser] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [data, setData] = useState(null);

    const updateData = async () => {
        if (user == null) {
            setData(null);
            return;
        }
        await get(ref(db, 'users/' + user.uid)).then((snapshot) => {
            if (snapshot.exists()) {
                setData(snapshot.val());
            } else {
                // CREATE NEW USER
                newUser();
            }
        });
    }

    useEffect(() => {
        onAuthStateChanged(auth, async (u) => {
            if (u) {
                setUser(u);
            } else {
                setUser(null);
            }
            setIsLoaded(true);
        });
    }, [])

    useEffect(() => {
        updateData();
    }, [user])

    return (
        <main>
            <ThemeProvider theme={theme}>
                <UserContext.Provider value={{isLoaded: isLoaded, user: user, data: data, db: db, updateData: updateData, functions: functions}}>
                    <NavBar />
                    <div class="wrapper">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/store" element={<Store isLoaded={isLoaded} user={user} db={db} updateData={updateData ?? function() {}}/>} />
                            <Route path="/cart" element={<Cart isLoaded={isLoaded} user={user} userData={data} updateData={updateData ?? function() {}}/>} />
                            <Route path="/orders" element={<Orders isLoaded={isLoaded} user={user} userData={data} updateData={updateData ?? function() {}}/>} />
                            <Route path="/balance_editor" element={<UserBalanceEditor user={user} userData={data}/>} />
                            <Route path="/role_editor" element={<UserRoleEditor user={user} userData={data}></UserRoleEditor>} />
                        </Routes>
                    </div>
                </UserContext.Provider>
            </ThemeProvider>
            
        </main>
    );
}

export default App;
