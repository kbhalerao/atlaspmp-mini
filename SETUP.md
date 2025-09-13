# Instructions on how to set up a Cloudflare & SvelteKit AI Stack

This document describes how to set up a SvelteKit project that also includes AI and database bindings,
to be deployed as a CloudFlare worker. Instructions are a bit sparse, thus this document.

## Objectives

- Deploy on CloudFlare, using D1 and AI Workers bindings for database and AI functionality
- Use SvelteKit for development
- Deploy as a CloudFlare Worker, with full CI/CD functionality
- Use Drizzle ORM as the database ORM
- Provide a good developer experience.

## Step 1: Set up a new SvelteKit project

```bash
npx sv create <project-name>
```

Choose the following options (Suggested list)

- minimal project
- typescript syntax
- Choose the following
  - prettier (formatter - https://prettier.io)
  - eslint (linter - https://eslint.org)
  - vitest (unit testing - https://vitest.dev)
  - tailwindcss (css framework - https://tailwindcss.com)
  - sveltekit-adapter (deployment - https://svelte.dev/docs/kit/adapters)
  - devtools-json (devtools json - https://github.com/ChromeDevTools/vite-plugin-devtools-json)
  - drizzle (database orm - https://orm.drizzle.team)
- Choose unit tests for vitest, and both typography and forms for tailwindcss
- Choose the cloudflare adapter for sveltekit-adapter
- Choose SQLite for Drizzle
- Choose libsql for serverless environments
- Choose `pnpm` for the package manager

Once `sv` installs all packages, then note the Drizzle message.

## Step 2: Add Wrangler to the project

Instead of using Wrangler to create the project, we instead add it manually to our SvelteKit project
as a dev dependency

```bash
pnpm i -D wrangler@latest
```

## Step 3: Create a new D1 database

```bash
wrangler d1 create <DATABASE_NAME>
```

This will return a database with the following credentials:

```json
{
	"d1_databases": [
		{
			"binding": "DB",
			"database_name": "<db-name>",
			"database_id": "<db-id>"
		}
	]
}
```

## Step 3: Create the `wrangler.jsonc`

Create a new `wrangler.jsonc` file in the root project folder. It needs to look something like this.

```json
{
	"name": "<project-name>",
	"account_id": "<account-id>",
	"main": "./.cloudflare/worker.js",
	"build": {
		"command": "pnpm run build"
	},
	"compatibility_flags": ["nodejs_compat"],
	"compatibility_date": "2024-09-23",
	"assets": {
		"directory": "./public",
		"binding": "ASSETS"
	},
	"d1_databases": [
		{
			"binding": "DB",
			"database_name": "<database-name>",
			"database_id": "<database-id>",
			"migrations_dir": "drizzle/migrations"
		}
	]
}
```

The `d1_databases` key is copied from above, along with the
`migrations_dir` key

## Step 4: Create the database schema

The instructions are defined [here](https://orm.drizzle.team/docs/get-started/d1-new).

Follow these instructions for a database setup.

## Step 5: To use a local file for development

When running locally, `wrangler dev` seems to invoke the local database.
So you should use the drizzle-generated migration to run against the local
d1 database, which should be run using something like

```bash
wrangler d1 execute  <db-name> -e production --file=<migration_file>
```

This works only when your bindings are properly set up and your wrangler.jsonc file
is correctly configured.
