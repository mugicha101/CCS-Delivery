const functions = require("firebase-functions");
const admin = require('firebase-admin');
const { auth } = require("firebase-admin");
const { user } = require("firebase-functions/v1/auth");
admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

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
                balance: 0,
                name: context.auth.token.name || "",
                email: context.auth.token.email || "",
                role: "user",
                cart: {
                    next_id: 0,
                    items: {}
                },
                inventory: {
                    next_id: 0,
                }
            });
        }
    } catch (e) {
        return {error: e};
    }
});

exports.addToCart = functions.https.onCall(async (data, context) => {
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
    userRef.child("cart").transaction(function(cart) {
        let id = cart.next_id;
        cart[id] = data.id;
        cart.next_id += 1;
        return cart;
    });
});

exports.getUidFromEmail = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
        'while authenticated.');
    }

    // verify role of caller
    let userRef = admin.database().ref("users/" + context.auth.uid + "/role");
    let snap = await userRef.once("value");
    let userData = snap.val();
    if (userData == null)
        return null;
    
    // search for email
    let allUsersRef = admin.database().ref("users");
    snap = await allUsersRef.once("value");
    let allUsersData = snap.val();
    if (allUsersData == null)
        return null;
    for (let uid in allUsersData) {
        if (allUsersData[uid].email === data.email) {
            return uid;
        }
    }
    return null;
})