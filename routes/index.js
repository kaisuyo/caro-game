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
              // room.turn = "o";
              // rooms[index] = room;
              io.to(rooms[index].clients[0]).emit("play", "x");
              io.to(rooms[index].clients[1]).emit("play", "o");
              // console.log(rooms);
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
          // console.log(indexClient);
          data.key = (indexClient== 1 )? "o":"x";
          console.log(rooms[indexRoom].clients);
          // console.log(room.turn, data.key);
          if (data.key == rooms[indexRoom].turn) {
            let temp = {
              x: data.posX,
              y: data.posY
            };
  
            if (!room.way.find( e => e.x == temp.x && e.y == temp.y)) {
              io.to(room.clients[0]).to(room.clients[1]).emit("choose", data);
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
          // console.log(rooms);
          io.emit("client leave", rooms);
        }
        // console.log(rooms);
      });

      socket.on("am winner", () => {
        let roomID = rooms.findIndex( e => e.clients.indexOf(socket.id) != -1);
        if (roomID != -1) {
          let winCLientID = rooms[roomID].clients.indexOf(socket.id);
          io.to(rooms[roomID].clients[winCLientID]).emit("win");
          io.to(rooms[roomID].clients[1-winCLientID]).emit("lose");
        }
      })
    });
  });
  return router;
}
