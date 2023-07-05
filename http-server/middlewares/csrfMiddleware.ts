// csrfMiddleware.ts
import csrf from "csurf"

// to check
// export const requireCsrf = () => {
//     console.log("csrf middleware triggered")
//     csrf({
//         cookie: {
//             key: process.env.COOKIE_PARSER_SECRET,
//             sameSite: "lax",
//             httpOnly: true,
//             signed: false,
//         },
//         value: (req) => {
//             return req.headers["x-csrf-token"]
//         },
//     })
// }

// old working:
export const requireCsrf = csrf({
    cookie: {
        key: process.env.COOKIE_PARSER_SECRET,
        sameSite: "lax",
        httpOnly: true,
        signed: false,
    },
    value: (req) => {
        return req.headers["x-csrf-token"]
    },
})
