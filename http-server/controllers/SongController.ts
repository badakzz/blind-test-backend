import { Request, Response } from 'express'
import Song from '../models/Song'
import { sequelizeErrorHandler } from '../../http-server/utils/ErrorHandlers'
import sequelize from '../config/database'
import axios from 'axios'
import { getAccessToken } from '../utils/helpers/spotifyHelper'
import Guess from '../models/Guess'
import Playlist from '../models/Playlist'

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

    static async getSongCredentialsById(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const song = await Song.findByPk(req.params.id)
            const { song_name, artist_name } = song
            res.send({ songName: song_name, artistName: artist_name })
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
                res.status(204).send('Song deleted')
            } else {
                res.status(404).send('Song not found')
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
            throw new Error('No songs found')
        }

        return song
    }

    static async getSongById(id: number, transaction: any): Promise<Song> {
        return await Song.findByPk(id, { transaction })
    }

    static async fetchAndStoreSongsFromSpotifyPlaylist(
        req: Request,
        res: Response
    ): Promise<Partial<Song>[]> {
        const transaction = await sequelize.transaction()
        try {
            const accessToken = await getAccessToken()
            const numPreviews = parseInt(req.query.numPreviews as string) || 1
            const chatroomId = req.query.chatroomId

            // Fetch the playlist from your database
            const playlist = await Playlist.findOne({
                where: { spotify_playlist_id: req.params.playlistId },
            })

            if (!playlist) {
                console.log(
                    `Playlist ${req.params.playlistId} does not exist in the database.`
                )
                return
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
                    'No tracks with previews found in the playlist.'
                )
            }
            let selectableTracks = [...tracksWithPreview]

            const previews = []
            for (let i = 0; i < numPreviews; i++) {
                if (selectableTracks.length === 0) {
                    break
                }
                // Randomly select a track and remove it from the selectableTracks array
                const randomIndex = Math.floor(
                    Math.random() * selectableTracks.length
                )
                const randomTrack = selectableTracks[randomIndex]
                selectableTracks.splice(randomIndex, 1)

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
                            transaction,
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
                        await Guess.create(
                            {
                                chatroom_id: chatroomId,
                                song_id: song.song_id,
                            },
                            { transaction }
                        )
                    } catch (error) {
                        console.log(
                            `Error during Guess.create operation: ${error}`
                        )
                        throw error
                    }

                    previews.push(newSong)
                }
            }
            await transaction.commit()

            return previews
        } catch (error) {
            await transaction.rollback()
            console.log(
                `Error caught in fetchSongsFromSpotifyPlaylist: ${error}`
            )
            res.status(500).json({ error: error.toString() })
        }
    }
}

export default SongController
