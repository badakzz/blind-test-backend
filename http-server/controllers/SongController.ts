import { Request, Response } from "express"
import Song from "../models/Song"
import { sequelizeErrorHandler } from "../../http-server/utils/ErrorHandlers"
import sequelize from "../config/database"
import axios from "axios"
import { getAccessToken } from "../utils/helpers/spotifyHelper"
import Guess from "../models/Guess"
import Playlist from "../models/Playlist"

class SongController {
    static async getSongs(req: Request, res: Response): Promise<void> {
        try {
            const songs = await Song.findAll()
            res.send(songs)
        } catch (error: any) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async getSong(req: Request, res: Response): Promise<void> {
        try {
            const song = await Song.findByPk(req.params.id)
            res.send(song)
        } catch (error: any) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async createSong(req: Request, res: Response): Promise<void> {
        try {
            const newSong = await Song.create(req.body)
            res.status(201).send(newSong)
        } catch (error: any) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async deleteSong(req: Request, res: Response): Promise<void> {
        try {
            const song = await Song.findByPk(req.params.id)

            if (song) {
                await song.destroy()
                res.status(204).send("Song deleted")
            } else {
                res.status(404).send("Song not found")
            }
        } catch (error: any) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async getCurrentSong(chatroomId) {
        const response = await axios.get(
            `${process.env.NODE_SERVER_DOMAIN}:${process.env.NODE_SERVER_PORT}/api/v1/chatrooms/${chatroomId}`
        )
        return response.data.current_song_playing_id
    }

    static async getRandomSong(playlistId: number) {
        const song = await Song.findOne({
            where: { playlistId },
            order: sequelize.random(),
        })
        if (!song) {
            throw new Error("No songs found")
        }

        return song
    }

    static async getSongById(id: number): Promise<Song> {
        return await Song.findByPk(id)
    }

    static async fetchAndStoreSongsFromSpotifyPlaylist(
        req: Request,
        res: Response
    ): Promise<Partial<Song>[]> {
        try {
            const accessToken = await getAccessToken()
            const numPreviews = parseInt(req.query.numPreviews as string) || 1
            const chatroomId = req.query.chatroomId

            // Fetch the playlist
            const responsePlaylist = await axios.get(
                `https://api.spotify.com/v1/playlists/${req.params.playlistId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            )

            // Upsert the Playlist in your database
            const newPlaylist = {
                spotify_playlist_id: responsePlaylist.data.id,
                name: responsePlaylist.data.name,
                genre_id: null, // Fetch genre_id from your database
            }

            const playlistRecord = await Playlist.findOne({
                where: { spotify_playlist_id: newPlaylist.spotify_playlist_id },
            })

            if (playlistRecord) {
                newPlaylist.genre_id = playlistRecord.genre_id
            } else {
                console.log(
                    `Playlist ${newPlaylist.name} does not exist in the database.`
                )
                return
            }

            const [playlist] = await Playlist.upsert(newPlaylist, {
                returning: true,
            })

            if (!playlist) {
                console.log("Upserting the playlist returned null or undefined")
            }

            // Fetch the tracks
            const responseTracks = await axios.get(
                `https://api.spotify.com/v1/playlists/${req.params.playlistId}/tracks`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            )

            const tracksWithPreview = responseTracks.data.items.filter(
                (item) => item.track.preview_url
            )

            if (tracksWithPreview.length === 0) {
                throw new Error(
                    "No tracks with previews found in the playlist."
                )
            }

            const previews = []
            for (let i = 0; i < numPreviews; i++) {
                const randomTrack =
                    tracksWithPreview[
                        Math.floor(Math.random() * tracksWithPreview.length)
                    ]

                if (randomTrack && randomTrack.track && randomTrack.track.id) {
                    const newSong = {
                        spotify_song_id: randomTrack.track.id,
                        preview_url: randomTrack.track.preview_url,
                        song_name: randomTrack.track.name,
                        artist_name: randomTrack.track.artists[0].name,
                        playlist_id: playlist.playlist_id,
                        song_id: null,
                    }

                    // Upsert the Song in your database
                    let song, created
                    try {
                        ;[song, created] = await Song.findOrCreate({
                            where: { spotify_song_id: newSong.spotify_song_id },
                            defaults: newSong,
                        })
                        newSong.song_id = song.song_id
                    } catch (error) {
                        console.log(
                            `Error during Song.upsert operation: ${error}`
                        )
                        throw error
                    }

                    // Create the Guess in your database
                    try {
                        await Guess.create({
                            chatroom_id: chatroomId,
                            song_id: song.song_id,
                        })
                    } catch (error) {
                        console.log(
                            `Error during Guess.create operation: ${error}`
                        )
                        throw error
                    }

                    previews.push(newSong)
                }
            }
            return previews
        } catch (error) {
            console.log(
                `Error caught in fetchSongsFromSpotifyPlaylist: ${error}`
            )
            res.status(500).json({ error: error.toString() })
        }
    }
}

export default SongController
