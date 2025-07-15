# Clerk Authentication Setup

## Overview

AStudy uses Clerk for secure user authentication and management. Clerk provides a complete authentication solution with features like:

- User registration and login
- Social login providers
- User management
- Session management
- Security features

## Setup Instructions

### 1. Create a Clerk Account

1. Go to [clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

### 2. Get Your API Keys

1. In your Clerk dashboard, go to API Keys
2. Copy your **Publishable Key** and **Secret Key**

### 3. Configure Environment Variables

Create a `.env` file in your project root with:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/astudy"
```

### 4. Configure Clerk Application

1. In your Clerk dashboard, go to **User & Authentication**
2. Configure your sign-in and sign-up methods
3. Set up your application URLs:
   - **Home URL**: `http://localhost:3000`
   - **Sign-in URL**: `http://localhost:3000/sign-in`
   - **Sign-up URL**: `http://localhost:3000/sign-up`
   - **After sign-in URL**: `http://localhost:3000/dashboard`
   - **After sign-up URL**: `http://localhost:3000/dashboard`

### 5. Database Setup

The application automatically creates user records in the database when users sign up through Clerk. The `clerkUserId` field links Clerk users to your application's user records.

### 6. Features Included

- **Protected Routes**: Dashboard and all authenticated pages
- **User Management**: UserButton in the top navigation
- **Session Management**: Automatic session handling
- **Modal Authentication**: Sign-in and sign-up modals
- **Automatic Redirects**: Users are redirected to dashboard after authentication

### 7. Customization

You can customize the authentication flow by:

- Modifying the sign-in/sign-up pages
- Customizing the UserButton appearance
- Adding additional authentication providers
- Customizing email templates

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables for all sensitive configuration
- Clerk handles security best practices automatically
- Sessions are managed securely by Clerk

## Troubleshooting

- Ensure all environment variables are set correctly
- Check that your Clerk application URLs match your local development setup
- Verify that your database is running and accessible
- Check the browser console for any authentication errors
