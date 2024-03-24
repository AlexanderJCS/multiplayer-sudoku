from waitress import serve
from flask import Flask, render_template

app = Flask(__name__)
# TODO: Add the SECRET_KEY configuration to the app object.


@app.route('/')
def hello_world():
    return render_template("index.html")


if __name__ == "__main__":
    serve(app, host="localhost", port=5000)
