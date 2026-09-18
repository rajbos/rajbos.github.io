---
layout: post
title: Running MCP servers securely
date: 2026-03-13
tags: [GitHub, MCP, Servers, Security, Best Practices, GitHub Copilot, Copilot, Microsoft, Azure, Cloud, DevOps]
description: "Learn best practices for running MCP servers securely, including configuration tips and security measures. Discusses private registries, MCP server configuration, ecosystems, and MCP Gateway setups"
---

# Hosting MCP Servers with security in mind

MCP (Model Context Protocol) servers give AI assistants like GitHub Copilot access to external tools and data — think querying your databases, calling APIs, reading repositories, or triggering pipelines. Getting those servers running reliably and securely for a whole development team is where things get complicated fast. Over the last year there has been tons of development in this space.

There are several issues at play when you want to work with MCP Servers:
1. Security concerns with executing them and the access they have
2. Discovery and governance of which MCP servers are approved for use

I've been researching the different hosting options to work in a more secure manner with MPC servers, and this is the state of the research so far. The core question is: how can we host MCP servers in a way that allows us to use them effectively while minimizing security risks and ensuring proper governance?

## Security concerns
MCP servers are powerful but potentially risky. They often need access to sensitive data, credentials, or internal systems. If a server is compromised, it could be a major attack vector. Running MCP servers locally on each developer's machine means they inherit all the security context of that machine — which is a big risk. That includes 3rd party libraries directly installed on the developer's OS. Running these MCP servers in a containerized environment with strict access controls could significantly reduce the attack surface, but a lot of MCP servers are not configured that way and run locally through `npx` (npm executable), `uvx` (PyPi executable), Docker or similar tools.

