import { Request, Response } from 'express'
import Playlist from '../models/Playlist'
import { sequelizeErrorHandler } from '../utils/ErrorHandlers'
import axios from 'axios'
import { sanitizeInput } from '../utils/sanitize'

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
            const sanitizedQuery = sanitizeInput(req.params)

            const playlist = await Playlist.findOne({
                where: {
                    genre_id: sanitizedQuery.id,
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
        const [playlist, created] = await Playlist.findOrCreate({
            where: { spotify_playlist_id: spotifyId, playlist_id: spotifyId },
            defaults: {
                name: name,
                genre_id: genreId,
            },
        })
        return playlist
    }

    static async fetchAndStorePlaylistsByGenre(
        accessToken,
        genreId,
        country = 'US',
        locale = 'en_US'
    ) {
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

        return null
    }

    static async fetchGenresAndStorePlaylists(
        req: Request,
        accessToken: string
    ) {
        const sanitizedQuery = sanitizeInput(req.query)
        const { country, locale } = sanitizedQuery

        const response = await axios.get(
            `https://api.spotify.com/v1/browse/categories`,
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
                    (country as string) || 'US',
                    (locale as string) || 'en_US'
                )
            )

            const playlistList = await Promise.all(promises)

            const validPlaylists = playlistList.filter(
                (playlist) => playlist !== null
            )

            return validPlaylists
        }

        return null
    }

    static async searchPlaylist(req: Request, accessToken: string) {
        try {
            const sanitizedQuery = sanitizeInput(req.query)

            const query = sanitizedQuery.q
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

            if (response.data && response.data.playlists) {
                return response.data.playlists.items
            } else {
                throw new Error('No playlists found')
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }
}

export default PlaylistController
