---
layout: post
title: Dependabot alerts triaging in GitHub
date: 2023-10-07
tags: [Dependabot, GitHub, alerts, DevSecOps]
---

The GitHub UI displays a couple of helpful tips to use in triaging your Dependabot alerts which are super helpful. Unfortunately the User Interface does not show these filters in the filter bar yet, so I wanted to have a better overview of the filters I could use. I've listed them below:

## Only show alerts where your code is using the vulnerable calls of the dependency
This is very helpful in triaging the open alerts. Currently in limited preview for certain languages and certain package ecosystems. I hope they will expand this to more languages and package ecosystems.

Instead of wading through all the open alerts where your code might (currently!) not call into the vulnerable part of the dependency code, you can filter down the list of alerts to the things you **are** calling. Use this filter:
* `is:open has:vulnerable-calls`

## Filter on Dependabot auto dismissal
Dependabot now has new functionality to auto dismiss alerts that have low or medium severity. This is a great way to reduce the noise in your alerts list so you can filter on the important issues. You can filter on these alerts with this filter:
* `is:closed resolution:auto-dismissed `

## Filter on only runtime dependencies
This is a great way to filter out the development dependencies from the runtime dependencies. This is the case for example when you use NPM as a package manager. You can use this filter to only show the runtime dependencies:
* `is:open scope:runtime`
Do make sure that you are not accidentally publishing to production with development dependencies. This is a common mistake that can lead to security issues, as the files are then still on disk, and could be used as an attack vector.

## Filter on vulnerable dependencies where a patch is available
This is helpful to focus on quick wins. Since there is a patch available that fixes the vulnerability, getting these dependencies upgraded can lead to fast results. You can use this filter to only show the alerts where a patch is available:
* `is:open has:patch`