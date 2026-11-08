# Vercel demo deployment

Deploy `backend` as one Vercel project and `frontend` as a Vite project. Use the current source, including the password-hashing fix. No production database is bundled.

## Database

Create a TiDB Cloud Starter instance, then create an empty `book_buddy_demo` database. Set backend environment variables through Vercel, keeping passwords out of the repository:

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `DB_SSL=true`
- `DB_POOL_SIZE=3`
- `JWT_SECRET`: a newly generated random secret
- `FRONTEND_URL`: the exact frontend production URL

Use the reviewed schema and seed helper in `deployment/`. The seed helper refuses to run if the database already has application tables. Use synthetic demo records only. Do not run the old SQL dump with plaintext password seeds.

Run `node deployment/initialize-demo.mjs` from the backend directory with the database environment configured. Run it once, then use the printed demo account passwords. They are not written to source files. The helper is only for a new, empty demo database.

## Frontend

Set `VITE_API_URL=https://BACKEND_HOST/api` before building. The Vite default `/api` is suitable only when a same-origin API proxy is configured. Run `npm ci` and `npm run build` from `frontend`.

## Validation

Run `node --test test/auth.test.js` in `backend`, build the frontend, then verify registration, sign-in, catalog browsing, borrowing, returning, and role permissions against the deployed database. No full workflow is considered verified until those live checks pass.
