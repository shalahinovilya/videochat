import express from 'express'
import { v4 as uuidv4 } from 'uuid';
import * as path from "path";
import * as http from "http";
import {Server} from "socket.io";
import {ExpressPeerServer} from "peer";
import {getCurrentUser, getRoomUsers, joinUser, userLeaveChat} from "./src/utils/users.js";
import {formatMessage} from "./src/utils/formatMessage.js";


const app = express()
const server = http.createServer(app)
const io = new Server(server)
const peerServer = ExpressPeerServer(server, {
    debug: true
})

app.use(express.static(path.resolve('src', 'public')))
app.use('/peerjs', peerServer)
app.use(express.urlencoded({extended: true}))


app.set('views', path.resolve('src', 'views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render(`index`)
})

app.get('/createRoom/:username/', (req, res) => {
    res.redirect(`/videochat/${uuidv4()}?username=${req.params.username}`)
})

app.get('/enterRoom/:roomId/:username/', (req, res) => {
    const {roomId, username} = req.params
    res.redirect(`/videochat/${roomId}?username=${username}`)
})

app.get('/videochat/:room/', (req, res) => {
    res.render('videochat', {roomId: req.params.room, username: req.query.username})
})

io.on('connection', socket => {

    socket.on('joinRoom', msg => {

        const user = joinUser(socket.id, msg.room, msg.username, msg.videoClass)

        socket.join(user.room)

        socket.broadcast.to(user.room).emit('userConnected', {peerId: msg.peerId, videoClass: user.videoClass})

        io.to(user.room).emit('roomUsers', {room: user.room, users: getRoomUsers(user.room)})

    })

    socket.on('disconnect', () => {

        const user = userLeaveChat(socket.id)

        if (user) {
            io.to(user.room).emit('userDisconnect', user.videoClass)
            io.to(user.room).emit('roomUsers', {room: user.room, users: getRoomUsers(user.room)})
        }
    })

    socket.on('message', msg => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('createMessage', formatMessage(msg.content, user.username))
    })
})

export default server