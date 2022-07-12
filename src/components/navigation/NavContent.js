import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { handleLogin } from "./login";
import { app } from '../../firebase.js';
import './NavBar.css';

function NavContent() {
    return (
        <UserContext.Consumer>
            {(user) => (
                <div id="NavContent">
                    <li id="navItem">
                        <Link id="navButton" to="../">
                            <span id="navSpan">HOME</span>
                        </Link>
                    </li>
                    {user && <li id="navItem">
                        <Link id="navButton" to="../store">
                            <span id="navSpan">STORE</span>
                        </Link>
                    </li>}
                    <li id="navItem">
                        <div id="navButton" onClick={(e) => handleLogin(e)}>
                            <span id="navSpan">{user? "SIGN OUT" : "SIGN IN"}</span>
                        </div>
                    </li>
                </div>
            )}
        </UserContext.Consumer>
    )
}

export default NavContent;