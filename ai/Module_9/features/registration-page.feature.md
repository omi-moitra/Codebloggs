# AI Feature Specification - Registration Page

Use with `./ai/ai-spec.md`.

## Goal

Provide a standalone Registration page for creating a basic CodeBloggs account.

## Scope

Included:
- Render `/register` outside the authenticated layout.
- Require first name, last name, birthday, email, password, location, and occupation.
- Use a date picker for birthday.
- Submit to `POST /user`.
- Create users with `auth_level: "basic"`.
- Redirect to `/login` after successful registration.
- Link back to `/login`.

Excluded:
- Admin self-registration.
- Profile editing.
- Email verification.

## Interfaces

- Page: `client/src/pages/Register.jsx`
- Service: `client/src/services/authService.js`
- Validators: `server/validators/user.validators.js`
- Endpoint: `POST /user`

## Data And Validation

Request body:

```json
{
  "first_name": "Ada",
  "last_name": "Lovelace",
  "birthday": "1995-12-01",
  "email": "ada@example.com",
  "password": "S3curePass!",
  "location": "London",
  "occupation": "Developer"
}
```

The server hashes the password and sets `auth_level` and `status`.

## Acceptance Criteria

- [ ] `/register` renders without Header or Sidebar.
- [ ] Every form field is required before submission.
- [ ] Birthday uses `type="date"`.
- [ ] Invalid input shows a clear error.
- [ ] Successful registration returns the user to `/login`.
- [ ] Login link navigates to `/login`.

