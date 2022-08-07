import { useState } from "react";

function UserSearch({onSubmit}) {
    const [email, setEmail] = useState("");

    return (
        <form onSubmit={(event) => {event.preventDefault(); onSubmit(email);}} autocomplete="off">
            <label for="user_email">Email</label>
            <input type="text" id="user_email" onChange={(e) => {setEmail(e.target.value)}}></input>
            <input type="submit" value="Submit"></input>
        </form>
    )
}

export default UserSearch;