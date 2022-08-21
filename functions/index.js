const functions = require("firebase-functions");
const admin = require('firebase-admin');
const serviceAccount = require('./ccs-houqin-firebase-adminsdk.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ccs-houqin-default-rtdb.firebaseio.com"
});

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

const getRole = async (context) => {
    let userRef = admin.database().ref("users/" + context.auth.uid + "/role");
    let snap = await userRef.once("value");
    let userData = snap.val();
    return userData;
}

const userExists = async (uid) => {
    let userRef = admin.database().ref()
    let snap = await userRef.once("value");
    return snap.exists();
}

// performs a transaction
exports.transaction = functions.https.onCall(async (data={localStoreData: {}, localCartData: {}}, context) => {
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
            'while authenticated.');
    }

    // attempt transaction (covers entire database, which means any change will cancel transaction, so expect retries/fails)
    let dbRef = admin.database().ref();
    let isSuccess = false;
    await dbRef.transaction(function(dbData) {
        // validate that local store data matches server data
        if (dbData == null) return dbData;
        if (JSON.stringify(data.localStoreData) != JSON.stringify(dbData.store ?? {})) return dbData;
        console.log("store matches");

        // validate that local cart data matches server data
        let user = dbData.users[context.auth.uid];
        let store = dbData.store;
        if (!user) return dbData;
        let cart = user.cart;
        if (!cart) return dbData;
        if (JSON.stringify(data.localCartData) != JSON.stringify(cart)) return dbData;
        console.log("cart matches");

        // ensure cart is not empty
        if (Object.keys(cart).length == 0)
            return dbData;

        // ensure items and amount are valid
        let totalCost = 0;
        let description="Order:";
        for (let id in cart) {
            let amount = cart[id];
            if (!(id in store.data)) return dbData;
            let item = store.data[id];
            if (amount > item.amount) return dbData;
            totalCost += item.cost * amount;
            description += " [" + item.name + "]x" + amount;
        }
        console.log("items valid");

        // ensure user has enough money
        balanceRef = user.balance;
        if (!balanceRef || !balanceRef.amount) return dbData;
        if (balanceRef.amount < totalCost) return dbData;

        console.log("transaction validated, starting transaction");

        // transfer stock to user
        if (!user.orders) user.orders = {};
        let time = Date.now();
        while (time in user.orders) {
            time = Date.now();
        }
        let order = {};
        for (let id in cart) {
            let amount = cart[id];
            store.data[id].amount -= amount;
            order.items = {};
            order.items[id] = amount;
            order.complete = false;
            order.cost = totalCost;
        }
        user.orders[time] = order;

        // apply balance change
        balanceChangeHelper(balanceRef, -totalCost, description, context);

        // clear users cart
        user.cart = {};

        // mark as successful
        isSuccess = true;
        console.log("transaction success");
        return dbData;
    }).catch((e) => {});
    return {isSuccess: isSuccess};
});

exports.refundOrder = functions.https.onCall(async (data={uid:null, orderTime:0}, context) => {
    if (data.uid == null) data.uid = context.auth.uid;
    console.log(data);
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
            'while authenticated.');
    }
    
    // ensure user has perms
    if (context.auth.uid != data.uid && getRole(context) != "service")
        return {error: "perms not valid"}
    
    // refund order
    let dbRef = admin.database().ref();
    let isSuccess = false;
    await dbRef.transaction(function(dbData) {
        if (!dbData) return dbData;
        let store = dbData.store;
        if (!store) return dbData;
        let user = dbData.users[data.uid];
        if (!user) return dbData;
        let order = user.orders[data.orderTime];
        if (!order) return dbData;
        // transfer stock to store
        let totalRefund = 0;
        let description = "Refund Order:";
        for (let id in order.items) {
            let amount = order.items[id];
            totalRefund += store.data[id].cost * amount;
            let activeId = store.active[id];
            store.data[activeId].amount += amount;
            description += " [" + store.data[id].name + "]x" + amount;
        }
        delete dbData.users[data.uid].orders[data.orderTime];

        // apply balance change
        let balanceRef = user.balance;
        balanceChangeHelper(balanceRef, totalRefund, description, context);
        return dbData;
    });
})

exports.setOrderComplete = functions.https.onCall(async (data={uid:"", orderTime:0, complete:true}, context) => {

})

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

exports.addToCart = functions.https.onCall(async (data={id: "", amount: 0, relative: true}, context) => {
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
    await itemRef.transaction(function(value) {
        if (!value || !data.relative) value = 0;
        value += data.amount;
        if (value <= 0) return null;
        else return value;
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

function balanceChangeHelper(balanceRef, amount, description, context) {
    if (!balanceRef.records) balanceRef.records = {};

    // get time
    let time = Date.now();
    while (time in balanceRef.records) {
        time = Date.now();
    }

    // add new balance change
    balanceRef.records[time] = {amount: parseInt(amount), description: description, accountant_uid: context.auth.uid};

    // update balance
    let balance = 0;
    for (let change in balanceRef.records) {
        balance += balanceRef.records[change].amount;
    }
    balanceRef.amount = balance;
}

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

    // ensure user exists if !isPlaceholder
    if (!isPlaceholder && !userExists(data.uid))
        return {error: "user does not exist"}

    // add balance change
    console.log("data:", data);
    let userRef = data.isPlaceholder? admin.database().ref("pacc/" + data.uid) : admin.database().ref("users/" + data.uid);
    let balRef = userRef.child("balance");
    await balRef.transaction(function(value) {
        if (value == null)
            value = {};
        balanceChangeHelper(value, data.amount, data.description, context);
        return value;
    })
});

exports.setUserRole = functions.https.onCall(async (data={uid: "", role: "user"}, context) => {
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
        'while authenticated.');
    }

    // verify admin role
    let role = await getRole(context);
    if (role != "admin")
        return {error: "role not valid"}
    
    // ensure user exists
    if (!userExists(data.uid))
        return {error: "user does not exist"}
    
    // change role
    await admin.database().ref("users/" + data.uid + "/role").set(data.role);
});

// TODO: TEST FUNCTION, DELETE LATER
exports.EMULATOR_DB_SETUP = functions.https.onCall(async (data, context) => {
    admin.database().ref("users").set({
        rUz2T7OHKwcB3RptZoMsw4lYl9Y2: {
            name: "Alexander Yoshida",
            role: "accountant",
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
        next_id: 4,
        active: {
            0: 0,
            1: 1,
            2: 2,
            3: 3,
        },
        data: {
            0: {
                name: "Chen Fumo",
                amount: 1,
                cost: 300,
                description: "based chen",
                retrieval_method: "delivery",
                unit: "fumo",
                vendor: "ZUN"
            },
            1: {
                name: "Goat Cheese Strawberry Vinaigrette Pizza",
                amount: 13,
                cost: 15,
                description: "pizza made with goat cheese and a strawberry mix to give the full package of lenoir (may cause unalive)",
                retrieval_method: "pick-up",
                unit: "slice",
                vendor: "Lenoir"
            },
            2: {
                name: "Pekora Juice",
                amount: 0,
                cost: 33.33,
                description: "20oz plum juice in a wine bottle",
                unit: "bottle",
                vendor: "Usaken"
            },
            3: {
                name: "Watermelon",
                amount: 5,
                cost: 5,
                description: "5lb watermelon",
                retrieval_method: "pick-up",
                unit: "melon",
                vendor: "uber sheep"
            }
        }
    });
})