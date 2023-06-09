from flask import *
from routes.attraction import attractionApi
from routes.user import userApi
from routes.booking import bookingApi
from routes.order import orderApi
from routes.upload import uploadImgApi
from routes.edit import editAllInfoApi
from asgiref.wsgi import WsgiToAsgi
import uvicorn


app = Flask(
    __name__,
    static_folder="public",
    static_url_path="/"
)

app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['JSON_SORT_KEYS'] = False

asgi_app = WsgiToAsgi(app)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/attraction/<id>")
def attractionnn(id):
    return render_template("attraction.html")


@app.route("/booking")
def booking():
    return render_template("booking.html")


@app.route("/thanks")
def thankyou():
    return render_template("thanks.html")


@app.route("/member")
def member():
    return render_template("member.html")






app.register_blueprint(attractionApi, url_prefix='/api')
app.register_blueprint(userApi, url_prefix='/api/user')
app.register_blueprint(bookingApi, url_prefix='/api/booking')
app.register_blueprint(orderApi, url_prefix='/api')
app.register_blueprint(uploadImgApi, url_prefix='/api/upload')
app.register_blueprint(editAllInfoApi, url_prefix='/api/edit')

if __name__ == '__main__':
    uvicorn.run(asgi_app, host='0.0.0.0', port=3000)
    # app.run(host='0.0.0.0', port=3000)
