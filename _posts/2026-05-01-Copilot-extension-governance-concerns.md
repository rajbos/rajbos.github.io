---
layout: post
title: "Where the GitHub Copilot extension points break governance"
date: 2026-05-01
tags: [GitHub, GitHub Copilot, Security, Governance, MCP, VS Code, Copilot CLI, Skills, Plugins, APM]
description: "A walkthrough of the governance gaps in the GitHub Copilot and extension surfaces: the Copilot CLI with its plugin marketplace, Agent Plugins 1.0, enterprise managed settings, the Agent Package Manager (APM), gh skills, MCP servers across editors, and VS Code extensions through the Microsoft Marketplace and Open VSX."
---

A lot of the recent additions to the GitHub Copilot ecosystem add real value for individual developers, yet they also expand the security surface that an enterprise has to reason about. Most of these new entry points let a developer pull executable instructions, configuration, or full processes from any random repository on the internet, with very little or no central control. This post looks at the five places where I think the gap between "useful for one engineer" and "safe to run across a 5,000 person org" is widest right now.

We'll look at these topis:
- GitHub Copilot CLI plugin marketplace
- GitHub Copilot CLI local extensions
- Agent Plugins 1.0, the package format underneath all of it
- Agent Package Manager (APM)
- `gh skill` now in the GitHub CLI
- MCP servers across editors
- VS Code extensions and the different registries
- Enterprise managed settings, the one client-side policy plane that does exist


![Samuel Regan Asante from Unsplash](/images/2026/20260501/samuel-regan-asante-STDn0DxY8os-unsplash.jpg)
##### Photo by <a href="https://unsplash.com/@reganography?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Samuel Regan-Asante</a> on <a href="https://unsplash.com/photos/a-sign-on-the-side-of-a-building-that-says-growing-concerns-STDn0DxY8os?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
      

## GitHub Copilot CLI plugin marketplace

The [Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-marketplace) lets you register a marketplace of plugins and install plugins from it. The on-ramp is one command:

```bash
copilot plugin marketplace add OWNER/REPO
copilot plugin install some-plugin@some-marketplace
```

A marketplace is just a GitHub repository with a `marketplace.json` file in `.github/plugin/`. There is no review, no signing, no central index. Two marketplaces (`copilot-plugins` and `awesome-copilot`) are registered by default, but any user can add any other repo, including a personal fork or a newly created account that copies a real plugin name with a small change.

