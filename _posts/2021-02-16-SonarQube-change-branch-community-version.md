---
layout: post
title: "SonarQube Community Edition - Change default branch name"
date: 2021-02-12
---


Small tidbit so I could potentially find this later on: If you are running SonarQube yourself with the Community Edition (for a POC for example, otherwise invest in yourself by getting a higher edition!) then you might find this useful.

## Default Branch name in Community Edition
The default branch in SonarQube Community Edition is still locked to `master`. If you want to change that in SonarQube then there is no user interface option available, as is in higher editions under [Administration --> Branches and Pull Requests](https://docs.sonarqube.org/latest/branches/overview/).

You can use this url to get to the same page for your project and change the name there:
`https://sonarqube.server.url/project/branches?id=<your project name>`