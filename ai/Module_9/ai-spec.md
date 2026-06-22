# 🤖 AI_SPEC — CodeBloggs (Main Specification)

This document is the primary AI specification for the CodeBloggs project. Every AI tool (Claude Code, GitHub Copilot Agent Mode, Codex, etc.) must read this document before generating or modifying code.

All feature implementation prompts must include:

1. This AI specification (`ai/ai-spec.md`)
2. The relevant feature specification (`ai/features/*.feature.md`)

AI must implement only what is defined in these documents and must not invent additional functionality.

---

# Project Identity

## Project Name

CodeBloggs

## Project Description

CodeBloggs is a full-stack MERN social blogging platform for developers.

Users can:

* Register
* Login
* Create blog posts
* View their own posts
* View posts from other users
* Like posts
* Comment on posts
* Browse other users
* Access an Admin section based on authorization level

The application uses cookie-based session authentication and role-based access control.

---

# Project Scope

## In Scope

### Backend

* User Schema
* Session Schema
* Post Schema
* Comment Schema

Endpoints:

* Session Login
* Session Logout
* Session Validation
* User Create
* User Get By ID
* User Get All
* Post Create
* Post Update
* Post Get All
* Comment Create
* Comment Update
* Comment Get All

### Frontend

* Login Page
* Registration Page
* Header
* Left Navigation
* Home Page
* Blogs Page
* Network Page
* Admin Page
* Post Modal
* Protected Routes
* Redux State Management
* Alert System

---

## Out of Scope

Do NOT implement:

* Password reset
* Email verification
* OAuth
* File uploads
* Image uploads
* Direct messaging
* Friend systems
* Notifications beyond Redux alerts
* Profile editing
* Account settings functionality
* Any features not explicitly listed in the business requirements

---

# User Roles

## Guest

Can access:

* Login
* Register

Cannot access:

* Home
* Blogs
* Network
* Admin

---

## Basic User

auth_level = "basic"

Can access:

* Home
* Blogs
* Network

Cannot access:

* Admin

---

## Admin User

auth_level = "admin"

Can access:

* Home
* Blogs
* Network
* Admin

The Admin navigation link must only be visible to admin users.

---

# Technology Stack

## Frontend

* React
* React Router DOM
* React Bootstrap
* Bootstrap
* Redux
* React Redux
* Redux Thunk
* react-use-cookie

## Backend

* Node.js
* Express
* MongoDB
* Mongoose
* bcrypt
* cors
* nodemon

---

# Brand Identity

## Color Palette

```css
--delft-blue: #403E6B;
--lavender: #D3D1EE;
--tropical-indigo: #8D88EA;
--periwinkle: #B1ADFF;
--dim-gray: #5F5E6B;
--slate-blue: #6E6AB8;
```

All styling should follow the provided CodeBloggs branding.

---

# Repository Structure

```text
/client
  /src
    /components
    /layout
    /pages
    /redux
      /actions
      /reducers
      /store
    /services
    /data
    /styles
    /utils

/server
  /routes
  /controllers
  /models
  /db

/ai
  ai-spec.md
  /features

/Working

README.md
CONCEPTS.md
PostmanCollection.json
```

Do not create files outside this structure unless required by a feature specification.

---

# Branching Strategy

Required workflow:

