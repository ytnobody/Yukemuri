import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'

interface User {
  id: number
  name: string
  email: string
}

interface UserDetailProps {
  id?: string
}

export default function UserDetail({ id }: UserDetailProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (id) {
      fetchUser(id)
    }
  }, [id])

  const fetchUser = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) {
        throw new Error('User not found')
      }
      const data = await response.json()
      setUser(data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="text-center py-8">
          <div className="text-2xl">Loading user details...</div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container">
        <div className="text-center py-8">
          <div className="text-red-600 text-xl mb-4">
            {error || 'User not found'}
          </div>
          <a 
            href="/users"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Back to Users
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="mb-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/" className="hover:text-gray-700">Home</a>
          <span className="mx-2">/</span>
          <a href="/users" className="hover:text-gray-700">Users</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{user.name}</span>
        </nav>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">User Details</h1>
        <p className="text-xl text-gray-600">
          Information for user #{user.id}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Profile Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <div className="mt-1 text-lg text-gray-900">{user.id}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <div className="mt-1 text-lg text-gray-900">{user.name}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 text-lg text-gray-900">{user.email}</div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Actions</h2>
            
            <div className="space-y-3">
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Edit User
              </button>
              
              <button className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                Send Message
              </button>
              
              <button className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                Delete User
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <a 
          href="/users"
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          ← Back to Users
        </a>
        
        <a 
          href="/"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          ← Home
        </a>
      </div>
    </div>
  )
}