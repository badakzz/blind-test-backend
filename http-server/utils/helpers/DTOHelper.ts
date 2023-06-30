import User from '../../models/User'

export const createDTOOmittingPassword = (obj: User) => {
    const { dataValues, ...rest } = obj
    const { password, ...userWithoutPassword } = dataValues
    return { ...userWithoutPassword }
}
