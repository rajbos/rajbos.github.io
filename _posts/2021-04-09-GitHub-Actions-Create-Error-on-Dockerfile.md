---
layout: post
title: "GitHub Actions Create: Dockerfile symlinks error"
date: 2021-04-09
---

I was building a new [GitHub Action](https://docs.github.com/en/actions/creating-actions/about-actions) today with a Dockerfile and got a strange error...


![GitHub execution error message](/images/20210409/20210409_01_ErrorMessage.png)


I was using a Dockerfile in a sub directory, but the [documentation](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions#runs-for-docker-actions) indicates this is supported. So, what gives? Is it a mix-up of the file path? I'm testing it on Windows and can build the Dockerfile itself just fine 🤔. Tested with a backslash instead of a slash, but still an error:

![GitHub execution error message with symlinks](/images/20210409/20210409_02_ErrorMessage.png)

# The fix

On a hunch (this has happened before!), I changed the file ending of the Dockerfile from CRLF into LF (created the file on Windows of-course!) and... tada: 


![Working result with a successful Docker build](/images/20210409/20210409_03_Working.png)


# For future reference

1. Check the line endings on your Dockerfile!
2. You can run an image in your GitHub Action in a subdirectory by using the correct path to it. It needs to be relative to the action.yml file!


``` yaml
# action.yml
name: 'Octogotchi'
description: 'Octogotchi'
branding:
  icon : alert-circle
  color: blue
runs:
  using: 'docker'
  image: 'action/Dockerfile'
```