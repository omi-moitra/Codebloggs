# Research

## Table of Contents

1. [Reactive Design](#reactive-design)
2. [Responsive Design](#responsive-design)
3. [Differences Between the Two](#differences-between-the-two)
4. [Implementation in CodeBloggs](#implementation-in-codebloggs)
5. [Extra Mile — SQL & Relational Basics](#extra-mile--sql--relational-basics)
6. [Extra Mile — Relationships in This Project](#extra-mile--relationships-in-this-project)
7. [Sources](#sources)

---

## Reactive vs. Responsive Design

### Reactive Design

Reactive design is the practice of making a user interface feel alive and responsive to ongoing processes — particularly while data is being fetched or computed in the background [1]. Rather than showing a blank screen or a static spinner, a reactive UI communicates progress and activity to the user in a meaningful way [2]. The most common expression of this is the skeleton loader: a placeholder layout that mirrors the shape of the content to come, so the user has a visual anchor while waiting [3]. The key idea is that the UI always reacts to the current state of the system — loading, loaded, error — and transitions smoothly between those states so users are never left wondering whether the app is working [1].

### Responsive Design

Responsive design is the practice of building a UI that adapts its layout and presentation to fit any screen size — desktop, tablet, or mobile [4]. Instead of designing one fixed layout that breaks on smaller viewports, a responsive design uses fluid grids, flexible components, and CSS media queries to reflow content gracefully as the available space changes [5]. Navigation might collapse into a hamburger menu on mobile; multi-column layouts might stack into a single column on a phone [6]. The goal is that the same codebase delivers an equally usable experience regardless of the device the user is holding [4].

### Differences Between the Two

Although the terms are sometimes confused, reactive and responsive design solve entirely different problems. Reactive design is about **time** — it manages how the UI behaves during asynchronous operations like data fetching, making wait states visible and informative rather than invisible and disorienting [1][2]. Responsive design is about **space** — it manages how the UI behaves across different screen sizes, rearranging and resizing elements so nothing overflows or gets cut off [4][5].

Another way to frame it: responsive design is a layout problem solved at build time through CSS; reactive design is a state problem solved at runtime through component logic [1][4]. A page can be perfectly responsive (it looks great on every device) but not reactive (it goes blank for two seconds while loading), and vice versa. A well-built application needs both: it should look right on any device and feel alive at every moment of the user journey.

### Implementation in CodeBloggs

**Reactive Design — Skeleton Loaders**

In CodeBloggs, reactive design is implemented through skeleton loaders on the Admin section's User Manager and Content Manager pages [3]. When the admin first loads either page, the app dispatches a Redux Thunk action to fetch users or posts from the backend. During that fetch, instead of rendering an empty table, the UI renders a set of animated placeholder rows that match the shape of the real content [3]. Once the data arrives and the Redux store updates, the skeleton rows are replaced by the actual user or post rows. This keeps the admin interface from feeling broken or unfinished during the brief window between page load and data arrival [2].

**Responsive Design — Responsive Navigation and Layouts**

Responsive design in CodeBloggs is implemented primarily through CSS media queries and React Bootstrap's grid system [5][7]. The navigation bar is the most visible touchpoint: on a full desktop viewport it displays all links inline, while on tablet and mobile viewports it collapses into a compact menu that does not overflow the screen [6]. Page layouts such as the blog feed, admin tables, and profile sections are built with Bootstrap's column system so they reflow naturally as the viewport narrows — multi-column arrangements stack vertically, and oversized elements scale down to fit [7]. Three breakpoints are targeted: desktop (full width), tablet (medium viewports), and mobile (small viewports), ensuring the site is usable on any device a visitor might bring [5][6].

---

## Extra Mile — SQL & Relational Basics

### What is SQL?

SQL (Structured Query Language) is the standard language for communicating with relational databases [8]. It lets you define structure (`CREATE TABLE`, `ALTER TABLE`), write data (`INSERT`, `UPDATE`, `DELETE`), and query data (`SELECT`) [8]. SQL databases store records in tables — rows and columns — with a rigid, predefined schema that enforces data types and constraints (e.g., `NOT NULL`, `UNIQUE`, `CHECK`) [9]. Because every table's shape is declared in advance and relationships between tables are encoded as foreign keys, the database engine can guarantee consistency and catch bad data before it is written [9]. Well-known SQL databases include MySQL, PostgreSQL, SQLite, and Microsoft SQL Server [8].

### SQLite vs MySQL

Both are relational databases that speak SQL, but they are designed for very different scales of use.

SQLite is a **serverless, file-based** engine [10]. The entire database lives in a single `.db` file on disk, and the engine itself runs as a library linked directly into the application process — there is no separate database server to install, configure, or secure [10]. This makes SQLite excellent for local development, mobile apps, embedded systems, and small tools where simplicity matters more than concurrency [10]. The trade-off is that SQLite handles only one writer at a time and lacks the advanced user-management and replication features of a server-based system [10].

MySQL is a **client-server** database [11]. It runs as a standalone service (or daemon) that listens for connections on a network port [11]. Multiple clients can connect simultaneously, and MySQL coordinates concurrent reads and writes through a locking and transaction system [11]. It supports user authentication, role-based permissions, replication, clustering, and the kinds of optimizations that high-traffic production applications need [11]. The trade-off is setup complexity: you must install and configure the server, manage credentials, and keep the service running.

**Summary**: SQLite is the right tool when you need a lightweight, zero-configuration database embedded in a single application [10]. MySQL is the right tool when multiple clients (users, services, or application instances) must access the same data concurrently [11].

### Primary Keys and Foreign Keys

A **Primary Key** is a column — or a combination of columns — that uniquely identifies each row in a table [12]. Every table should have one. Primary keys must be unique and non-null, and the database engine enforces this automatically [12]. In SQL you define one with `PRIMARY KEY`:

```sql
CREATE TABLE users (
  user_id   INT          PRIMARY KEY AUTO_INCREMENT,
  email     VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL
);
```

Here `user_id` is the primary key. No two users will ever share the same `user_id`, and no row can exist without one [12].

A **Foreign Key** is a column in one table whose values must match the primary key of another table [13]. It encodes a relationship ("this row in Table A belongs to a row in Table B") and enforces referential integrity — the database will reject an insert or update that would leave a dangling reference [13]. Foreign keys are defined with `REFERENCES`:

```sql
CREATE TABLE posts (
  post_id   INT  PRIMARY KEY AUTO_INCREMENT,
  user_id   INT  NOT NULL,
  content   TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

Here `posts.user_id` is a foreign key. Every post must reference a real user; deleting a user without also handling their posts would violate this constraint [13].

### Types of Database Relationships

Relational databases express how tables relate to one another through three fundamental relationship types [14].

**One-to-One (1:1)**
Each row in Table A is associated with at most one row in Table B, and vice versa [14]. This pattern is used when you want to split a wide table into two narrower ones — usually for performance, access control, or optional data [14].

*Example:* A `users` table and a `user_settings` table. Each user account has exactly one settings record (theme preference, notification flags, etc.), and each settings record belongs to exactly one user. Splitting them out keeps the main `users` table lean and lets settings be loaded only when needed.

**One-to-Many (1:N)**
One row in Table A is associated with many rows in Table B, but each row in Table B points back to exactly one row in Table A [14]. This is by far the most common relationship in web applications [9].

*Example:* A `users` table and a `posts` table. One author can write many blog posts, but each post has exactly one author. The `posts` table stores a `user_id` foreign key; the `users` table stores nothing about posts — you query for a user's posts by filtering on `user_id` [12][13].

**Many-to-Many (N:M)**
Many rows in Table A can be associated with many rows in Table B and vice versa [14]. SQL cannot express this directly with a foreign key on either side, so it requires a **junction table** (also called a bridge table or associative table) whose rows each represent one pairing of an A-row and a B-row [14].

*Example:* A `students` table and a `courses` table. A student can enroll in many courses, and a course can have many enrolled students. The junction table `enrollments` has two foreign key columns — `student_id` and `course_id` — and each row represents one enrollment. It can also carry its own data, such as `enrolled_at` or `grade` [14].

---

## Extra Mile — Relationships in This Project

CodeBloggs uses MongoDB rather than a traditional SQL database, but the same relationship types apply — MongoDB "collections" map to SQL "tables," and `ObjectId` references map to foreign keys [15]. The four main collections are `users`, `posts`, `comments`, and `sessions`.

### Many-to-One — Posts → Users

**Collections involved:** `posts` (many) → `users` (one)

Each post document carries a `user_id` field (`ObjectId`, `ref: "User"`) that points to the user who authored it. One user can author any number of posts, but each post has exactly one author. This is a classic many-to-one relationship expressed through a reference field [15][16].

**Justification:** Embedding the full user object inside every post document would duplicate data. If a user's name changed, every one of their post documents would need updating. By storing only a `user_id` reference, a single update to the `users` collection is immediately reflected everywhere [15]. This mirrors the relational database principle of normalization — each fact is stored in exactly one place [9].

*Schema evidence:* [server/schemas/Post.js](server/schemas/Post.js) — `user_id: { type: ObjectId, ref: "User", required: true }`.

### One-to-One — Session → User

**Collections involved:** `sessions` (one) → `users` (one)

Each session document carries a `user` field (`ObjectId`, `ref: "User"`) pointing to the authenticated user that session belongs to. By design, CodeBloggs creates a single session per login and invalidates it on logout, so each user has at most one active session record at any given time — a one-to-one relationship [15][16].

**Reason:** Keeping session data in a separate collection avoids bloating the `users` document with ephemeral, volatile data [15]. The session record can be created on login and destroyed on logout without touching the user document at all, keeping those two concerns cleanly separated. This also makes it trivial to invalidate a session by deleting one document rather than updating a field buried inside a user record [17].

*Schema evidence:* [server/schemas/Session.js](server/schemas/Session.js) — `user: { type: ObjectId, ref: "User", required: true }`.

### Many-to-Many — Users ↔ Posts (through Comments)

**Collections involved:** `users` ↔ `comments` ↔ `posts`

A single user can comment on many different posts, and a single post can receive comments from many different users. Neither side can hold a simple reference to the other without creating an unbounded, ever-growing array. The `comments` collection acts as the bridge: each comment document holds both a `user_id` (pointing to the commenter) and a `post_id` (pointing to the post being commented on), implementing the many-to-many relationship the same way a SQL junction table would [14][15].

**Why this design is needed:** If user documents stored an array of every post they had commented on, and post documents stored an array of every user who had commented, we would have unbounded, duplicated data that grows out of sync [15]. Instead, the `comments` collection is the single source of truth for the User ↔ Post commenting relationship. It also naturally carries its own data per pairing — content, likes, and timestamp — which a pure foreign-key column on either side could not hold [14][16]. This is the same reason a SQL `enrollments` table exists rather than storing arrays of course IDs in the `students` table.

*Schema evidence:* [server/schemas/Comment.js](server/schemas/Comment.js) — `user_id: { type: ObjectId, ref: "User" }` and `post_id: { type: ObjectId, ref: "Post" }`. [server/schemas/Post.js](server/schemas/Post.js) also maintains a `comments: [ObjectId]` array as a convenience reference, kept in sync by the controllers.

---

## Sources

### Reactive & Responsive Design

- [1] Bonér, J., Farley, D., Kuhn, R., & Thompson, M. (2014). *The Reactive Manifesto*. https://www.reactivemanifesto.org/
- [2] Nielsen Norman Group. *Progress Indicators Make Users Feel Faster*. https://www.nngroup.com/articles/progress-indicators/
- [3] UX Collective. *Everything you need to know about skeleton screens*. https://uxdesign.cc/what-you-should-know-about-skeleton-screens-a820c45a571a
- [4] Marcotte, E. (2010). *Responsive Web Design*. A List Apart. https://alistapart.com/article/responsive-web-design/
- [5] MDN Web Docs. *Responsive design*. Mozilla. https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design
- [6] Wroblewski, L. (2011). *Mobile First*. A Book Apart. https://abookapart.com/products/mobile-first
- [7] React Bootstrap. *Layout — Grid system*. https://react-bootstrap.github.io/docs/layout/grid

### SQL & Relational Basics

- [8] W3Schools. *SQL Introduction*. https://www.w3schools.com/sql/sql_intro.asp
- [9] Oracle. *Relational Database Concepts*. https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/introduction-to-oracle-database.html
- [10] SQLite.org. *When To Use SQLite*. https://www.sqlite.org/whentouse.html
- [11] MySQL. *What is MySQL?* MySQL 8.0 Reference Manual. https://dev.mysql.com/doc/refman/8.0/en/what-is-mysql.html
- [12] W3Schools. *SQL PRIMARY KEY Constraint*. https://www.w3schools.com/sql/sql_primarykey.asp
- [13] W3Schools. *SQL FOREIGN KEY Constraint*. https://www.w3schools.com/sql/sql_foreignkey.asp
- [14] Lucidchart. *Database Relationships — ER Diagrams*. https://www.lucidchart.com/pages/er-diagrams

### MongoDB Data Modeling

- [15] MongoDB. *Data Modeling Introduction*. https://www.mongodb.com/docs/manual/data-modeling/
- [16] MongoDB. *Model One-to-Many Relationships with Document References*. https://www.mongodb.com/docs/manual/tutorial/model-referenced-one-to-many-relationships-between-documents/
- [17] Mongoose. *Populate*. https://mongoosejs.com/docs/populate.html

### Additional Reference

- MDN Web Docs. *Using media queries*. Mozilla. https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries
