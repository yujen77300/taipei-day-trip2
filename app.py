from flask import *


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


app.run(host='0.0.0.0', port=3000)
