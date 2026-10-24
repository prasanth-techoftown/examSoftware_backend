import SnowflakeId from 'snowflake-id'
import crypto from 'crypto'

const snowFlake = new SnowflakeId({
    mid: 42,
    offset: (2021 - 1970) * 31536000 * 1000,
})

export const generateSnowflakeId = (): string => {
    const originalId = snowFlake.generate().toString()

    const hash = crypto.createHash('md5').update(originalId).digest('hex')
    const eightDigit = (
        (parseInt(hash, 16) % 90_000_000) +
        10_000_000
    ).toString()

    return eightDigit
}
