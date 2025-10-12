import { Hono } from 'hono'
import type { Context } from 'hono'

const users = new Hono()

// Sample users data
const usersData = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com' }
]

// Export individual handler functions
export const getAllUsers = (c: Context) => {
  return c.json({ users: usersData })
}

export const getUserById = (c: Context) => {
  const id = parseInt(c.req.param('id'))
  const user = usersData.find(u => u.id === id)
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  return c.json({ user })
}

// Define routes on the Hono instance
users.get('/', getAllUsers)
users.get('/:id', getUserById)

export default users