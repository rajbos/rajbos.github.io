---
layout: post
title: "Reverse-engineering `.github/github-app.yml` in the GitHub Copilot app"
date: 2026-07-06
tags: [github, copilot, yaml, reverse-engineering]
---

The new GitHub Copilot app appears to support a repo-level config file at `.github/github-app.yml`, but public documentation is still very sparse.

I could confirm that the file path is real, that it is surfaced in repository settings, and that the app has explicit trust/create-config flows around it. I could **not** find an official schema reference or trustworthy public repositories with populated examples. So this post is a **working map**, not a spec. I reversed engineered it from the UI and examples found in other peoples repositories from this [search](https://github.com/search?q=.github%2Fgithub-app.yml+language%3Ayaml&type=code).

## What is confirmed

From GitHub docs and release notes, I could confirm the following:

- The GitHub Copilot app has **repository-specific settings** under the repository entry in the **Projects** section.
- The app uses a repository config file at **`.github/github-app.yml`**.
- The repository config row is hidden until the file exists.
- The settings UI has trust-related actions such as **Accept**, **Revoke**, **Keep local**, and **Create config file**.
- The **Open on GitHub** link only makes sense once the file is committed to the **default branch**.
- **Default branch** is a real persisted project setting and has had recent bug fixes.
- The app definitely parses this file as YAML: one release mentions a crash caused by a quoted YAML value.

That is enough evidence to say: **the file is real, repo-scoped, shared, and YAML-based**.

## What I observed in the UI

From the current repository settings UI, the following controls appear to belong to this config surface:

- **Scripts**
- **Environment variables**
- **Browser auto-open**
- **Server ready pattern**
- **Instructions**
- **Default branch**
- **Branch prefix override**
- **Remote control**
- **Automation**
- **Auto-start issue sessions**

This is the part where reverse-engineering starts: the UI is visible, but the matching YAML schema is not documented publicly.

## What I could not confirm

I could **not** find:

- An official schema reference for `.github/github-app.yml`
- Trustworthy public repositories with a populated `.github/github-app.yml`
- A public example showing the exact nesting and key names
- Official docs that explicitly map every UI field to YAML

So below, I separate **confirmed**, **observed**, and **inferred**.

---

## Best-effort schema

### Status legend

- **Confirmed** = directly supported by GitHub docs or release notes
- **Observed** = visible in the app UI
- **Inferred** = best current guess for the YAML key or structure

| Field | Type | Status | Notes |
|---|---|---:|---|
| `default_branch` | `string` | Confirmed concept / inferred key | Default branch is clearly a project setting. |
| `instructions` | `string` (multiline) | Confirmed concept / inferred key | Repository-specific instructions are officially supported in app settings. |
| `scripts` | `array<object>` or `map` | Observed / inferred | The UI explicitly exposes scripts, but the YAML shape is undocumented. |
| `env` / `environment` | `map<string,string>` | Observed / inferred | The UI exposes environment variables shared by scripts and terminals. |
| `browser_auto_open` | `boolean` | Observed / inferred | UI toggle for opening a browser when a local URL is detected. |
| `server_ready_pattern` | `string` | Observed / inferred | Regex field tied to dev-server URL detection. |
| `branch_prefix` / `branch_prefix_override` | `string` | Observed / inferred | UI shows a branch prefix override, including placeholder-style values. |
| `remote_control` | `boolean` | Observed / inferred | UI shows a per-project remote-control toggle. |
| `automation` | `object` | Observed / inferred | UI exposes project-level automation defaults. |
| `automation.auto_start_issue_sessions` | `boolean` | Observed / inferred | Explicitly visible in the UI. |

### Likely script shape

This is the least certain part, but the most plausible structure today is:

| Field | Type | Status | Purpose |
|---|---|---:|---|
| `name` | `string` | Inferred | Friendly script name |
| `event` / `trigger` | `string` | Inferred | Lifecycle hook like session start or manual |
| `command` / `run` | `string` | Inferred | Shell command |
| `cwd` / `working_directory` | `string` | Weak inference | Optional working directory |
| `background` | `boolean` | Weak inference | Plausible for dev servers |
| `shell` | `string` | Weak inference | Optional shell override |

My current confidence order is:

1. There **is** a `scripts` section  
2. Scripts run commands  
3. There is probably some lifecycle trigger  
4. Exact object shape and key names are still unknown

---

## UI → YAML mapping

This is my current best-fit mapping from the app UI to YAML:

| UI label | Best-fit YAML key |
|---|---|
| Scripts | `scripts` |
| Environment variables | `env` or `environment` |
| Browser auto-open | `browser_auto_open` |
| Server ready pattern | `server_ready_pattern` |
| Instructions | `instructions` |
| Default branch | `default_branch` |
| Branch prefix override | `branch_prefix` or `branch_prefix_override` |
| Remote control | `remote_control` |
| Auto-start issue sessions | `automation.auto_start_issue_sessions` |

These key names are **not** documented. Treat them as reverse-engineering placeholders.

---

## Minimal example

This is the smallest example I would try first.

```yaml
# Reverse-engineered example — not official schema.

default_branch: main

instructions: |
  Use npm, not pnpm.
  Keep changes small and easy to review.

scripts:
  - name: bootstrap
    event: session_start
    command: npm ci && npm run compile
```

## Extended example
This example includes the UI fields that seem most plausible today.

``` yaml
# Reverse-engineered example — not official schema.

default_branch: main
branch_prefix: "%username%-"
remote_control: false

env:
  NODE_ENV: development

browser_auto_open: true
server_ready_pattern: '(?i)listening on.*(https?://\\S+|localhost:\\d+)'

instructions: |
  Use npm, not pnpm.
  Ask before changing CI or workflow files.
  Prefer small commits and reviewable PRs.

automation:
  auto_start_issue_sessions: true

scripts:
  - name: bootstrap
    event: session_start
    command: npm ci && npm run compile

  - name: devserver
    event: session_start
    command: npm run dev

  - name: open_vscode
    event: manual
    command: code .
```

---

## Update: testing this against a real repo

I pointed this at a real repo of mine (`ai-engineering-fluency`, a VS Code extension project) to see how far off the guesses above were. Here's the `.github/github-app.yml` I have locally:

```yaml
scripts:
- name: Install and compile VS Code extension
  command: |
    cd vscode-extension
    npm ci
    npm run compile
  triggers:
  - session.create
- name: Open in VS Code
  command: code .
automation:
  auto_issue_session: true
  remote_control: true
```

Two scripts. But the repository settings UI shows **three**:

- "Install VS Code extension dependencies" — Setup
- "Compile VS Code extension" — Setup
- "Open in VS Code" — Setup

My single combined script (`npm ci` and `npm run compile` in one multi-line block) shows up as two separate entries in the UI, with names that don't match anything in my YAML at all. Opening the edit panel for the first one shows:

- **Name**: `Install VS Code extension dependencies`
- **Command**: `cd vscode-extension && npm ci`
- **Triggers**: "Run on workspace creation" (checked), "Run on workspace archive or removal" (unchecked)

A few things fall out of this:

1. **"Session" is probably the wrong vocabulary.** The UI talks about "workspace creation" and "workspace archive or removal", not sessions. My earlier guess of `session.create` as the trigger key was likely wrong — the lifecycle is modeled around a **workspace**, with at least two events: creation, and archive/removal. So the real trigger keys are more likely something like `workspace.create` and `workspace.archive` (or `workspace.remove`).
2. **The multi-line command got flattened.** My YAML used a block scalar (`command: |` with three lines: `cd`, `npm ci`, `npm run compile`). The UI shows a single line joined with `&&`: `cd vscode-extension && npm ci`. That's a real, confirmed transformation — whatever parses this file collapses newlines into `&&`-joined shell commands.
3. **The name mismatch is the biggest open question.** My file has one script named "Install and compile VS Code extension". The UI shows two differently-named scripts ("Install VS Code extension dependencies" and "Compile VS Code extension") that I never typed. I see three plausible explanations, in order of how likely I think they are:
   - The UI is rendering whatever is committed on the **default branch**, not my local working copy. If these three scripts were created earlier through the "Add script" UI (which writes straight to the file), and my local YAML is a newer, uncommitted draft, then this isn't a parsing quirk at all — it's just two different versions of the same file. This is the simplest explanation and the first thing to rule out.
   - The backend splits a multi-command script into one entry per line and invents a name per command (`npm ci` → "Install VS Code extension dependencies", `npm run compile` → "Compile VS Code extension"). This is possible, but doesn't fully explain why my one script name isn't reused anywhere.
   - The app auto-suggests common setup scripts for a detected project shape (a VS Code extension folder with a `package.json`), independent of the YAML, and layers my own "Open in VS Code" script on top since it matches. Less likely given the command in the edit panel is an exact match to my `cd vscode-extension` path, but not ruled out.

The most useful confirmed detail here is the **trigger vocabulary is workspace-based, not session-based** — that changes my earlier "best-effort schema" table above, and I've left it as-is rather than editing it retroactively so you can see how the guess evolved.

I also noticed the active session's top bar has a **Run ▾** button with a "Configure scripts" option. Clicking it deep-links back to the exact same repository settings panel shown above — confirming scripts are a per-repository setting surfaced at runtime, not something session-specific.

### Next things to test

Before trusting the "three scripts" theory over the "stale file" theory, I'd want to:

1. Diff `.github/github-app.yml` on the default branch against my local working copy — if they're already different, the mystery is solved.
2. Rename my combined script to something unique, commit it to the default branch, and see whether the UI still shows three entries or now shows my new name.
3. Try switching `session.create` to a `workspace.*` trigger key and see if the file round-trips through "Create config file" / Save without an error.
4. Check whether editing a script through the UI ("Edit script" → Save) writes back to the committed YAML file, or just updates a local/session-scoped override — that would itself explain a permanent mismatch between file and UI.

I'll update this post once I know which of these is actually true.