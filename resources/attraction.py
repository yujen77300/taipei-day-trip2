from flask import Flask, Blueprint, request
from flask.views import MethodView
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

attractionApi = Blueprint('attraction', __name__)


taipeiPool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="connectionPool",
    pool_size=20,
    pool_reset_session=True,
    host='localhost',
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_ACCOUNT'),
    password=os.getenv('DB_PW')
)


class attractionCategory(MethodView):
    def get(self):
        categories = []
        try:
            mydb = taipeiPool.get_connection()
            cur = mydb.cursor()
            cur.execute("SELECT CAT FROM spot_info GROUP BY CAT")
            info = cur.fetchall()
            for category in info:
              # 從tuple轉為string
                string = ''.join(category)
                string.replace('\u3000', ' ')
                categories.append(string)
            return ({'data': categories})
        except Exception as e:
            return {'error': True, "message": str(e)}
        finally:
            cur.close()
            mydb.close()

attractionApi.add_url_rule(
    '/categories', view_func=attractionCategory.as_view('Categories of all tourist spots'))
