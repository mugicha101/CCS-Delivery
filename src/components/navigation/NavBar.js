import React, {useState} from 'react';
import Dropdown from './Dropdown';
import Tabs from './Tabs';
import {handleLogin} from './login';
import './NavBar.css';

import {GoogleAuthProvider, getAuth, onAuthStateChanged} from 'firebase/auth';
import {app} from '../../firebase.js'

function NavBar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    return (<div id="NavBar">
        <Tabs />
        <Dropdown />
    </div>)
}

export default NavBar;