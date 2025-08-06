# Gamified Productivity Dashboard - Deployment Guide

## Overview
This is a comprehensive gamified productivity dashboard built with React, TypeScript, Express.js, and designed for cloud deployment with automatic data synchronization.

## Cloud Sync & Data Persistence
The application automatically syncs data to the cloud when deployed on Replit. All game progress, challenges, todos, and analytics are preserved across sessions and devices.

## Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git (for cloning)

### 1. Download and Setup

#### Option A: Download as ZIP
1. Click the "Download" button in the Replit interface
2. Extract the ZIP file to your desired location
3. Open terminal and navigate to the project folder

#### Option B: Clone Repository (if using Git)
```bash
git clone <your-repository-url>
cd <project-folder>
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
```

### 4. Run Locally
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Production Deployment

### Deploy on Replit (Recommended for Cloud Sync)
1. Import your project to Replit
2. The project will automatically detect dependencies and start
3. Data automatically syncs to Replit's cloud storage
4. Access from anywhere with your Replit account

### Deploy on Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel` in the project directory
3. Follow the prompts to deploy
4. Note: You'll need to set up external database for data persistence

### Deploy on Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`

### Deploy on VPS/Cloud Server
```bash
# Clone and setup
git clone <your-repo>
cd <project-folder>
npm install
npm run build

# Using PM2 for process management
npm install -g pm2
pm2 start npm --name "productivity-dashboard" -- start
pm2 startup
pm2 save
```

## Environment Variables for Production

### Required Variables
```env
NODE_ENV=production
PORT=5000
```

### Optional Database Configuration
If using external database instead of in-memory storage:
```env
DATABASE_URL=postgresql://username:password@host:port/database
```

## Features Included

### Core Functionality
- ✅ 6 action types with XP rewards (DM, Loom, Call, Client, Content, System)
- ✅ 50-level progression system with league rankings
- ✅ Challenge system with 7 different challenge types
- ✅ Custom todo list with XP rewards
- ✅ Sticky Pomodoro timer with performance tracking
- ✅ Advanced analytics and progress tracking
- ✅ League requirements and progression system
- ✅ Bonus XP for speed completion and records

### Performance Features
- ✅ Real-time progress tracking
- ✅ Performance comparison against previous records
- ✅ Bonus XP calculation for beating personal bests
- ✅ Mobile-responsive design
- ✅ Browser optimizations with proper meta tags

### Data Management
- ✅ Automatic cloud sync (when deployed on Replit)
- ✅ In-memory storage for development
- ✅ Ready for database integration
- ✅ Cross-device synchronization

## Customization

### Adding New Action Types
1. Edit `shared/schema.ts` - Update `ACTION_XP_VALUES`
2. Update `client/src/components/action-buttons.tsx`
3. Add corresponding challenge types if needed

### Modifying XP Values
Edit the `ACTION_XP_VALUES` object in `shared/schema.ts`:
```typescript
export const ACTION_XP_VALUES = {
  dm: 5,        // Adjust these values
  loom: 20,     // as needed
  call: 30,
  client: 50,
  content: 15,
  system: 45,
};
```

### Changing Level Requirements
Modify `LEVEL_REQUIREMENTS` in `shared/schema.ts` to adjust progression difficulty.

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
# Or use different port
PORT=3000 npm run dev
```

#### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build Errors
```bash
# Check TypeScript errors
npx tsc --noEmit
# Fix any type errors before building
```

## Support

### Cloud Sync Benefits
- Automatic data persistence
- Cross-device access
- No database setup required
- Instant deployment

### Manual Backup (Local Development)
The app uses in-memory storage for development. For production, consider:
1. Implementing PostgreSQL database
2. Adding data export/import features
3. Setting up regular backups

## File Structure
```
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and helpers
├── server/                # Backend Express server
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data storage layer
├── shared/               # Shared types and schemas
└── package.json         # Project dependencies
```

## Next Steps After Deployment

1. **Access Your Dashboard**: Navigate to your deployed URL
2. **Start Tracking**: Begin using action buttons to earn XP
3. **Set Challenges**: Create focused work sessions
4. **Use Pomodoro Timer**: Track performance and earn bonus XP
5. **Monitor Progress**: Check analytics and league progression

Your gamified productivity dashboard is now ready to help you level up your daily activities!