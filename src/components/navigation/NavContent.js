import { Link } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { LoginButton } from "./LoginButton";
import './NavBar.css';

function NavContent() {
    return (
        <UserContext.Consumer>
            {({isLoaded, user}) => (
                <div class="NavContent">
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
                    <li class="navItem">
                        <LoginButton isLoaded={isLoaded} user={user}/>
                    </li>
                </div>
            )}
        </UserContext.Consumer>
    )
}

export default NavContent;