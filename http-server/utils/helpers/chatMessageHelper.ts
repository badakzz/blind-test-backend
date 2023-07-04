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

    return answer
}
