import * as firebase from 'firebase';

require('@firebase/firestore')

// Your web app's Firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyAEmKAxnvGDoXIKYG_-FLXlXGoWHq1x1G8",
        authDomain: "wily-app-7fae6.firebaseapp.com",
        projectId: "wily-app-7fae6",
        storageBucket: "wily-app-7fae6.appspot.com",
        messagingSenderId: "176168153090",
        appId: "1:176168153090:web:a524df154ee0c89d0f371b"
    };
// Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();