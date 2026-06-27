✏️ Concept - 01

🔤 Name:

Onboarding an Existing Project

🎯 Purpose:

Instead of creating a project from scratch, I had to learn how to jump into someone else's codebase and become productive as quickly as possible. This included installing dependencies, configuring environment variables, understanding the project structure, and learning how the different models, routes, and controllers interacted before I could safely make changes.

❓ Why it was challenging:

This was challenging because I wasn't starting with code that I had written myself. Before I could even begin implementing new features, I had to understand how the project was organized and why everything was built the way it was. I also learned that simply cloning a repository isn't enough—you have to restore all of the project's dependencies with npm install, configure the .env file correctly, and verify that everything runs before writing any code. This module taught me how important it is to spend time understanding an existing application before making modifications.

📍 Where (file & line):

Entire project setup, project structure review, environment configuration, dependency installation, and implementation across all backend endpoint files.

✏️ Concept - 02

🔤 Name:

Cascade Deletion

🎯 Purpose:

Cascade deletion ensures that when a parent resource is removed, every piece of related data is also removed. In this project, deleting a user also required deleting their sessions, posts, comments, replies, profile pictures, and other related records so that the database remained consistent and free of orphaned data.

❓ Why it was challenging:

This was one of the hardest concepts because deleting a single document wasn't actually a single operation. I had to trace every relationship that object had throughout the database and make sure nothing was left behind. If even one relationship was missed, the database could end up containing orphaned records that no longer belonged to anything. It really changed how I think about deleting data. Instead of asking, "What am I deleting?", I started asking, "What else depends on this object?" That shift in thinking helped me understand how relational data works even inside MongoDB.

📍 Where (file & line):

routes/user.js — DELETE /user/:id
routes/posts.js — DELETE /posts/:id
routes/comments.js — DELETE /comments/:id
✏️ Concept - 03

🔤 Name:

Data Validation and Defensive API Design

🎯 Purpose:

The purpose of validation is to make sure the API only accepts valid data and handles errors gracefully. Rather than assuming every request is correct, the server verifies IDs, validates incoming data, checks whether resources exist, prevents duplicate information, and returns appropriate HTTP status codes whenever something goes wrong.

❓ Why it was challenging:

Before this module, I mostly focused on making the happy path work. During this project I realized that a large part of backend development is actually preparing for everything that can go wrong. I had to think about situations like invalid IDs, missing users, duplicate email addresses, empty passwords, and requests for resources that didn't exist. I also had to learn when to return different HTTP status codes like 400, 404, and 409 depending on the situation. It taught me that a good API isn't just one that works when everything goes right—it's one that fails safely and tells the client exactly what happened.

📍 Where (file & line):

Primarily implemented throughout:

routes/user.js — PATCH /user/:id and DELETE /user/:id
routes/posts.js — DELETE /posts/:id
routes/comments.js — DELETE /comments/:id

Validation includes ObjectId checks, duplicate email validation, password validation, resource existence checks, and standardized error responses.