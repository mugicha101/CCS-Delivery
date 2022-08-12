import React from "react";
export const UserContext = React.createContext({
    isLoaded: false, // true if auth state is known
    user: null, // user object
    data: null, // user data from firebase
    updateData: null, //function to set data
    db: null, // firebase realtime database reference
    functions: null, // firebase functions
})