feature/*
↓
dev
↓
main

Rules:

* No direct commits to main
* Every feature starts from dev
* Every feature uses its own feature branch
* Feature branches merge into dev
* dev merges into main before submission

---

# Frontend Architecture Standards

Frontend and backend are developed in parallel.

Frontend development should continue even when backend endpoints are unavailable.

Until backend APIs are completed:

* Use fakeFetch()
* Use mock data
* Follow final API contracts
* Avoid creating temporary response structures

Mock data should be stored under:

```text
src/data
src/services
```

---

# API Contract Standards

All API responses must use:

```json
{
  "status": "ok",
  "data": {},
  "message": ""
}
```

Frontend mock responses must use this exact structure.

Do not create alternate response formats.

---

# Database Collections

## User

Stores:

* first_name
* last_name
* birthday
* email
* password
* auth_level
* status
* additional profile information required by wireframes

Passwords must always be hashed using bcrypt.

---

## Session

Stores:

* session token
* user reference
* timestamps
* expiration information

---

## Post

Stores:

* author reference
* content
* date
* like count

---

## Comment

Stores:

* post reference
* author reference
* content
* date

Comment displays must reflect actual Comment collection data.

---

# Layout Rules

Authenticated pages always use:

```text
Header
Navbar
Main Content
```

Layout structure:

```text
┌─────────────────────────────┐
│ Header                      │
├────────────┬────────────────┤
│ Navbar     │ Main Content   │
│            │                │
└────────────┴────────────────┘
```

---

## Pages Using Layout

* Home
* Blogs
* Network
* Admin

---

## Pages Without Layout

* Login
* Register

Login and Register must never display:

* Header
* Navbar

---

# Routing Rules

## Public Routes

* /login
* /register

## Protected Routes

* /home
* /blogs
* /network
* /admin

Users without a valid session must be redirected to:

```text
/login
```

---

# Session Rules

Authentication uses cookie-based sessions.

Session token:

```text
session_token
```

must be stored using:

```javascript
react-use-cookie
```

Never use:

```javascript
localStorage
```

for authentication.

Every protected route must validate the session.

---

# Header Rules

The Header is visible on all authenticated pages.

Required components:

* Logo
* Post Button
* Username Dropdown

---

## Logo

Navigates to:

```text
/home
```

---

## Post Button

Opens the global Post Modal.

---

## Username Dropdown

Contains:

* Account Settings
* Logout

Account Settings:

* Displays a Redux alert
* No additional functionality required

Logout:

* Clears session
* Removes cookie
* Redirects to Login

---

# Navbar Rules

Navbar appears on all authenticated pages.

Required links:

* Home
* Blogs
* Network
* Admin

Admin link visibility:

```javascript
user.auth_level === "admin"
```

Active page link must be highlighted.

---

# Post Modal Rules

The Post Modal is globally available.

Requirements:

* Open from Header Post button
* Overlay current page
* Close when clicking outside
* Create new posts

---

# Redux Standards

Redux is the global state manager.

Redux should manage:

* Authentication
* Users
* Posts
* Comments
* Alerts
* UI State

Use redux-thunk for asynchronous actions.

Local component state should only be used for temporary UI concerns.

---

# Alert Standards

All user actions must generate Redux-managed alerts.

Examples:

* Login Success
* Login Failure
* Registration Success
* Registration Failure
* Post Created
* Comment Created
* Logout Success
* Access Denied

Requirements:

* Managed through Redux
* Automatically dismiss after 5 seconds
* Global reusable component

---

# Home Page Requirements

Display:

* User initials avatar
* User information
* Total post count
* Date of latest post
* User posts
* Like functionality
* Comments

---

# Blogs Page Requirements

Display:

* All posts
* Most recent first
* Author initials
* Comments
* Like counts

---

# Network Page Requirements

Display User Cards.

Each card includes:

* User information
* Status
* Latest post

---

# Admin Page Requirements

Admin access only.

Contains:

* User Manager Card
* Content Manager Card

Module 9 behavior:

Display an alert indicating:

"Under Construction"

---

# Mock Data Standards

Until backend APIs are available:

* Use fakeFetch()
* Use Promise-based mock responses
* Match final API contract exactly
* Match backend schema structure exactly

Do not create frontend-only data models.

---

# AI Rules

AI must:

* Follow this specification exactly
* Follow the associated feature specification
* Reuse existing files whenever possible
* Write beginner-friendly code
* Avoid unnecessary abstractions
* Use React Bootstrap components where appropriate
* Use Redux for shared state
* Use cookie-based authentication
* Follow wireframes
* Follow branding
* Follow API contracts

AI must NOT:

* Add unrequested features
* Add new pages
* Add new routes
* Invent API structures
* Invent database fields
* Replace required technologies

---

# Definition of Done

A feature is complete only when:

* Requirement implemented
* Matches wireframe
* Matches feature specification
* Uses React Bootstrap where appropriate
* Uses Redux when state is global
* Uses approved API contract
* Uses approved mock data
* No console errors
* No lint errors
* Manually tested
* Ready to merge into dev

---

# Code Quality Requirements

Every generated or modified file must contain:

* Clear inline comments
* Explanations of important logic
* Notes explaining implementation decisions
* Warnings for known limitations using:

```javascript
// ⚠️
```

Implementation logs must be created for completed features:

Working/Module_9/implementation_logs/

Each implementation log should summarize:

* Files created
* Files modified
* Decisions made
* Deviations from specification
* Known issues

```
```
