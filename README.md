# Hono API Template

A modern Node.js API template built with Hono framework featuring automatic OpenAPI documentation generation, TypeScript support, and production-ready configuration.

## Features

- 🚀 **Hono Framework** - Fast, lightweight web framework
- 📚 **Automatic API Documentation** - OpenAPI/Swagger integration
- 🔒 **Type Safety** - Full TypeScript support with Zod validation
- 🛠️ **Development Experience** - Hot reload with tsx
- 🌐 **CORS Enabled** - Ready for frontend integration
- 📝 **Structured Logging** - Built-in request/response logging
- 🎯 **Error Handling** - Comprehensive error middleware
- 🔍 **Validation** - Request/response validation with Zod schemas

## Tech Stack

- **Framework**: Hono.js
- **Language**: TypeScript
- **Validation**: Zod
- **Documentation**: OpenAPI 3.0 with Swagger UI
- **Development**: tsx (hot reload)
- **Environment**: dotenv

## Quick Start

1. **Install dependencies**
   ```bash
   npm install hono @hono/node-server @hono/zod-openapi @hono/swagger-ui
   npm install -D typescript tsx @types/node dotenv zod
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   ```

3. **Start development server**
   ```bash
   npx tsx watch src/index.ts
   ```

4. **Visit the application**
   - API: http://localhost:5000
   - Documentation: http://localhost:5000/docs
   - OpenAPI JSON: http://localhost:5000/openapi.json

## API Endpoints

### Health Check
- `GET /health` - Health check endpoint

### Users
- `GET /api/users` - Get all users (with pagination and search)
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Posts
- `GET /api/posts` - Get all posts (with filters)
- `GET /api/posts/{id}` - Get post by ID
- `POST /api/posts` - Create new post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post

## Project Structure

