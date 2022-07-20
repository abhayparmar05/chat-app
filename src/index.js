//servers side
const express = require('express')
const path = require('path')//node js core module for that resion we not install
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
//because it file return object
const  {generateMessage,generateLocationMessage }=require('./utils/messages')
const {adduser,removeUser,getUser,getUsersInRoom,} =require('./utils/users')

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))
//create a connect to webscoket
io.on('connection', (socket) => {
   console.log('new websocket connection')
   
   //join a user in room 
   socket.on('join',(option,callback)=>{
      //user login
      const {error,user} = adduser({id: socket.id , ...option})

      if(error){
         return callback(error)
      }
      socket.join(user.room)
      //create a welcome Message who join room
   socket.emit('message', generateMessage('Admin','welcome!'))

      //when a new user join in room 
   socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has Joined!`))
      io.to(user.room).emit('roomData',{
         room:user.room,
         users:getUsersInRoom(user.room)
      })
   callback()

   })

   //send message
   socket.on('sendMessage', (message, callback) => {
      const user = getUser(socket.id)
      const filter = new Filter()

      if(filter.isProfane(message))
      {
         return callback('profanity is not allow')
      }
      io.to(user.room).emit('message', generateMessage(user.username,message))
      callback()
   })
   //send loaction to all user 
   socket.on('sendLocation', (coords,callback) => {
      const user = getUser(socket.id)

      io.to(user.room).emit('loactionMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
      callback()
   })
   //when 1 user is disconnect
   socket.on('disconnect', () => {
      const user =  removeUser(socket.id)
      if(user){
         io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`))
         io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
         })
      }
   })
})
server.listen(port, () => {
   console.log('server port : ' + port)
})