import { Link } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { LoginButton } from "./LoginButton";
import './NavBar.css';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';


function NavContent() {
    return (
        <UserContext.Consumer>
            {({isLoaded, user}) => (
                <>
                    <Link class="navButton" to="../">
                        <span class="navSpan">HOME</span>
                    </Link>
                    {user && <Link class="navButton" to="../store">
                        <span class="navSpan">STORE</span>
                    </Link>}
                    {user && <Link class="navButton" to="../cart">
                        <span class="navSpan">CART</span>
                    </Link>}

                    <div style={{flexGrow: 1}}/>

                    <div class="dropdown">
                        <a class="navButton roleButton">
                            <span class="navSpan">ADMIN</span><ArrowDropDownIcon sx={{fontSize: 25, verticalAlign: "middle"}}/>
                        </a>
                        <div class="dropdown-content">
                            <Link class="navButton roleButton" to="../balance_editor">
                                <span class="navSpan">BALANCE EDITOR</span>
                            </Link>
                            <Link class="navButton roleButton" to="../balance_editor">
                                <span class="navSpan">ROLE EDITOR</span>
                            </Link>
                        </div>
                    </div>
                    
                    <LoginButton isLoaded={isLoaded} user={user}/>
                </>
            )}
        </UserContext.Consumer>
    )
}

export default NavContent;