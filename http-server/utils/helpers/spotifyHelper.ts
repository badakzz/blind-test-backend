import axios from 'axios'

let accessToken = ''
let tokenExpirationTime = 0

export const getAccessToken = async () => {
    if (accessToken && Date.now() < tokenExpirationTime) {
        return accessToken
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
        return accessToken
    } catch (error) {
        console.error('Error obtaining Spotify access token:', error)
        throw error
    }
}
