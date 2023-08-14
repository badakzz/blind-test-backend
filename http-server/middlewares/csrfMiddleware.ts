import csrf from 'csurf'

export const requireCsrf = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    value: (req) => {
        const csrfTokenFromHeader = req.headers['x-csrf-token']
        console.log('CSRF middleware triggered:', csrfTokenFromHeader)
        return req.headers['x-csrf-token']
    },
})
