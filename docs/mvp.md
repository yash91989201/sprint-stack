# Sprint Stack MVP

The MVP is a lean, Linear-like issue tracker for small software teams. It prioritizes speed, keyboard control, and a clear path from signup to tracking work.

For the complete product vision and the full module index, see [product.md](./product.md).

## Goal

Ship a fast, keyboard-friendly issue tracker where a small team can sign up, create a workspace, invite members, organize projects, track issues with List and Kanban views, comment, and receive basic assignment notifications.

## Who MVP is for

- Small software teams (roughly 2–15 people)
- Teams that want an opinionated, lightweight workflow without heavy configuration
- Users comfortable with keyboard-first navigation
- Teams that need private projects and basic role boundaries before advanced org structures

## Principles

- **Fast first:** every core action (create, move, assign, comment) should feel instant
- **Keyboard-first:** core flows must be usable without reaching for the mouse
- **Opinionated workflow:** a fixed status set and single-assignee issues keep the model simple
- **Collaborative by default:** mentions, assignment notifications, and comments are built in, not bolted on
- **Simple over configurable:** defer custom roles, statuses, labels groups, and public projects to post-MVP

## In Scope

### [Authentication](./modules/authentication.md)

- Email & password signup/signin
- Forgot password
- Email verification
- Profile onboarding (name, avatar)
- Basic session management (current session / sign out)
- Invite acceptance via email invite link

### [Workspaces](./modules/workspaces.md)

- Create workspace
- Invite members
- Member directory
- Roles & permissions: Owner, Admin, Member (no custom roles)
- Workspace switching when multiple workspaces exist

### [Projects](./modules/projects.md)

- Create, list, archive, restore projects
- Private projects (public projects deferred)
- Project icon & color
- Description
- Simple status (e.g., planned / active / completed)
- Basic overview page

### [Issues](./modules/issues.md)

- Issue types: Bug, Feature, Task
- Title and rich / markdown description
- Status, Priority, Labels, Due date
- Single assignee
- Reporter
- Basic issue history for key field changes
- Subtasks and parent/child relationships are **deferred** to post-MVP

### [Status Workflow](./modules/status-workflow.md)

- Fixed MVP statuses: Backlog, Todo, In Progress, Done
- Review, QA, Blocked, Archived, and custom statuses are post-MVP

### [Labels](./modules/labels.md)

- Workspace labels
- Label colors
- Project labels, icons, descriptions, usage count, and label groups are post-MVP

### [Views](./modules/views.md)

- List View
- Kanban Board
- My Work (assigned to me)
- Backlog

### [Dashboard](./modules/dashboard.md)

- Assigned to Me
- Created by Me
- Recent Activity (basic)
- Quick Create

### [Comments](./modules/comments.md)

- Markdown comments
- Basic @member mentions
- Edit comments
- Replies, emoji reactions, comment attachments, and full edit history are post-MVP

### [Rich Editor](./modules/rich-editor.md)

- Markdown, links, code blocks, inline code, mentions
- Tables, images/videos, slash commands, quotes, and emojis are post-MVP

### [Notifications](./modules/notifications.md)

- Assignment notifications
- Mention notifications
- In-app inbox with read/unread state
- Advanced preferences, email notifications, and status-change noise are post-MVP

### [Activity Timeline](./modules/activity-timeline.md)

- Issue created
- Status changed
- Assignment changes
- Comments

### [User Profiles](./modules/user-profiles.md)

- Avatar and basic profile
- Theme preference

### [Settings](./modules/settings.md)

- Appearance / Theme
- Basic notification settings
- Change password
- Sessions list and basic revoke

### [Productivity](./modules/productivity.md)

- Keyboard shortcuts for core navigation and create
- Quick create
- Basic command palette

## Out of Scope

These modules and features are intentionally excluded from the MVP. They are tracked in the full product docs and should be revisited once the core tracker is validated.

### Authentication

