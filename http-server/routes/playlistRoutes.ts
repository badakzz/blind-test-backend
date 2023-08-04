import { requirePremium } from './../middlewares/premiumMiddleware'
import { Router } from 'express'
import axios from 'axios'
import PlaylistController from '../controllers/PlaylistController'
import { requireCsrf } from '../middlewares/csrfMiddleware'

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
    try {
        if (!accessToken) {
            await getAccessToken()
        }
        const playlistId = req.params.id
        const response = await axios.get(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    limit: 10, // Limit to 10 songs
                },
            }
        )
        const tracks = response.data.items
        const trackList = tracks.map((trackItem) => trackItem.track)
        res.json(trackList)
    } catch (error) {
        console.log(
            `Error caught in '/api/v1/playlists/:id/tracks' route: ${error}`
        )
        res.status(500).json({ error: error.toString() })
    }
})

export default router
