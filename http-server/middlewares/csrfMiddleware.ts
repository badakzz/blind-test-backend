import csrf from 'csurf'

export const requireCsrf = csrf({
    cookie: {
        key: process.env.COOKIE_PARSER_SECRET,
        sameSite: 'lax',
        httpOnly: true,
        signed: false,
    },
    value: (req) => {
        return req.headers['x-csrf-token']
    },
})
