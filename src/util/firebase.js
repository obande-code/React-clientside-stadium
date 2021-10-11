import firebase from "firebase";

//ios test
/*const firebaseConfig = {
  apiKey: "AIzaSyCgjLaaKDX_l29wocFtThdNDbLBz6OBw9U",
  authDomain: "parkr-test.firebaseapp.com",
  databaseURL: "https://parkr-test.firebaseio.com",
  projectId: "parkr-test",
  storageBucket: "parkr-test.appspot.com",
  messagingSenderId: "541211266756",
  appId: "1:541211266756:web:b451596e399ba69dc04391",
  measurementId: "G-WHXXNL07GY"
};*/

//web test
/*const firebaseConfig = {
	apiKey: "AIzaSyCNdlm5_FcH0IU74bq3Mr9Va4GigrOr-Xk",
	authDomain: "prked-web.firebaseapp.com",
	databaseURL: "https://prked-web-default-rtdb.firebaseio.com",
	projectId: "prked-web",
	storageBucket: "prked-web.appspot.com",
	messagingSenderId: "92544552001",
	appId: "1:92544552001:web:eead9b13de8677328a4ac0",
	measurementId: "G-3ECXHN9ZSG",
};*/

//live
const firebaseConfig = {
  apiKey: "AIzaSyDvkCxENnn1V5z_kfeJM5b0L644J0mBJ_4",
  authDomain: "parkrapp-1c8f0.firebaseapp.com",
  databaseURL: "https://parkrapp-1c8f0.firebaseio.com/",
  projectId: "parkrapp-1c8f0",
  storageBucket: "parkrapp-1c8f0.appspot.com",
  messagingSenderId: "245119136782",
  appId: "1:245119136782:web:d4d185a72d9062de14f85f",
  measurementId: "G-006XL4JR6S",
};

firebase.initializeApp(firebaseConfig);

export default firebase;
