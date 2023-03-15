from flask import Flask, jsonify
import mysql.connector
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
with open("data/taipei-attractions.json", encoding="utf-8") as json_file:
    data = json.load(json_file)

spotsInfo = data["result"]["results"]

taipeiPool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="connectionPool",
    pool_size=20,
    pool_reset_session=True,
    host='localhost',
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_ACCOUNT'),
    password=os.getenv('DB_PW')
  )

mydb = taipeiPool.get_connection()
cur = mydb.cursor()


for i in spotsInfo:
    cur.execute("INSERT IGNORE INTO spot_info(id, CAT, MEMO_TIME, MRT, address, description, direction, latitude, longitude, name) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                (i["_id"], i["CAT"], i["MEMO_TIME"], i["MRT"], i["address"], i["description"], i["direction"], i["latitude"], i["longitude"], i["name"]))
mydb.commit()


spotIdAndImage = {}

for i in spotsInfo:
    spotImageAddress = []
    spotImageAddressWithJpgPng = []
    id = i["_id"]
    spotImageAddress = i["file"].split('https://')

    spotImageAddress.pop(0)
    spotImageAddressWithJpgPng = spotImageAddress
    for address in spotImageAddress[:]:
 
        if (address[-3:]).upper() == "PNG" or (address[-3:]).upper() == "JPG":
            pass
        else:

            spotImageAddressWithJpgPng.remove(address)

    spotIdAndImage[id] = spotImageAddressWithJpgPng



for i in spotsInfo:
    for image in spotIdAndImage[i["_id"]]:
        cur.execute("INSERT INTO image(spot_info_id, file) VALUES(%s,%s)",
                    (i["_id"], image))
mydb.commit()
cur.close()
mydb.close()


app.run(port=5000)
