---
name: split-tasks
description: >-
  Splits a feature into GitHub issues: reads the user stories (user-stories.md or their Notion page), tech-design.md
  and an optional implementation-plan.md, writes task-splitting.md when there is no plan, and generates an
  idempotent create-issues.sh (dry run by default) that creates the epic, one ticket per user story and
  its sub-tasks in OpenAEV-Platform/openaev. Use when asked to split a feature or user stories into tasks
  or GitHub issues.
---

# Split Tasks

## Prerequisites

- A feature folder `brainstorming/<feature>/` holding `tech-design.md`
- The user stories: `user-stories.md` **or** a Notion link to the page listing them
- `gh` authenticated with the project scope (`gh auth refresh -s project`) and `jq`, to run the script

## Step 1 — Gather the inputs

First pin the feature folder. List what the request points to:

```bash
find brainstorming/<feature> -name tech-design.md
```

No match, or more than one (one per `taskN/` subfolder for instance) → ask which folder to use. Do not
pick one yourself.

| Input | Source | Look for |
|---|---|---|
| User stories (PM/PO) | `user-stories.md` or Notion link — one is required | Feature title, every user story with its AC, Figma links, images |
| Tech design (staff/senior dev) | `tech-design.md` — required | Implementation approach, Mermaid sequence and class diagrams |
| Implementation plan (EM) | `implementation-plan.md` — optional | An existing task split per user story |
| Vertical | Named in the request — defaults to `#3 Easy-to-Use & consistent platform` | The VERTICALES value of the issues |

- User stories given as a **Notion link**: read the page with the Notion tools, and keep its URL for the
  epic. Every issue also links to `tech-design.md` on GitHub.
- **Images** (png, jpeg) next to the user stories: keep them for the user story tickets (Step 4).
- **Vertical**: when no specific vertical is given for this work, use the default. The value must be exactly
  one of the options of the project's VERTICALES field (the script stops otherwise):

  ```bash
  gh api graphql -f query='{ organization(login: "OpenAEV-Platform") { projectV2(number: 2) {
    field(name: "VERTICALES") { ... on ProjectV2SingleSelectField { options { name } } } } } }' \
    -q '.data.organization.projectV2.field.options[].name'
  ```

- No user stories (file or Notion link), no `tech-design.md`, or a Notion page you cannot read → ask for it. Never invent user stories or AC.

Then read the code and `docs/` areas the tech design refers to, to know how the work spreads across
`openaev-model`, `openaev-api` and `openaev-front`.

## Step 2 — Choose the topic and the titles

- `<topic>`: one word naming the area of the feature, lowercase (`audit-log`, `multitenancy`, `marking`).
  Reuse the scope of existing issues of the area when there is one:

  ```bash
  gh issue list -R OpenAEV-Platform/openaev --label epic --state all --limit 50 --json number,title
  ```

- Titles follow `.github/LABELS.md` (Conventional Commits, lowercase description, no trailing period):

  | Issue | Title |
  |---|---|
  | Epic | `feat(<topic>): epic for <feature title>` |
  | User story | `feat(<topic>): US1 <story title>` |
  | Sub-task | `feat(<topic>): US1.1 <task title>` |

  The sub-task number always starts with its user story (`US1.x`), so the epic reads as a list grouped by
  story.

## Step 3 — Split each user story

**If `implementation-plan.md` exists**, use its split as is: map each planned task to a sub-task. Only
merge tasks that cannot be worked on in parallel (see below), and say so in the report.

**Otherwise**, split each user story yourself and write the result to
`brainstorming/<feature>/task-splitting.md`:

```markdown
# Task splitting — <feature title>

Topic: `<topic>` · Inputs: user-stories.md, tech-design.md

## US1 — <story title>

| Task | Title | Delivers | Depends on |
|---|---|---|---|
| US1.1 | <task title> | <one-line outcome> | — |
| US1.2 | <task title> | <one-line outcome> | US1.1 (<why>) |

## Parallel work

<Which tasks can start on day one, which ones wait, and on what.>
```

