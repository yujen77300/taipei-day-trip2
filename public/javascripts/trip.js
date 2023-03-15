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
const smallPxAvator = document.querySelector('.smallPX-bar-avator')
const barAvator = document.querySelector(".bar-avator")

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
    console.log(searchingCat)
  }
})


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