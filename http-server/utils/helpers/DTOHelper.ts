import Song from '../../models/Song'
import User from '../../models/User'

export const createDTOOmittingPassword = (obj: User) => {
    const { dataValues, ...rest } = obj
    const { password, ...userWithoutPassword } = dataValues
    return { ...userWithoutPassword }
}

export const createDTOOmittingArtistAndSongNames = (obj: Song[]) => {
    let songs: Partial<Song>[] = []
    obj.forEach((song) => {
        const {
            playlist_id,
            spotify_song_id,
            song_name,
            artist_name,
            ...songWithoutArtistAndSongNames
        } = song
        songs.push(songWithoutArtistAndSongNames)
    })
    return songs
}