- Google/GitHub OAuth
- Magic link login
- Multi-session advanced management
- Account deletion (can be a near-term follow-up)

### Org structure

- [Teams](./modules/teams.md), team profiles, team leads, team workload
- Custom workspace roles beyond Owner/Admin/Member
- Archived workspaces, favorites, workspace logo/branding

### Issue depth

- Epic, Spike, Research, Story issue types
- Subtasks, parent/child relationships, dependencies, related issues
- Duplicate detection
- Watchers, followers, bookmarks
- Multi-assignee
- Estimates
- Checklists

### Planning

- [Milestones](./modules/milestones.md) and release planning
- [Roadmaps](./modules/roadmaps.md), timeline, calendar views
- Archive view

### Status & labels

- Custom statuses
- Review, QA, Blocked, Archived statuses
- Project labels, label groups, label icons, usage counts

### Discovery & filters

- [Search](./modules/search.md): global search, instant results, saved searches, advanced filters
- Shareable filter URLs (basic filters are in; sharing them via URL is post-MVP)
- Date-range filters, reporter filter, milestone filter, team filter, custom combinations

### Collaboration surfaces

- [Attachments](./modules/attachments.md) module
- Replies and reactions on comments
- Full comment edit history
- Comment attachments

### Ops, reporting, and integrations

- [Admin](./modules/admin.md): analytics, user management, audit logs, billing, storage
- [Reporting](./modules/reporting.md): velocity, burndown, completion rate, team workload
- [Integrations](./modules/integrations.md): GitHub, Slack, Discord, webhooks, public API
- [Future Enhancements](./modules/future-enhancements.md): AI features, time tracking, sprints, mobile apps, offline, real-time collaboration

## Basic filters

Basic filtering is in scope for the List and Kanban views:

- Status
- Priority
- Labels
- Assignee
- Project

Shareable filter URLs, date ranges, reporter filter, milestone filter, team filter, saved searches, and custom combinations are post-MVP.

## Success criteria

A new user can complete the full core loop without help:

1. Sign up and verify email
2. Create a workspace
3. Invite a teammate
4. Create a project
5. Create issues
6. Move issues on the Kanban board
7. Comment with an @mention
8. Receive a notification
9. Perform the core flows using keyboard shortcuts

## Suggested phases

### Phase 1: Core tracker

- Authentication (email/password, verify, forgot password, onboarding)
- Workspaces (create, invite, member directory, roles)
- Projects (CRUD, archive/restore, basic overview)
- Issues (Bug/Feature/Task, title, description, status, priority, assignee, reporter)
- List View

### Phase 2: Views & organization

- Kanban Board
- Labels
- Basic filters (status, priority, labels, assignee, project)
- Dashboard (Assigned to Me, Created by Me, Recent Activity, Quick Create)

### Phase 3: Collaboration & speed

- Comments with @mentions
- Activity Timeline
- Notifications (assignments, mentions, inbox)
- Keyboard shortcuts and basic command palette
- Quick create

## Relationship to the full product

The MVP is the smallest slice of [Sprint Stack](./product.md) that a team can actually use every day. It keeps the fixed status set, single-assignee issues, and private projects so the product stays fast and opinionated.

After the MVP, the roadmap expands into the remaining modules:

- [Teams](./modules/teams.md), [Milestones](./modules/milestones.md), [Roadmaps](./modules/roadmaps.md)
- Deeper issue features: subtasks, dependencies, related issues, watchers, estimates, checklists
- [Search](./modules/search.md), saved filters, shareable URLs
- [Attachments](./modules/attachments.md), rich comment threads, reactions
- [Admin](./modules/admin.md), [Reporting](./modules/reporting.md), [Integrations](./modules/integrations.md)
- [Future Enhancements](./modules/future-enhancements.md) such as AI-assisted triage and time tracking

See the module docs under [`./modules/`](./modules/) for the full capability list of each area.
