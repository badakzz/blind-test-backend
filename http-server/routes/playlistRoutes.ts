import { requirePremium } from './../middlewares/premiumMiddleware'
import { Router } from 'express'
import axios from 'axios'
import PlaylistController from '../controllers/PlaylistController'
import { requireCsrf } from '../middlewares/csrfMiddleware'
import { requireNativePremium } from '../middlewares/premiumNativeMiddleware'
import sequelize from '../config/database'
import { Guess, Song } from '../models'

let accessToken = ''

let tokenExpirationTime = 0

const getAccessToken = async () => {
    if (accessToken && Date.now() < tokenExpirationTime) {
        return
    }

    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            null,
            {
                params: {
                    grant_type: 'client_credentials',
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${Buffer.from(
                        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                    ).toString('base64')}`,
                },
            }
        )

        accessToken = response.data.access_token
        tokenExpirationTime =
            Date.now() + response.data.expires_in * 1000 - 60000
    } catch (error) {
        console.error('Error obtaining Spotify access token:', error)
        throw error
    }
}

const router = Router()

router.get('/api/v1/playlists', async (req, res) => {
    try {
        if (!accessToken) {
            await getAccessToken()
        }
        const playlistList =
            await PlaylistController.fetchGenresAndStorePlaylists(
                req,
                accessToken
            )
        res.json(playlistList)
    } catch (error) {
        console.log(`Error caught in '/api/v1/playlists' route: ${error}`)
        res.status(500).json({ error: error.toString() })
    }
})

router.get('/api/v1/playlists/search', requirePremium, async (req, res) => {
    try {
        if (!accessToken) {
            await getAccessToken()
        }
        const playlistList = await PlaylistController.searchPlaylist(
            req,
            accessToken
        )
        res.json(playlistList)
    } catch (error) {
        console.log(`Error caught in '/api/v1/playlists' route: ${error}`)
        res.status(500).json({ error: error.toString() })
    }
})

router.get('/api/v1/playlists/:id/tracks', requirePremium, async (req, res) => {
    const transaction = await sequelize.transaction()
    try {
        if (!accessToken) {
            await getAccessToken()
        }

        const playlistId = req.params.id
        const chatroomId = req.query.chatroomId

        let tracksWithPreviews = []
        let offset = 0

        const playlistDetails = await axios.get(
            `https://api.spotify.com/v1/playlists/${playlistId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        )

        const spotifyPlaylist = playlistDetails.data

        const playlist = await PlaylistController.findOrCreatePlaylist(
            playlistId,
            spotifyPlaylist.name,
            spotifyPlaylist.genres ? spotifyPlaylist.genres[0] : null
        )

        while (tracksWithPreviews.length < 10) {
            const response = await axios.get(
                `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        limit: 100,
                        offset: offset,
                    },
                }
            )

            const tracks = response.data.items

            for (let track of tracks) {
                if (track.track.preview_url) {
                    const newSong = {
                        spotify_song_id: track.track.id,
                        preview_url: track.track.preview_url,
                        song_name: track.track.name,
                        artist_name: track.track.artists[0].name,
                        playlist_id: playlist.playlist_id,
                        song_id: null,
                    }

                    let song, created
                    try {
                        ;[song, created] = await Song.findOrCreate({
                            where: { spotify_song_id: newSong.spotify_song_id },
                            defaults: newSong,
                            transaction,
                        })

                        newSong.song_id = song.song_id
                        tracksWithPreviews.push(newSong)

                        await Guess.create(
                            {
                                chatroom_id: chatroomId,
                                song_id: song.song_id,
                            },
                            {
                                transaction,
                            }
                        )
                    } catch (error) {
                        console.log(
                            `Error during Song/Guess operations: ${error}`
                        )
                        throw error
                    }

                    if (tracksWithPreviews.length >= 10) {
                        break
                    }
                }
            }

            if (tracks.length === 100) {
                offset += 100
            } else {
                if (tracksWithPreviews.length < 10) {
                    throw new Error(
                        'Playlist does not have enough songs with previews. Please select a different playlist.'
                    )
                }
                break
            }
        }

        await transaction.commit()
        res.json(tracksWithPreviews)
    } catch (error) {
        await transaction.rollback()
        console.log(
            `Error caught in '/api/v1/playlists/:id/tracks' route: ${error}`
        )
        res.status(500).json({ error: error.toString() })
    }
})

router.get(
    '/api/v1/playlists/search_native',
    requireNativePremium,
    async (req, res) => {
        try {
            if (!accessToken) {
                await getAccessToken()
            }
            const playlistList = await PlaylistController.searchPlaylist(
                req,
                accessToken
            )
            res.json(playlistList)
        } catch (error) {
            console.log(`Error caught in '/api/v1/playlists' route: ${error}`)
            res.status(500).json({ error: error.toString() })
        }
    }
)

router.get(
    '/api/v1/playlists/:id/tracks_native',
    requireNativePremium,
    async (req, res) => {
        try {
            if (!accessToken) {
                await getAccessToken()
            }
            const playlistId = req.params.id
            let tracksWithPreviews = []
            let offset = 0

            while (tracksWithPreviews.length < 10) {
                const response = await axios.get(
                    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                        params: {
                            limit: 100,
                            offset: offset,
                        },
                    }
                )

                const tracks = response.data.items
                for (let i = 0; i < tracks.length; i++) {
                    if (tracks[i].track.preview_url) {
                        tracksWithPreviews.push(tracks[i].track)
                        if (tracksWithPreviews.length >= 10) {
                            break
                        }
                    }
                }

                if (tracks.length === 100) {
                    offset += 100
                } else {
                    if (tracksWithPreviews.length < 10) {
                        throw new Error(
                            'Playlist does not have enough songs with previews. Please select a different playlist.'
                        )
                    }
                    break
                }
            }

            res.json(tracksWithPreviews)
        } catch (error) {
            console.log(
                `Error caught in '/api/v1/playlists/:id/tracks' route: ${error}`
            )
            res.status(500).json({ error: error.toString() })
        }
    }
)

export default router
