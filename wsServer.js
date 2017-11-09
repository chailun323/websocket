var app = require('http').createServer();
var io = require('socket.io')(app);
var PORT = 3000;
//客户端计数
var clientCount = 0;
//用来 存储客户端socket
var socketMap = {};

var bindListener = function (socket, event) {
  socket.on(event, function (data) {
    if (socket.clientNum % 2 == 0) {
      if (socketMap[(socket.clientNum - 1)]) {
        socketMap[(socket.clientNum - 1)].emit(event, data)
      }
    } else {
      if (socketMap[(socket.clientNum + 1)]) {
        socketMap[(socket.clientNum + 1)].emit(event, data);
      }
    }
  })
}

app.listen(PORT);
io.on('connection', function (socket) {
  clientCount = clientCount + 1;
  socket.clientNum = clientCount;
  socketMap[clientCount] = socket;
  if (clientCount % 2 == 1) {
    socket.emit('waiting', 'waiting for another person');
  } else {
    socket.emit('start');
    if (socketMap[(clientCount - 1)]) {
      socketMap[(clientCount - 1)].emit("start");
    } else {
      socket.emit("leave");
    }
  }

  bindListener(socket, "init");
  bindListener(socket, "next");
  bindListener(socket, "rotate");
  bindListener(socket, "left");
  bindListener(socket, "right");
  bindListener(socket, "fixed");
  bindListener(socket, "down");
  bindListener(socket, "fall");
  bindListener(socket, "line");
  bindListener(socket, "time");
  bindListener(socket, "lose");
  bindListener(socket, "bottomLines");
  bindListener(socket, "addTailLines");

  socket.on('disconnect', function () {
    if (socket.clientNum % 2 == 0) {
      if (socketMap[(socket.clientNum - 1)]) {
        socketMap[(socket.clientNum - 1)].emit("leave");
      }
    } else {
      if (socketMap[(socket.clientNum + 1)]) {
        socketMap[(socket.clientNum + 1)].emit("leave");
      }
    }
    delete(socketMap[socket.clientNum]);
  });
});
console.log('websocket listening on port' + PORT);