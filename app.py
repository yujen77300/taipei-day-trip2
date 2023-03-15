from flask import *
from resources.attraction import attractionApi
from resources.user import userApi


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




app.register_blueprint(attractionApi, url_prefix='/api')
app.register_blueprint(userApi, url_prefix='/api/user')
app.run(host='0.0.0.0', port=3000)
