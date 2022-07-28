import {GoogleAuthProvider, signInWithPopup, getAuth, signInWithRedirect, reload} from 'firebase/auth';
import { getDatabase, ref, get, set, child } from "firebase/database";
import {app} from '../../firebase.js'

const provider = new GoogleAuthProvider();
const auth = getAuth();

const db = getDatabase();
const dbRef = ref(db);

function handleLogin(e, user) {
    if (user)
        handleSignOut(e);
    else
        handleSignIn(e);
}

function handleSignIn(e) {
    signInWithRedirect(auth, provider);
}

function handleSignOut(e) {
    auth.signOut().then(() => {
        // Sign-out successful.
    }).catch((error) => {
        // An error happened.
        console.log(error);
    });
    window.location.reload();
}

function LoginButton({isLoaded, user}) {
    let text;
    if (!isLoaded) {
        text = "LOADING";
    } else {
        text = user ? "SIGN OUT" : "SIGN IN";
    }
    return (
        <div class="navButton loginButton" onClick={(e) => handleLogin(e, user)}>
            <span class="navSpan">{text}</span>
        </div>
        // <div>
        
        //     <button id="loginButton" onClick={(e) => handleLogin(e)}>
        //         {user? "Logout" : "Login"}
        //     </button>
        //     <img src={user ? user.picture : ""}></img>
        //     <h3>{user ? user.name : ""}</h3>
        // </div>
    );
}

export { LoginButton };