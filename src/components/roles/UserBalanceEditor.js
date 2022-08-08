import { get, ref, set } from "firebase/database";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";
import { useContext, useState } from "react";
import {UserContext} from "../../contexts/UserContext";
import UserSearch from "./UserSearch";

const functions = getFunctions();
if (window.location.hostname === "localhost") {
    connectFunctionsEmulator(functions, "localhost", 5001);
}
const getUidFromEmail = httpsCallable(functions, 'getUidFromEmail');
const addBalanceChange = httpsCallable(functions, 'addBalanceChange');

function UserBalanceEditor() {
    const [recordsList, setRecordsList] = useState([]);
    const [waiting, setWaiting] = useState(false);
    const [isPlaceholder, setIsPlaceholder] = useState(false);
    const [balAmount, setBalAmount] = useState(null);
    const [email, setEmail] = useState(null);
    const [uid, setUid] = useState(null);

    // for change balance form
    const [balanceChangeAmount, setBalanceChangeAmount] = useState(0);
    const [balanceChangeDescription, setBalanceChangeDescription] = useState("");

    const db = useContext(UserContext).db;
    function email_id(email) {
        return email.replace(/\./g, "_");
    }

    const getUserData = async () => {
        // get user data
        let userRef = isPlaceholder? ref(db, 'pacc/' + uid + "/balance") : ref(db, 'users/' + uid + "/balance");
        let balance;
        await get(userRef).then((snapshot) => {
            if (snapshot.exists())
                balance = snapshot.val();
            else {
                // user doesnt exist
                balance = {amount: 0};
            }
        });

        // configure balance list
        let rList = [];
        Object.keys(balance?.records ?? {}).map((key) => {
            const rec = balance.records[key];
            rList.push({time: key, record: rec});
        });

        rList.sort((a, b) => {
            return b.time - a.time;
        })
        await setBalAmount(balance.amount);
        await setRecordsList(rList);
    }

    function handleSubmit(em) {
        console.log(em);
        setEmail(em);
        setWaiting(true);
        getUidFromEmail(em).then(async (res) => {
            console.log(res.data);
            if (res.data.error != null) {
                setWaiting(false);
                return;
            }
            let u = res.data.value ?? email_id(em);
            let placeholder = res.data.value == null;
            await setIsPlaceholder(placeholder);
            await setUid(u);
            await getUserData();
            await setWaiting(false);
        })
    }

    function handleBalanceChangeSubmit() {
        setWaiting(true);
        addBalanceChange({uid: uid, amount: balanceChangeAmount, description: balanceChangeDescription, isPlaceholder: isPlaceholder}).then(async (res) => {
            await getUserData();
            await setWaiting(false);
        });
    }

    return (
        <div>
            <UserSearch disabled={waiting} onSubmit={handleSubmit}></UserSearch>
            {email && <h2>{email}</h2>}
            {balAmount != null && <h3>balance: {balAmount}</h3>}
            {isPlaceholder && <p>Warning: An account with this email does not exist yet, balance history will be transferred upon account creation</p>}
            <h2>Balance Records</h2>
            <form onSubmit={(event) => {event.preventDefault(); handleBalanceChangeSubmit();}} autocomplete="off">
                <table>
                    <tr>
                        <th>Time</th>
                        <th>Amount</th>
                        <th>Description</th>
                    </tr>
                    <tr>
                        <td>
                            Add New:
                        </td>
                        <td>
                            <input type="number" placeholder="amount" onChange={(e) => {setBalanceChangeAmount(e.target.value)}}></input>
                        </td>
                        <td>
                            <input type="text" placeholder="description" onChange={(e) => {setBalanceChangeDescription(e.target.value)}}></input>
                        </td>
                        <td>
                            <input type="submit" value="Add" disabled={waiting}></input>
                        </td>
                    </tr>
                    {recordsList.map((rec) => {
                        let date = new Date(parseInt(rec.time));
                        return <tr>
                            <td>{date.toLocaleString()}</td>
                            <td>{rec.record.amount}</td>
                            <td>{rec.record.description}</td>
                        </tr>
                    })}
                </table>
            </form>
        </div>
    )
}

export default UserBalanceEditor;