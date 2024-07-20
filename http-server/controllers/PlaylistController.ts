import { Request, Response } from 'express'
import Playlist from '../models/Playlist'
import { sequelizeErrorHandler } from '../utils/ErrorHandlers'
import axios from 'axios'
import { getAccessToken } from '../utils/helpers/spotifyHelper'

class PlaylistController {
    static async getPlaylists(req: Request, res: Response) {
        try {
            const playlists = await Playlist.findAll()
            res.send(playlists)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async getPlaylist(req: Request, res: Response) {
        try {
            const playlist = await Playlist.findOne({
                where: {
                    genre_id: req.params.id,
                },
            })

            if (playlist) {
                res.send(playlist)
            } else {
                res.status(404).send('Playlist not found')
            }
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async findOrCreatePlaylist(
        spotifyId: string,
        name: string,
        genreId: string
    ) {
        try {
            const [playlist, created] = await Playlist.findOrCreate({
                where: { spotify_playlist_id: spotifyId },
                defaults: {
                    name: name,
                    genre_id: genreId,
                },
            })
            return playlist
        } catch (error) {
            console.error(
                `Error in findOrCreate for Spotify ID ${spotifyId}:`,
                error
            )
            throw new Error(
                `Error in findOrCreate for Spotify ID ${spotifyId}: ${error.message}`
            )
        }
    }

    static async fetchAndStorePlaylistsByGenre(
        accessToken,
        genreId,
        country = 'US',
        locale = 'en_US'
    ) {
        try {
            const playlists = await axios.get(
                `https://api.spotify.com/v1/browse/categories/${genreId}/playlists`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        country: country,
                        locale: locale,
                        limit: 1,
                    },
                }
            )

            if (
                playlists.data &&
                playlists.data.playlists &&
                playlists.data.playlists.items
            ) {
                const validPlaylist = playlists.data.playlists.items[0]

                if (validPlaylist) {
                    const playlistFromDb =
                        await PlaylistController.findOrCreatePlaylist(
                            validPlaylist.id,
                            validPlaylist.name,
                            genreId
                        )
                    return playlistFromDb
                }
            }
        } catch (error) {
            console.error(
                `Failed to fetch playlists for genre ${genreId}:`,
                error
            )
            if (error.code === 'ETIMEDOUT' || error.code === 'ENETUNREACH') {
                console.log(
                    `Network error encountered, skipping genre ${genreId}`
                )
                return null
            }
            throw error
        }

        return null
    }

    static async fetchGenresAndStorePlaylists(req: Request) {
        let accessToken = await getAccessToken()

        try {
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

            const genres = response.data.categories.items

            if (genres) {
                const promises = genres.map((genre) =>
                    PlaylistController.fetchAndStorePlaylistsByGenre(
                        accessToken,
                        genre.id,
                        req.query.country as string,
                        req.query.locale as string
                    )
                )

                const playlistList = await Promise.all(promises)

                const validPlaylists = playlistList.filter(
                    (playlist) => playlist !== null
                )

                return validPlaylists
            }

            return null
        } catch (error) {
            console.error('Failed to fetch genres:', error)

            if (error.response && error.response.status === 401) {
                accessToken = await getAccessToken()
                return await PlaylistController.fetchGenresAndStorePlaylists(
                    req
                )
            }

            throw error
        }
    }

    static async searchPlaylist(req: Request) {
        let accessToken = await getAccessToken()
        try {
            const query = req.query.q
            const response = await axios.get(
                'https://api.spotify.com/v1/search',
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        q: encodeURIComponent(query as string),
                        type: 'playlist',
                        limit: 10,
                    },
                }
            )

            if (
                response.data &&
                response.data.playlists &&
                response.data.playlists.items
            ) {
                const playlistPromises = response.data.playlists.items.map(
                    (playlist: any) =>
                        PlaylistController.findOrCreatePlaylist(
                            playlist.id,
                            playlist.name,
                            null
                        )
                )
                await Promise.all(playlistPromises)
                return response.data.playlists.items
            } else {
                throw new Error('No playlists found')
            }
        } catch (error) {
            console.error(`Error searching playlists: ${error.message}`)

            if (error.response && error.response.status === 401) {
                accessToken = await getAccessToken()
                return await PlaylistController.searchPlaylist(req)
            }

            throw new Error(`Error searching playlists: ${error.message}`)
        }
    }
}

export default PlaylistController
