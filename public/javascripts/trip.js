const attractionList = document.querySelector('.attraction-list')
const attractionCard = document.querySelector('.attraction-card')
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
const smallPxAvator = document.querySelector('.smallPX-bar-avator')
const barAvator = document.querySelector(".bar-avator")

// 假設有沒有顯示loginpopup視窗
let loginPopup = 0
// 是否有載入
let isLoading = 1
// 是否有搜尋
let isSearching = 0
// 類別是否有點擊過
let isSearchingCat = 0


// 點擊searchbar以外的地方會關掉searchingCat，點擊popup以外的要跳出popup
window.onload = function () {
  document.onclick = function (div) {
    if (div.target.className != "searching-cat" && div.target.className != "search-bar") {
      searchingCat.style.display = "none"
    }
  }
}

// 新增一個陣列存放所有旅遊景點的資料
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
    console.log(searchingCat)
  }

})

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