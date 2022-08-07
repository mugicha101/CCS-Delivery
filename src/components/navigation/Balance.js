import { UserContext } from '../../contexts/UserContext';
import './NavBar.css';

function Balance() {
    return (
        <UserContext.Consumer>
            {({user, data}) => (
            user && <div class="balance">
                <span class="navSpan">{data && data.balance != null? `balance: ${data.balance}` : "error"}</span>
            </div>
            )}
        </UserContext.Consumer>
)}

export default Balance;