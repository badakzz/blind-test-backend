import axios from "axios"

export const getAccessToken = async () => {
    const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        null,
        {
            params: {
                grant_type: "client_credentials",
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(
                    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                ).toString("base64")}`,
            },
        }
    )

    return response.data.access_token
}
