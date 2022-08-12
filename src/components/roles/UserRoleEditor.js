import { get, ref } from "firebase/database";
import { httpsCallable } from "firebase/functions";
import { useContext, useState } from "react";
import { UserContext } from "../../contexts/UserContext";
import UserSearch from "./UserSearch";

function UserRoleEditor() {
    const getUidFromEmail = httpsCallable(useContext(UserContext).functions, 'getUidFromEmail');
    const setUserRole = httpsCallable(useContext(UserContext).functions, 'setUserRole');

    const [waiting, setWaiting] = useState(false);
    const [role, setRole] = useState(null);
    const [email, setEmail] = useState(null);
    const [uid, setUid] = useState(null);
    const [formRole, setFormRole] = useState(role);

    const db = useContext(UserContext).db;

    const getUserData = async (uid) => {
        // get user data
        let roleRef = ref(db, 'users/' + uid + "/role");
        await get(roleRef).then(async (snapshot) => {
            if (snapshot.exists()) {
                setRole(snapshot.val());
                setFormRole(snapshot.val());
            } else {
                // user doesnt exist
                setRole(null);
                setRole(null);
            }
        });
    }
    
    const handleSubmit = async (em) => {
        setEmail(em);
        setWaiting(true);
        await getUidFromEmail(em).then(async (res) => {
            if (res.data.error != null)
                return;
            let u = res.data.value;
            setUid(u);
            if (u) await getUserData(u);
        });
        setWaiting(false);
    }

    return (
        <div>
            <UserSearch disabled={waiting} onSubmit={handleSubmit}></UserSearch>
            {waiting && <h2>loading</h2>}
            {!waiting && uid == null && email != null && <p>Error: An account with this email does not exist yet</p>}
            {!waiting && uid && <>
                {email && <h2>{email}</h2>}
                {role != null && <h3>role: {role}</h3>}
                {uid != null && email != null &&
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        setWaiting(true);
                        await setUserRole({uid: uid, role: formRole});
                        await getUserData(uid);
                        setWaiting(false);
                    }}>
                        <label htmlFor="role">Role: </label>
                        <select id="role" onChange={(e) => {setFormRole(e.target.value)}}>
                            <option value="user" selected={role==="user"}>user</option>
                            <option value="accountant" selected={role==="accountant"}>accountant</option>
                            <option value="service" selected={role==="service"}>service</option>
                            <option value="admin" selected={role==="admin"}>admin</option>
                        </select>
                        {formRole != role && <input type="submit" disabled={waiting} value="Set"></input>}
                    </form>
                }
            </>}
        </div>)
}

export default UserRoleEditor;