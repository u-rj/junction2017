var emotionInData = 0;
var commandInData = [];

var fs = require('fs');
var http = require('http');
var server = http.createServer();

//express
// 必要なパッケージの読み込み
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');

// POSTでdataを受け取るための記述
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 3000番を指定
var port = 8001;

// 正しく実行出来るか左記にアクセスしてテストする (GET http://localhost:3000/api)
app.get('/emotion', function(req, res) {
  if(req.query.face || req.query.face == 0){
    emotionInData += req.query.face * 1;
    res.json({ status: 'Success', data: emotionInData });
    return;
  }else if(req.query.sentence || req.query.sentence == 0){
    emotionInData += req.query.sentence * 1;
    res.json({ status: 'Success', data: emotionInData });
    return;
  }else if(req.query.empty || req.query.empty == 0){
    emotionInData = 0 * 1;
    res.json({ status: 'Success', data: emotionInData });
    return;
  }

  res.json({ status: 'Success', data: emotionInData });
});

// 正しく実行出来るか左記にアクセスしてテストする (GET http://localhost:3000/api)
app.get('/command', function(req, res) {
  var name = req.query.name;
  var data = req.query.data;
  
  if(name && data){
    commandInData[name] = data
    res.json({ status: 'Success', name: name, data: commandInData[name] });
    return;
  }else if(name && commandInData[name]){
    res.json({ status: 'Success', name: name, data: commandInData[name] });
    return;
  }

  res.json({ status: 'Failure'});
});

//サーバ起動
app.listen(port);
// console.log('listen on port ' + port);

//express end


server.on('request', function(req, res) {
  console.log(req.url);
  var stream = fs.createReadStream('index.html');
  res.writeHead(200, {'Content-Type': 'text/html'});
  stream.pipe(res);
});

var io = require('socket.io').listen(server);
server.listen(8000);

io.sockets.on('connection', function(socket) {

  //command-in
  //----------------------------------------
  
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
