const PASSWORD_REGEXP =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*[@$!%*#?&]).{12,}$/

export const isPasswordValid = (password: string) => {
    return PASSWORD_REGEXP.test(password)
}
