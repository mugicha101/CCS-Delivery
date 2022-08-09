const functions = require("firebase-functions");
const admin = require('firebase-admin');
const { auth } = require("firebase-admin");
const { user } = require("firebase-functions/v1/auth");
const { set, get } = require("firebase/database");
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
        
        // check placeholder accounts for matching data
        let paccRef = admin.database().ref("pacc/" + context.auth.token.email.replace(/\./g, "_"));
        snap = await paccRef.once("value");
        let paccData = snap.val();
        if (paccData != null) { // pacc exists
            console.log("IMPORT PACC DATA");
            await userRef.update({
                balance: paccData.balance
            })
            await paccRef.remove();
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

exports.addBalanceChange = functions.https.onCall(async (data={uid: "", amount: 0, description: "", isPlaceholder: false}, context) => {
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
    console.log("data:", data);
    let userRef = data.isPlaceholder? admin.database().ref("pacc/" + data.uid) : admin.database().ref("users/" + data.uid);
    let balRef = userRef.child("balance");
    await balRef.transaction(function(value) {
        console.log("value beforehand:", value);
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
        value.records[time] = {amount: parseInt(data.amount), description: data.description, accountant_uid: context.auth.uid};

        // update balance
        let balance = 0;
        for (let change in value.records) {
            balance += value.records[change].amount;
        }
        console.log("value:", value);
        value.amount = balance;
        return value;
    })
});

// TODO: TEST FUNCTION, DELETE LATER
exports.EMULATOR_DB_SETUP = functions.https.onCall(async (data, context) => {
    admin.database().ref("users").set({
        rUz2T7OHKwcB3RptZoMsw4lYl9Y2: {
            name: "Alexander Yoshida",
            role: "accountant",
            inventory: {
                next_id: 0
            },
            balance: {
                amount: 900,
                records: {
                    1659903196024: {
                        amount: 1000,
                        description: "stonks",
                        accountant_id: "727"
                    },
                    1659903727727: {
                        amount: -100,
                        description: "pog",
                        accountant_id: "123"
                    }
                }
            },
            email: "alexander.yoshida@gmail.com"
        },
    });
    admin.database().ref("store").set({
        chen_fumo: {
            name: "Chen Fumo",
            amount: 1,
            cost: 300,
            description: "based chen",
            retrieval_method: "delivery",
            unit: "fumo",
            vendor: "ZUN"
        },
        lenoir_food: {
            name: "Goat Cheese Strawberry Vinaigrette Pizza",
            amount: 13,
            cost: 15,
            description: "pizza made with goat cheese and a strawberry mix to give the full package of lenoir (may cause unalive)",
            retrieval_method: "pick-up",
            unit: "slice",
            vendor: "Lenoir"
        },
        pekora_juice: {
            name: "Pekora Juice",
            amount: 0,
            cost: 33.33,
            description: "20oz plum juice in a wine bottle",
            unit: "bottle",
            vendor: "Usaken"
        },
        watermelon: {
            name: "Watermelon",
            amount: 5,
            cost: 5,
            description: "5lb watermelon",
            retrieval_method: "pick-up",
            unit: "melon",
            vendor: "uber sheep"
        }
    });
})