import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { config } from './config/env'
import { errorHandler } from './middleware/error'
import { userRoutes } from './routes/users'
import { postRoutes } from './routes/posts'

// Create OpenAPI-enabled Hono app
const app = new OpenAPIHono()

// Middleware
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Health check endpoint
import { z } from 'zod'

const HealthSchema = z.object({
  status: z.string().openapi({ example: 'ok' }),
  timestamp: z.string().datetime().openapi({ example: '2024-01-01T00:00:00.000Z' }),
  version: z.string().openapi({ example: '1.0.0' })
})

const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  summary: 'Health Check',
  description: 'Check if the API is running',
  tags: ['Health'],
  responses: {
    200: {
      description: 'API is healthy',
      content: {
        'application/json': {
          schema: HealthSchema
        }
      }
    }
  }
})

app.openapi(healthRoute, (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// API Routes
app.route('/api/users', userRoutes)
app.route('/api/posts', postRoutes)

// OpenAPI Documentation
app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Hono API Template',
    description: 'A Node.js API template built with Hono framework featuring automatic OpenAPI documentation generation',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: `http://localhost:${config.PORT}`,
      description: 'Development server'
    },
    {
      url: 'https://api.example.com',
      description: 'Production server'
    }
  ],
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints'
    },
    {
      name: 'Users',
      description: 'User management endpoints'
    },
    {
      name: 'Posts',
      description: 'Post management endpoints'
    }
  ]
})

// Swagger UI
app.get('/docs', swaggerUI({ url: '/openapi.json' }))

// Root endpoint with API information
app.get('/', (c) => {
  return c.json({
    message: 'Welcome to Hono API Template',
    documentation: `${c.req.url}docs`,
    openapi: `${c.req.url}openapi.json`,
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/api/users',
      posts: '/api/posts'
    }
  })
})

// Error handling middleware (should be last)
app.onError(errorHandler)

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: c.req.path
  }, 404)
})

console.log(`🚀 Server starting on http://0.0.0.0:${config.PORT}`)
console.log(`📚 API Documentation available at http://0.0.0.0:${config.PORT}/docs`)
console.log(`📋 OpenAPI JSON available at http://0.0.0.0:${config.PORT}/openapi.json`)

serve({
  fetch: app.fetch,
  port: config.PORT,
  hostname: '0.0.0.0'
})
