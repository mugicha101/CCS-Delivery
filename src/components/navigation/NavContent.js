import { Link } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { LoginButton } from "./LoginButton";
import './NavBar.css';
import theme from '../../theme';

function NavContent() {
    return (
        <UserContext.Consumer>
            {({isLoaded, user}) => (
                <>
                    <li class="navItem">
                        <Link class="navButton" to="../">
                            <span class="navSpan">HOME</span>
                        </Link>
                    </li>
                    {user && <li class="navItem">
                        <Link class="navButton" to="../store">
                            <span class="navSpan">STORE</span>
                        </Link>
                    </li>}
                    <li style={{flexGrow: 1}}/>
                    <li class="loginItem">
                        <LoginButton isLoaded={isLoaded} user={user}/>
                    </li>
                </>
            )}
        </UserContext.Consumer>
    )
}

export default NavContent;