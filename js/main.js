function login() {
  const username = document.getElementById('username').value.trim().toLowerCase();
  const password = document.getElementById('password').value.trim();
  const unlockSound = document.getElementById("unlockSound");

  // Add your real password check here
  const allowedUsers = {
    "arnav": "1234",
    "anokhi": "5678"
  };

  if (allowedUsers[username] === password) {
    localStorage.setItem("username", username.charAt(0).toUpperCase() + username.slice(1));
    unlockSound.play();
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);
  } else {
    alert("Wrong username or password! 💔");
  }
}
const username = localStorage.getItem('username') || 'Anokhi';
document.getElementById('username').innerText = username;
