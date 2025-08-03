import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { 
  UserSchema, 
  CreateUserSchema, 
  UpdateUserSchema, 
  UserParamsSchema,
  UserQuerySchema,
  User 
} from '../schemas/user'

const PaginatedUsersSchema = z.object({
  data: z.array(UserSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number()
  })
})

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string()
})

export const userRoutes = new OpenAPIHono()

// In-memory storage for demo purposes
// In production, replace with actual database
let users: User[] = []

// Get all users
const getUsersRoute = createRoute({
  method: 'get',
  path: '/',
  summary: 'Get all users',
  description: 'Retrieve a paginated list of users with optional search',
  tags: ['Users'],
  request: {
    query: UserQuerySchema
  },
  responses: {
    200: {
      description: 'List of users',
      content: {
        'application/json': {
          schema: PaginatedUsersSchema
        }
      }
    }
  }
})

userRoutes.openapi(getUsersRoute, (c) => {
  const { page, limit, search } = c.req.valid('query')
  
  let filteredUsers = users
  if (search) {
    filteredUsers = users.filter(user => 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    )
  }
  
  const total = filteredUsers.length
  const totalPages = Math.ceil(total / limit)
  const offset = (page - 1) * limit
  const data = filteredUsers.slice(offset, offset + limit)
  
  return c.json({
    data,
    meta: {
      page,
      limit,
      total,
      totalPages
    }
  })
})

// Get user by ID
const getUserRoute = createRoute({
  method: 'get',
  path: '/{id}',
  summary: 'Get user by ID',
  description: 'Retrieve a specific user by their unique identifier',
  tags: ['Users'],
  request: {
    params: UserParamsSchema
  },
  responses: {
    200: {
      description: 'User found',
      content: {
        'application/json': {
          schema: UserSchema
        }
      }
    },
    404: {
      description: 'User not found',
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      }
    }
  }
})

userRoutes.openapi(getUserRoute, (c) => {
  const { id } = c.req.valid('param')
  const user = users.find(u => u.id === id)
  
  if (!user) {
    return c.json({
      error: 'Not Found',
      message: 'User not found'
    }, 404)
  }
  
  return c.json(user)
})

// Create user
const createUserRoute = createRoute({
  method: 'post',
  path: '/',
  summary: 'Create new user',
  description: 'Create a new user with the provided information',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateUserSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'User created successfully',
      content: {
        'application/json': {
          schema: UserSchema
        }
      }
    },
    400: {
      description: 'Invalid request data',
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      }
    },
    409: {
      description: 'User with email already exists',
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      }
    }
  }
})

userRoutes.openapi(createUserRoute, (c) => {
  const userData = c.req.valid('json')
  
  // Check if email already exists
  const existingUser = users.find(u => u.email === userData.email)
  if (existingUser) {
    return c.json({
      error: 'Conflict',
      message: 'User with this email already exists'
    }, 409)
  }
  
  const newUser: User = {
    id: crypto.randomUUID(),
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  users.push(newUser)
  return c.json(newUser, 201)
})

// Update user
const updateUserRoute = createRoute({
  method: 'put',
  path: '/{id}',
  summary: 'Update user',
  description: 'Update an existing user with new information',
  tags: ['Users'],
  request: {
    params: UserParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: UpdateUserSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'User updated successfully',
      content: {
        'application/json': {
          schema: UserSchema
        }
      }
    },
    404: {
      description: 'User not found'
    }
  }
})

userRoutes.openapi(updateUserRoute, (c) => {
  const { id } = c.req.valid('param')
  const updateData = c.req.valid('json')
  
  const userIndex = users.findIndex(u => u.id === id)
  if (userIndex === -1) {
    return c.json({
      error: 'Not Found',
      message: 'User not found'
    }, 404)
  }
  
  // Check email uniqueness if updating email
  if (updateData.email && updateData.email !== users[userIndex].email) {
    const existingUser = users.find(u => u.email === updateData.email)
    if (existingUser) {
      return c.json({
        error: 'Conflict',
        message: 'User with this email already exists'
      }, 409)
    }
  }
  
  users[userIndex] = {
    ...users[userIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  }
  
  return c.json(users[userIndex])
})

// Delete user
const deleteUserRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  summary: 'Delete user',
  description: 'Delete a user by their unique identifier',
  tags: ['Users'],
  request: {
    params: UserParamsSchema
  },
  responses: {
    204: {
      description: 'User deleted successfully'
    },
    404: {
      description: 'User not found'
    }
  }
})

userRoutes.openapi(deleteUserRoute, (c) => {
  const { id } = c.req.valid('param')
  
  const userIndex = users.findIndex(u => u.id === id)
  if (userIndex === -1) {
    return c.json({
      error: 'Not Found',
      message: 'User not found'
    }, 404)
  }
  
  users.splice(userIndex, 1)
  return c.body(null, 204)
})
