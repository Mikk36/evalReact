import firebase from "firebase";

const config = {
  apiKey: "AIzaSyCWU_Ec9lgkPEo--jjhJdccRvJiJ4o76T0",
  authDomain: "eval-dirt-rally.firebaseapp.com",
  databaseURL: "https://eval-dirt-rally.firebaseio.com",
  projectId: "eval-dirt-rally",
  storageBucket: "eval-dirt-rally.appspot.com",
  messagingSenderId: "960899693694"
};
const fbApp = firebase.initializeApp(config);

export const db = fbApp.database();
export const root = db.ref();
export const leagues = db.ref("leagues");
export const seasons = db.ref("seasons");
export const rallies = db.ref("rallies");
export const rallyResults = db.ref("rallyResults");
export const races = db.ref("races");
export const drivers = db.ref("drivers");
export const rallyTeams = db.ref("rallyTeams");
export const apiCache = db.ref("apiCache");
export const eventData = db.ref("eventData");

export default {
  db,
  root,
  leagues,
  seasons,
  rallies,
  rallyResults,
  races,
  drivers,
  rallyTeams,
  apiCache,
  eventData
};
