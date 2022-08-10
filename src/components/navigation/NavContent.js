import { NavLink } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { LoginButton } from "./LoginButton";
import './NavBar.css';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

function NavButton({className, to, name}) {
    if (!className) {
        className = ""
    }
    return <NavLink className={({isActive}) => "navButton " + className + (isActive && " selected")} to={to}>
        <span class="navSpan">{name}</span>
    </NavLink>
}


function NavContent() {
    return (
        <UserContext.Consumer>
            {({isLoaded, user}) => (
                <>
                    <NavButton to="../" name="HOME"/>
                    {user && <NavButton to="../store" name="STORE"/>}
                    {user && <NavButton to="../cart" name="CART"/>}

                    <div style={{flexGrow: 1}}/> {/*Pushes everything to the sides*/}

                    <div class="dropdown">
                        <a class="navButton roleButton">
                            <span class="navSpan">ADMIN</span><ArrowDropDownIcon sx={{fontSize: 25, verticalAlign: "middle"}}/>
                        </a>
                        <div class="dropdown-content">
                            <NavButton className="roleButton" to="../balance_editor" name="BALANCE EDITOR"/>
                            <NavButton className="roleButton" to="../balance_editor" name="ROLE EDITOR"/>
                        </div>
                    </div>
                    
                    <LoginButton isLoaded={isLoaded} user={user}/>
                </>
            )}
        </UserContext.Consumer>
    )
}

export default NavContent;