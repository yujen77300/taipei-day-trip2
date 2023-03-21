from flask import Flask, Blueprint, request, make_response
from flask.views import MethodView
from datetime import datetime, timedelta
import mysql.connector
import jwt
import re
import requests
import os
from dotenv import load_dotenv

load_dotenv()

orderApi = Blueprint('order', __name__)

taipeiPool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="connectionPool",
    pool_size=20,
    pool_reset_session=True,
    host='localhost',
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_ACCOUNT'),
    password=os.getenv('DB_PW')
)


class order(MethodView):
    def get(self, orderNumber):
        token = request.cookies.get('token')
        if token is not None:
            responseData = {}
            attraction = {}
            contact = {}
            trip = {}
            data = jwt.decode(token, os.getenv('JWT_KEY'), algorithms="HS256")
            memberId = data["id"]
            name = data["name"]
            email = data["email"]
            mydb = taipeiPool.get_connection()
            cur = mydb.cursor(dictionary=True)

            cur.execute(
                "SELECT * FROM order_info JOIN member on order_info.member_id = member.member_id where order_number=%s and order_info.member_id = %s;", (orderNumber, memberId))
            orderInfoData = cur.fetchone()
    
            if orderInfoData is not None:
                try:
                    spotId = orderInfoData["spot_id"]
                    cur.execute(
                        "SELECT spot_info.name, spot_info.address, image.file FROM spot_info JOIN image on spot_info.id=image.spot_info_id WHERE spot_info.id=%s LIMIT 1", [spotId])
                    spotInfoData = cur.fetchone()
                    attraction["id"] = spotId
                    attraction["name"] = spotInfoData["name"]
                    attraction["address"] = spotInfoData["address"]
                    attraction["image"] = spotInfoData["file"]
                    trip["attraction"] = attraction
                    trip["date"] = orderInfoData["date"].strftime('%Y-%m-%d')
                    trip["time"] = orderInfoData["time"]
                    status = 0 if orderInfoData["status"] == "未付款" else 1
                    contact["name"] = name
                    contact["email"] = email
                    contact["phone"] = orderInfoData["phone"]
                    responseData["number"] = orderNumber
                    responseData["price"] = orderInfoData["price"]
                    responseData["trip"] = trip
                    responseData["contact"] = contact
                    responseData["status"] = status
                    return ({'data': responseData}), 200
                except Exception as e:
                    return {'error': True, "message": str(e)}
                finally:
                    cur.close()
                    mydb.close()
            else:
                cur.close()
                mydb.close()
                return ({'data': responseData}), 200
        else:
            return ({"error": True, "message": "未登入系統，請先登入會員"}), 403

    def post(self):
        orderInfo = {}
        orderNumber = 1

        token = request.cookies.get('token')
        data = jwt.decode(token, os.getenv('JWT_KEY'), algorithms="HS256")
        memberId = data["id"]
        orderData = request.get_json()
        validate_phone_number_pattern = r"^(\+\d{1,3}|00\d{1,3})\d{6,14}$"
        phoneValidation = re.match(
        validate_phone_number_pattern, orderData["order"]["contact"]["phone"])
    
        spotId = orderData["order"]["trip"]["id"]
        status = "未付款"
        contactPhone = orderData["order"]["contact"]["phone"]
        contactEmail = orderData["order"]["contact"]["email"]
        contactName = orderData["order"]["contact"]["name"]
        date = orderData["order"]["date"]
        time = orderData["order"]["time"]
        price = orderData["order"]["price"]


        now = datetime.now()
        formattedDate = now.strftime('%Y-%m-%d')
        dateForOrderNumber = formattedDate.replace('-', '')
        idForOrderNumber = str(memberId).zfill(4)
       
        if (token is not None and not phoneValidation):
            return ({"error": True, "message": "請輸入正確手機格式，包含國碼與號碼"}), 400
        elif token is not None:
            try:
                mydb = taipeiPool.get_connection()
                cur = mydb.cursor()
                cur.execute(
                    "SELECT * FROM order_info where member_id = %s ORDER BY id DESC LIMIT 1;", [memberId])
                info = cur.fetchall()

                # update orderNumber depends on user's order
                if not info:
                    serialNumber = str(orderNumber).zfill(3)
                    orderNumber = dateForOrderNumber + idForOrderNumber + serialNumber
                    cur.execute(
                        "INSERT INTO order_info(member_id,order_number,spot_id,date,time,price,status,contact_name,contact_email,contact_phone) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);", (memberId, int(orderNumber), spotId, date, time, price, status, contactName, contactEmail, contactPhone))
                    mydb.commit()
                else:
                    serialNumber = str(int((str(info[0][2]))[-3:])+1).zfill(3)
                    orderNumber = dateForOrderNumber + idForOrderNumber + serialNumber
             
                    cur.execute(
                        "INSERT INTO order_info(member_id,order_number,spot_id,date,time,price,status,contact_name,contact_email,contact_phone) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);", (memberId, int(orderNumber), spotId, date, time, price, status, contactName, contactEmail, contactPhone))
                    mydb.commit()

                # 後端呼叫 TapPay 提供的付款 API，提供必要付款資訊，完成付款動作。
                url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
                headers = {"Content-Type": "application/json",
                           "x-api-key": os.getenv('PARTNER_KEY')}
                postData = {
                    "prime": orderData["prime"],
                    "partner_key": os.getenv('PARTNER_KEY'),
                    "merchant_id": "dylan399_CTBC",
                    "details": "Taipei Day Trip",
                    "amount": orderData["order"]["price"],
                    "cardholder": {
                        "phone_number": orderData["order"]["contact"]["phone"],
                        "name": orderData["order"]["contact"]["name"],
                        "email": orderData["order"]["contact"]["email"]
                    },
                    "remember": False
                }

                response = requests.post(url, headers=headers, json=postData)

                if (response.json())["status"] == 0:
                    status = "付款成功"
                    cur.execute(
                        "UPDATE order_info SET status='已付款' WHERE order_number=%s;", [orderNumber])
                    mydb.commit()
                    payment = {}
                    payment["status"] = 1
                    payment["message"] = status
                    orderInfo["number"] = orderNumber
                    orderInfo["payment"] = payment
                    cur.execute(
                        "DELETE cart_spot_info FROM cart_spot_info INNER JOIN cart ON cart_spot_info.cart_id=cart.id WHERE cart.member_id=%s ;", [memberId])
                    cur.execute(
                        "DELETE cart FROM cart WHERE cart.member_id = %s ;", [memberId])
                    mydb.commit()
                    return ({'data': orderInfo}), 200
                else:
                    payment = {}
                    payment["status"] = 0
                    payment["message"] = status
                    orderInfo["number"] = orderNumber
                    orderInfo["payment"] = payment
                    cur.execute(
                        "DELETE cart_spot_info FROM cart_spot_info INNER JOIN cart ON cart_spot_info.cart_id=cart.id WHERE cart.member_id=%s ;", [memberId])
                    cur.execute(
                        "DELETE cart FROM cart WHERE cart.member_id = %s ;", [memberId])
                    mydb.commit()
                    return ({'data': orderInfo}), 200
            except Exception as e:
                return {'error': True, "message": str(e)}
            finally:
                cur.close()
                mydb.close()

        else:
            return ({"error": True, "message": "未登入系統，請先登入會員"}), 403


orderApi.add_url_rule(
    '/order/<orderNumber>', view_func=order.as_view('Specific order info'))
orderApi.add_url_rule(
    '/orders/', view_func=order.as_view('Pay for the order'), methods=['POST'])
