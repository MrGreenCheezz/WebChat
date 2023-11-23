const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'San94iki',
    port:5432,
})

const io = require("socket.io")(server,{
  cors:{
    origin:"*",
    methods:'*'
  }
});

var usersSocket = new Map();
var socketUsers = new Map();
var UserCounter = 0;

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

server.listen(3000,() => {
  console.log('listening on *:3000');
});


io.on('connection', (socket)=>{
  UserCounter++;
  socket.join("Main" + socket.id);
  console.log("User Connected!" + " " + UserCounter)
  socket.on('disconnect', ()=>{
    let localName = socketUsers.get(socket.id);
    socketUsers.delete(socket.id);
    usersSocket.delete(localName);
    console.log("Disconnected")
    UserCounter--;
  })
  socket.on('client-send-message',async (msg)=>{
    console.log(msg.Author + "     " + msg.Text + "   " + msg.TodayDate);
    try{
      let sqlRes = await pool.query('INSERT INTO messages(authorname, messagecontent, messagedate) VALUES ($1, $2, $3)', [msg.Author,msg.Text,msg.TodayDate]);
    }catch(e){
      console.log(e)
    }
    io.emit("serverMessage",msg);
  })

  socket.on('setName',(name)=>{
    if(usersSocket.has(name)){
     socket.disconnect();
    }
    usersSocket.set(name, socket.id);
    socketUsers.set(socket.id,name);
  })

  socket.on('getLastMessages', async()=>{
    let messages;
    try{
      messages = await pool.query('SELECT * FROM messages ORDER BY id ASC LIMIT 100');
    }
    catch(e){
      console.log(e);
      return;
    }
    console.log("Loading MEssages")
    socket.emit('recieveLastMessages', messages.rows);
  })

  socket.on('voice', (data)=>{
    socket.broadcast.emit('voice',data);
  });
})