const firebaseConfig = {
  apiKey: "AIzaSyDCVqvy1gzjB4bF6ufYCoKhv1cYOQTgYs0",
  authDomain: "airis-61963.firebaseapp.com",
  databaseURL: "https://airis-61963.firebaseio.com",
  projectId: "airis-61963",
  storageBucket: "airis-61963.appspot.com",
  messagingSenderId: "558285874006",
  appId: "1:558285874006:web:bfe1257eb598cacafcecf7"
};
// Firebaseの初期化
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

window.addEventListener("load", () => {
  let loginBtn = document.getElementById('loginBtn');
  loginBtn.onclick = () => {
    let path = "./src/model/LoginAccount.php";
    let loginName = document.getElementsByName('loginName')[0];
    let loginPass = document.getElementsByName('loginPass')[0];
    // ログインした時のアクションを発行する。
    db.collection("action-history")
      .add({
        type: "login",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        user: `${loginName.value}`
      })

    let data = {
      'loginName': loginName.value,
      'loginPass': loginPass.value
    }
    data = JSON.stringify(data);

    let req = new XMLHttpRequest();
    req.open("POST", path, true);
    req.addEventListener("load", (ev) => {
      // レスポンスの処理

      if ((ev.target.status == 200) && (ev.target.readyState == 4)) {
        let msgLogin = document.getElementById('msgLogin');
        let json_data = JSON.parse(ev.target.response);
        msgLogin.innerHTML = json_data.msgLogin;
        if (!json_data.is_error) {
          document.getElementById("tabbar").setActiveTab(3).then(() => {
            let jsLogin = document.getElementsByClassName("js-login");
            let jsLogout = document.getElementsByClassName("js-logout");
            for (var i = 0; i < jsLogin.length; i++) {
              jsLogin[i].style.display = "block";
            }
            for (var i = 0; i < jsLogout.length; i++) {
              jsLogout[i].style.display = "none";
            }
          });
        }
      }
    });

    req.setRequestHeader('Content-Type', 'application/json');

    req.send(data);

    return false;
  }
});