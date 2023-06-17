// import express from 'express'
// import * as http from 'http'
// import { Server } from 'socket.io'
// // import {
// //     saveChatMessage,
// //     createChatroom,
// //     checkIfAnyUserAlreadyGuessed,
// //     getMaxScoreForChatroomId,
// //     getScoreListByChatroomId,
// //     updateScoreboard,
// //     recordGuess,
// //     getUserById,
// // } from '../common/services'
// // import { generateUniqueId } from '../common/utils/helpers'
// import * as dotenv from 'dotenv'
// import { Message } from '../common/types'

// dotenv.config({ path: '../env/local.env' })

// const app = express()
// const httpServer = http.createServer(app)
// const io = new Server(httpServer, {
//     cors: {
//         origin: 'http://localhost:3000',
//         methods: ['GET', 'POST'],
//         allowedHeaders: ['my-custom-header'],
//         credentials: true,
//     },
// })

// const PORT = process.env.NODE_WEBSOCKET_PORT || 3001

// const connectedUsers: { id: string; username: string; chatroomId: string }[] =
//     []
// const activeChatrooms = []

// io.on('connection', async (socket) => {
//     console.log(`User connected with ID: ${socket.id}`)

//     socket.on('createRoom', async (username) => {
//         const chatroomId = generateUniqueId()
//         try {
//             await createChatroom(chatroomId)
//         } catch (error) {
//             console.error('Error creating chatroom:', error.message)
//         }
//         socket.join(chatroomId)
//         const user = { id: socket.id, username, chatroomId }
//         connectedUsers.push(user)
//         io.to(chatroomId).emit('userConnected', user)
//         io.to(chatroomId).emit('connectedUsers', connectedUsers)
//         console.log(
//             `User ${username} created and joined chatroom ${chatroomId}`
//         )
//         activeChatrooms.push(chatroomId)
//         socket.emit('chatroomCreated', chatroomId)
//     })

//     socket.on('joinRoom', (username, chatroomId) => {
//         const user = { id: socket.id, username, chatroomId }
//         connectedUsers.push(user)
//         const chatroom = activeChatrooms.find((c) => c === chatroomId)
//         if (chatroom) {
//             socket.join(chatroomId)
//             console.log(
//                 `User ${username} joined the chatroom with ID: ${chatroomId}`
//             )
//         } else {
//             console.log(`Chatroom with ID: ${chatroomId} not found.`)
//         }
//     })

//     socket.on('disconnect', () => {
//         console.log(`User disconnected with ID: ${socket.id}`)
//         const index = connectedUsers.findIndex((u) => u.id === socket.id)
//         if (index !== -1) {
//             const user = connectedUsers.splice(index, 1)[0]
//             // [0] is the return of the splice function (always an array), which here is the deleted user
//             io.emit('userDisconnected', user)
//             io.emit('connectedUsers', connectedUsers)
//             console.log(`User ${user.username} left the chatroom`)
//         }
//     })

//     socket.on('chatMessage', async (msg: Message, userId: number) => {
//         if (msg.user_name !== 'System') {
//             const user = connectedUsers.find((u) => u.id === socket.id)
//             if (user) {
//                 const chatroomId = user.chatroomId
//                 console.log('User and chatroomId:', user, chatroomId)
//                 io.to(chatroomId).emit('chatMessage', {
//                     user_name: user.username,
//                     message: msg,
//                 })
//             }
//         } else {
//             // System message, don't save to DB but broadcast
//             console.log('SYSTEM')
//             io.emit('chatMessage', msg)
//         }
//     })

//     socket.on('startGame', (chatroomId, trackPreviews) => {
//         socket.to(chatroomId).emit('gameStarted', trackPreviews) // emit trackPreviews
//     })

//     socket.on(
//         'updateScore',
//         async (
//             currentChatroomId: string,
//             userId: number,
//             points: number,
//             correctGuessType: string,
//             songName: string,
//             artistName: string
//         ) => {
//             let user = await getUserById(userId)
//             console.log('server received chatroom id', currentChatroomId)

//             // Only update the score if a guess was made
//             if (songName || artistName) {
//                 // Check for song name guess
//                 if (correctGuessType === 'song name') {
//                     let alreadyGuessedSong = await checkIfAnyUserAlreadyGuessed(
//                         currentChatroomId,
//                         songName,
//                         'song'
//                     )

//                     if (!alreadyGuessedSong) {
//                         console.log('Song guessed')
//                         // If no one else has guessed correctly, update the scoreboard and record the guess
//                         await updateScoreboard(
//                             currentChatroomId,
//                             userId,
//                             points
//                         ) // Update the score in database
//                         // Record the guess
//                         await recordGuess(
//                             userId,
//                             currentChatroomId,
//                             songName,
//                             'song'
//                         )
//                     }
//                 }

//                 // Check for artist name guess
//                 if (correctGuessType === 'artist name') {
//                     let alreadyGuessedArtist =
//                         await checkIfAnyUserAlreadyGuessed(
//                             currentChatroomId,
//                             artistName,
//                             'artist'
//                         )

//                     if (!alreadyGuessedArtist) {
//                         // If no one else has guessed correctly, update the scoreboard and record the guess
//                         await updateScoreboard(
//                             currentChatroomId,
//                             userId,
//                             points
//                         ) // Update the score in database
//                         // Record the guess
//                         await recordGuess(
//                             userId,
//                             currentChatroomId,
//                             artistName,
//                             'artist'
//                         )
//                     }
//                 }
//             }

//             // Retrieve the updated score from the database
//             let maxScore = await getMaxScoreForChatroomId(currentChatroomId)

//             console.log('maxScore', maxScore)
//             // Emit the score update
//             socket.emit('scoreUpdated', {
//                 user,
//                 newScore: maxScore,
//                 correctGuessType,
//             })
//             // If the user has reached the winning score, end the game
//             if (maxScore >= 2) {
//                 const scores = getScoreListByChatroomId(currentChatroomId)
//                 console.log('game over', scores)
//                 io.to(currentChatroomId).emit('gameOver', scores, userId)
//             }
//         }
//     )
// })

// httpServer.listen(PORT, () => {
//     console.log(`Listening on port ${PORT}`)
// })
