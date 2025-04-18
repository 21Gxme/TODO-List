# Todo Application

A modern, full-stack Todo application built with Next.js and Supabase, featuring user authentication, real-time updates, image uploads, and a responsive UI.

## Table of Contents

- [Todo Application](#todo-application)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Framework](#framework)
    - [Project Structure](#project-structure)
  - [Database](#database)
    - [Database Structure](#database-structure)
      - [Tables](#tables)
      - [Storage Buckets](#storage-buckets)
    - [Database Schema](#database-schema)
  - [GitHub Repository](#github-repository)
    - [Prerequisites](#prerequisites)
    - [Local Development](#local-development)
    - [Supabase Setup](#supabase-setup)
  - [Code Explanation](#code-explanation)
    - [Architectural Layers](#architectural-layers)
    - [Key Design Decisions](#key-design-decisions)
  - [Environment Variables](#environment-variables)

## Features

- **User Authentication**: Secure sign-up, sign-in, and password reset functionality
- **CRUD Operations**: Create, read, update, and delete todos
- **Real-time Updates**: Changes to todos are reflected in real-time
- **Image Uploads**: Attach images to todos
- **Responsive Design**: Works on desktop and mobile devices
- **Status Management**: Track todo status (Todo, In Progress, Done)

## Framework

This project is built with the following technologies:

- **Next.js 14**: A React framework with App Router for server-side rendering, routing, and API routes
- **React 18**: For building the user interface
- **TypeScript**: For type safety and better developer experience
- **Tailwind CSS**: For styling and responsive design
- **Shadcn/UI**: Component library built on top of Radix UI and Tailwind CSS
- **Supabase Client & Server SDK**: For database operations and authentication

### Project Structure

```bash
todo-app/
├── .next/                  # Next.js build output
├── app/                    # Next.js App Router
│   ├── (auth-pages)/       # Authentication pages group
│   │   ├── forgot-password/# Forgot password page
│   │   ├── sign-in/        # Sign in page
│   │   ├── sign-up/        # Sign up page
│   │   ├── layout.tsx      # Auth pages layout
│   │   └── smtp-message.tsx# Email template component
│   ├── auth/callback/      # Auth callback route
│   │   └── route.ts        # Auth callback handler
│   ├── protected/          # Protected routes
│   │   ├── reset-password/ # Password reset page
│   │   └── todos/          # Todos pages
│   ├── sign-out/           # Sign out page
│   ├── actions.ts          # Server actions
│   ├── favicon.ico         # Site favicon
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── tutorial/           # Tutorial components
│   ├── typography/         # Typography components
│   ├── ui/                 # UI components (shadcn)
│   ├── CreateTodoForm.tsx  # Form for creating todos
│   ├── deploy-button.tsx   # Deployment button
│   ├── env-var-warning.tsx # Environment variable warning
│   ├── form-message.tsx    # Form message component
│   ├── header-auth.tsx     # Authentication header
│   ├── hero.tsx            # Hero section
│   ├── next-logo.tsx       # Next.js logo
│   ├── submit-button.tsx   # Submit button component
│   ├── supabase-logo.tsx   # Supabase logo
│   ├── theme-switcher.tsx  # Theme switcher
│   ├── TodoItem.tsx        # Todo item component
│   └── TodoList.tsx        # Todo list component
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── node_modules/           # Node.js dependencies
├── utils/                  # Utility functions
├── .env.example            # Example environment variables
├── .env.local              # Local environment variables
├── .gitignore              # Git ignore file
├── components.json         # Components configuration
├── middleware.ts           # Next.js middleware
├── next-env.d.ts           # Next.js TypeScript declarations
├── next.config.ts          # Next.js configuration
├── package-lock.json       # NPM lock file
├── package.json            # NPM package file
├── postcss.config.js       # PostCSS configuration
├── README.md               # Project documentation
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Database

This project uses **Supabase** as the backend, which is built on top of PostgreSQL.

### Database Structure

#### Tables

1. **auth.users** (Managed by Supabase Auth)
   - Standard user authentication table

2. **Todo**
   - `id`: UUID (Primary Key)
   - `user_id`: UUID (Foreign Key to auth.users)
   - `title`: Text
   - `description`: Text
   - `status`: Text ('Todo', 'In Progress', 'Done')
   - `created_at`: Timestamp

#### Storage Buckets

1. **todo-images**
   - Stores images attached to todos
   - Files are named after the todo ID they belong to

### Database Schema

```sql
-- Todo table
CREATE TABLE "Todo" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Todo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE "Todo" ENABLE ROW LEVEL SECURITY;

-- Users can only see their own todos
CREATE POLICY "Users can view their own todos" ON "Todo"
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own todos
CREATE POLICY "Users can insert their own todos" ON "Todo"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own todos
CREATE POLICY "Users can update their own todos" ON "Todo"
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own todos
CREATE POLICY "Users can delete their own todos" ON "Todo"
  FOR DELETE USING (auth.uid() = user_id);
```

## GitHub Repository

[GitHub Repository Link](https://github.com/21Gxme/TODO-List.git)

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account

### Local Development

1. Clone the repository:

   ```bash
   git clone https://github.com/21Gxme/TODO-List.git
   cd todo-list
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in the required environment variables (see [Environment Variables](#environment-variables) section)

4. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

6. After sign up you must verify your email address via your email provider. After that you can sign in with your email and password.

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL commands from the [Database Schema](#database-schema) section in the Supabase SQL editor
3. Create a storage bucket named `todo-images` with public access
4. Set up authentication providers in the Supabase dashboard
5. Copy the Supabase URL and anon key to your environment variables

(Or you can use my .env.local)

## Code Explanation

This application follows a layered architecture pattern to maintain separation of concerns and improve maintainability.

### Architectural Layers

1. **Presentation Layer**
   - React components in the `components/` directory
   - Next.js pages in the `app/` directory
   - Responsible for UI rendering and user interaction

2. **Application Layer**
   - Server actions in `app/actions.ts`
   - Auth callback handler in `app/auth/callback/route.ts`
   - Middleware in `middleware.ts`
   - Handles business logic and coordinates between presentation and data layers
   - Manages authentication flows and form submissions

3. **Data Access Layer**
   - Supabase client in `utils/` directory
   - Handles database operations and storage interactions
   - Manages real-time subscriptions

4. **Infrastructure Layer**
   - Configuration in `next.config.ts`
   - Environment variables in `.env.local`
   - TypeScript configuration in `tsconfig.json`

### Key Design Decisions

1. **Authentication Strategy**
   - Supabase Auth for user management
   - Route grouping with `(auth-pages)` for authentication pages
   - Protected routes under `/protected` with middleware validation
   - Dedicated auth callback handler for OAuth flows

2. **Component Organization**
   - Reusable UI components in `components/ui/`
   - Authentication-specific components like `header-auth.tsx`
   - Form handling components like `submit-button.tsx` and `form-message.tsx`
   - Todo-specific components separated for better maintainability

3. **Routing Structure**
   - App Router with route groups for better organization
   - Authentication pages grouped together
   - Protected routes separated from public routes
   - Dedicated sign-out page for better user experience

4. **Server Actions**
   - Centralized server actions in `app/actions.ts`
   - Used for form submissions and data mutations
   - Provides type safety and better error handling

5. **Error Handling**
   - Form message component for displaying errors and success messages
   - Environment variable warnings to ensure proper setup
   - Consistent error handling patterns across the application

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the following variables:

(I already provided the .env.local via private comment in google classroom.)

```bash)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
