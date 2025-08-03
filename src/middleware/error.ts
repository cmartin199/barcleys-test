import { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('Error occurred:', err)

  // Handle HTTPException from Hono
  if (err instanceof HTTPException) {
    return c.json({
      error: err.message,
      status: err.status
    }, err.status)
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return c.json({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }))
    }, 400)
  }

  // Handle other known errors
  if (err instanceof Error) {
    return c.json({
      error: 'Internal Server Error',
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }, 500)
  }

  // Fallback for unknown errors
  return c.json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  }, 500)
}
