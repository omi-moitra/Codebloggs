# CodeBloggs

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation / Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Responsive Design](#responsive-design)
- [Authors](#authors)

## Project Description

CodeBloggs is a full-stack social blogging platform for developers. Users can register, log in, create and manage posts, leave comments and replies, follow other users, and see who is online in real time. It is built as a single-page application with a React frontend backed by a RESTful Express/MongoDB API, and is designed to be fully responsive across desktop, tablet, and mobile viewports.

## Tech Stack

- **Frontend:** React 18, React Router DOM v6, Redux + Redux Thunk, Bootstrap 5, React-Bootstrap, Tailwind CSS, Vite
- **Backend:** Node.js, Express 4
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** Cookie-based session authentication, bcrypt password hashing
- **File uploads:** Multer (profile picture uploads)
- **Dev tooling:** Vite (HMR), Nodemon, ESLint

## Project Structure

```
FullStack_CodeBloggsM10/
├── client/                    # React SPA
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # Auth, Theme, and Presence contexts
│   │   ├── layout/            # MainLayout and MainContent wrappers
│   │   ├── pages/             # Route-level page components
│   │   ├── redux/             # Actions, reducers, and store
│   │   ├── services/          # API call helpers (one per resource)
│   │   └── styles/            # CSS theme files (light/dark)
│   ├── public/                # Static assets
│   ├── index.html
│   └── vite.config.js
├── server/                    # Express API
│   ├── controllers/           # Request handlers (one per resource)
│   ├── db/                    # MongoDB connection helper
│   ├── lib/                   # Presence tracker, session config
│   ├── middleware/            # requireSession auth guard
│   ├── routes/                # Express routers (one per resource)
│   ├── schemas/               # Mongoose models
│   ├── validators/            # express-validator rule sets
│   └── server.js              # Entry point
├── PostmanCollection.json     # Importable API test collection
└── README.md
```

## Installation / Setup

```bash
# Clone the repository
git clone git@github.com:YOUR_GITHUB_USERNAME/FullStack_CodeBloggsM10.git
cd FullStack_CodeBloggsM10

# Install and start the backend
cd server
npm install
cp .env.example .env   # then fill in your values (see Environment Variables)
npm run dev            # starts on http://localhost:5050

# In a separate terminal — install and start the frontend
cd ../client
npm install
npm run dev            # starts on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To seed the database with sample data:

```bash
cd server
npm run seed
```

## Environment Variables

Create a `.env` file inside the `server/` directory and set the following:

```env
# MongoDB connection string
MONGO_URI=your_mongodb_connection_string

# Port the Express server listens on (defaults to 5050)
PORT=5050

# Origin(s) the CORS policy allows (comma-separated for multiple)
CLIENT_ORIGIN=http://localhost:3000
```

## API Documentation

Base URL: `http://localhost:5050`

### Session

```
POST   /session          - Log in (returns session cookie)
DELETE /session          - Log out
GET    /session/validate - Validate current session
```

### Users

```
POST   /user             - Register a new user
GET    /user             - Get all users
GET    /user/:id         - Get user by ID
PATCH  /user/:id         - Update user
DELETE /user/:id         - Delete user
```

### Posts

```
POST   /posts            - Create a post (auth required)
GET    /posts            - Get all posts
PATCH  /posts/:id        - Update a post
DELETE /posts/:id        - Delete a post
```

### Comments

```
POST   /comments         - Create a comment (auth required)
GET    /comments         - Get all comments
PATCH  /comments/:id     - Update a comment
DELETE /comments/:id     - Delete a comment
```

### Replies

```
POST   /replies          - Create a reply (auth required)
GET    /replies          - Get replies by post
PUT    /replies/:id      - Update a reply
```

### Profile Pictures

```
POST   /profile-pic           - Upload a profile picture (auth required)
GET    /profile-pic/:userId   - Get profile picture by user ID
```

### Presence

```
GET    /presence         - Get list of currently online users (auth required)
```

A full Postman collection is available at [PostmanCollection.json](PostmanCollection.json).

## Responsive Design

CodeBloggs is fully responsive across three viewport sizes. Below the desktop breakpoint the sidebar collapses and a hamburger toggle in the top header reveals the navigation links as a vertical dropdown.

### Breakpoints

| Breakpoint | Range | Behaviour | Justification |
|---|---|---|---|
| Desktop | ≥ 992px | Full vertical sidebar visible; no hamburger | Bootstrap's `lg` breakpoint (992px) is the minimum width at which the sidebar and content panel share horizontal space comfortably without crowding |
| Tablet | 768px–991px | Sidebar hidden; hamburger toggle in header; collapsible dropdown nav | Bootstrap's `md` breakpoint (768px) corresponds to common tablet widths (iPad portrait: 768px); the sidebar would crowd the content panel below 992px |
| Mobile | < 768px | Sidebar hidden; hamburger toggle; full-width vertical dropdown | Below 768px matches typical phone sizes (iPhone SE: 375px, iPhone 14: 390px); a full-width collapsible nav is the standard touch-friendly pattern at this width |

*See [Research.md](Research.md) for further context on the breakpoint decisions.*

## Authors

Built by the CodeBloggs team for Fullstack Module 9.

