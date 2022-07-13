import React from "react";
export const UserContext = React.createContext({
    isLoaded: false, //true if auth state is known
    user: null //user object
})