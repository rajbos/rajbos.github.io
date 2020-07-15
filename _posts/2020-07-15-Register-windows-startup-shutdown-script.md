---
layout: post
title: "Register a Startup or Shutdown script on Windows with PowerShell"
date: 2020-07-15
---

Today I got asked how you could register a Startup and/or Shutdown script on Windows through PowerShell. 
My colleague already had a setup for creating a VM, but wanted this extra step as well.

Searching the web revealed some bits and pieces, so I'm logging it here for future reference.  

![Nurturing plants image](/images/20200715/daniel-oberg-sEApBUS4fIk-unsplash.jpg)  
##### <span>Photo by <a href="https://unsplash.com/@artic_studios?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Daniel Öberg</a></span>  

## Gist
I've created this [gist](https://gist.github.com/rajbos/49f70f4e2b9765da05f0526225de2450) with the registration script and an example file with a script to execute on Startup or Shutdown of the VM. It will then log the date/time to a text file for easy testing:

![Log messages in output text file](/images/20200715/20200715_01_Output.png)

The trick is to set up (quite a lot of registry keys) and a windows folder that has to be present to get things working.

## Tested
Tested on a Windows 10 VM (1909).

## Caveat:
You need to run the register script with an elevated session because you need to have access to at least the `%SYSTEMROOT%` directory.