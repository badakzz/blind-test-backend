const EMAIL_REGEXP = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/

export const isEmailValid = (email: string) => {
    return EMAIL_REGEXP.test(email)
}