Versioning is the next gap. The [CLI plugin reference](https://docs.github.com/en/copilot/reference/cli-plugin-reference) has a `version` field in `plugin.json`, but the `copilot plugin install` command has no syntax to pin to a version. You install `OWNER/REPO`, `OWNER/REPO:PATH`, a Git URL, a local path, or `plugin@marketplace`, and you get whatever HEAD of the source happens to be at that moment. `copilot plugin update NAME` pulls latest. There is no lockfile, no SHA pinning of the kind `gh skill` has, and no provenance attestation. A marketplace can change a plugin's contents without changing the `version` field, and the next `update` ships those changes to every developer who installed it.

Plugins themselves are executable assets.They sit in the directory the marketplace points at, get pulled to the user's machine, and run in the user's shell context with whatever permissions the developer has. That is the same context as their git credentials, their cloud CLI sessions, and any local secrets in their environment.

What is missing on the GitHub side:

- No setting on a GitHub Enterprise or organization to restrict which marketplaces a Copilot CLI user is allowed to add. There is a client-side answer now (`strictKnownMarketplaces` in managed settings, further down this post), but that is enforced on the laptop, not by the platform that hosts the repos.
- No way to require signed plugins, or plugins from a verified publisher.
- No audit trail on the GitHub side that tells you which plugins your developers installed and from where.
- Clear versioning out of the box. preferably with provenance signing build in. 

If you compare this to how npm or PyPI are usually handled in a regulated org (a private proxy, an allowlist, a vulnerability scanner in the pipeline), the Copilot CLI plugin story today is roughly where npm was around 2014.

## GitHub Copilot CLI local extensions

Beyond the plugin marketplace there is a second, almost entirely undocumented extension surface baked into the Copilot CLI: the `.github/extensions/` directory. [A detailed reverse-engineering writeup by htek.dev](https://htek.dev/articles/github-copilot-cli-extensions-complete-guide/) extracted this from the Copilot SDK source, because there is essentially no public documentation for it. The architecture is that the CLI discovers any subdirectory containing an `extension.mjs` file, forks it as a child Node.js process, and communicates with it over JSON-RPC via stdio. The extension calls `joinSession()` and gets back a live session object that lets it register custom tools, intercept every agent lifecycle event, rewrite prompts, and make permission decisions.

The lifecycle hooks are the part that matters from a governance angle:

- `onSessionStart` — inject context into every session before the user's first message
- `onUserPromptSubmitted` — rewrite or augment the user's prompt before the agent sees it
- `onPreToolUse` — approve, deny, or modify the arguments of any tool call before it executes
- `onPostToolUse` — react after any tool completes, inject feedback the agent acts on
- `onErrorOccurred` — decide whether to retry, skip, or abort on failure

The `onPermissionRequest` handler in the `joinSession()` call replaces the standard user confirmation prompt for every tool execution. The SDK ships an `approveAll` import that does exactly what it sounds like: pass it and the extension silently approves every shell command, file write, and network call without showing the user a prompt.

The discovery paths are what make this a fleet-wide concern:

1. **Project-scoped**: `.github/extensions/` is committed to the repo. Cloning the repo means the extensions are live the next time any developer opens a CLI session in that directory. No `install` step. No opt-in. The moment the CLI opens the project, it forks whatever `.mjs` files are in that folder.
2. **User-scoped**: `~/.copilot/extensions/` applies to every repo on the developer's machine. An extension installed once here runs against every project that developer ever opens in the Copilot CLI, with no per-project awareness or consent.

Project extensions shadow user extensions on name collision, and the load order across extensions is not guaranteed — combined with a [known bug](https://github.com/github/copilot-cli/issues/2076) where multiple extensions registering hooks results in only the last-loaded extension's hooks actually firing, this creates silent behavior that is hard to audit even locally.

What is missing for an enterprise:

- No org-level allowlist. Any `.github/extensions/` directory in any repo a developer clones will have its extensions activated with no central gate.
- No signing or publisher verification. An extension is an arbitrary `.mjs` file on disk.
- No audit trail. The CLI does not log which extensions ran in a session or what hooks they fired.
- No policy to restrict which `onPermissionRequest` handlers can suppress user prompts. A malicious or compromised extension can run `approveAll` and the developer sees nothing different.

The feature is legitimately useful: teams can enforce architecture rules, block destructive commands, run linters after edits, and build self-healing test loops. But those same capabilities — prompt rewriting, permission suppression, tool argument modification — are exactly what a supply-chain attack would want, and right now there is no org-level control surface at all.

## Agent Plugins 1.0

Underneath the marketplace sits a package format that got standardised: [Agent Plugins 1.0](https://agent-plugins.org/specification), which shipped in VS Code, the Copilot CLI and the Copilot app in August 2026 (VS Code's side is documented under [agent plugins](https://code.visualstudio.com/docs/agent-customization/agent-plugins)). It is worth reading the spec, because most of the governance confusion I run into comes from people expecting it to do things it explicitly does not do.

What the spec does define, normatively:

- A root `plugin.json` with `$schema` and `name` as the only required fields.
- A portable core of exactly two component types: Agent Skills under `skills/<name>/SKILL.md`, and MCP servers in a root `mcp.json`. Any client that claims support has to handle those two.
- Reverse-domain namespaces for client-specific components, so `com.github.copilot/` holds the agents, commands, rules, hooks, and canvases that only Copilot understands. Another client ignores that directory instead of guessing.
- Path containment: everything a plugin references has to live inside the plugin root, exposed as `PLUGIN_ROOT`, with writable state in `PLUGIN_DATA`.
- Component failure isolation, so one broken skill does not take the whole plugin down.
- MCP transports limited to stdio and streamable HTTP, with the legacy SSE transport optional and non-loopback HTTP required to be HTTPS.

What it does not define, and this is the part that matters for an enterprise: no registry protocol, no dependency graph, no lockfile, no publisher signature, no enterprise policy model, and no runtime sandbox. Path containment is a portability rule, not a security boundary. A skill that stays neatly inside `PLUGIN_ROOT` can still tell the agent to run `curl | sh`, because the agent is the thing executing, not the plugin.

One detail that catches people out: the `env` and `headers` values in a plugin's `mcp.json` are package data. They ship with the plugin and anyone who can read the repo can read them. They are a place to point at a secret, not a place to put one.

So Agent Plugins 1.0 is a good, stable, portable *packaging* contract, and I am glad it exists. It just answers "what is in this thing and how do I load it", not "am I allowed to run it".



## Agent Package Manager (APM)

[Microsoft APM](https://github.com/microsoft/apm) is a dependency manager for AI agent context. You declare an `apm.yml`, run `apm install`, and it pulls instructions, skills, prompts, agents, hooks, plugins, and MCP servers from any git host (GitHub, GitLab, Bitbucket, Azure DevOps, GitHub Enterprise) into every detected agent client on the machine.

The manifest lives in the repo itself (`apm.yml` and `apm.lock.yaml` are committed alongside the code, like `package.json` and `package-lock.json`). It looks like this:

```yaml
dependencies:
  apm:
    - anthropics/skills/skills/frontend-design
    - github/awesome-copilot/plugins/context-engineering
    - microsoft/apm-sample-package#v1.0.0
  mcp:
    - name: io.github.github/github-mcp-server
      transport: http
```

APM does ship a governance story, and it is the most thought-through one in this post. There is `apm-policy.yml` with tighten-only inheritance from enterprise to org to repo, a published bypass contract, hidden-Unicode scanning on every install, lockfile integrity hashes, and an `apm audit --ci` mode that you can wire into branch protection.

The catch is that all of this governance is opt-in and lives outside of GitHub itself. A fresh install of `apm` on a developer laptop has no policy file. Policy is also pull-only: the canonical org policy lives at `<org>/.github/apm-policy.yml` and the CLI fetches it on demand when a developer or CI job runs `apm install` or `apm audit --ci`. There is no push, no agent, and no central enrollment. The fetched policy is cached locally for an hour by default in `apm_modules/.policy-cache/`, and a `fetch_failure: warn|block` knob decides what happens when the org repo is unreachable. The default is `warn`, which means an offline laptop with an empty cache resolves with no policy at all. Repo-local `apm-policy.yml` files can `extends: org` and only **tighten** the parent rules, never relax them. See the [Policy Reference](https://microsoft.github.io/apm/enterprise/policy-reference/) and [Governance Guide](https://microsoft.github.io/apm/enterprise/governance-guide/) for the full mechanics.

Until your security team writes one, publishes it, and gets it picked up on every machine, an `apm install` will happily resolve transitive dependencies from any reachable git host. And don't worry: your CI/CD pipeline will do the same (if the tooling is already installed)!

There is also no auto-install. APM is purely a CLI; it has no editor extension that runs `apm install` when you open a repo in VS Code. The docs frame it explicitly as "same as `npm install` after cloning a Node project", which means the install step relies on the developer running it (or a devcontainer `postCreateCommand`, or a CI job). The flip side is that the **deployed** files (under `.github/`, `.claude/`, `.cursor/`, `.gemini/`) are recommended to be committed, so a teammate who clones the repo gets the agent context immediately, before they ever run `apm install`. That is convenient and it also means the agent is reading APM-deployed content the moment the editor opens the repo, regardless of whether the local CLI was ever invoked.

APM packages can declare `scripts` (think npm scripts), and the policy reference exposes `manifest.scripts: allow|deny` precisely because of this risk. Default is `allow`. So an attacker who lands a package in your dependency tree can also land scripts, unless your org policy denies them outright.

Versioning is fine on the manifest side: dependencies pin with `#tag` or `#sha`, the lockfile records resolved commit SHAs and content hashes, and the org policy can `require` specific versions with a `require_resolution` of `project-wins`, `policy-wins`, or `block`. Updates happen on `apm install --update`, not implicitly. Direct and transitive resolution stay the parts I would worry about: a package you trusted six months ago can pull in a new dependency on its next release, and unless your org policy has a tight `dependencies.allow` pattern, the new source slips through.

Three caveats on maturity. The format is specified as [OpenAPM v0.1](https://microsoft.github.io/apm/specs/openapm-v01/), which is an editor's working draft under semver-zero, so it can still change under you. The policy engine is an early preview while `apm.lock.yaml` (resolved commits, tree SHA-256, deployed-file hashes) is the production-ready piece. And publisher attestations, the thing that would actually give you provenance rather than just integrity, are reserved for v0.2. Local bypasses also exist: `--no-policy` and a couple of environment flags will get a developer past the policy engine on their own machine, which is fine for a debugging escape hatch and not fine as your only enforcement point. APM is explicit that it stops at installation; runtime permissions are the harness's problem.

The MCP integration is worth a separate paragraph. `apm install --mcp NAME` adds an entry under `dependencies.mcp` in `apm.yml` and writes the resolved server config straight into the native config file of every detected client (Copilot, Claude, Cursor, Codex, OpenCode, Gemini) on the filesystem, bypassing each client's own registry or policy layer. The full mechanism is documented in the [APM MCP Servers guide](https://microsoft.github.io/apm/guides/mcp-servers/). Convenient for a developer; also a clean way around whatever per-client policy exists. You are then relying on the runtime side of those clients to apply policy, and only a few of them do, with workarounds.

## `gh skill` now in the GitHub CLI
Note: this is the **GitHub** CLI, not the GitHub **Copilot** CLI!

The [gh skill](https://github.blog/changelog/2026-04-16-manage-agent-skills-with-github-cli/) command lets you discover, install, manage, and publish [Agent Skills](https://agentskills.io) from any GitHub repository:

```bash
gh skill install github/awesome-copilot documentation-writer
gh skill install some-user/some-repo some-skill --pin v1.0.0
```

The supply-chain features here are better. Skills can be pinned to a tag (unsafe) or commit SHA, the install records the git tree SHA in the skill's frontmatter, `gh skill update` compares local SHAs against the remote, and `gh skill publish` will offer to enable [immutable releases](https://docs.github.com/repositories/releasing-projects-on-github/about-releases) so that even a repo admin cannot rewrite a published version.

Audit tooling is thin. The [`gh skill` manual](https://cli.github.com/manual/gh_skill) lists `install`, `preview`, `publish`, `search`, and `update` as the only subcommands. There is a `gh skill preview` to inspect a skill's content before installing, and `gh skill update` uses the stored tree SHA to detect drift, but there is no `gh skill audit` and no org-side audit log of what your developers installed. If you want to know which skills landed on a developer's laptop, you have to grep the agent host directories yourself.

The thing that is not there is an org-level allowlist.GitHub itself is unusually direct about this in the changelog:

> Skills are installed at your own discretion. They are not verified by GitHub and may contain prompt injections, hidden instructions, or malicious scripts. We strongly recommend inspecting the content of skills before installation.

So the tooling around a single skill is solid, the tooling around "which skills is my org allowed to use" is not. A developer can `gh skill install` from any public repo, and the agent host (Copilot, Claude Code, Cursor, Codex, Gemini, all the CLI options) will pick the skill up the next time it scans the directory. Skills are a first-class extension point for the agent's behavior, which means a malicious skill is closer to a custom system prompt than to a passive config file.

Dependabot does not help here either: agent skills, MCP servers, APM packages, and Copilot CLI plugins are not on the [list of ecosystems Dependabot supports](https://docs.github.com/en/code-security/dependabot/ecosystems-supported-by-dependabot/supported-ecosystems-and-repositories). That means no automatic update PRs, no security advisories wired in, and no scheduled drift detection across these surfaces. You would have to build that yourself.

## MCP servers across editors

This is the area where the situation has gotten more confusing rather than less, even though there has been real work on it. Back in March 2025 MCP exploded into the AI world: extensibility from anywhere into anything! Since then, a lot of servers and OSS repos turned out to be playing around with things. The hard part is that a large share of those repos have since been abandoned. Endor Labs covered this in its [State of Dependency Management 2025 report](https://www.endorlabs.com/learn/state-of-dependency-management-2025) (summary on the [Endor Labs press release](https://www.prnewswire.com/news-releases/endor-labs-launches-2025-state-of-dependency-management-report-finds-80-of-ai-suggested-dependencies-contain-risks-302603438.html)): more than 10,000 MCP servers were created in less than a year, 75% of them by individual developers rather than organizations, around 40% have no license at all, and 82% touch sensitive APIs. Maintenance signals on the long tail are weak, which means the same servers your developers happily installed last year may already be effectively orphaned.

A short summary of where MCP server config lives today:

- VS Code: `.vscode/mcp.json` (workspace), the user-profile `mcp.json` opened via `MCP: Open User Configuration`, or contributed by an installed VS Code extension. The full schema is in the [VS Code MCP servers docs](https://code.visualstudio.com/docs/copilot/customization/mcp-servers). APM sits on top of this: it stores MCP servers in the repo's `apm.yml`, then writes them into the same `.vscode/mcp.json` file the editor reads. By default `apm install` does not overwrite locally-authored entries (that needs `--force`, per the [CLI reference](https://microsoft.github.io/apm/reference/cli-commands/)), so the file you end up with is APM's set **plus** anything that was already there. If a developer thinks "I'm only running the APM-managed servers", they are wrong: they are running APM-managed plus whatever they (or another tool) wrote into `mcp.json` previously.
- Cursor, Windsurf, Codex, Claude Code, Gemini CLI, Copilot and other CLI’s: each has its own file in its own location, with its own schema variations.
- The remote Copilot agents (Cloud Agent, Spark, Spaces, Review Agent) each have their own configuration surface and can only be configured by a repo admin. 

GitHub did ship an [MCP private registry policy](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-mcp-usage/configure-mcp-registry) for Copilot that lets an enterprise restrict which MCP servers Copilot users can connect to. Useful, and a real step forward, but at the time of writing it only applies inside Copilot in VS Code. The same Copilot identity used in JetBrains, Neovim, the CLI, Spark, Spaces, the Cloud Agent, or the Review Agent is not covered by that policy.

Two patterns make the policy easier to bypass than it looks:

1. Local stdio servers. The [VS Code MCP docs](https://code.visualstudio.com/docs/copilot/customization/mcp-servers) describe three config paths: the gallery flow (which the Copilot private registry can gate), the workspace `.vscode/mcp.json`, and the user-profile `mcp.json`. The registry policy applies to the gallery flow. A developer who edits either JSON file directly gets a one-time "trust this server" prompt and the server starts. There is a separate VS Code device-management policy that can disable MCP entirely, but it is on/off, not allowlist-aware. See [extension runtime security](https://code.visualstudio.com/docs/configure/extensions/extension-runtime-security) for the surrounding policy surface.
2. Extension-contributed servers. A VS Code extension can contribute MCP servers through its manifest. If an extension is allowed to install (and most orgs do not gate extensions tightly, see the next section), the MCP servers it contributes inherit the same trust as the extension itself. That sidesteps the registry policy entirely.

Even worse: clone the extension repo from github.com, build it, and just use the compiled VSIX file in VS Code!

So the practical state is: you can get a meaningful slice of governance for Copilot in VS Code if you set up the registry, and almost no governance for any of the other clients on the same laptop, all of which can reach the same internal systems. So we are not there yet, but at least a step in the right direction. 

## VS Code extensions and the registry split

The extension story is the oldest of the five, and it is the one that has changed shape most recently because of the Cursor and Windsurf-style forks. A few things to be explicit about:

- The Microsoft Visual Studio Marketplace is closed to non-Microsoft products by its terms of use. Any VS Code fork (Cursor, Windsurf, VSCodium, Kiro, Antigravity, Positron) cannot legally use it.
- Those forks generally point at [Open VSX](https://open-vsx.org/), the Eclipse Foundation registry. Open VSX has a smaller catalog, less aggressive abuse handling historically, and a publish flow that is easier to ride.
- On April 21, 2026 the Eclipse Foundation [launched the Open VSX Managed Registry](https://newsroom.eclipse.org/news/announcements/eclipse-foundation-launches-open-vsx-managed-registry-0) as an SLA-backed paid tier (99.95% uptime, defined support tiers), with AWS, Google, and Cursor as initial adopters. The launch numbers paint the scale: 300M+ downloads per month, 200M+ daily requests at peak, 12,000+ extensions, 8,000+ publishers. The community instance was being asked to do the job of always-on critical infrastructure, and the AI editors are most of the reason.

For an org this means the threat model differs by editor, even when the developer thinks they are installing "the same extension". A name on the Microsoft Marketplace is not necessarily owned by the same publisher on Open VSX. Typosquats and copy-jobs of popular extensions show up regularly on both registries, and an extension is essentially arbitrary code in your editor process with access to your workspace files, your environment, and any tokens the editor holds.

The MCP angle ties back in here: an extension can contribute MCP servers, settings, and language model providers. So an extension that gets past your install policy can reintroduce all the things you tried to gate at the registry layer.

What helps in practice:

- The VS Code `extensions.allowed` and related policies, deployed through your endpoint management, so that only an allowlist of extensions can install at all.
- Mirroring Open VSX internally if you support fork editors, with a curated subset rather than a full passthrough.
- Treating new extension installs the same way you treat new npm dependencies: review, scan, and budget for the maintenance.

Endpoint protection is the layer that catches what the registries miss. Even the official VS Code documentation on [extension runtime security](https://code.visualstudio.com/docs/configure/extensions/extension-runtime-security) is direct that an extension runs with the user's full permissions: it can read and write any file the editor can, spawn processes, and make network calls. The Marketplace does scan packages and verify signatures (see the Microsoft post on [security and trust in the Visual Studio Marketplace](https://developer.microsoft.com/blog/security-and-trust-in-visual-studio-marketplace)), but malicious extensions and credential-stealing supply chain incidents keep landing (see the [Wiz writeup on supply chain risk in VS Code extension marketplaces](https://www.wiz.io/blog/supply-chain-risk-in-vscode-extension-marketplaces) and Check Point's [report on 45,000+ downloads of malicious extensions](https://blog.checkpoint.com/securing-the-cloud/malicious-vscode-extensions-with-more-than-45k-downloads-steal-pii-and-enable-backdoors/)). For an org that means the controls have to live below the editor: managed device policy that blocks unsigned binaries, EDR that watches the editor's process tree the same way it watches a browser, outbound DNS and TLS inspection that can flag the unusual call patterns an extension makes, and a workstation lifecycle that assumes a compromised editor is one of the realistic incidents you respond to. Third-party scanners like [ExtensionTotal](https://extensiontotal.com) can give you a per-extension risk score before you allow it, but treat them as an addition to your endpoint stack rather than a substitute.

## New: VS Code enterprise policy updates

VS Code shipped a notable batch of new enterprise policies around late April 2026 (documented at [code.visualstudio.com/docs/enterprise/policies](https://code.visualstudio.com/docs/enterprise/policies)) that start closing some of the gaps described above. The most relevant additions:

**MCP server control** — `ChatMCP` (`chat.mcp.access`) lets an admin disable access to all installed MCP servers via device policy. This is a blunter but more reliable control than the Copilot private registry alone, because it applies regardless of how the server was registered.

**Network filtering for agent tools** — `ChatAgentNetworkFilter`, `ChatAgentAllowedNetworkDomains`, and `ChatAgentDeniedNetworkDomains` let you restrict which hosts an agent's fetch tool and integrated browser can reach. Combined with `ChatAgentSandboxEnabled`, which runs terminal commands in a sandboxed environment, this starts to limit the blast radius of a compromised or malicious tool.

**Agent tool approval** — `ChatToolsAutoApprove` lets you lock down the "YOLO mode" (`chat.tools.global.autoApprove`) at the org level so individual developers cannot enable it, and `ChatToolsEligibleForAutoApproval` lets you force specific tools to always require manual confirmation.

**Account-gated AI access** — `ChatApprovedAccountOrganizations` blocks all AI features until the user signs into a GitHub account belonging to an approved organization. Useful for contractors, BYOD, and split environments where you need to tie the Copilot seat to an identity your org controls before anything runs.

**Linux policy support** — VS Code 1.106 added a `/etc/vscode/policy.json` file for Linux devices, meaning the same policies you deploy on Windows and macOS via ADMX or `.mobileconfig` can now cover Linux developer workstations through your existing config management tooling (Ansible, Puppet, Chef, Salt).

**Policy diagnostics** — A new `Developer: Policy Diagnostics` command generates a Markdown report of which policies are active, what values are in effect, and whether the Account Policy Gate is satisfied or blocked. Useful when you need to prove to an auditor — or a confused developer — exactly what the machine is enforcing.

These additions meaningfully strengthen the VS Code row in the summary table below. The gaps at the Copilot CLI, `gh skill`, and cross-editor MCP layers remain open.

## Enterprise managed settings

The one place where a real enterprise control plane does exist for Copilot clients is [`managed-settings.json`](https://docs.github.com/en/copilot/reference/enterprise-managed-settings-reference). I did not have this on my radar for a long time, partly because it is a client-side mechanism that lives outside the GitHub web UI, and partly because the key coverage per client keeps moving.

You can deliver it through four channels:

1. Server-managed, from a `.github-private` repository in your enterprise, at `copilot/managed-settings.json`, with `copilot/team-mappings.json` and `copilot/teams/*.json` for per-team specialisation.
2. MDM-managed, through the Windows registry or macOS preferences.
3. File-based, at `/Library/Application Support`, `%ProgramFiles%`, or `/etc/github-copilot`.
4. User settings, which is the developer's own layer.

Precedence runs MDM > server > file > user, with one exception that I like: the Copilot CLI `sandbox` key merges most-restrictively across every source instead of letting the highest layer win outright. Team settings combine least-restrictively between teams and then sit underneath the enterprise-wide settings, so a developer in three teams gets the union of what those teams allow, capped by the enterprise.

The keys worth knowing:

- `strictKnownMarketplaces` — set to an empty array and the CLI accepts no marketplace at all. This is the answer to the "any repo can be a marketplace" problem I described earlier, and it is the single highest-value key in the file.
- `extraKnownMarketplaces` — the approved sources you do want.
- `enabledPlugins`, keyed by `plugin@marketplace`. `true` requires the plugin, `false` forces it off.
- `permissions.disableBypassPermissionsMode` — kills the "approve everything" escape hatch.
- `allowedMcpServers` and `deniedMcpServers`. Allow lists intersect across sources, deny lists union, and deny wins.
- `telemetry`, pointing at your own OpenTelemetry endpoint, with `captureContent` and `lockCaptureContent`.
- `remoteControl`, set to `disabled`, `requireSSO`, or `enabled`.
- `sandbox` for the CLI.
- `model`, which sets a default model rather than an allowlist. Worth saying out loud, because people read it as a restriction and it is not one.

Three things about this file that I would want a security team to know before they trust it:

**First-party Copilot MCP servers are exempt from `deniedMcpServers`.** The deny list is not a kill switch. If your incident response plan says "we deny the MCP server and we are done", test that assumption against the first-party servers first.

**An MCP server name is not a security identity.** Matching is possible by name, by canonical URL, or by exact command plus args. Names are trivially reused, so write your rules against the URL or the exact command line.

**Key coverage is uneven across clients, and the least-covered client is your bypass path.** The Copilot CLI is the most complete surface: bypass mode, model, plugins, marketplaces, OTel, MCP, remote control and sandbox all land. VS Code covers nearly all of it but has only partial remote control and no sandbox. The Copilot app has no sandbox. JetBrains only picked up managed settings in August 2026 and is still partial on model and remote control, with no sandbox. The cloud agent honours plugins and marketplaces and little else. If you lock down VS Code and forget that the same developer has JetBrains installed, you have written a policy with a documented hole in it.

Two smaller traps. Server-managed policy is fetched, so an offline laptop with no cached response is a laptop with that channel missing — which is an argument for pairing the server channel with MDM rather than relying on it alone. And `telemetry` with `captureContent` enabled is an egress path for prompt and response content; if you turn it on, turn on `lockCaptureContent` too so a developer cannot flip it back.

The baseline I would ship on day one:

```json
{
  "strictKnownMarketplaces": [],
  "extraKnownMarketplaces": { "internal": "your-org/copilot-marketplace" },
  "permissions": { "disableBypassPermissionsMode": true },
  "telemetry": { "captureContent": false, "lockCaptureContent": true },
  "sandbox": { "enabled": true, "allowBypass": false }
}
```

Then add `allowedMcpServers` entries by URL or exact command, and grow `enabledPlugins` from a small approved set rather than trying to enumerate everything you want to block.

## Loading order surprises

A few merge rules that are easy to miss once you have plugins, workspace config and user config all in play at once:

- CLI built-ins are always present and cannot be overridden by a plugin.
- Agents and skills are first-found-wins, so a plugin's copy can be silently ignored because something earlier in the search order already claimed the name.
- MCP servers are last-wins, which is the opposite direction. An extra MCP config file can quietly replace the server a plugin shipped.
- In VS Code, enabling a plugin starts its MCP server without a separate trust prompt. Install implies trust.
- Hooks from a plugin run alongside workspace and user hooks, and the most restrictive `PreToolUse` decision wins. VS Code currently ignores Claude-style hook matcher values, so a hook you expected to be scoped may be firing on everything.

None of these are bugs exactly, but "first-found-wins for skills, last-wins for MCP" is the kind of asymmetry that makes an audit of what is actually loaded harder than reading the config files suggests.

## State of the plugin governance for GitHub Copilot



If I line up the different surfaces by how much org-level governance is actually possible today:

| Surface | Org-level allowlist | Provenance / pinning | Notes |
| --- | --- | --- | --- |
| Copilot CLI plugin marketplace | Client-side, via `strictKnownMarketplaces` | None | Nothing on the GitHub platform side; enforcement lives on the laptop |
| Copilot CLI local extensions | None | None | Committed to repo; active on clone with no install step |
| Agent Plugins 1.0 format | Not in scope of the spec | Not in scope of the spec | Portable package contract only, no signature and no sandbox |
| APM | Yes, via `apm-policy.yml` | Lockfile + content hashes | Policy is opt-in, customer-owned, and still preview |
| `gh skill` | None | Tag and SHA pinning | GitHub explicitly mentions verification |
| MCP servers | Limited (Copilot in VS Code, plus managed settings allow/deny) | None standardized | First-party servers are exempt from the deny list |
| VS Code extensions | Yes, via VS Code policy | Marketplace + signature | Differs across forks and Open VSX |
| Managed settings | Yes, per client | n/a | Key coverage differs per client; JetBrains and the cloud agent lag |

The pattern across all of them is that the per-developer experience is great, the per-org enforcement is either absent or has to be assembled from policies that live in different places than the feature itself. It also splits neatly into layers that people keep conflating: Agent Plugins 1.0 is the package format, APM is the dependency and deployment layer, `managed-settings.json` is the client policy plane, and runtime containment is a fourth thing that none of them provide. They are complementary, not competing, and you need all four before "we govern Copilot extensions" is a true statement.

The layer nobody covers at all is semantic safety. Every mechanism above answers "where did this file come from and is it allowed to load". None of them answer "does this skill tell the agent to do something stupid". That review is still a human reading the Markdown.

If you are responsible for any of this in a larger org, the short version of what I would do:

1. Decide which of these surfaces you want your developers to use at all. Default-allow is a choice that has consequences, not a neutral starting point.
2. Inventory what is already installed on your developers' machines before you write policy. You will find more than you expect.
3. For the ones you allow, pick the strongest available control today (VS Code extension policy, `managed-settings.json`, the Copilot MCP registry, an APM policy file) and ship it. Roll APM policy out as `warn` first, push the results into code scanning as SARIF, and only then flip to `block`.
4. Ship managed settings to every client your developers actually have, not just the one you think they use.
5. For the ones with no control today (CLI plugins on the platform side, CLI local extensions, `gh skill`), at minimum log and review, and feed back to GitHub and Microsoft that this gap matters.

Overall, tighten your grip on endpoint protection and your firewall/proxy configurations.

The features themselves are fine. The missing layer is the one every package ecosystem has had to grow eventually: a place for an org to say which sources it trusts, applied uniformly across every client that can pull from them.