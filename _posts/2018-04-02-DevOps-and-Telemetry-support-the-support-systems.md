---
layout: post
title: "DevOps and Telemetry: Support on the supporting systems"
date: 2018-04-02
description: "Part 3 of the DevOps telemetry series covers monitoring SSL certificate validity and security headers using SSLLabs and SecurityHeaders.com in your pipeline."
---

**Note** This is part 3 in a series of posts about DevOps and the role of telemetry in it. In part one I described the reasoning behind the series and explained how I started with logging (usage) telemetry for a SaaS application. You can read part 1 in the series [here](/blog/2018/03/14/DevOps-and-Telemetry-Insights-into-your-application).
In this post I want to explain about the next step: logging information about the systems that support the application: servers, database, storage and anything that comes with that.

## Series overview
* [Part 1](/blog/2018/03/14/DevOps-and-Telemetry-Insights-into-your-application) - My journey with telemetry and starting with logging
* [Part 2](/blog/2018/03/22/DevOps-and-Telemetry-Insights-supporting-systems) - Supporting systems and how to gather that information (this post)
* [Part 3](/blog/2018/04/02/DevOps-and-Telemetry-support-the-support-systems) - Supporting the support systems

## SSL certificates - validity


### SSL certificates: industry standards on encryption
[SSLLabs](https://www.ssllabs.com/)

### Security headers
[https://securityheaders.com/](https://securityheaders.com/)