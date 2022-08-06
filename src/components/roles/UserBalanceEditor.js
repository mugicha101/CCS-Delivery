import { get, ref } from "firebase/database";
import { useState } from "react";
import UserSearch from "./UserSearch";

function UserBalanceEditor() {
    const [target, setTarget] = useState();

    function handleSubmit(email) {
        console.log(email);
    }

    return (
        <UserSearch onSubmit={handleSubmit}></UserSearch>
    )
}

export default UserBalanceEditor;