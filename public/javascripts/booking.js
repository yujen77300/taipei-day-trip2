const topTitle = document.querySelector('.top-title')
const bookingName = document.querySelector('.booking-name')
const scheduledDate = document.getElementById('scheduled-date')
const scheduledFee = document.getElementById('scheduled-fee')
const totalFee = document.querySelector('.total-fee')
const scheduledTime = document.getElementById('scheduled-time')
const scheduledPlace = document.getElementById('scheduled-place')
const scheduledImg = document.querySelector('.booking-left')
const scehduledUsername = document.getElementById('scehduled-username')
const scehduledEmail = document.getElementById('scehduled-email')
const scehduledPhone = document.getElementById('scehduled-phone')
const bookingDeleteBtn = document.querySelector('.booking-delete-btn')
const noSchedule = document.querySelector('.no-schedule')
const bookInfo = document.querySelector('.booking-info')
const bookMiddle = document.querySelector('.booking-middle')
const bookBottom = document.querySelector('.booking-bottom')
const bookTotal = document.querySelector('.booking-total')
const divider = document.querySelectorAll('.divider')
const footerExtend = document.querySelector('.footer-extend')
const payBtn = document.getElementById('book-and-pay')
const bookingFailed = document.querySelector('.booking-failed')
const loading = document.getElementById('load')
const loadingBkgd = document.querySelector('.loading-background')
let contactInfo = {}




renderBooking()
function renderBooking() {
  fetch(
    "/api/user/auth"
  ).then(function (response) {
    return response.json();
  }).then(function (data) {
    if (data["error"] === true) {
      document.location.href = '/'
    }
    else {
      fetch(
        "/api/booking"
      ).then(function (response) {
        return response.json();
      }).then(function (data) {
        if (Object.keys(data["data"]).length === 0) {
          fetch(
            "/api/user/auth"
          ).then(function (response) {
            return response.json();
          }).then(function (data) {
            topTitle.textContent = `您好，${data["data"]["name"]}，待預訂的行程如下 : `
          })
          noSchedule.style.display = "block"
          bookInfo.style.display = "none"
          bookMiddle.style.display = "none"
          bookBottom.style.display = "none"
          bookTotal.style.display = "none"
          divider[0].style.display = "none"
          divider[1].style.display = "none"
          divider[2].style.display = "none"
          footerExtend.style.display = "block"
        }
        else {
          fetch(
            "/api/user/auth"
          ).then(function (response) {
            return response.json();
          }).then(function (data) {
            contactInfo = data
            topTitle.textContent = `您好，${data["data"]["name"]}，待預訂的行程如下 : `
            scehduledUsername.value = data["data"]["name"]
            scehduledEmail.value = data["data"]["email"]

            if ((data["data"]["phone"]).length > 0) {
              scehduledPhone.value = data["data"]["phone"]
            }
          })
          bookingName.textContent = `台北一日遊 : ${data["data"]["attraction"]["name"]}`
          scheduledDate.innerHTML = `<span class="item">日期 : </span>${data["data"]["date"]}`
          scheduledPlace.innerHTML = `<span class="item">地點 : </span>${data["data"]["attraction"]["address"]}`
          scheduledImg.style.backgroundImage = `url(${data["data"]["attraction"]["image"]})`

          if (data["data"]["time"] === "afternoon") {
            scheduledTime.innerHTML = `<span class="item">時間 : </span>下午1點到下午5點`
            scheduledFee.innerHTML = `<span class="item">費用 : </span>新台幣2500元`
            totalFee.textContent = "總價 : 新台幣2500元"
          } else if (data["data"]["time"] === "morning") {
            scheduledTime.innerHTML = `<span class="item">時間 : </span>早上8點到中午12點`
            scheduledFee.innerHTML = `<span class="item">費用 : </span>新台幣2000元`
            totalFee.textContent = "總價 : 新台幣2000元"
          }

        }
      })
    }
  })

}




// 刪除行程
bookingDeleteBtn.addEventListener('click', function () {
  deleteSchedule()
})



