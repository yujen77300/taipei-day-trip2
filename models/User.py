import mysql.connector
import os
import jwt
from dotenv import load_dotenv

load_dotenv()

taipeiPool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="connectionPool",
    pool_size=20,
    pool_reset_session=True,
    host='localhost',
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_ACCOUNT'),
    password=os.getenv('DB_PW')
)


def getUserAuthData(data):
    mydb = taipeiPool.get_connection()
    cur = mydb.cursor(dictionary=True)
    try:
      cur.execute(
          "SELECT avatar_url, avatar_name,phone,email from member WHERE name =%s;", [data["name"]])
      info = cur.fetchone()
      data["email"] = info["email"]
      data["avatarUrl"] = info["avatar_url"]
      data["avatarName"] = info["avatar_name"]
      data["phone"] = info["phone"]
      return data
    except Exception as e:
      return {'error': True, "message": str(e)}
    finally:
      cur.close()
      mydb.close()
