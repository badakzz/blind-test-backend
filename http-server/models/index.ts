import User from './User'
import ChatMessage from './ChatMessage'
import Guess from './Guess'
import Chatroom from './Chatroom'
import Playlist from './Playlist'
import Song from './Song'
import Score from './Score'
import Payment from './Payment'

User.hasMany(ChatMessage, { foreignKey: 'user_id' })
ChatMessage.belongsTo(User, { foreignKey: 'user_id' })

User.hasMany(Guess, { foreignKey: 'song_guesser_id' })
Guess.belongsTo(User, { foreignKey: 'song_guesser_id' })

User.hasMany(Guess, { foreignKey: 'artist_guesser_id' })
Guess.belongsTo(User, { foreignKey: 'artist_guesser_id' })

Chatroom.hasMany(ChatMessage, { foreignKey: 'chatroom_id' })
ChatMessage.belongsTo(Chatroom, { foreignKey: 'chatroom_id' })

Chatroom.hasOne(Song, { foreignKey: 'current_song_playing_id' })
Song.belongsTo(Chatroom, { foreignKey: 'current_song_playing_id' })

Playlist.hasMany(Song, { foreignKey: 'playlist_id' })
Song.belongsTo(Playlist, { foreignKey: 'playlist_id' })

User.hasMany(Score, { foreignKey: 'user_id' })
Score.belongsTo(User, { foreignKey: 'user_id' })

User.hasMany(Payment, { foreignKey: 'user_id' })
Payment.belongsTo(User, { foreignKey: 'user_id' })

export { User, ChatMessage, Guess, Chatroom, Playlist, Song, Score, Payment }