// 刪除schedule
async function deleteSchedule() {
  let url = "/api/booking"
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

// tappay

const script = document.createElement('script');
script.src = 'https://js.tappaysdk.com/sdk/tpdirect/v5.14.0';
document.body.appendChild(script);
script.onload = function () {

  TPDirect.setupSDK(`${APP_ID}`, `${APP_KEY}`, 'sandbox')
  TPDirect.card.setup({
    fields: {
      number: {
        element: '.form-control.card-number',
        placeholder: '**** **** **** ****'
      },
      expirationDate: {
        element: document.getElementById('tappay-expiration-date'),
        placeholder: 'MM / YY'
      },
      ccv: {
        element: document.querySelector('.form-control.cvv'),
        placeholder: '後三碼'
      }
    },
    styles: {
      'input': {
        'color': 'gray'
      },
      'input.ccv': {
      },
      ':focus': {
        'color': 'black'
      },
      '.valid': {
        'color': 'green'
      },
      '.invalid': {
        'color': 'red'
      },
      '@media screen and (max-width: 400px)': {
        'input': {
          'color': 'orange'
        }
      }
    },
    isMaskCreditCardNumber: true,
    maskCreditCardNumberRange: {
      beginIndex: 6,
      endIndex: 11
    }
  })

  // listen for TapPay Field
  TPDirect.card.onUpdate(function (update) {
    if (update.canGetPrime) {
     
    } else {
    }

    /* Change card image  */
    const cardTypes = ['mastercard', 'visa', 'jcb', 'amex', 'unionpay', 'unknown']
    let newType = update.cardType === 'unknown' ? '' : update.cardType
    if (cardTypes.includes(newType)) {
      document.getElementById('cardimg').src = `/picture/${newType}.png`
    }

  })

 
  payBtn.addEventListener('click', function () {
    // 確認是否可以getprime
    if (TPDirect.card.getTappayFieldsStatus().canGetPrime === false) {
      bookingFailed.textContent = "請輸入正確信用卡資訊"
      return
    } else if (scehduledPhone.value === "") {
      bookingFailed.textContent = "請輸入手機號碼"
      return
    } else if (!phoneValidation(scehduledPhone.value)){
      bookingFailed.textContent = "請輸入正確手機格式，包含國碼與號碼"
      return
    } else {
      // Get prime
      TPDirect.card.getPrime((result) => {

        if (result.status !== 0) {
          alert('get prime error ' + result.msg)
          return
        } else {


          fetch(
            "/api/booking"
          ).then(function (response) {
            return response.json();
          }).then(function (data) {
            let orderData = {}
            let order = {}
            let contact = {}
            order["price"] = data.data["price"]
            order["trip"] = data.data["attraction"]
            order["date"] = data.data["date"]
            order["time"] = data.data["time"]

            contact["name"] = scehduledUsername.value
            contact["email"] = scehduledEmail.value
            contact["phone"] = scehduledPhone.value
            order["contact"] = contact
            orderData["prime"] = result.card.prime
            orderData["order"] = order
            payByPrime(orderData)


          })
        }

      })
    }
  })


}



async function payByPrime(data) {
  let url = "/api/orders"
  let options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json",
    }
  }

  loading.style.display = "block"
  loadingBkgd.style.display = "block"
  try {
    let response = await fetch(url, options);
    let result = await response.json();
    if (response.status === 200) {

      let orderNumber = result["data"]["number"]
      loadThankyou(orderNumber)

      // window.location.reload();
    } else if (response.status === 400) {

      bookingFailed.textContent = result["message"]
    }
  } catch (err) {
    console.log({ "error": err.message });
  }
}

function loadThankyou(orderNumber) {
  document.location.href = '/thanks'
  sessionStorage.setItem("orderNumber", orderNumber);
}


function phoneValidation(phone) {
  if (phone.search(/^(\+\d{1,3}|00\d{1,3})\d{6,14}$/) != -1) {
    return true
  } else {
    return false
  }
}