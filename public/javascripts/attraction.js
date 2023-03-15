const afternoonSection = document.querySelector('.afternoon-section')
const morningSection = document.querySelector('.morning-section')
let slides = document.querySelector('.slides')
let slide = document.querySelector('.slide')
let fee = document.querySelector('.fee')
let controlsVisible = document.querySelector('.controls-visible')
let firstSlide = document.querySelector('#firstSlide')
const bookingButton = document.querySelector('.booking-button')
const tripDate = document.getElementById("trip-date")
const bookingFail = document.getElementById('booking-fail')

let id = window.location.href.split("/").slice(-1)[0]
const url = "/api/attraction/" + id;

let imgIndex = 0

let isRight = 1

let allImage = []
let controlButton = []



fetch(
  url
).then(function (response) {
  return response.json();
}).then(function (data) {
  let category = data.data["category"]
  let mrt = data.data["mrt"]
  document.querySelector('.name').innerHTML = data.data["name"]
  document.querySelector('.cat-location').innerHTML = `${category} at ${mrt}`
  document.querySelector('.description').innerHTML = data.data["description"]
  document.querySelector('.address').innerHTML = data.data["address"]
  document.querySelector('.transportation').innerHTML = data.data["transport"]
  let img = data.data["image"]
  let imgAmount = img.length
  let leftMove = 0
  slide.style.backgroundImage = `url(${img[0]})`
  for (let i = 1; i < imgAmount; i++) {
    leftMove = i * 100
    slide = document.createElement('div')
    slide.className = "slide"
    slide.style.cssText = `background-image:url(${img[i]});left:${leftMove}%`
    slides.insertBefore(slide, controlsVisible)
    label = document.createElement('label')
    label.setAttribute('for', `control-${i + 1}`)
    label.setAttribute('class', "control-button")
    controlsVisible.appendChild(label)
    input = document.createElement('input')
    input.setAttribute("name", "control")
    input.setAttribute("type", "radio")
    input.setAttribute("id", `control-${i + 1}`)
    slides.insertBefore(input, firstSlide)
  }
  allImage = document.querySelectorAll('.slide');
  controlButton = document.querySelectorAll('.control-button')
})


afternoonSection.addEventListener('click', () => {
  if (afternoonSection.firstElementChild.classList.contains('clicked')) {

  } else {
    afternoonSection.firstElementChild.classList.toggle("clicked")
    morningSection.firstElementChild.classList.toggle("clicked")
    fee.innerHTML = "新台幣2500元"
  }

})

morningSection.addEventListener('click', () => {
  if (morningSection.firstElementChild.classList.contains('clicked')) {

  } else {
    afternoonSection.firstElementChild.classList.toggle("clicked")
    morningSection.firstElementChild.classList.toggle("clicked")
    fee.innerHTML = "新台幣2000元"
  }
})





// carousel

function refresh(index, direction) {

  if (direction == 1) {
    let leftMove = (index + 1) * 100
    for (var i = 0; i < allImage.length; i++) {
      allImage[i].style.transform = `translatex(-${leftMove}%)`
    }
    controlButton[index].style.backgroundColor = "#fff"
    controlButton[index + 1].style.backgroundColor = "#000"
  } else {
    let leftMove = (index - 1) * 100
    for (var i = 0; i < allImage.length; i++) {
      allImage[i].style.transform = `translatex(-${leftMove}%)`
    }
    controlButton[index].style.backgroundColor = "#fff"
    controlButton[index - 1].style.backgroundColor = "#000"
  }

}

function leftShift() {
  if (imgIndex == 0) {
    for (var i = 0; i < allImage.length; i++) {
      allImage[i].style.transform = `translatex(-${(allImage.length - 1) * 100}%)`
    }
    controlButton[0].style.backgroundColor = "#fff"
    controlButton[allImage.length - 1].style.backgroundColor = "#000"
    imgIndex = allImage.length - 1
  } else {
    isRight = 0
    refresh(imgIndex, isRight)
    imgIndex--
  }

}

function rightShift() {
  if (imgIndex + 1 >= allImage.length) {
    for (var i = 0; i < allImage.length; i++) {
      allImage[i].style.transform = "translatex(0%)"
    }
    controlButton[allImage.length - 1].style.backgroundColor = "#fff"
    controlButton[0].style.backgroundColor = "#000"
    imgIndex = 0
  } else {
    isRight = 1
    refresh(imgIndex, isRight)
    imgIndex++
  }
}


bookingButton.addEventListener('click', function () {
  fetch(
    "/api/user/auth"
  ).then(function (response) {
    return response.json();
  }).then(function (data) {
    if (data.data != undefined) {
      newBookingData = {}
      newBookingData["attractionId"] = id
      newBookingData["date"] = tripDate.value
      let today = new Date();
      today = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + ""
      console.log("今天")
      console.log(today)
      let tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      // en-CA => YYYY-MM-DD
      tomorrow = tomorrow.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })
      if (parseInt((fee.textContent).substr(3, 4), 0) == 2500) {
        newBookingData["time"] = "afternoon"
      } else {
        newBookingData["time"] = "morning"
      }
      newBookingData["price"] = parseInt((fee.textContent).substr(3, 4), 0)
      console.log("我在這裡")
      console.log(newBookingData)
      console.log(tripDate.value)
      console.log(tomorrow)

      if (tripDate.value >= tomorrow) {
        bookNewSchedule(newBookingData)
      } else if (tripDate.value == today) {
        bookingFail.textContent = "無法預訂當天日期，請選擇明天開始之日期"
        bookingFail.style.marginTop = "10px"
        bookingButton.style.marginTop = "10px"
      } else if (tripDate.value.length == 0) {
        bookingFail.textContent = "要預訂失敗，請選擇日期"
        bookingFail.style.marginTop = "10px"
        bookingButton.style.marginTop = "10px"
      } else if (tripDate.value < today) {
        bookingFail.textContent = "無法選擇過往日期，請選擇明天開始之日期"
        bookingFail.style.marginTop = "10px"
        bookingButton.style.marginTop = "10px"
      }


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



async function bookNewSchedule(data) {
  let url = "/api/booking"
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
      console.log("成功新增")
      document.location.href = '/booking'
    } else if (response.status === 400) {
      console.log(result["message"])
      bookingFail.textContent = result["message"]
      bookingFail.style.marginTop = "10px"
      bookingButton.style.marginTop = "10px"
    }
  } catch (err) {
    console.log({ "error": err.message });
  }
}