import React, {useState} from 'react';
import {handleLogin} from "./login";
import {onAuthStateChanged, GoogleAuthProvider, getAuth} from 'firebase/auth';
import {app} from '../../firebase.js';
import './NavBar.css';

const provider = new GoogleAuthProvider();
const auth = getAuth();

function NavContent() {
    const [user, setUser] = useState(auth.currentUser? auth.currentUser : null);
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            // ...
            setUser(user);
        } else {
            // User is signed out
            // ...
            setUser(null);
        }
    });
    
    return (<div id="NavContent">
        <li id="navItem"><a id="navButton" href="../"><span id="navSpan">HOME</span></a></li>
        <li id="navItem"><a id="navButton" href="../store"><span id="navSpan">STORE</span></a></li>
        <li id="navItem"><div id="navButton" onClick={(e) => handleLogin(e)}><span id="navSpan">{user? "SIGN OUT" : "SIGN IN"}</span></div></li>
    </div>)
}

export default NavContent;