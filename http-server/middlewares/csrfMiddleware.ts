import csrf from 'csurf'

export const requireCsrf = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    value: (req) => {
        return req.headers['x-csrf-token']
    },
})
