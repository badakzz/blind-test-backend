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

export const normalizeAnswer = (answer) => {
    // Remove all non-alphanumeric characters (except for spaces and dashes)
    answer = answer.toLowerCase().replace(/[^\w\s-]/gi, '')

    // Remove words in parentheses
    answer = answer.replace(/ *\([^)]*\) */g, ' ')

    // If there's a dash in the song name, only keep what's after the dash
    if (answer.includes('-')) {
        answer = answer.substring(answer.indexOf('-') + 1)
    }

    // If the answer starts with a number, remove it (and the following space)
    answer = answer.replace(/^\d+\s/, '')

    // If there's a "feat" in the song name, only keep what's before "feat"
    if (answer.includes('feat')) {
        answer = answer.substring(0, answer.indexOf('feat'))
    }

    // Remove multiple spaces
    answer = answer.replace(/\s+/g, ' ').trim()

    console.log('answer', answer)

    // Split the answer into words and return the array
    return answer.split(' ')
}

function* combinations(arr, len = arr.length) {
    if (len === 0) yield []
    else {
        for (let i = 0; i <= arr.length - len; i++) {
            for (let tail of combinations(arr.slice(i + 1), len - 1)) {
                yield [arr[i], ...tail]
            }
        }
    }
}

export const analyzeAnswer = (
    normalizedParsedSongNameWords: string[],
    normalizedGuessWords: string[],
    normalizedParsedArtistNameWords: string[]
): {
    points: number
    correctGuessType: string
} => {
    const minAccuracy = 0.8
    let points = 0
    let correctGuessType = ''

    let songScore = 0
    let artistScore = 0

    for (let guessWord of normalizedGuessWords) {
        let isArtist = false
        let isSong = false

        for (let artistWord of normalizedParsedArtistNameWords) {
            if (
                calculateAnswerSimilarity(guessWord, artistWord) >= minAccuracy
            ) {
                isArtist = true
                break
            }
        }

        for (let songWord of normalizedParsedSongNameWords) {
            if (calculateAnswerSimilarity(guessWord, songWord) >= minAccuracy) {
                isSong = true
                break
            }
        }

        if (isArtist && !isSong) {
            artistScore++
        } else if (!isArtist && isSong) {
            songScore++
        } else if (isArtist && isSong) {
            // The word belongs to both the artist name and the song name
            // You can decide how to handle this case
            artistScore++
            songScore++
        }
    }

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

    return { points, correctGuessType }
}
