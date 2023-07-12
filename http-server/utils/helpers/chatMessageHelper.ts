export const calculateLevenshteinDistance = (a, b) => {
    const matrix = []

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i]
    }

    for (let i = 0; i <= a.length; i++) {
        matrix[0][i] = i
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1]
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                )
            }
        }
    }

    return matrix[b.length][a.length]
}

export const calculateAnswerSimilarity = (a, b) => {
    const distance = calculateLevenshteinDistance(a, b)
    const longestLength = Math.max(a.length, b.length)
    return (longestLength - distance) / longestLength
}

export function normalizeAnswer(answer) {
    // Remove all non-alphanumeric characters (except for spaces and dashes)
    answer = answer.toLowerCase().replace(/[^\w\s-]/gi, "")

    // Remove words in parentheses
    answer = answer.replace(/ *\([^)]*\) */g, " ")

    // If there's a dash in the song name, only keep what's after the dash
    if (answer.includes("-")) {
        answer = answer.substring(answer.indexOf("-") + 1)
    }

    // If the answer starts with a number, remove it (and the following space)
    answer = answer.replace(/^\d+\s/, "")

    // If there's a "feat" in the song name, only keep what's before "feat"
    if (answer.includes("feat")) {
        answer = answer.substring(0, answer.indexOf("feat"))
    }

    // Remove multiple spaces
    answer = answer.replace(/\s+/g, " ").trim()

    return answer
}

export const analyzeAnswer = (
    normalizedParsedSongNameWords: string[],
    normalizedMGuessWords: string[],
    normalizedParsedArtistNameWords: string[]
): {
    points: number
    correctGuessType: string
} => {
    const minAccuracy = 0.9
    let points = 0
    let correctGuessType = ""

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
        correctGuessType = "song name"
    }

    if (artistCorrect && !nameCorrect) {
        points += 0.5
        correctGuessType = "artist name"
    }

    if (artistCorrect && nameCorrect) {
        points += 1
        correctGuessType = "artist and the song names"
    }

    return { points, correctGuessType }
}
