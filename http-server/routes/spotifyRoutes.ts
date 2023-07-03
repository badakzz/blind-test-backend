import axios from 'axios'
import { Router } from 'express'
import Song from '../models/Song'

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

        res.json(response.data.playlists.items)
    } catch (error) {
        res.status(500).json({ error: error.toString() })
    }
})

router.get('/api/tracks/:playlistId', async (req, res) => {
    try {
        if (!accessToken) {
            await getAccessToken()
        }

        const response = await axios.get(
            `https://api.spotify.com/v1/playlists/${req.params.playlistId}/tracks`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        )

        const tracksWithPreview = response.data.items.filter(
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
            const newSong = {
                spotify_song_id: randomTrack.track.id,
                previewUrl: randomTrack.track.preview_url,
                song_name: randomTrack.track.name,
                artist_name: randomTrack.track.artists[0].name,
            }
            previews.push(newSong)

            // Insert the new song into the database
            await Song.upsert(newSong)
        }
        console.log('previews', previews)
        res.json(previews)
    } catch (error) {
        res.status(500).json({ error: error.toString() })
    }
})

export default router
