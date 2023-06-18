export const createDTOOmittingPassword = (obj: { password: string }) => {
    const userWithoutPassword = { ...obj }
    delete userWithoutPassword.password
    return userWithoutPassword
}
