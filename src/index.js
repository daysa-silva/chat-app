const path = require('path');
const http = require('http')
const express = require('express');
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLinkMessage } = require('./utils/messages')
const { addUser,getUser, getUsersinRoom, removeUser } = require('./utils/users')

const app = express();
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, '../public')));

let count = 0;

io.on('connection', (socket) => {
    socket.on('join', (options, callback) => {
        const {error, user} = addUser(socket.id, options.username, options.room)

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('printMessage', generateMessage('Welcome!') )
        socket.broadcast.to(user.room).emit('printMessage', generateMessage(`${user.username} has joined!`) )
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersinRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (msg, cb) => {
        const filter = new Filter()
        const user = getUser(socket.id)

        if (filter.isProfane(msg)) {
            return cb('Profanity is not allowed!')
        }
        io.to(user.room).emit('printMessage', generateMessage(user.username, msg) )

        cb()
    })

    socket.on('sendLocation', (location, cb) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('printLink', generateLinkMessage(
            user.username,
            'My current location',
            `https://google.com/maps?q=${location.latitude},${location.longitude}`
        ))

        cb()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('printMessage', generateMessage(`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersinRoom(user.room)
            })
        }        
    })
})

const port = process.env.PORT || 3000
server.listen(port, () => console.log(`Server is runnig on port ${port}`) );