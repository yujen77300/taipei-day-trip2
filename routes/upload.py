from flask import Flask, Blueprint, request, make_response
from flask.views import MethodView
import mysql.connector
import jwt
import os
import string
import random
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from azure.storage.blob import BlobServiceClient

storage_account_key = os.getenv('STORAGE_ACCOUNT_KEY')
storage_account_name = os.getenv('STORAGE_ACCOUNT_NAME')
connection_string = os.getenv('CONNECTION_STRING')
container_name = os.getenv('CONTAINER_NAME')

load_dotenv()

uploadImgApi = Blueprint('loadImg', __name__)

taipeiPool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="connectionPool",
    pool_size=20,
    pool_reset_session=True,
    host='localhost',
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_ACCOUNT'),
    password=os.getenv('DB_PW')
)


class uploadAvatar(MethodView):
    def post(self):
        avatarInfo = {}
        token = request.cookies.get('token')
        data = jwt.decode(token, os.getenv('JWT_KEY'), algorithms="HS256")
        if token is not None:
            img = request.files['form']
            if img.filename == "":
                return ({"error": True, "message": "Please select a file"}), 400
            if img:
                try:
                    fileName = secure_filename(img.filename)
                    fileName.split('.')
                    ext = fileName.split('.')[-1]
                    randomName = imgRandomName()
                    randonmFileName = randomName + '.' + ext
                    # get theh client object
                    blob_service_client = BlobServiceClient.from_connection_string(
                        connection_string)
                    blob_client = blob_service_client.get_blob_client(
                        container=container_name, blob=randonmFileName)
                    blob_client.upload_blob(img)



                    avatarInfo["userId"] = data["id"]
                    avatarInfo["name"] = data["name"]
                    avatarInfo["fileName"] = fileName
                    avatarInfo["avatarUrl"] = blob_client.url
                    return ({"data": avatarInfo}), 200
                except Exception as e:
                    return {'error': True, "message": str(e)}
            else:
                return ({"error": True, "message": "未登入系統，請先登入會員"}), 403


def imgRandomName (size=20 , chars=string.ascii_letters+string.digits):
    return ''.join(random.choice(chars) for _ in range (size))


uploadImgApi.add_url_rule(
    '/avatar', view_func=uploadAvatar.as_view('Operation about avatar'), methods=['POST'])
