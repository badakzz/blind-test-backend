import { calculateAnswerSimilarity } from '.'

export const analyzeAnswerAndAttributeScore = (
    userId: number,
    normalizedParsedSongNameWords: string[],
    normalizedMGuessWords: string[],
    normalizedParsedArtistNameWords: string[]
): { points: number; correctGuessType: string; userId: number } => {
    const minAccuracy = 0.9
    let points = 0
    let correctGuessType = ''

    let nameCorrect = normalizedParsedSongNameWords.every(
        (songWord, i) =>
            normalizedMGuessWords[i] !== undefined &&
            calculateAnswerSimilarity(songWord, normalizedMGuessWords[i]) >=
                minAccuracy
    )

    let artistCorrect = normalizedParsedArtistNameWords.every(
        (artistWord, i) =>
            normalizedMGuessWords[i] !== undefined &&
            calculateAnswerSimilarity(artistWord, normalizedMGuessWords[i]) >=
                minAccuracy
    )

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

    return { points, correctGuessType, userId }
}
