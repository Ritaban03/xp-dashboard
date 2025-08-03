# Overview

This is a gamified productivity dashboard that turns daily sales activities into an engaging RPG-style experience. Users earn XP and level up by completing actions like sending cold DMs, creating Loom videos, booking calls, closing clients, writing content, and building systems. The application features a modern interface with action buttons, progress tracking, todo management, timed challenges, and detailed analytics to motivate consistent daily activity.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui for consistent design system
- **Styling**: Tailwind CSS with custom gaming-themed color variables and dark theme support
- **State Management**: TanStack Query for server state and API data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **API Design**: RESTful endpoints with JSON responses
- **Validation**: Zod schemas shared between client and server
- **Development**: Hot reload with Vite integration in development mode

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Schema Design**: Five main tables - game_state, actions, todos, challenges, and achievements
- **Data Persistence**: All game progress, user actions, and analytics stored in database
- **Fallback Storage**: In-memory storage implementation for development/testing

## Authentication and Authorization
- **Current State**: Simple user identification via userId parameter (defaults to "default")
- **Session Management**: Basic session handling without complex authentication
- **Security**: Prepared for future authentication system integration

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm & drizzle-kit**: Type-safe ORM and database migrations
- **@tanstack/react-query**: Server state management and data fetching
- **@radix-ui/***: Comprehensive UI component primitives
- **wouter**: Lightweight routing for React
- **zod**: Runtime type validation and schema definition

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static typing for both client and server
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production builds

### UI and Styling
- **shadcn/ui**: Pre-built component library based on Radix UI
- **class-variance-authority**: Utility for creating component variants
- **clsx & tailwind-merge**: Conditional CSS class management
- **Lucide React**: Modern icon library

### Gaming Features
- **XP System**: Predefined XP values for different action types
- **Level Progression**: Calculated level requirements and progress tracking
- **Challenge System**: Timed challenges with targets and progress monitoring
- **Achievement System**: Unlockable achievements based on user activity