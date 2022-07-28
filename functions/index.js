const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest(async (req, res) => {
    const text = req.query.text;
    const writeRes = await admin.firestore().collection('test').set({message: text});
    res.json({result: `message with id ${writeRes.ID} added.`});
    // functions.logger.info("Hello logs!", {structuredData: true});
    // response.send("Hello from Firebase!");
});