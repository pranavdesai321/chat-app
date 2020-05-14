const express = require('express')
const hbs = require('hbs')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage , generateUrl } = require('./utils/messages')
const {addUser, removeUser, getUser, getUserByRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')


const port = process.env.PORT || 3000

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('new websocket connection')


    socket.on('join', ({ username, room }, callback) => {
        const {error, user} = addUser({ id: socket.id, username, room})
        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('Admin', 'Welcome'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${username} has joined `))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users:getUserByRoom(user.room)
        })

        callback()

    })

    socket.on('sendMessage', (text, callback) => {
        const user = getUser(socket.id)

        const filter = new Filter()
        if(filter.isProfane(text)) {
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username, text))
        callback()
    })  

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserByRoom
            })
        }
        // console.log(user.room)
        
        
    })

    socket.on('sendLocation', ({latitude, longitude}, callback) => {
        const user = getUser(socket.id)
        const url = `https://google.com/maps?q=${latitude},${longitude}`
        io.to(user.room).emit('locationMessage', generateUrl(user.username, url))
        callback()
    })


})




server.listen(port, () => {
    console.log('Server is up and running on port ' + port)
})