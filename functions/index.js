const functions = require("firebase-functions");
const admin = require('firebase-admin');
const { auth } = require("firebase-admin");
const { user } = require("firebase-functions/v1/auth");
const { set } = require("firebase/database");
admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

const getRole = async (context) => {
    let userRef = admin.database().ref("users/" + context.auth.uid + "/role");
    let snap = await userRef.once("value");
    let userData = snap.val();
    return userData;
}

// performs a transaction
exports.transaction = functions.https.onCall(async (data, context) => {
    for (let item in data.items) {
        admin.database().ref("store/" + item.id).transaction(function(currentItem) {
            currentItem.amount -= item.amount;
        })
    }
});

// initialized new user's data in firebase if necessary (returns user's data)
exports.newUser = functions.https.onCall(async (data, context) => {
    // Checking that the user is authenticated.
    try {
        if (!context.auth) {
            // Throwing an HttpsError so that the client gets the error details.
            throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
                'while authenticated.');
        }
        let userRef = admin.database().ref("users/" + context.auth.uid);
        let snap = await userRef.once("value");
        let userData = snap.val();
        if (userData == null) {
            console.log("CREATE NEW USER");
            userRef.update({
                balance: {
                    amount: 0
                },
                name: context.auth.token.name || "",
                email: context.auth.token.email || "",
                role: "user",
                inventory: {
                    next_id: 0,
                }
            });
        }
    } catch (e) {
        return {error: e};
    }
});

exports.addToCart = functions.https.onCall(async (data={id: "", amount: 0}, context) => {
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
        'while authenticated.');
    }
    let userRef = admin.database().ref("users/" + context.auth.uid);
    let snap = await userRef.once("value");
    let userData = snap.val();
    if (userData == null)
        return;
    let itemRef = userRef.child("cart").child(data.id);
    itemRef.transaction(function(value) {
        return value + data.amount;
    })
});

exports.getUidFromEmail = functions.https.onCall(async (email, context) => {
    const validRoles = ["accountant", "admin", "service"];
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
        'while authenticated.');
    }

    // verify role of caller
    let role = await getRole(context);
    if (role == null || !validRoles.includes(role))
        return {error: "role not valid"};
    
    // search for email
    let allUsersRef = admin.database().ref("users");
    snap = await allUsersRef.once("value");
    let allUsersData = snap.val();
    if (allUsersData == null)
        return {error: "failed to retrieve users data"};
    console.log(allUsersData);
    for (let uid in allUsersData) {
        if (allUsersData[uid].email === email) {
            return {value: uid};
        }
    }
    return {value: null};
});

exports.changeUserBalance = functions.https.onCall(async (data={uid: "", amount: 0, description: "", placeholder_account: false}, context) => {
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
        'while authenticated.');
    }

    // verify accountant role
    let role = await getRole(context);
    if (role != "accountant")
        return {error: "role not valid"}

    // add balance change
    let userRef = placeholder_account? admin.database().ref("pacc/" + uid) : admin.database().ref("users/" + uid);
    await userRef.child("balance").transaction(function(value) {
        if (value == null)
            value = {};
        if (value.records == null)
            value.records = {};
        
        // get time
        let time = Date.now();
        while (time in value.records) {
            time = Date.now();
        }

        // add new balance change
        value.records[time] = {amount: amount, description: description};

        // update balance
        let balance = 0;
        for (let change in value.records) {
            balance += change.amount;
        }
        value.amount = balance;
        return value;
    })
});