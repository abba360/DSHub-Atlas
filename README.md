# DSHub Atlas Authentication Module

Production-minded authentication and authorization module for the DSHub Graduation Digital Experience Platform.

## Scope

This delivery covers the **Authentication & Role Management System** only.

It is intended to be the shared access-control layer that the rest of the backend can build on top of:

- CRUD modules can plug protected routes into the auth middleware
- Analytics endpoints can reuse the same JWT and RBAC checks
- DevOps and CI/CD can package and deploy this module with the wider backend later

This keeps responsibilities clear across the team and avoids overlap with other backend owners.

## What This Module Covers

- JWT-based authentication with short-lived access tokens
- Refresh token rotation with database-backed session revocation
- Role-based access control for `admin`, `mentor`, and `intern`
- Password hashing with `bcryptjs`
- Secure login, refresh, logout, and current-user workflows
- Swagger API documentation for team integration
- PostgreSQL schema for users and refresh sessions

## Team-Friendly Backend Story

This auth module is designed around a simple onboarding and access flow:

1. The platform boots with a first admin account from environment variables.
2. Interns can self-register through the public onboarding endpoint.
3. Admins can sign in and provision mentors, interns, or other admins from a protected route.
4. All other backend modules can protect their routes with the shared auth and RBAC middleware.

That means your teammates handling platform CRUD, dashboards, or deployment do not need to rebuild auth logic. They only integrate against it.

## Architecture

The service is built with Express and PostgreSQL using a modular structure:

- `src/modules/auth`: login, register, refresh, logout, and current-user logic
- `src/modules/users`: admin-only user creation and user listing
- `src/middlewares`: validation, auth protection, RBAC, and error handling
- `src/config`: environment and database setup
- `database/schema.sql`: required PostgreSQL tables and enum definitions

## Authentication Design

1. `POST /api/v1/auth/login` validates credentials and returns an access token.
2. A refresh token is stored as an `httpOnly` cookie and its SHA-256 hash is saved in PostgreSQL.
3. `POST /api/v1/auth/refresh` rotates the refresh token and issues a fresh access token.
4. `POST /api/v1/auth/logout` revokes the refresh session in the database and clears the cookie.
5. Protected routes use `Authorization: Bearer <accessToken>` and RBAC middleware.

## Onboarding And Role Provisioning

- Public intern onboarding happens through `POST /api/v1/auth/register`
- First-admin access happens through the bootstrap env values
- Admin-led account provisioning happens through `POST /api/v1/users`
- Role enforcement is handled by reusable middleware before protected handlers run

## API Surface

### Public

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

### Protected

- `GET /api/v1/auth/me`

### Admin Only

- `GET /api/v1/users`
- `POST /api/v1/users`

## Ownership Boundary

This module intentionally does **not** implement:

- internship content CRUD
- gallery/testimonial/highlight management
- analytics aggregation APIs
- Docker and CI/CD pipeline automation

Those can be added by the relevant owners while reusing this module for authentication, route protection, and role checks.

## Local Setup

1. Copy `.env.example` to `.env`.
2. Update `DATABASE_URL`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET`.
3. Install dependencies:

```bash
npm install
```

4. Create the database tables by running [database/schema.sql](C:/Users/buthm/source/repos/DSHub-Atlas/database/schema.sql).
5. Optional: set `ADMIN_BOOTSTRAP_*` values in `.env` to auto-create the first admin if none exists.
6. Start the API:

```bash
npm run dev
```

## Default Seed Credentials

If you use the bootstrap env values from `.env.example`, the initial admin account is:

- Email: `admin@dshub.com`
- Password: `SecurePass123`

Change this immediately in any shared or deployed environment.

## Swagger Docs

After the server starts, open:

- [http://localhost:4000/api-docs](http://localhost:4000/api-docs)

## Notes For Frontend And Product Teams

- `register` is intentionally limited to interns for safer public onboarding.
- Admins can create mentor, intern, or admin accounts through `POST /api/v1/users`.
- The refresh endpoint supports cookie-based rotation and an optional body token fallback for non-browser clients.
- Auth endpoints are rate-limited to reduce brute-force risk.
- The server can bootstrap the first admin automatically, which is safer than committing a long-lived password hash into SQL.
- `CORS_ORIGIN` supports comma-separated local origins, which is useful for both frontend development and Swagger testing.

## Push Checklist

- commit the source files, schema, package files, and docs
- do not commit `.env`
- keep `.env.example` as the safe shared template

## Suggested Next Backend Steps

- Add email verification and password reset flows
- Add audit logging for role changes and auth events
- Add automated tests for auth and RBAC paths
- Add Docker and CI once the wider backend scope is ready
