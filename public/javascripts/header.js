const body = document.querySelector('.body')
const loginEmail = document.getElementById("login-email")
const loginPassword = document.getElementById("login-password")
const loginFail = document.getElementById("login-fail")
const signupName = document.getElementById("signup-name")
const signupEmail = document.getElementById("signup-email")
const signupPassword = document.getElementById("signup-password")
const signupFail = document.getElementById("signup-fail")
const signupSuccess = document.getElementById("signup-success")
const loginLogout = document.getElementById("login-logout")
const scheduleBtn = document.getElementById("schedule-btn")

function login() {
  let loginInputEmail = loginEmail.value
  let loginInputPassword = loginPassword.value
  if (loginInputEmail.length != 0 && loginInputPassword != 0) {
    let loginData = {
      "email": loginInputEmail,
      "password": loginInputPassword
    };
    loginAccount(loginData)
  } else {
    loginFail.textContent = "請輸入帳號與密碼"
  }
}


function signup() {
  let signupInputName = signupName.value
  let signupInputEmail = signupEmail.value
  let signupInputPassword = signupPassword.value
  if (signupInputName.length != 0 && signupInputEmail != 0 && signupInputPassword != 0) {
    if (!emailValidation(signupInputEmail) && !passwordValidation(signupInputPassword)) {
      signupFail.textContent = "密碼與信箱格式錯誤"
      signupEmail.value = ""
      signupPassword.value = ""
    } else if (!emailValidation(signupInputEmail)) {
      signupFail.textContent = "信箱格式錯誤"
      signupEmail.value = ""
    } else if (!passwordValidation(signupInputPassword)) {
      signupFail.textContent = "密碼至少4位數，且包含至少一個數字與一個英文字母"
      signupPassword.value = ""
    } else {
      let signupData = {
        "name": signupInputName,
        "email": signupInputEmail,
        "password": signupInputPassword
      };
      signupAccount(signupData)
    }
  } else {
    signupFail.textContent = "請輸入姓名、電子郵件與密碼"
  }
}


function emailValidation(email) {
  if (email.search(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/) != -1) {
    return true
  } else {
    return false
  }
}

function passwordValidation(password) {
  if (password.search(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,}$/) != -1) {
    return true
  } else {
    return false
  }
}


async function signupAccount(data) {
  let url = "/api/user"
  let options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json",
    }
  }
  try {
    let response = await fetch(url, options);
    let result = await response.json();
    if (response.status === 200) {
      signupFail.textContent = ""
      signupSuccess.textContent = "註冊成功請登入系統"
    } else if (response.status === 400) {
      signupFail.textContent = result.message;
      signupName.value = ""
      signupEmail.value = ""
      signupPassword.value = ""
    }
  } catch (err) {
    console.log({ "error": err.message });
  }
}


async function loginAccount(data) {
  let url = "/api/user/auth"
  let options = {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json",
    }
  }
  try {
    let response = await fetch(url, options);
    let result = await response.json();
    if (response.status === 200) {
      window.location.reload();
    } else if (response.status === 400) {
      loginFail.textContent = result.message;
      loginEmail.value = ""
      loginPassword.value = ""
    }
  } catch (err) {
    console.log({ "error": err.message });
  }
}

async function deleteAccount() {
  let url = "/api/user/auth"
  let options = {
    method: "DELETE",
  }
  try {
    let response = await fetch(url, options);
    let result = await response.json();
    if (response.status === 200) {
      window.location.reload();
    }
  } catch (err) {
    console.log({ "error": err.message });
  }
}


document.querySelector("#login-logout").addEventListener("click", function () {
  fetch(
    "/api/user/auth"
  ).then(function (response) {
    return response.json();
  }).then(function (data) {
    if (data.data != undefined) {

      deleteAccount()
    } else {
      document.querySelector(".popup").classList.add("active");
      background = document.createElement('div')
      background.className = "background"
      background.style.cssText = 'background-color: rgba(15, 15, 15, 0.25);z-index:1;position:absolute;left:0;right:0;top:0;bottom:0;'
      body.appendChild(background)
      body.style.overflow = "hidden"
    }
  })

});

document
  .querySelector(".popup .close-btn")
  .addEventListener("click", function () {
    loginFail.textContent = ""
    loginEmail.value = ""
    loginPassword.value = ""
    body.style.overflow = "visible"
    document.querySelector(".popup").classList.remove("active");
    background.remove()
  });

document
  .querySelector(".signup .close-btn")
  .addEventListener("click", function () {
    signupFail.textContent = ""
    signupName.value = ""
    signupEmail.value = ""
    signupPassword.value = ""
    body.style.overflow = "visible"
    document.querySelector(".signup").classList.remove("active");
    background.remove()
  });



function tosignup() {
  document.querySelector(".popup").classList.remove("active");
  document.querySelector(".signup").classList.add("active");
  loginFail.textContent = ""
  loginEmail.value = ""
  loginPassword.value = ""

}


function tologin() {
  document.querySelector(".signup").classList.remove("active");
  document.querySelector(".popup").classList.add("active");
  signupFail.textContent = ""
  signupName.value = ""
  signupEmail.value = ""
  signupPassword.value = ""
}


const barAvator = document.querySelector(".bar-avator")
reload()
function reload() {
  fetch(
    "/api/user/auth"
  ).then(function (response) {
    return response.json();
  }).then(function (data) {
    if (data.data != undefined) {
      loginLogout.textContent = "登出系統"
      if (data.data["avatorName"] == "user.png") {
        barAvator.style.backgroundImage = "url(/picture/profile.png)"
      } else {
        barAvator.style.backgroundImage = `url('${data.data["avatorUrl"]}')`
      }
      barAvator.style.width = "20px"
      barAvator.style.height = "20px"
      barAvator.style.borderRadius = "50%"
      barAvator.style.backgroundSize = "cover"
      barAvator.style.backgroundPosition = "center center"
    } else {
      loginLogout.textContent = "登入/註冊"
    }
  })
}

scheduleBtn.addEventListener('click', function () {
  fetch(
    "/api/user/auth"
  ).then(function (response) {
    return response.json();
  }).then(function (data) {
    if (data.data != undefined) {
      document.location.href = '/booking'
    } else {
      document.querySelector(".popup").classList.add("active");
      background = document.createElement('div')
      background.className = "background"
      background.style.cssText = 'background-color: rgba(15, 15, 15, 0.25);z-index:1;position:absolute;left:0;right:0;top:0;bottom:0;'
      body.appendChild(background)
      body.style.overflow = "hidden"
    }
  })
})

let memberBtn = document.getElementById("member-btn")
memberBtn.addEventListener('click', function () {
  fetch(
    "/api/user/auth"
  ).then(function (response) {
    return response.json();
  }).then(function (data) {
    if (data.data != undefined) {
      document.location.href = '/member'
    } else {
      document.querySelector(".popup").classList.add("active");
      background = document.createElement('div')
      background.className = "background"
      background.style.cssText = 'background-color: rgba(15, 15, 15, 0.25);z-index:1;position:absolute;left:0;right:0;top:0;bottom:0;'
      body.appendChild(background)
      body.style.overflow = "hidden"
    }
  })
})