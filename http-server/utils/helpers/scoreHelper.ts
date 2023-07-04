import { calculateAnswerSimilarity } from '.'

export const analyzeAnswerAndAttributeScore = (
    userId: number,
    chatroomId: string,
    normalizedParsedSongNameWords: string[],
    normalizedMGuessWords: string[],
    normalizedParsedArtistNameWords: string[]
): {
    points: number
    correctGuessType: string
    userId: number
    chatroomId: string
} => {
    const minAccuracy = 0.9
    let points = 0
    let correctGuessType = ''

    let songScore = normalizedParsedSongNameWords.reduce(
        (accum, songWord, i) =>
            accum +
            (normalizedMGuessWords[i] !== undefined &&
            calculateAnswerSimilarity(songWord, normalizedMGuessWords[i]) >=
                minAccuracy
                ? 1
                : 0),
        0
    )

    let artistScore = normalizedParsedArtistNameWords.reduce(
        (accum, artistWord, i) =>
            accum +
            (normalizedMGuessWords[i] !== undefined &&
            calculateAnswerSimilarity(artistWord, normalizedMGuessWords[i]) >=
                minAccuracy
                ? 1
                : 0),
        0
    )

    let nameCorrect = songScore / normalizedParsedSongNameWords.length > 0.5
    let artistCorrect =
        artistScore / normalizedParsedArtistNameWords.length > 0.5

    if (nameCorrect && !artistCorrect) {
        points += 0.5
        correctGuessType = 'song name'
    }

    if (artistCorrect && !nameCorrect) {
        points += 0.5
        correctGuessType = 'artist name'
    }

    if (artistCorrect && nameCorrect) {
        points += 1
        correctGuessType = 'artist and the song names'
    }

    return { points, correctGuessType, userId, chatroomId }
}