Research from EndorLabs about the [State of Dependency Management 2025](https://www.endorlabs.com/lp/state-of-dependency-management-2025) focused on MCP servers and their lineage, showing that a massive amount of MCP servers have not been maintained at all since their creation, and often lack support from a community of maintainers driving it forward. This means that many MCP servers are not receiving regular security updates, making them potentially vulnerable to exploits. When developers run these MCP servers locally, they are exposed to these vulnerabilities, which could lead to security breaches if the MCP server is compromised.

Since MCP servers are a very effective man in the middle in your AI workflow, they can be used to exfiltrate data, access internal systems, or perform malicious actions if compromised. An MCP server can expose prompts, agent definitions, and tools. All these places allow for manipulation of both data and your prompts (prompt injection attacks). if an attacker can compromise an MCP server, they could potentially manipulate the prompts being sent to the AI model, leading to unintended actions or leak data to a 3rd party system. This is especially concerning if the MCP server has access to sensitive data or internal systems (which is a high level of probability on an engineers development environment these days). 

## Running local server concerns
Running MCP servers locally on developers' machines is the most common setup. Unfortunately most MCP Clients (for example: your code editor) host the MCP server only for themselves. That means there is no great way to expose these servers to all tools that support MCP Server in one go. So if you hop between editors: each editor will have to startup a process to communicate with the MCP servers you want to use. I'd expect that MCP tools become so prevalent that you'd run a centrally governed instance of a server on your machine as a service, and then each tool that wants to use them can find them, with a security layer on top that lets you allow list which MCP server is allowed to be used by which tools. 

Let's take an example with an engineer that runs both VS Code and IntelliJ. They switch between those editors when they work on different parts of their normal work, for example backend work in Java in IntelliJ and front end work in Typescript in VS Code. Next to that they have a todo application where they plan their work. If they manage their work for a part in something like Jira (user stories and tasks), Azure Boards (work items), or GitHub Issues, they might need to plan things across all those environments. If they want to use an MCP server that can read and write to their issue tracker, they would need to run a separate instance of that MCP server for each editor, and then keep those in sync with each other. Each instance also would have to be set up with the correct credentials. 

![Diagram of running the same MCP server multiple times on the same machine](/images/2026/20260313/20260313_02_MCPServersInClients.png)  

That is where a local MCP Gateway comes into play: you can host an MCP Gateway (e.g. this one [github.com/microsoft/mcp-gateway](https://github.com/microsoft/mcp-gateway)) locally, and then configure this Gateway in each editor. That way the MCP Server itself only has to run once, and the gateway can route the requests from each editor to the same MCP server instance. This also allows you to centralize the configuration of the MCP server, saves you some local resources, and centralizes the authentication for those external services as well.

End result: 
![Diagram of a local MCP Gateway routing requests from multiple editors to a single MCP server](/images/2026/20260313/20260313_02_MCPGatewayInClients.png)  

### Discovery and governance concerns

Next to the runtime security concerns (dependencies, hosting multiple instances, and even local installation issues if the ecosystem is not installed), there is also a discovery and governance problem: how do developers know which MCP servers they can use in your organization? How do you ensure they only use approved servers that meet your security standards? A central registry of approved MCP servers, integrated with developer tools, can help solve this.

This part can be covered by hosting your own MCP Registry: a catalog of approved MCP servers that developers can discover and connect to. [Azure API Center](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-mcp-usage/configure-mcp-registry#option-2-using-azure-api-center-as-an-mcp-registry) provides this capability with an enterprise-grade MCP server registry integrated with VS Code and GitHub Copilot, or you can build and host your own, with an example available here [github.com/rajbos/mcp-registry-demo](https://github.com/rajbos/mcp-registry-demo).

After setting up your registry, you can configure some Enterprise ready tools like VS Code to only allow connections to MCP servers that are registered in your registry, ensuring that developers can only use approved servers. For GitHub Copilot you get this option available with an GitHub Enterprise license, where you can configure an allowlist of MCP servers that your developers can use with Copilot by enforcing a private registry. Do be aware that this is configured on the Enterprise or Organization where the user gets their license from, and is only applied where the client supports this. 

As far as I can figure out at the moment this registry policy has been build in to support these environments:
- GitHub Copilot in VS Code

And is not yet supported in:
- GitHub Copilot in JetBrains IDEs
- GitHub Copilot in Neovim
- GitHub Copilot CLI
- GitHub Copilot Spark
- GitHub Copilot Spaces
- GitHub Copilot Coding Agent
- GitHub Copilot Review Agent

Or other editors that do not support GitHub Copilot.

## Potential solutions for centralizing an MCP Gateway and Private Registry

There are two solutions that I am researching at the moment to solve these issues:
1. Using Azure API Management as a secure gateway in front of your MCP servers, that can be augmented wih Azure API Center as a private registry
2. Using the MCP Gateway to host your MCP servers in a secure, containerized environment for the entire organization (instead of each developer running their own instance on their machine), moved behind the Azure API Management gateway for the security layer, also linking it up to Azure API Center as a private registry

The TL;DR of things I am running into is that Azure API Management provides a powerful perimeter security layer with Entra ID authentication, rate limiting, and monitoring, but lacks session-aware routing and adapter lifecycle management. 

The MCP Gateway itself provides session-aware routing and adapter management but does not natively support per-user OAuth for remote servers. Combining both could give you the best of both worlds.

So in short:
- APIM can help with remote MCP servers, but lacks user specific OAuth support
- MCP Gateway can help with local stdio MCP servers, but lacks per-user OAuth support for remote servers. Can sit behind APIM for security and having everything in one place.

The MCP Gateway can run in a k8s setup and can be exposed through APIM, so that is a nice way to tackle problems at the same time, at least for remote/local servers that do not require per-user OAuth. 

So lets see how far we can get combining these two solutions, and where the gaps are that we need to fill with custom code or configuration.

## The central MCP Gateway approach

One option is to use the same [`microsoft/mcp-gateway`](https://github.com/microsoft/mcp-gateway) repo in a centrally hosted service. This solves a real pain point: instead of every developer installing and running MCP servers locally on their own machine, or hosting a gateway on their own machine, the gateway hosts them inside Docker containers in a Kubernetes cluster. 

Developers connect to a central endpoint and get all the MCP tools they need — no Node.js, no Python runtimes, no `npx` invocations cluttering their laptops, saving the bandwidth, security issues of the different package managers, and centralize the maintenance cycles of keeping these servers up to date.

This also improves **security**. When an MCP server runs locally, it inherits the developer's environment: their filesystem access, their local credentials, their OS context. A containerized server running in a cluster is isolated — it only has access to what you explicitly give it. This is a meaningful reduction in the blast radius if an MCP server is compromised or behaves unexpectedly.

The MCP Gateway repo lets you configure the gateway with a couple of services:
- MCP Server gateway: register and retrieve listed MCP servers
- tool gateway: a tool gateway that routes tool calls to the correct backend MCP server in a container
- Redis: for session state management and routing
And then per server that you register with the gateway, a container will be spun up with the MCP server running inside, and the gateway will route requests to the correct container based on the session ID. 

### Where the MCP Gateway falls short

The MCP Gateway works well for stdio-based MCP servers running with shared credentials as the API keys can only be injected at deployment time. This is also the fundamental limitation with all other authentication options. There is no concept of per-user session state or per-user OAuth tokens. The gateway cannot inject a different GitHub personal access token for each developer who connects.

So this does not work for these two use cases:
- Remote, OAuth-authenticated MCP servers: each MCP server runs as a single shared instance. 
- Local MCP servers that require per-user auth: this gateway cannot inject different credentials for each user session.

This blocks setting up this flow for MCP servers like:
- GitHub MCP server (`api.githubcopilot.com/mcp/`), which uses GitHub OAuth or a Personal Access Token (which should not be used anyway if possible)
- Context7 MCP server, which needs an Personal Access Token for each user to connect to the Context7 service

## The Azure API Management (APIM) approach

Azure API Management is a fully managed API gateway with first-class support for Entra ID configurations. It lets you configure access to the APIM endpoint as the MCP Gateway which means the endpoint is only available for authenticated users in your organization. Since this is API Management, it lets you configure policies to validate incoming tokens, enforce rate limits, and monitor usage with Application Insights. This is a powerful way to add a security perimeter around your MCP servers.Any MCP server that uses the normal REST API for tools/resources can be fronted with APIM, which can handle the Entra ID authentication and then forward the request to the backend MCP server. The only thing it cannot expose through this is the prompts an MCP server might have. It's not really clear __why__ this is the case, so this is something to look into further. Potentially this is not that big of an issue at the moment, as you can get prompts from plenty of other sources (like the [Awesome Copilot](https://github.com/github/awesome-copilot) repo).

## Options to run MCP servers in Azure API Management

There are four primary Azure native hosting options for running MCP servers:
- Azure API Management (direct REST to MCP server)
- Azure Container Apps (to use the container runtime)
- Azure App Service (REST based MCP servers)
- Azure Functions (REST based MCP servers)

And additionally you can also use the [MCP Gateway](https://github.com/microsoft/mcp-gateway) as another backend and expose those MCP servers with shared state through APIM as well, so that you have one shared front end. APIM and MCP Gateway are complementary, not interchangeable: APIM handles north-south concerns (OAuth, rate limiting, monitoring) while MCP Gateway handles east-west session-aware routing. The user's core concern—that MCP Gateway doesn't support per-user OAuth for remote servers like the GitHub MCP server—is valid. APIM can help by fronting MCP servers with Entra ID auth. 

### Known limitations
APIM does have a couple of limitations to be aware of when hosting MCP servers. None of them really block the core use case of hosting remote MCP servers with Entra ID auth, but they are good to be aware of when designing your architecture:

- **APIM is stateless**: It does not maintain MCP session affinity. Each HTTP call flows independently
- **No session-aware routing**: Cannot pin `Mcp-Session-Id` to a specific backend pod (unlike MCP Gateway)
- **MCP tools only**: Currently supports MCP tools, not MCP resources or prompts
- **Not available on Consumption tier**
- **Response body access prohibited**: Don't use `context.Response.Body` in MCP server policies—it breaks streaming
- **Workspace support**: MCP server capabilities not yet supported in APIM workspaces

### APIM Pricing Consideration
Something to keep in mind is that APIM is billed per instance/tier, not per request. The Developer tier is cheapest (~$50/month) but has no SLA. Standard v2 starts around $170/month. This is significantly more expensive than just running MCP Gateway on an existing AKS cluster. If you already have an APIM instance running, then it does make sense to add this capability to it, as it is available out of the box. The value add of APIM is the security/routing/monitoring/rate-limiting features, so if you need those, it can be worth the cost. If you just want to host some MCP servers without those features, it might be overkill.

Also note that the MCP server features are not available in the Consumption tier, so you need at least the Developer tier to use APIM for MCP servers.

### What I could not verify yet: Oauth
- Whether APIM Credential Manager supports the OAuth passthrough required by e.g. the GitHub MCP server (the GitHub MCP server uses specific MCP-related scopes that may not align with standard GitHub OAuth App scopes)
- Performance characteristics of APIM fronting MCP streaming endpoints at scale

So the main questions that remain: 

- How to centralize access to remote servers like the GitHub MCP server that require per-user OAuth.
- How to centralize access/hosting to local servers like the GitHub MCP server that require per-user OAuth.

### Architectural overview of Clients/APIM + MCP Gateway
![Architectural Overview of the Clients/APIM + MCP Gateway stetup with options](/images/2026/20260313/20260313_01_ArchitecturalOverview.png)


## Key References used in this research
Of course I used AI to help me with this research, so I also looked for a lot of resources to understand the different options and their limitations. Here are some of the key references I used in this research:

### Official Microsoft Documentation
| Resource | URL |
|----------|-----|
| APIM MCP Server Overview | https://learn.microsoft.com/en-us/azure/api-management/mcp-server-overview |
| Expose Existing MCP Server | https://learn.microsoft.com/en-us/azure/api-management/expose-existing-mcp-server |
| Expose REST API as MCP Server | https://learn.microsoft.com/en-us/azure/api-management/export-rest-mcp-server |
| Secure MCP Servers | https://learn.microsoft.com/en-us/azure/api-management/secure-mcp-servers |
| Choose Azure Service for MCP | https://learn.microsoft.com/en-us/azure/container-apps/mcp-choosing-azure-service |
| Azure Functions MCP Tutorial | https://learn.microsoft.com/en-us/azure/azure-functions/functions-mcp-tutorial |
| APIM Credential Manager (GitHub) | https://learn.microsoft.com/en-us/azure/api-management/credentials-how-to-github |
| Azure API Center MCP Registry | https://learn.microsoft.com/en-us/azure/api-center/register-discover-mcp-server |

### GitHub Samples
| Repository | Description |
|------------|-------------|
| [blackchoey/remote-mcp-apim-oauth-prm](https://github.com/blackchoey/remote-mcp-apim-oauth-prm) | MCP Server with PRM + APIM + Entra ID |
| [Azure-Samples/remote-mcp-apim-functions-python](https://github.com/Azure-Samples/remote-mcp-apim-functions-python) | Secure remote MCP via APIM + Azure Functions |
| [Azure-Samples/mcp-auth-servers](https://github.com/Azure-Samples/mcp-auth-servers) | MCP auth reference collection |
| [Azure-Samples/AI-Gateway (MCP labs)](https://github.com/Azure-Samples/AI-Gateway/tree/main/labs/mcp-client-authorization) | MCP client authorization lab |
| [localden/remote-auth-mcp-apim-py](https://github.com/localden/remote-auth-mcp-apim-py) | Entra ID-protected MCP server with APIM |
| [microsoft/mcp-gateway](https://github.com/microsoft/mcp-gateway) | This repo - session-aware MCP reverse proxy |

### Blog Posts and Articles
| Article | URL |
|---------|-----|
| Secure Remote MCP Servers with Entra ID and APIM (Den Delimarsky) | https://den.dev/blog/remote-mcp-server/ |
| How to Build Secure and Scalable Remote MCP Servers (GitHub Blog) | https://github.blog/ai-and-ml/generative-ai/how-to-build-secure-and-scalable-remote-mcp-servers/ |
| Turn Any REST API into an MCP Server (Florian) | https://techworldofflorian.substack.com/p/turn-any-rest-api-into-an-mcp-server |
| Enhancing AI Integrations with MCP and APIM (Dev.to) | https://dev.to/azure/enhancing-ai-integrations-with-mcp-and-azure-api-management-bpe |
| Building an authenticated MCP server with Entra and .NET | https://www.developerscantina.com/p/mcp-entra-dotnet/ |
| MCP Authentication Checklist (Nov 2025 spec) | https://www.mcpjam.com/blog/mcp-oauth-guide |
| MCP Auth Implementation Guide | https://blog.logto.io/mcp-auth-implementation-guide-2025-06-18 |
| APIM as Auth Gateway for MCP (Tech Community) | https://techcommunity.microsoft.com/blog/integrationsonazureblog/azure-api-management-your-auth-gateway-for-mcp-servers/4402690 |
| Remote GitHub MCP Server GA | https://github.blog/changelog/2025-09-04-remote-github-mcp-server-is-now-generally-available/ |
| MCP vs. API Gateways: Not Interchangeable (The New Stack) | https://thenewstack.io/mcp-vs-api-gateways-theyre-not-interchangeable/ |
