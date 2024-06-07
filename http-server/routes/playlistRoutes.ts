import { requirePremium } from './../middlewares/premiumMiddleware'
import { Router } from 'express'
import axios from 'axios'
import PlaylistController from '../controllers/PlaylistController'

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
        console.error(
            `Error caught in '/api/v1/playlists/search' route: ${error}`
        )
        res.status(500).json({ error: error.toString() })
    }
})

export default router
