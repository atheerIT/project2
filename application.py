import os

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

rooms={}
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/rooms")
def roomsName():
    return jsonify({"rooms": rooms})

@app.route("/newRoom", methods=["POST"])
def addRoom():
    roomName = request.form.get("roomName")
    if roomName in rooms:
        return jsonify({"success": False})
    else:
        chat=[]
        rooms[roomName]=chat
        return jsonify({"success": True})

@app.route("/chatt", methods=["POST"])
def chatt():
    req = request.form.get("roomName")
    chatt = rooms[req]
    return jsonify({"chatt": chatt})


@socketio.on("submit room")
def newRoom(data):
    emit("anounce room", {"rooms": rooms}, broadcast = True)

@socketio.on("message sent")
def newMessag(data):
    roomName = data["roomName"]
    chat = rooms[roomName]
    if len(chat) == 100:
        chat.pop(0)
        chat.append(data['msg'])
    else:
        chat.append(data['msg'])
    rooms[roomName]=chat
    emit('messege recieved', {"roomName": roomName, "msg": [data["msg"]]}, broadcast = True)