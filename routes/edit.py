from flask import Flask, Blueprint, request, make_response
from flask.views import MethodView
import mysql.connector
import jwt
import os
import re
from dotenv import load_dotenv

load_dotenv()

editAllInfoApi = Blueprint('editAllInfo', __name__)


taipeiPool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="connectionPool",
    pool_size=20,
    pool_reset_session=True,
    host='localhost',
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_ACCOUNT'),
    password=os.getenv('DB_PW')
)


class editInfo(MethodView):
    def patch(self):
        token = request.cookies.get('token')
        mydb = taipeiPool.get_connection()
        cur = mydb.cursor(dictionary=True)
        tokenData = jwt.decode(token, os.getenv('JWT_KEY'), algorithms="HS256")
        if token is not None:
            try:
                data = request.get_json()
                userName = data["userName"]
                email = data["email"]
                phone = data["phone"]
                avatarUrl = data["avatarUrl"]
                avatarName = data["avatarName"]

                cur.execute(
                    "UPDATE member SET phone=%s WHERE name=%s", (phone, userName))
                cur.execute(
                    "SELECT avatar_name FROM member WHERE name=%s", [userName])
                info = cur.fetchone()
                originAvatar = info["avatar_name"]
    
                if email != tokenData["email"]:
                    cur.execute(
                        "UPDATE member SET email=%s WHERE name=%s", (email, userName))
                if avatarName != originAvatar:
                  
                    cur.execute(
                        "UPDATE member SET avatar_url=%s,avatar_name=%s WHERE name=%s", (avatarUrl, avatarName, userName))
                mydb.commit()
                return {"ok": True}, 200
            except Exception as e:
                return {'error': True, "message": str(e)}
            finally:
                cur.close()
                mydb.close()
        else:
            return ({"error": True, "message": "未登入系統，請先登入會員"}), 403


class editPwd(MethodView):
    def patch(self):
        token = request.cookies.get('token')
        mydb = taipeiPool.get_connection()
        cur = mydb.cursor(dictionary=True)
        tokenData = jwt.decode(token, os.getenv('JWT_KEY'), algorithms="HS256")
        if token is not None:
            try:
                data = request.get_json()
           
                cur.execute(
                    "SELECT password FROM member WHERE name=%s", [tokenData["name"]])
                info = cur.fetchone()

                if info["password"] == data["oldPwd"]:
                    if data["newPwd"] == data["repeatPwd"]:
                        if data["newPwd"] != data["oldPwd"]:
                            if isValidPwd(data["newPwd"]):
                                cur.execute(
                                    "UPDATE member SET password=%s WHERE name=%s", (
                                        data["newPwd"], tokenData["name"]))
                                mydb.commit()
                                return {"ok": True}, 200
                            else:
                                return {'error': True, "message": "密碼至少8位數，且包含至少一個數字與一個英文字母"}, 400
                        else:
                            return {'error': True, "message": "新的密碼不可與上一次密碼相同"}, 400
                    else:
                        return {'error': True, "message": "新的密碼與確認密碼不一致"}, 400
                else:
                    return {'error': True, "message": "輸入的現在密碼與原本密碼不一致"}, 400
            except Exception as e:
                return {'error': True, "message": str(e)}
            finally:
                cur.close()
                mydb.close()
        else:
            return ({"error": True, "message": "未登入系統，請先登入會員"}), 403


def isValidPwd(password):
    pwdRegex = re.compile(
        r'^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$')
    if re.fullmatch(pwdRegex, password):
        return True
    else:
        return False


editAllInfoApi.add_url_rule(
    '/info', view_func=editInfo.as_view('Operation about editing info'), methods=['PATCH'])

editAllInfoApi.add_url_rule(
    '/password', view_func=editPwd.as_view('Operation about editing password'), methods=['PATCH'])
