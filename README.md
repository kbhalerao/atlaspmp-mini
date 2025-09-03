# Atlas Project Management POC

Atlas is a minimal, modern project management system and LLM agent interface, built with SvelteKit, Drizzle ORM, and Shadcn UI. It is designed to:

- Store projects, tasks, activities, and user data in a relational database
- Allow users to log in and interact with a single LLM-powered project manager
- Enable the LLM to assign tasks, track progress, and generate reports via tool-calling APIs
- Provide a beautiful dashboard UI with cards, tables, charts, and chat

## Main Goals

- **Minimal, extensible project management**: Projects, tasks, activities, and users with clear relationships
- **LLM as project manager**: All user interaction and project updates can be mediated by an LLM agent
- **Modern SvelteKit UI**: Responsive dashboard, sidebar, cards, activity table, and LLM chatbox
- **Invitation-only registration**: Only users with an invite code can register

## Data Models

The core schema is implemented with Drizzle ORM and SQLite. Main tables:

- **user**: Users with id, username, password hash, and age
- **session**: User sessions for authentication
- **project**: Projects with name, description, owner, and LLM context
- **task**: Tasks with title, priority, status, deadline, description, project, and LLM context
- **taskDependency**: Task dependencies (taskId depends on dependsOnTaskId)
- **projectAssignee**: Users assigned to projects (besides owner)
- **taskAssignee**: Users assigned to tasks
- **taskActivity**: Activity log for tasks (comments, status updates, etc), with LLM context

## API

All CRUD operations for projects, tasks, assignees, activities, and dependencies are exposed as TypeScript functions for LLM tool-calling and UI use.

## UI Features

- **Login/Register**: Invitation-only registration, SSO-ready
- **Dashboard**: Sidebar navigation, project cards (with avatars), activity table, activity chart, and LLM chatbox
- **Responsive**: Built with Shadcn Svelte UI components

## Getting Started

Install dependencies and run the dev server:

```sh
pnpm install
pnpm run dev -- --open
```

Push the schema to your database:

```sh
pnpm run db:push
```

## License

MIT
