import {GoogleAuthProvider, signInWithPopup, getAuth, signInWithRedirect, getRedirectResult, onAuthStateChanged, reload} from 'firebase/auth';
import { getDatabase, ref, get, set, child } from "firebase/database";
import {app} from '../../firebase.js'

const provider = new GoogleAuthProvider();
const auth = getAuth();

const db = getDatabase();
const dbRef = ref(db);

let user = auth.currentUser? auth.currentUser : null;

onAuthStateChanged(auth, (u) => {
  if (u) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      // ...
      user = u;
  } else {
      // User is signed out
      // ...
      user = null;
  }
});

function set_user_data(user, data) {
  set(ref(db, 'users/' + user.uid), data);
}

async function get_user_data(user) {
  get(ref(db, 'users/' + user.uid)).then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val());
    } else {
      return null;
    }
  })
}

function handleLogin(e) {
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
  });
  window.location.reload();
}

function LoginButton() {
  return (
    <div>
        <button id="loginButton" onClick={(e) => handleLogin(e)}>
            {user? "Logout" : "Login"}
        </button>
        <img src={user? user.picture : ""}></img>
        <h3>{user? user.name : ""}</h3>
    </div>
  );
}

export {handleLogin};