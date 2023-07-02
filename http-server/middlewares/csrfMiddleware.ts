// csrfMiddleware.ts
import csrf from 'csurf'

console.log('auth middleware triggered')

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
