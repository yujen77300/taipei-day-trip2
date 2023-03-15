const attractionList = document.querySelector('.attraction-list')
let attractionCard = document.querySelector('.attraction-card')
const body = document.querySelector('.body')
const searchingCat = document.querySelector('.searching-cat')
const searchBar = document.querySelector('.search-bar')
const noReuslt = document.querySelector('.no-result')
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
const memberBtn = document.getElementById("member-btn")
const smallPxAvatar = document.querySelector('.smallPX-bar-avatar')
const barAvatar = document.querySelector(".bar-avatar")
const burger = document.querySelector('.burger')
const itemSection = document.querySelector('.item-section')
const burgerClose = document.querySelector('.burger-close')

let loginPopup = 0
let isLoading = 1
let isSearching = 0
let isSearchingCat = 0


window.onload = function () {
  document.onclick = function (div) {
    if (div.target.className != "searching-cat" && div.target.className != "search-bar") {
      searchingCat.style.display = "none"
    }
  }
}

// Intersection observer api
let page = 0
const footer = document.querySelector(".footer")

const options = {
  root: null,
  rootMargin: "0px 0px 0px 0px",
  threshold: 0
}

let zeroIpunt = 0

let keyword = null
let callback = ([entry]) => {
  if (entry && entry.isIntersecting) {
    if (isLoading == 1) {
      let touristSpot = []
      fetchImages(touristSpot, keyword)
    }
  }
}
let observer = new IntersectionObserver(callback, options)
observer.observe(footer)

const touristSpot = []

searchBar.addEventListener('click', () => {
  if (isSearchingCat == 0) {
    let categories = []
    fetch(
      "/api/categories"
    ).then(function (response) {
      return response.json();
    }).then(function (data) {
      categories.push(...data.data)
      categories.forEach(category => {
        searchingCat.innerHTML += `<div class="categories" onclick="getCategory(this.firstChild.innerHTML)"><div class="cat-text">${category}</div></div>`
      })
      searchingCat.style.display = "flex"
      isSearchingCat++
    })
  } else {
    searchingCat.style.display = "flex"
  }
})

// about login and signup
loginLogout.addEventListener("click", function () {
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

// move to booking page
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

// move to member page
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

burger.addEventListener('click', function () {
  itemSection.style.display = "flex"
  itemSection.style.top = 0
  barAvatar.style.top = '-100%'
  burger.style.top = '-100%'
  burgerClose.style.top = '20px'
})

burgerClose.addEventListener('click', function () {
  burger.style.top = '15px'
  itemSection.style.top = '-100%'
  burgerClose.style.top = '-100%'
})

reload()


function getCategory(category) {
  searchBar.value = category
}

function getAttraction() {
  isSearching = 0
  const input = document.querySelector(".search-bar")
  keyword = input.value
  if (keyword.length == 0) {
    zeroIpunt = 0
  }
  let touristSpot = []
  fetchImages(touristSpot, keyword)

}

function renderAttractionList(touristSpot, keyword) {
  if (keyword != null && isSearching == 0) {
    attractionList.removeChild(attractionCard)
    attractionCard = document.createElement('div')
    attractionCard.className = ".attraction-card"
    attractionCard.style.cssText = 'display:flex;flex-wrap: wrap;justify-content: center;gap:30px';
    attractionList.appendChild(attractionCard)
    touristSpot.forEach(spot => {
      let attraction = document.createElement('div')
      attraction.className = "attraction"
      attraction.setAttribute("onclick", `window.location='/attraction/${spot["id"]}';`)
      attraction.innerHTML = `
          <div class="attraction-pic" style="background-image: url(${spot["image"][0]});" >
            <div class="name-back">
              <div class="name">${spot['name']}</div>
            </div>
          </div>
          <div class="image-below">
            <div class="mrt">${spot['mrt']}</div>
            <div class="category">${spot['category']}</div>
          </div>
     `
      attractionCard.appendChild(attraction)
      isSearching++
    });
  } else {
    touristSpot.forEach(spot => {
      let attraction = document.createElement('div')
      attraction.className = "attraction"
      attraction.setAttribute("onclick", `window.location='/attraction/${spot["id"]}';`)
      attraction.innerHTML = `
        <div class="attraction-pic" style="background-image: url(${spot["image"][0]});">
          <div class="name-back">
            <div class="name">${spot['name']}</div>
          </div>
        </div>
        <div class="image-below">
          <div class="mrt">${spot['mrt']}</div>
          <div class="category">${spot['category']}</div>
        </div>
   `
      attractionCard.appendChild(attraction)
    });
  }
}

function fetchImages(touristSpot, keyword) {
  let nextPage = 0
  let url = ``
  if (keyword != null) {

    if (keyword.length == 0 && zeroIpunt == 0) {
      page = 0
      url = `/api/attractions?page=${page}`
      isLoading = 1
      zeroIpunt++
    } else if (keyword.length == 0 && zeroIpunt > 0) {
      url = `/api/attractions?page=${page}`
    } else {
      if (isSearching == 0) {
        page = 0
        isLoading = 1
        url = `/api/attractions?page=${page}&keyword=${keyword}`
      } else {
        url = `/api/attractions?page=${page}&keyword=${keyword}`
      }
    }

  } else {
    url = `/api/attractions?page=${page}`
  }
  fetch(
    url
  ).then(function (response) {
    return response.json();
  }).then(function (data) {
    nextPage = data["nextpage"]
    touristSpot.push(...data.data)
    if (touristSpot.length === 0) {
      noReuslt.style.display = "flex"
      attractionCard.style.display = "none"
    } else {
      noReuslt.style.display = "none"
      if (nextPage == null) {
        isLoading = 0
      }
      if (keyword != null) {
        renderAttractionList(touristSpot, keyword)
        page = page + 1
      } else {
        renderAttractionList(touristSpot)
        page = page + 1
      }

    }
  })
}


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
      signupFail.textContent = "密碼至少8位數，且包含至少一個數字與一個英文字母"
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
  if (password.search(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/) != -1) {
    return true
  } else {
    return false
  }
}

function reload() {
  fetch(
    "/api/user/auth"
  ).then(function (response) {
    return response.json();
  }).then(function (data) {
    if (data.data != undefined) {
      loginLogout.textContent = "登出系統"
      if (data.data["avatarName"] == "user.png") {
        barAvatar.style.backgroundImage = "url(/picture/profile.png)"
        smallPxAvatar.style.backgroundImage = "url(/picture/profile.png)"
      } else {
        smallPxAvatar.style.backgroundImage = `url('${data.data["avatarUrl"]}')`
        barAvatar.style.backgroundImage = `url('${data.data["avatarUrl"]}')`
      }
      barAvatar.style.width = "20px"
      barAvatar.style.height = "20px"
      barAvatar.style.borderRadius = "50%"
      barAvatar.style.backgroundSize = "cover"
      barAvatar.style.backgroundPosition = "center center"
      smallPxAvatar.style.width = "20px"
      smallPxAvatar.style.height = "20px"
      smallPxAvatar.style.borderRadius = "50%"
      smallPxAvatar.style.backgroundSize = "cover"
      smallPxAvatar.style.backgroundPosition = "center center"
    } else {
      loginLogout.textContent = "登入/註冊"
    }
  })
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
    if (response.status === 200) {
      window.location.reload();
    }
  } catch (err) {
    console.log({ "error": err.message });
  }
}