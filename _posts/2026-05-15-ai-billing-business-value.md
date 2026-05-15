---
layout: post
title: "The AI subsidy era is ending — time to talk business value"
date: 2026-05-15
tags: [GitHub Copilot, AI, Billing, DevOps]
description: "Usage-based billing is here. The conversation has to shift from how fast AI makes engineers to what business value those AI sessions actually produce."
---

GitHub Copilot [moves to usage-based billing on June 1](https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/). We have already seen customers that will see their AI spend on Copilot go to 2x or 3x (median), with some even going 8x! And this is happening across all model hosters and vendors: Anthropic has been pushing people onto their Max tiers ($200/month) and metered Claude Code usage. Gemini, Cursor, Windsurf, and the rest are doing the same math and arriving at the same answer. The era where AI was heavily subsidised by vendors trying to grab market share is ending, and now we get to pay the actual price of hosting all those GPUs.

Some companies are about to wake up and smell the roses.

Some reference stories of the last days:
- Sander Trijssenaar wrote a [solid breakdown of the new GitHub Copilot App combined with token billing](https://www.trijssenaar.net/blog/2026-05-15-new-github-copilot-app-token-based-billing-major-ai-spend-increase/) and what that means for spend. 
- Hidde de Smet did the [per-token math across every major provider](https://hiddedesmet.com/the-real-cost-of-ai-coding-agents). 
- State of Brand called the whole subsidy model [a ticking time bomb](https://www.thestateofbrand.com/news/ai-subscription-time-bomb). 
- AJ Enns put together a [token economy playbook](https://github.com/aj-enns/token-economy) for keeping spend under control once the meter is running. 
- I see the same thing happening in the [Copilot Discord](https://discord.gg/cURHV9TvFS).

Read all four references if you haven't — they cover the numbers better than I will here.

What I want to talk about is what comes after the panic.

## The trough we're sliding into

If you look at 
[Gartner Hype Cycle](https://www.gartner.com/en/newsroom/press-releases/2025-08-05-gartner-hype-cycle-identifies-top-ai-innovations-in-2025), this is the bit right after "Peak of Inflated Expectations" — the slide into the Trough of Disillusionment. We're sliding into it right now. Here is last years Hype Cycle for reference, althoug this is on AI overall:

![The Gartner Hype Cycle, showing the "Trough of Disillusionment" phase after the "Peak of Inflated Expectations"](/images/2026/20260515/GartnerHypeCycle-et-hc-2025-press-release.jpg)

The negative sentiment on pricing is everywhere on LinkedIn, Mastodon, Reddit, and every dev community in between: individual users hopping between editors and CLIs trying to find the next thing that runs AI for free or close to it, and companies scrambling to get costs under control by limiting AI use instead of enabling their engineers.

That second part is the wrong path. Restricting AI to control the bill saves a few thousand euros a month and leaves a multiple of that in business value on the table. I see it in the numbers all the time.

## What the numbers actually look like

At Xebia we've built a [Copilot billing dashboard](https://copilot-billing.xebia.ms/) on top of the standard GitHub data, with extra logic that flags things like the Business → Enterprise upgrade math during the current promo period. The pattern that keeps showing up: a small group of heavy users carries most of the cost, and a much larger group is barely touching their allotment.

One example from a real customer: four users were responsible for roughly 50% of the company-wide bill. The rest of the org has AI Credits sitting unused every month. That's not a cost problem — that's a massive opportunity problem. Those underused seats are engineers who could be shipping faster, fixing tech debt, or building MVPs to test new ideas, and instead they're using maybe a third of what they're already paying for. Some companies approach giving out licenses the wrong way. I have shared my views on this at conferences left and right: 
- 2024 - GitHub Universe: [Lessons learned from enabling thousands of developers on GitHub Copilot](https://youtu.be/eJRNJwlLFts)

The AI Credits pooling model under the new billing for GitHub Copilot helps with this on paper — heavy users draw from the shared pool, light users effectively subsidise them. But it also masks the real story: a lot of seats are paid for and not used. That's the gap I want teams to close, with data-driven insights and proactive management.

## My own usage hockey stick

I've been tracking my own AI usage in detail for a while with this [VS Code Extension](http://github.com/rajbos/ai-engineering-fluency) I built. Here's what it what my hockey stick growth looks like:

![Token usage and sessions per month from June 2025 to May 2026, climbing from near zero through October to a projected ~1.8B tokens in May 2026](/images/2026/20260515/20260515_Hockeystick.png)

Near zero through October 2025. A small bump in November and December. Then it climbs through Q1 2026 and goes vertical in March and April. April hit ~530 sessions and ~1.4B tokens. May is projected around 1.8B tokens. And to be clear: I'm not running `/fleet`, Squad, or any other multi-agent army. This is one person, working interactively most of the time.

I vividly remember end of March where I hit my first 100 Million tokens in 30 days. I thought "oh, that's a lot!". Then I hit 1 Billion tokens just 3 weeks later. Let that sync in: from 100M to 1B in three weeks. 

What changed? Two things. First, agent mode genuinely became my default for non-trivial work after December. Second, I got early access to the GitHub Copilot App that [went into technical preview in May 2026](/blog/2026/05/14/github-copilot-app), and it is by design a more agentic experience which of course consumes more tokens: parallel sessions, longer autonomous runs, Agent Merge handling CI failures, merge conflicts, and security review comments, all on its own. I wrote about that release the day it dropped [here](/blog/2026/05/14/github-copilot-app).

So yes, my AI bill will go up significantly. The question I want to talk about is whether that's worth it and how I look at it.

## A concrete case: $57 in tokens for a JetBrains extension

Here's a session from my own custom dashboard that shows costs per session:

![Session efficiency view showing a single JetBrains extension session at $57.05, 54 user turns, 30 commits, 31 files edited, with token usage across Claude Opus 4.7, Opus 4.6, Haiku 4.5, Sonnet 4.6 and GPT-5 mini](/images/2026/20260515/20260515_SessionCosts.png)

One session. A couple of hours of my time. $57.05 in AI spend across Claude Opus 4.7, Sonnet 4.6, Haiku 4.5, and GPT-5 mini. Output: a working JetBrains extension — [rajbos/ai-engineering-fluency](https://github.com/rajbos/ai-engineering-fluency) — that visualises in-depth information about your AI usage: sessions, tokens, chat turns, models used, and even an AI fluency score. Same kind of insights I'd been building for VS Code and Visual Studio, now ported to the JetBrains ecosystem.

If I had to build that from scratch, learning the JetBrains plugin SDK along the way, I'd estimate two weeks of work. Maybe more. Instead it cost me a couple of hours and $57 in tokens.

Was it worth it? An engineer's hours for two weeks versus a few hours plus $57 — that's not even a close call. The business case writes itself.

That's the conversation we need to be having about every meaningful AI session: not "how much did the tokens cost" in isolation, but "what did we get for it, and what would the alternative have cost". And of course, just raw cost and "did you ship anything" is not the right way to look at it either. The real question is "what was the business value of the session overall, and was that worth it". Tracking these sessions to something sensible or tangible is hard! When I start research in session one, and then hop over to another tool, tagging those sessions together is unrealistic. But we can get close enough to have a meaningful conversation about the value of the work done in those sessions, and that's what we should be doing. Also the other side is true: shipping more crap and bugs into production faster is also not a good business case. The value conversation has to be about the overall impact of the session in the long term, not just the singular output or the cost.

If a beefy session shaves off 2ms in a request on a system that does millions a day, that's a huge business win. If it produces a feature that customers love and drives more revenue, that's a huge business win. If it refactors a piece of code that was causing 10% of the bugs in production, that's a huge business win. If it just produces a few more lines of code that don't actually move the needle, then maybe it's not worth it.

If a session teaches a new developer on the team how to do something they didn't know before, that's a huge business win. If it helps an experienced developer get unstuck on a problem that was blocking them for days, that's a huge business win. If it just produces a few more lines of code that don't actually move the needle, then maybe it's not worth it.

## Foundation first, then speed

Here's where it ties back to something I've been saying for over a year. Back in April 2025 I wrote [GitHub Copilot — Change the Narrative](/blog/2025/04/01/GitHub-Copilot-Change-the-Narrative), arguing that the productivity framing for AI was the wrong one. The real value is that AI gives engineers time to put a sturdy DevOps foundation in place: automated pipelines, testing you actually trust, monitoring, the more-eyes principle, everything-as-code.

That argument is more relevant now than it was then. With usage-based billing, every team has to justify what their AI spend produces. And all of a sudden we will have a (justified) conversation again about the AI cost for that team. The teams that can answer "we used the time to get our pipelines, tests, and monitoring in shape, and now we ship features in days instead of weeks with confidence they won't break production" are going to look very different from the teams that just shipped more features faster on top of a wobbly foundation.

Enabling the teams to get the most out of their AI usage is the job of engineering leadership. They need to give the team the time to absorb the new tools, tailor the AI setup to their stck and way of working, and then some. So many businesses make the mistake of handing out licenses and hope that they get 10x engineers. That's not how any of this works!

Instead, spend the early time with the team on the foundation of their SDCLC setup. Get your confidence up to the point where you can actually go faster. Then go even faster.

Once that foundation is solid, tackling the technical debt backlog stops being a luxury item. AI sessions are very good at the kind of bounded, well-tested refactor work that usually sits at the bottom of the backlog forever. The cost of a refactor session is small. The cost of carrying that debt for another year, in slower delivery and more bugs, is much larger.

## Then the real prize: speed of opportunity

Once foundation and tech debt are in a decent state, the next conversation is the one that actually matters to the business: cost of opportunity.

A team that's fluent with AI in their SDLC, on top of a solid DevOps foundation, can turn on a dime. New feature idea on Monday, MVP in the user's hands by Friday. That speed of response is the business value. Not "engineers type faster". Not "we shipped 30% more story points". The ability to react to a market signal or a customer request in days instead of months is what AI in the SDLC actually unlocks, and it's what should be in the business case.

So the conversation with the business becomes: here's the change, here's the AI spend (training engineers, tokens, compute) it took to get it out, is the value worth that cost? My honest expectation is that the answer is an immediate yes most of the time. For the cases where it isn't obvious, spin up an AI session to do the research and build a quick MVP — that's trivial these days, and it's usually enough to make a real business case from.

## Look at the current spent to avoid surprises, then shift the conversation to business value

Here are few concrete things, in roughly the order I'd tackle them:

1. Get visibility into your usage before June 1. The GitHub preview bill is the bare minimum. If you want more, the [Xebia Copilot billing dashboard](https://copilot-billing.xebia.ms/) is one option (we even share opportunities to upgrade Business licenses to Enterprise licenses based on the data), or look at the [token economy playbook](https://github.com/aj-enns/token-economy) as it is another good starting point.
2. Look at who is and isn't using their allotment. The underusers are not a saving — they're an opportunity. Find out why they're not using it (no training, no use case, fear of "doing it wrong") and fix that. Talk to the engineers and see what holds them back. I've seen teams with editors out of 2023, teams on hosted or locked down editors that did not allow them to install new tools and extension, or teams that kept on saying "the AI does not get our stack". All of those are solvable problems, and the solution is not "just don't use AI then". It's "let's fix the problem so you can use AI and be more effective". Call us if you need help in this field!
3. Run the upgrade math during the promo period. For some users, moving from Business to Enterprise pays for itself thanks to the bigger included allotment, and the surplus credits help cover the heavy users without overage.
4. Stop measuring AI by "engineers shipping faster". Start measuring it by what you spent the freed time on: foundation work, tech debt, MVPs that became real features, deep research that lead to improvements. I am a fan of the book [Frictionless](https://www.amazon.nl/-/en/Nicole-Forsgren/dp/1662966377/ref=sr_1_1?adgrpid=1341406728955258&dib=eyJ2IjoiMSJ9.r4fbGSDpzlF1M-6oEq0Stynwnl9ObpQ45b9f0FcMleR0eUzrWPeM9M-tkOlGGSOmwmlzq9nuSbMlDPrfuZ5f-3uQX_CfnKiFIJINd2t3rknrT1_9gm8ofybsFMO8NhYOvvnMV2q0BT0wYS5kGHQ5WJvMINgaT-Js6CnKsu03aYqgmq647_cPz2s9fucjK55e3tI2OBYfZaYV5amMIB_C2KsOisKAcKOx-gN7L2p8baJpd6Bs-7Kr8tHDB2XH2sti5L0NzDgcE2CUhKz_VDpq7MGTL_VrYaY1PB878Ko2KW0.1l11q18OYBoDeKvq8wlaCssWM0hq1FVGJQRBjkz3Chc&dib_tag=se&hvadid=83838200192813&hvbmt=be&hvdev=c&hvlocphy=152248&hvnetw=o&hvqmt=e&hvtargid=kwd-83839127493302%3Aloc-129&hydadcr=24320_2296430&keywords=frictionless+book&mcid=dcf0dce74e943256a8ca6e59aea0ba68&msclkid=7a35294523b513a4ea3e434218f5df5b&qid=1778858818&sr=8-1) from Abi Noda and Nicole Forsgren, which has a great framework for measuring the value of work in terms of "friction removed", as well as a way to explain this in business value. I think that is a much better way to look at the value of AI sessions than "how many lines of code did we ship".
5. Have the business value conversation per change, not per seat. Tie AI spend to the feature it produced, then ask the business if it was worth it.

If you want to talk about any of this, reach out to me on [LinkedIn](https://www.linkedin.com/in/bosrob).

The subsidy era ending isn't a bad thing. It forces the conversation we should have been having from day one: what is this actually worth?
