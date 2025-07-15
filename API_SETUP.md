# API Configuration Setup

This document explains how to configure the frontend to connect to the backend API.

## Backend Server

The backend server runs on port 8000 by default. Make sure the backend is running:

```bash
cd astudy-be
deno run --allow-net --allow-env server.ts
```

## Frontend Configuration

### Option 1: Environment Variable (Recommended)

Create a `.env.local` file in the frontend directory:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Clerk Configuration (if needed)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
```

### Authentication

The frontend automatically includes Clerk authentication tokens in all API requests. The `useApiService` hook handles:

- Getting the current user's JWT token from Clerk
- Adding the token to the `Authorization: Bearer <token>` header
- Making authenticated requests to the backend

### Option 2: Default Configuration

If no environment variable is set, the frontend will default to `http://localhost:8000`.

## API Endpoints

The following endpoints are available:

### Topics

- `GET /topics` - Get all topics
- `GET /topics/:id` - Get topic by ID
- `POST /topics` - Create new topic
- `PUT /topics/:id` - Update topic
- `DELETE /topics/:id` - Delete topic

### Activities

- `GET /activities` - Get all activities
- `POST /activities` - Create new activity

### Questions

- `GET /questions` - Get all questions
- `POST /questions` - Create new question

### User

- `GET /me` - Get current user info from Clerk token

## Usage in Components

Import and use the API service hook:

```typescript
import { useApiService } from "@/services/apiService";

function MyComponent() {
  const { getTopics, createTopic } = useApiService();

  useEffect(() => {
    // Get all topics
    getTopics().then((topics) => {
      console.log(topics);
    });
  }, [getTopics]);

  const handleCreateTopic = async () => {
    // Create a new topic
    const newTopic = await createTopic({
      title: "My Topic",
      description: "Topic description",
    });
  };
}
```

## Development

1. Start the backend server first
2. Start the frontend development server
3. The frontend will automatically connect to the backend API

## Troubleshooting

- Make sure the backend server is running on the correct port
- Check that the API_BASE_URL is correctly configured
- Verify that CORS is properly configured on the backend
- Check the browser console for any API errors
