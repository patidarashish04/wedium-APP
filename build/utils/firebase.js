// import admin from 'firebase-admin';
const firebase = require("firebase-admin");

require("firebase/firestore");
// import { serviceAccount } from '../admin.json';
const serviceAccount = require('../admin.json');

firebase.initializeApp({ credential: firebase.credential.cert(serviceAccount) });

// // const admin = require("firebase-admin");
// const admin = require("firebase");

// const serviceAccount = require("../admin.json");

// const db = admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

//   const user = db.collection('Users');
//   module.exports = db;