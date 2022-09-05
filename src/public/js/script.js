const socket = io();

const myVideoGrid = document.querySelector('.video-grid')
const audioControl = document.querySelector('.mute-button')
const videoControl = document.querySelector('.video-button')
const leaveMeeting = document.querySelector('.leave-meeting')
const participantsBtn = document.querySelector('.chat-participants')
const chatBtn = document.querySelector('.chat-messages')
const participantsBlock = document.querySelector('.main__participants')

const myVideoClass = uuid()

const myVideoWrapper = createVideoBlock(myVideoClass, USERNAME)

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
        addVideoStream(myVideoWrapper, stream)
        initAudioVideoState(stream)

        peer.on('call', call => {
            call.answer(stream)

            const videoWrapper = createVideoBlock(call.metadata.myVideoClass, call.metadata.username)

            call.on('stream', remoteVideoStream => {
                addVideoStream(videoWrapper, remoteVideoStream)
            })
        })

        socket.on('userConnected', msg => {
            connectUser(msg.peerId, msg.videoClass, msg.username, stream)
        })

        socket.on('userDisconnect', videoClass => {
            document.getElementsByClassName(`${videoClass}`)[0].remove()
        })

        function connectUser (peerId, videoClass, username, stream) {

            const call = peer.call(peerId, stream, {metadata: {myVideoClass, username: USERNAME}});

            const videoWrapper = createVideoBlock(videoClass, username)

            call.on('stream', remoteVideoStream => {
                addVideoStream(videoWrapper,  remoteVideoStream)
            })
        }

    })
    .catch(err => {
        console.log("An error occurred: " + err);
    });

function createVideoBlock (videoClass, username) {
    const videoWrapper = document.createElement('div')
    const video = document.createElement('video')
    videoWrapper.className = `videoWrapper ${videoClass}`
    videoWrapper.appendChild(video)
    videoWrapper.insertAdjacentHTML('beforeend', `<p>${username}</p>`)
    return videoWrapper
}

const addVideoStream = (videoWrapper, stream) => {

    const video = videoWrapper.querySelector('video')
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })

    myVideoGrid.appendChild(videoWrapper)
}

function initAudioVideoState (stream) {
    const audioEnabled = stream?.getAudioTracks()[0]?.enabled
    const videoEnabled = myVideoStream?.getVideoTracks()[0]?.enabled

    if (audioEnabled) {
        setUnmuteButton()
    }
    else {
        setMuteButton()
    }

    if (videoEnabled) {
        setStopButton()
    }
    else {
        setPlayButton()
    }

}

audioControl.addEventListener('click', () => {
    muteOrUnmuteAudio()
})

// MUTE OR UNMUTE AUDIO
function muteOrUnmuteAudio ()  {
    const enabled = myVideoStream?.getAudioTracks()[0]?.enabled

    if (enabled === undefined) return;

    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false
        setMuteButton()
    }
    else {
        setUnmuteButton()
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
    const enabled = myVideoStream?.getVideoTracks()[0]?.enabled

    if (enabled === undefined) return;

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

socket.on('roomUsers', ({room, users}) => {

    const participantsList = participantsBlock.querySelector('.main-participants__participants-list')

    participantsList.innerHTML = `${users.map(user => `<div class="participants-list__participant-content">
                                                            ${user.username}
                                                            </div>`).join('')}`
})

leaveMeeting.addEventListener('click', () => {
    window.history.back()
})

participantsBtn.addEventListener('click', () => {
    participantsBlock.style.opacity = '1'
    participantsBlock.style.zIndex = '9999'
})

chatBtn.addEventListener('click', () => {
    participantsBlock.style.opacity = '0'
    participantsBlock.style.zIndex = '-9999'
})

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}