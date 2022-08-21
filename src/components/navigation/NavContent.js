import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { LoginButton } from "./LoginButton";
import Cart from "../cart/Cart";
import './NavBar.css';
import { ArrowDropDown, ShoppingCart } from '@mui/icons-material';

function NavButton({className, to, name}) {
    if (!className) {
        className = ""
    }
    return <NavLink className={({isActive}) => "navButton " + className + (isActive && " selected")} to={to}>
        <span class="navSpan">{name}</span>
    </NavLink>
}


function NavContent() {
    const [open, setOpen] = useState(false);
    return (
        <UserContext.Consumer>
            {({isLoaded, user}) => (
                <>
                    <NavButton to="../" name="HOME"/>
                    {user && <NavButton to="../store" name="STORE"/>}
                    {user && <NavButton to="../orders" name="ORDERS"/>}

                    <div style={{flexGrow: 1}}/> {/*Pushes everything to the sides*/}

                    <div class="dropdown">
                        <a class="navButton roleButton">
                            <span class="navSpan">ADMIN</span><ArrowDropDown sx={{fontSize: 25, verticalAlign: "middle"}}/>
                        </a>
                        <div class="dropdown-content">
                            <NavButton className="roleButton" to="../balance_editor" name="BALANCE EDITOR"/>
                            <NavButton className="roleButton" to="../role_editor" name="ROLE EDITOR"/>
                        </div>
                    </div>
                    
                    <LoginButton isLoaded={isLoaded} user={user}/>

                    <button class="navButton roleButton" onClick={(e) => setOpen(true)}>
                        <ShoppingCart sx={{fontSize: 25, verticalAlign: "middle"}}/>
                    </button>

                    <Cart open={open} setOpen={setOpen}/>
                </>
            )}
        </UserContext.Consumer>
    )
}

export default NavContent;