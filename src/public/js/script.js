const socket = io();

const myVideoGrid = document.querySelector('.video-grid')
const myVideo = document.createElement('video')
const audioControl = document.querySelector('.mute-button')
const videoControl = document.querySelector('.video-button')

const myVideoClass = uuid()

myVideo.className = myVideoClass

myVideo.muted = true

let myVideoStream

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {

        const peer = new Peer(undefined, {
            host: '/',
            port: 5000,
            path: '/peerjs'
        });

        peer.on('open', id => {
            socket.emit('joinRoom', {room: ROOM_ID, peerId: id, videoClass: myVideoClass, username: USERNAME})
        })

        myVideoStream = stream
        addVideoStream(myVideo, stream)

        peer.on('call', call => {
            console.log(call)
            call.answer(stream)

            const video = document.createElement('video')
            video.className = call.metadata
            call.on('stream', remoteVideoStream => {
                addVideoStream(video, remoteVideoStream)
            })
        })

        socket.on('userConnected', msg => {
            connectUser(msg.peerId, msg.videoClass, stream)
        })

        socket.on('userDisconnect', videoClass => {
            document.getElementsByClassName(`${videoClass}`)[0].remove()
        })

        function connectUser (peerId, videoClass, stream) {
            const call = peer.call(peerId, stream, {metadata: myVideoClass});
            const video = document.createElement('video')
            video.className = `${videoClass}`
            call.on('stream', remoteVideoStream => {
                addVideoStream(video, remoteVideoStream)
            })
        }

    })
    .catch(err => {
        console.log("An error occurred: " + err);
    });


const addVideoStream = (video, stream) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    myVideoGrid.appendChild(video)
}


audioControl.addEventListener('click', () => {
    muteOrUnmuteAudio()
})

// MUTE OR UNMUTE AUDIO
function muteOrUnmuteAudio ()  {
    const enabled = myVideoStream.getAudioTracks()[0].enabled

    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false
        setUnmuteButton()
    }
    else {
        setMuteButton()
        myVideoStream.getAudioTracks()[0].enabled = true
    }

}

function setUnmuteButton () {
    const html = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
    `
    document.querySelector('.mute-button').innerHTML = html
}

function setMuteButton () {
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
    `
    document.querySelector('.mute-button').innerHTML = html
}


videoControl.addEventListener('click', () => {
    playOrStopVideo()
})


// PLAY OR STOP VIDEO
function playOrStopVideo ()  {
    const enabled = myVideoStream.getVideoTracks()[0].enabled

    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false
        setPlayButton()
    }
    else {
        setStopButton()
        myVideoStream.getVideoTracks()[0].enabled = true
    }

}

function setPlayButton () {
    const html = `
        <i class="stop fas fa-video-slash"></i>
        <span>Play Video</span>
    `
    document.querySelector('.video-button').innerHTML = html
}

function setStopButton () {
    const html = `
        <i class="fas fa-video"></i>
        <span>Stop Video</span>
    `
    document.querySelector('.video-button').innerHTML = html
}

const chatMessage = document.querySelector('input#chatMessage')
const messagesBlock = document.querySelector('.right-chat__messages-block')

chatMessage.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.value.length > 0) {
        socket.emit('message', {content: e.target.value})
        e.target.value = ''
    }
})

socket.on('createMessage', msg => {
    const div = document.createElement('div')
    div.className = 'messages-block__message-content'

    div.innerHTML = `
                    <div class="message-content__meta">${msg.username} <span><time>${msg.time}</time></span></div>
                        <div class="message-content__text">
                            <span>
                                ${msg.content}
                            </span>
                    </div>`

    messagesBlock.appendChild(div)
})

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}