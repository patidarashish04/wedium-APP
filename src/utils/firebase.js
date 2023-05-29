const firebase = require("firebase-admin");

require("firebase/firestore");
const serviceAccount = require('../admin.json');

firebase.initializeApp({ credential: firebase.credential.cert( serviceAccount ) });
