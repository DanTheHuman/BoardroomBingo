var express = require('express');
var app = express();
var serv = require('http').Server(app);
const fs = require('fs');

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});
app.use('/public',express.static(__dirname + '/public'));

serv.listen(2000);
console.log("Server Started.");
//***********************************/


var SOCKET_LIST = [];
var PLAYER_LIST = [];
//var WORD_LIST = ["Scale","Top of mind","There There", "Sensitive", "Disrupt","X as a Service", "Revolutionize", "Learning", "Above-board","Actionable","Action Item","Anonymize","At the end of the day","Availability", "Backdoor","Baked-in","Ballpark","Bandwidth","Bang for the buck","Baseline","Best in Breed","Best Practices", "Bifurcate","Binary","Bio break","Brass tacks","Brick and Mortar","Brown-bag","Bubble it up","Bucketize","Build","End to end","Buy-in","C-level","Cadence","Cannibalize","Cascade","Chime in","Circle back","Cooperition","Core competencies","Critical Mass","Deck","deep dive","Dog and pony show","Drop dead date","Ducks in a row","Out of pocket","offline","awesome","synergy","cross-functional","low hanging fruit","paradigm","reach out","Roadmap","sport analogy","combat analogy","Uber of x","Frame this as...","Target segment","Position as...","Double Click","game changing","leverage","open the kimono","run up the flagpole","blue sky","skin in the game","drink the kool-aid","eat the dogfood","value add","execute","here here"];

//Read Wordlist1.JSON
let rawdata = fs.readFileSync('./wordlist1.json');
var WORD_LIST = JSON.parse(rawdata);

console.log(SOCKET_LIST.length);
//Player constructor
var Player = function(id) {
	var self = {
		id:id,
		number:"" + Math.floor(10 *Math.random()),
		//number: PLAYER_LIST.length+1,
		score:0,
		words:[],
		winner:false,
		name:"",
	}
	return self;
}
		

//Socket connection happens here
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	
	//Record new socket connection and instantiate a new player
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	var player = Player(socket.id);
	PLAYER_LIST[socket.id] = player;
	console.log('Socket connection: ' + player.number + '. Score is ' + player.score);
	
	//Send Word list
	
	for (i = 0; i < 25; i++){
		//random number between 0-75
		var randnum = Math.floor(Math.random()*WORD_LIST.words.length);
		player.words[i] = WORD_LIST.words[randnum];
	}
	socket.emit('wordList',{
		words:player.words,
	});
	

	//Server listening to delete a user when they disconnect
	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		delete PLAYER_LIST[socket.id];
	});
	
	
	//Server listening to scoreUp a user
	socket.on('scoreUp',function(data){
		player.score = player.score + data.amount;
		console.log('scoreUp for ' + player.number + ': ' + player.score); 
	});
	
	
	//Server sending out "serverMsg" to client with some data
	socket.emit('welcomeMsg',{
		msg:'You are player: ' + player.number,
		//test:player.words,
	});
	
});


	

setInterval(function(){
	var pack = [];
	for(var i in PLAYER_LIST){
		var player = PLAYER_LIST[i];
		pack.push({
			number:player.number,
			score:player.score
		});
	}
	//player.emit('updateScoreList',pack);
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('updateScoreList', pack);
	}
	
},1000/25);
		
		
		
		
		
		
