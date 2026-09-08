import { getServerSession } from 'next-auth'
import { authOptions } from './lib/auth'

export { authOptions }
export const auth = () => getServerSession(authOptions)
