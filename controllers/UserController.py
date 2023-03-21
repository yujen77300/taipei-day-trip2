from flask import Flask, Blueprint, request, make_response
from datetime import datetime, timedelta
import jwt
import re
import os
from models.User import *


class UserController():

    def getUserAuth(self, token):
        try:
          data = jwt.decode(token, os.getenv('JWT_KEY'), algorithms="HS256")
          loginData = getUserAuthData(data)
          return loginData
        except Exception as e:
            return {'error': True, "message": str(e)}

