from flask import *
from resources.attraction import attractionApi
from resources.user import userApi
from resources.booking import bookingApi
from resources.order import orderApi
from resources.upload import uploadImgApi
from resources.edit import editAllInfoApi


app = Flask(
    __name__,
    static_folder="public",
    static_url_path="/"
)

app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['JSON_SORT_KEYS'] = False


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
app.run(host='0.0.0.0', port=3000)
