# TaskFlow - Team Task Manager

> Manage projects, assign tasks, and track team productivity efficiently.

A modern, full-stack team task management application built with React, Express.js, and MongoDB. Similar to tools like Trello, Asana, and ClickUp.

## Features

### Authentication
- Secure JWT-based authentication
- User signup with role selection (Admin/Member)
- Protected routes and persistent sessions
- Password hashing with bcrypt

### Role-Based Access Control
- **Admin**: Full access - create/edit/delete projects and tasks, manage team members
- **Member**: View assigned projects and tasks, update task status

### Project Management
- Create, edit, and delete projects
- Add/remove team members
- View project progress and statistics
- Team collaboration features

### Task Management
- Create, assign, and track tasks
- Priority levels (Low, Medium, High)
- Status tracking (To Do, In Progress, Done)
- Due date management with overdue warnings
- Filter and search tasks

### Dashboard Analytics
- Overview statistics (projects, tasks, completion rate)
- Tasks by status chart
- Tasks by priority chart
- Tasks per user chart
- Recent activity feed

### Modern UI
- Responsive design (mobile/tablet/desktop)
- Dark mode support
- Clean, professional interface
- Toast notifications
- Loading states and empty states

## Tech Stack

### Frontend
- React 19 with Vite
- React Router DOM
- Tailwind CSS
- Axios
- Recharts (for charts)
- Lucide React (icons)

### Backend
- Node.js
- Express.js 5
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing

## Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- pnpm (recommended) or npm

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd taskflow
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
MONGODB_URI=mongodb+srv://your-username:password@cluster.mongodb.net/taskflow
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
CLIENT_URL=http://localhost:3000
```

4. **Start development servers**
```bash
pnpm dev
```

This runs both the frontend (port 3000) and backend (port 5000) concurrently.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both client and server in development |
| `pnpm dev:client` | Start only the frontend |
| `pnpm dev:server` | Start only the backend |
| `pnpm build` | Build the frontend for production |
| `pnpm preview` | Preview the production build |

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects (user's)
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project (Admin)
- `PUT /api/projects/:id` - Update project (Admin)
- `DELETE /api/projects/:id` - Delete project (Admin)
- `POST /api/projects/:id/members` - Add member (Admin)
- `DELETE /api/projects/:id/members/:userId` - Remove member (Admin)

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create task (Admin)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (Admin)

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user profile

## Project Structure

```
taskflow/
├── client/                 # Frontend (Vite + React)
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (Auth, Theme)
│   │   ├── layouts/        # Page layouts
│   │   ├── lib/            # Utilities
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── index.html
├── server/                 # Backend (Express.js)
│   ├── middleware/         # Auth middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── index.ts
├── .env.example
├── package.json
├── vite.config.ts
└── README.md
```

## Deployment

### Frontend (Vercel)
1. Connect your repository to Vercel
2. Set build command: `pnpm build`
3. Set output directory: `dist`
4. Add environment variables

### Backend (Railway/Render)
1. Create a new service
2. Connect your repository
3. Set start command: `pnpm start`
4. Add environment variables

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `PORT` | Backend server port (default: 5000) |
| `CLIENT_URL` | Frontend URL for CORS |

## Screenshots

*Coming soon*

## License

MIT

---

Built with React, Express, and MongoDB
