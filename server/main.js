var fs = require('fs');
var http = require('http');
var server = http.createServer();


server.on('request', function(req, res) {
  var stream = fs.createReadStream('index.html');
  res.writeHead(200, {'Content-Type': 'text/html'});
  stream.pipe(res);
});

var io = require('socket.io').listen(server);
server.listen(8000);

io.sockets.on('connection', function(socket) {

  //command-in
  //----------------------------------------
  var commandInData = [];
  socket.on('command-in', function (data) {
    console.log('command-in', data);

    if(data.data){
      commandInData[data.name] = data.data;
    }else{
      commandInData[data.name] = (commandInData[data.name])?commandInData[data.name]:null;
    }
    socket.emit('command-out', {name: data.name, data: commandInData[data.name]});
    socket.broadcast.emit('command-out', {name: data.name, data: commandInData[data.name]});
  });

  //emotion-in
  //----------------------------------------
  var emotionInData = 0;
  socket.on('emotion-in', function (data) {
    console.log('emotion-in', data);

    if(data.name == 'face'){
      if(data.data){
        emotionInData += data.data;
      }
    }else if(data.name == 'sentence'){
      if(data.data){
        emotionInData += data.data;
      }
    }else if(data.name == 'empty'){
      emotionInData = 0;
    }

    socket.emit('emotion-out', emotionInData);
    socket.broadcast.emit('emotion-out', emotionInData);
  });

});
