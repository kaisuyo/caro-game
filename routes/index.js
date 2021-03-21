var express = require('express');
var router = express.Router();
var rooms = require('../module/rooms');

function singleFilter(id) {
  let arrRoom = rooms.filter( e => e.clients.indexOf(id) != -1);
  let temp = arrRoom.filter( e => e.clients.length == 1);
  if (temp.length < arrRoom.length) {
    temp.forEach( e => {
      let index = rooms.findIndex( element => element.id == e.id);
      rooms.splice(index, 1);
    })
  }
}

function clearRooms() {
  let temp = rooms.filter( e => e.clients.length == 1);
  temp.forEach( e => {
    let index = rooms.findIndex( element => element.id == e.id);
    rooms.splice(index, 1);
  });
}

module.exports = function(io) {
  router.get('/', function(req, res, next) {
    res.render('index');

    setInterval ( () => {
      clearRooms();
      io.emit("rooms update", rooms);
    }, 60000);

    io.on("connection", socket => {

      io.to(socket.id).emit("show menu", socket.id);
      socket.emit("get rooms", rooms);
      
      socket.on("send id game", id => {

        let room = rooms.find( e => e.id == id);
        if (!room) {
          rooms.push({
            id,
            clients: [socket.id],
            turn: 'o',
            way: []
          });
        } else {
          let index = rooms.findIndex(e => e.id == room.id);
          if (rooms[index].clients.length < 2) {
            if (rooms[index].clients.indexOf(socket.id) == -1) {
              rooms[index].clients.push(socket.id);
              io.to(rooms[index].clients[0]).emit("play", "x");
              io.to(rooms[index].clients[1]).emit("play", "o");
            }
          }
        }
        singleFilter(socket.id);
        io.emit("rooms update", rooms);
      });

      socket.on("clickBoad", data => {
        let room = rooms.find( e => e.clients.indexOf(socket.id) != -1);
        if (room) {
          let indexRoom = rooms.findIndex(e => e.id == room.id);
          let indexClient = room.clients.indexOf(socket.id);
          data.key = (indexClient== 1 )? "o":"x";
          data.turn = room.turn;
          if (data.key == rooms[indexRoom].turn) {
            let temp = {
              x: data.posX,
              y: data.posY
            };

            if (!room.way.find( e => e.x == temp.x && e.y == temp.y)) {
              io.to(room.clients[1-indexClient]).emit("choose", data);
              rooms[indexRoom].turn = (rooms[indexRoom].turn == "x") ? "o":"x"; 
              rooms[indexRoom].way.push(temp);
            }
          }
        }
      });

      socket.on("disconnect", () => {
        let room = rooms.find(e => e.clients.indexOf(socket.id) != -1);
        if (room){
          let indexRoom = rooms.findIndex(e => e.id == room.id);
          room.clients.forEach( e => {
            io.to(e).emit("partner leave");
          });
          rooms.splice(indexRoom, 1);
          io.emit("client leave", rooms);
        }
      });

      socket.on("am winner", () => {
        let roomID = rooms.findIndex( e => e.clients.indexOf(socket.id) != -1);
        if (roomID != -1) {
          let winCLientID = rooms[roomID].clients.indexOf(socket.id);
          io.to(rooms[roomID].clients[winCLientID]).emit("win");
          io.to(rooms[roomID].clients[1-winCLientID]).emit("lose");
        }
      });

      socket.on("replay request", key => {
        let indexRoom = rooms.findIndex(e => e.clients.indexOf(socket.id) != -1);
        let indexClient = (key == "x") ? 0:1;
        io.to(rooms[indexRoom].clients[1-indexClient])
          .emit("please replay");
      });
      socket.on("accept replay", () => {
        let roomIndex = rooms.findIndex( e => e.clients.indexOf(socket.id) != -1);
        io.to(rooms[roomIndex].clients[0]).to(rooms[roomIndex].clients[1]).emit("new game");
        rooms[roomIndex].way = [];
      });

      socket.on("send message", msg => {
        let room = rooms.find( e => e.clients.indexOf(socket.id) != -1);
        io.to(room.clients[1])
          .to(room.clients[0]).emit("take msg", msg);
      });
    });
  });
  return router;
}
