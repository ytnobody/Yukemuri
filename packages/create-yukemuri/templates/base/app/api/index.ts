import { Hono } from 'hono'

// Import individual handler functions
import { getAllUsers, getUserById } from './users'
import { getBasicHealth, getDetailedHealth } from './health'

const api = new Hono()

// Mount users routes using imported handlers
api.get('/users', getAllUsers)
api.get('/users/:id', getUserById)

// Mount health routes using imported handlers  
api.get('/health', getBasicHealth)
api.get('/health/detailed', getDetailedHealth)

export default api