Splitting rules:

- **Independent tasks.** The split exists so that several people work in parallel. When a task cannot
  start before the previous one ends, and both are small, merge them. A chain of dependent micro-tasks is
  not worth splitting.
- **One task = one reviewable PR**, usually one layer (model + migration, API, frontend) or one vertical
  slice when it is small.
- A user story with a single task gets no sub-task: its user story ticket is the task.
- Cross-cutting work several stories need (a migration, a capability, a feature flag) becomes one task of
  the first story that needs it, and the others list it under *Depends on*.

## Step 4 — Write the issue bodies

Every body stays **high level and short**: no file changes, no method signatures, no class names unless
they are the vocabulary of the feature. The script adds the tech design link as the first line of every
body.

**Epic**: what the feature brings and why (a few sentences), and the list of user stories. The script adds the
link to the user stories in Notion.

**User story ticket**: the PM/PO tests the story with it.
- The user story itself
- **Every AC** from the user stories, as a checklist, word for word
- The UX: Figma links, and images (upload them to an issue comment or reference them from the Notion page,
  since a local image path does not render on GitHub)

**Sub-task**:
- `## Context`: what the task delivers and how it fits the story, from the tech design. Reuse an excerpt
  or the part of a Mermaid sequence or class diagram the task implements.
- `## Definition of Done`: a checklist with
  - the functional outcome
  - unit tests for the behaviour
  - how a PR reviewer checks it works (the endpoint, screen or scenario to try)

## Step 5 — Generate the script

Copy `.claude/skills/split-tasks/create-issues.template.sh` to `brainstorming/<feature>/create-issues.sh`
and make it executable. Then:

1. Fill in `TOPIC`, `FEATURE_TITLE`, `TECH_DESIGN_URL` (the GitHub link to `tech-design.md`: on `main` once
   merged, otherwise on the branch that holds it) and `USER_STORIES_URL` (the Notion page, or empty when the
   user stories only exist as `user-stories.md`), and `PROJECT_VERTICALE` when the work has a specific
   vertical (the template holds the default).
   The script refuses to run while any of these settings, or any issue title, still holds a template `<…>`
   value. `--execute` checks every issue with a silent dry run before writing anything.
2. Replace the example issues at the bottom with one `epic` call, then for each user story one `task "USn …"`
   call followed by its `task "USn.m …"` calls.
3. Keep the bodies in quoted heredocs (`<<'BODY'`): backticks, `$` and Mermaid arrows stay verbatim.

Do not touch the helpers: they hold the project, issue type and field settings, and the idempotency.

| Setting | Value |
|---|---|
| Repository | `OpenAEV-Platform/openaev` |
| Labels | epic: `feature`, `epic` — others: `feature` (existing labels, never created or recoloured) |
| Issue type | `Feature` |
| Project | #2 *OpenAEV - Product Backlog* |
| Status | *Tech refinement* |
| VERTICALES | The vertical input, default *#3 Easy-to-Use & consistent platform* |

## Step 6 — Dry run and hand over

```bash
cd brainstorming/<feature> && ./create-issues.sh
```

The dry run only reads GitHub: it stops if the project, status or vertical cannot be found, then prints
every issue with `ACTION: create` or `ACTION: update #N`. Check that
an update only targets issues this feature created before; an unexpected `update` means a title collides
with an unrelated issue, so rename the task.

Report with the agent's output format and stop there. **Do not run `--execute`** unless the user asks for
it explicitly in the conversation.

## Re-running after the inputs change

When the user stories, tech design or plan change, update `task-splitting.md` and the bodies in
`create-issues.sh`, then dry run again. The script matches issues by **exact title**:

- changed body → the issue is updated
- new task → a new issue, added under the epic and to the project
- renamed task → a **new** issue; rename the existing one on GitHub first so the script finds it
- removed task → nothing happens; close the issue by hand

Status and VERTICALES are only set when empty: a re-run fills in a field an interrupted run left blank, and
never moves an issue back to *Tech refinement*.
