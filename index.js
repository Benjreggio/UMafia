var express = require('express');
var app = express();
var http = require('http');
var server = http.Server(app);
server.listen(8080,'127.0.0.1');
var io = require('socket.io').listen(server);
var path = require('path');
var games = [];
var hostSockets =[];
connections = [];
users = [];

console.log('server on');

app.use(express.static('public'))

app.get('/',function(req,res){
	res.sendFile(__dirname + '/public/UMafia.html');
});

function checkName(list,name)
{
	for(var i = 2; i<list.length;i++)
	{
		if(list[i] == name)
			return false;
	}
	return true;
}

io.sockets.on('connection',function(socket)
{
	connections.push(socket);
	console.log('new connection');

	socket.on('createGame',function(data)
	{
		newdata = [data[0],socket,data[1]];
		games.push(newdata);
		users.push(data[1]);
	})

	socket.on('host start',function(data)
	{
		io.sockets.emit('begin',data.players)
	})

	socket.on('join attempt',function(data)
	{
		var gameToJoin;
		console.log('joinattempt');
		users.push(data.player)
		for(var i = 0; i<games.length;i++)
		{
			if(games[i][0]==data.gc)
			{
				gameToJoin = games[i];
				break;
			}
		}
		if(gameToJoin)
		{
			if(checkName(gameToJoin,data.player))
			{
				socket.emit('join confirmed',{name : data.player,game: gameToJoin[0],host : gameToJoin[2]});
				gameToJoin[1].emit('join confirmed host',{name : data.player,game: gameToJoin[0],host : gameToJoin[2]})
				console.log("joined: " + gameToJoin[0]);
				gameToJoin.push(data.player);
				console.log(gameToJoin)
			}
			else
				socket.emit('name error',0);
		}
	})
	socket.on('decision input',function(data)
	{
		io.sockets.emit('decision output',{decider : data.decider,decision: data.decision});
	})

	socket.on('vig input',function(data)
	{
		io.sockets.emit('vig output',0);
	})

})
