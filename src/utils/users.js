const users = []

export function joinUser (id, room, username, videoClass) {
    const user = {id, room, username, videoClass}

    users.push(user)

    return user
}

export function userLeaveChat (userId) {
    const userIndex = users.findIndex(user => user.id === userId)

    if (userIndex !== -1) return users.splice(userIndex, 1)[0]
}

export function getCurrentUser (userId) {
    return users.find(user => user.id === userId)
}

export function getRoomUsers (room) {
    return users.filter(user => user.room === room)
}