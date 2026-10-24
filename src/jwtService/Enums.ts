export const TOKENTYPE = Object.freeze({
    ACCESSTOKEN: '__as_secure',
    REFRESHTOKEN: '__rs_secure',
})

export type TokenType = (typeof TOKENTYPE)[keyof typeof TOKENTYPE]

const Enums = { TOKENTYPE }
export default Enums
