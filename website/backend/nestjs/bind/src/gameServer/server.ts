// FIXME - this is a hack to get the server to work, maybe socket.io is not in package.json

// var app = require('express')();
// var http = require('http').Server(app);
// var io = require('socker.io')(http);
// import {Server} from "socket.io";

// app.get("/", function(req, res ) {
// 	res.sendFile(__dirname + '/index.html')
// })

// io.on('connection', (socket) {
// 	console.log('a user is connected');
// 	socket.on('disconnect', function(){
// 		console.log('a user is disconnected');
// 	})
// 	socket.on('chat message', function(msg:string){
// 		console.log('message recu: ' + msg);
// 	})
// })

// http.listen(3000, function() {
// 	console.log("Server running on port 3000")
// })