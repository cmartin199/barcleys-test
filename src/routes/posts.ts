import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { 
  PostSchema, 
  CreatePostSchema, 
  UpdatePostSchema, 
  PostParamsSchema,
  PostQuerySchema,
  Post 
} from '../schemas/post'

const PaginatedPostsSchema = z.object({
  data: z.array(PostSchema),
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

export const postRoutes = new OpenAPIHono()

// In-memory storage for demo purposes
// In production, replace with actual database
let posts: Post[] = []

// Get all posts
const getPostsRoute = createRoute({
  method: 'get',
  path: '/',
  summary: 'Get all posts',
  description: 'Retrieve a paginated list of posts with optional filters',
  tags: ['Posts'],
  request: {
    query: PostQuerySchema
  },
  responses: {
    200: {
      description: 'List of posts',
      content: {
        'application/json': {
          schema: PaginatedPostsSchema
        }
      }
    }
  }
})

postRoutes.openapi(getPostsRoute, (c) => {
  const { page, limit, authorId, published, search } = c.req.valid('query')
  
  let filteredPosts = posts
  
  // Filter by author
  if (authorId) {
    filteredPosts = filteredPosts.filter(post => post.authorId === authorId)
  }
  
  // Filter by published status
  if (published !== undefined) {
    filteredPosts = filteredPosts.filter(post => post.published === published)
  }
  
  // Search in title and content
  if (search) {
    filteredPosts = filteredPosts.filter(post => 
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase())
    )
  }
  
  const total = filteredPosts.length
  const totalPages = Math.ceil(total / limit)
  const offset = (page - 1) * limit
  const data = filteredPosts.slice(offset, offset + limit)
  
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

// Get post by ID
const getPostRoute = createRoute({
  method: 'get',
  path: '/{id}',
  summary: 'Get post by ID',
  description: 'Retrieve a specific post by its unique identifier',
  tags: ['Posts'],
  request: {
    params: PostParamsSchema
  },
  responses: {
    200: {
      description: 'Post found',
      content: {
        'application/json': {
          schema: PostSchema
        }
      }
    },
    404: {
      description: 'Post not found',
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      }
    }
  }
})

postRoutes.openapi(getPostRoute, (c) => {
  const { id } = c.req.valid('param')
  const post = posts.find(p => p.id === id)
  
  if (!post) {
    return c.json({
      error: 'Not Found',
      message: 'Post not found'
    }, 404)
  }
  
  return c.json(post)
})

// Create post
const createPostRoute = createRoute({
  method: 'post',
  path: '/',
  summary: 'Create new post',
  description: 'Create a new post with the provided information',
  tags: ['Posts'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreatePostSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Post created successfully',
      content: {
        'application/json': {
          schema: PostSchema
        }
      }
    },
    400: {
      description: 'Invalid request data'
    }
  }
})

postRoutes.openapi(createPostRoute, (c) => {
  const postData = c.req.valid('json')
  
  const newPost: Post = {
    id: crypto.randomUUID(),
    ...postData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  posts.push(newPost)
  return c.json(newPost, 201)
})

// Update post
const updatePostRoute = createRoute({
  method: 'put',
  path: '/{id}',
  summary: 'Update post',
  description: 'Update an existing post with new information',
  tags: ['Posts'],
  request: {
    params: PostParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: UpdatePostSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Post updated successfully',
      content: {
        'application/json': {
          schema: PostSchema
        }
      }
    },
    404: {
      description: 'Post not found'
    }
  }
})

postRoutes.openapi(updatePostRoute, (c) => {
  const { id } = c.req.valid('param')
  const updateData = c.req.valid('json')
  
  const postIndex = posts.findIndex(p => p.id === id)
  if (postIndex === -1) {
    return c.json({
      error: 'Not Found',
      message: 'Post not found'
    }, 404)
  }
  
  posts[postIndex] = {
    ...posts[postIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  }
  
  return c.json(posts[postIndex])
})

// Delete post
const deletePostRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  summary: 'Delete post',
  description: 'Delete a post by its unique identifier',
  tags: ['Posts'],
  request: {
    params: PostParamsSchema
  },
  responses: {
    204: {
      description: 'Post deleted successfully'
    },
    404: {
      description: 'Post not found'
    }
  }
})

postRoutes.openapi(deletePostRoute, (c) => {
  const { id } = c.req.valid('param')
  
  const postIndex = posts.findIndex(p => p.id === id)
  if (postIndex === -1) {
    return c.json({
      error: 'Not Found',
      message: 'Post not found'
    }, 404)
  }
  
  posts.splice(postIndex, 1)
  return c.body(null, 204)
})
