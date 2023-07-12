import axios from 'axios'
import { Router } from 'express'
import Guess from '../models/Guess'
import Playlist from '../models/Playlist'
import Song from '../models/Song'
import {
    createDTOOmittingArtistAndSongNames,
    tempCreateDTOOmittingArtistAndSongNames,
} from '../utils/helpers'

let accessToken = ''

const getAccessToken = async () => {
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
}

const router = Router()

router.get('/api/genres', async (req, res) => {
    try {
        if (!accessToken) {
            await getAccessToken()
        }

        const response = await axios.get(
            'https://api.spotify.com/v1/browse/categories',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    country: req.query.country || 'US',
                    locale: req.query.locale || 'en_US',
                },
            }
        )

        res.json(response.data.categories.items)
    } catch (error) {
        res.status(500).json({ error: error.toString() })
    }
})

router.get('/api/playlists/:genreId', async (req, res) => {
    try {
        if (!accessToken) {
            await getAccessToken()
        }
        const response = await axios.get(
            `https://api.spotify.com/v1/browse/categories/${req.params.genreId}/playlists`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    country: req.query.country || 'US',
                    locale: req.query.locale || 'en_US',
                },
            }
        )

        // Iterate over each item and add it to the database if it's not already present
        for (const item of response.data.playlists.items) {
            // Check if the playlist exists in your database, if not, create it
            if (item) {
                const [playlist, created] = await Playlist.findOrCreate({
                    where: { spotify_playlist_id: item.id },
                    defaults: {
                        name: item.name,
                        genre_id: req.params.genreId,
                    },
                })
            }
        }

        // Query your own database to return the playlists to the frontend
        const playlists = await Playlist.findAll({
            where: { genre_id: req.params.genreId },
        })

        res.json(playlists)
    } catch (error) {
        res.status(500).json({ error: error.toString() })
    }
})

router.get('/api/tracks/:playlistId', async (req, res) => {
    try {
        if (!accessToken) {
            await getAccessToken()
        }
        const chatroomId = req.query.chatroomId
        if (!chatroomId) {
            // Handle the error case when chatroomId is not provided
            console.log('Chatroom id is not provided')
        }
        // Fetch the playlist
        const responsePlaylist = await axios.get(
            `https://api.spotify.com/v1/playlists/${req.params.playlistId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        )

        const newPlaylist = {
            spotify_playlist_id: responsePlaylist.data.id,
            name: responsePlaylist.data.name,
            genre_id: null,
        }
        // Fetch genre_id from your database
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

        // Upsert the playlist
        const [playlist] = await Playlist.upsert(newPlaylist, {
            returning: true,
        })

        if (!playlist) {
            console.log('Upserting the playlist returned null or undefined')
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
            throw new Error('No tracks with previews found in the playlist.')
        }

        const previews = []
        for (
            let i = 0;
            i < (parseInt(req.query.numPreviews as string) || 1);
            i++
        ) {
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

                // Attempt the Song.upsert
                let song, created
                try {
                    ;[song, created] = await Song.findOrCreate({
                        where: { spotify_song_id: newSong.spotify_song_id },
                        defaults: newSong,
                    })
                    newSong.song_id = song.song_id
                    previews.push(newSong)
                } catch (error) {
                    console.log(`Error during Song.upsert operation: ${error}`)
                    throw error
                }

                // Attempt the Guess.create
                try {
                    await Guess.create({
                        chatroom_id: chatroomId,
                        song_id: song.song_id,
                    })
                } catch (error) {
                    console.log(`Error during Guess.create operation: ${error}`)
                    throw error
                }
            }
        }

        // to change after tests
        res.json(tempCreateDTOOmittingArtistAndSongNames(previews as Song[]))
    } catch (error) {
        console.log(`Error caught in '/api/tracks/:playlistId' route: ${error}`)
        res.status(500).json({ error: error.toString() })
    }
})

export default router
