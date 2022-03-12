---
layout: post
title: "GitHub Container Registry"
date: 2021-01-06
---

I wanted to use the [GitHub Container Registry](https://docs.github.com/en/free-pro-team@latest/packages/guides/about-github-container-registry) to host an image for me and had some issues setting things up. To save me some time the next time I need this, and hopefully for someone else as well, I wanted to document how this process works.

![Image of a lighthouse at night](/images/20210106/evgeni-tcherkasski-SHA85I0G8K4-unsplash.jpg)
##### <span>Photo by <a href="https://unsplash.com/@evgenit?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Evgeni Tcherkasski</a> on <a href="https://unsplash.com/s/photos/lighthouse?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>

## Beta period
During the beta, the container registry will be free to use. Open-source and public repositories are always entirely free to use, but private repositories will fall under the [standard billing rates](https://docs.github.com/en/free-pro-team@latest/github/setting-up-and-managing-billing-and-payments-on-github/about-billing-for-github-packages) for GitHub Packages after the beta is over. The free tier of that includes 500 MB of storage and 1 GB of transfer every month.

## Enable GitHub Container Registry
Currently, the registry is in Beta, so you'll need to enable the beta feature on your profile or on the organization level you want to use it on. To do so, go to your profile (or organization) and go to `Feature preview` where you can toggle the feature. You'll notice a new 'Packages' tab on you profile page as well.

![Location to find the preview settings](/images/20210106/20210106_01_EnablePackages.png)  

## Preparing to push image to the registry
Currently the only way to authenticate with GitHub Container Registry is to use a GitHub [Personal Access Token (PAT)](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token). GitHub already knows this is an issue because the PAT can be used in the entire account it is created and will change that later.  
For now the advisory is to create a specific PAT with only rights to the registry and use that.

These are the scopes you need to enable for the PAT:
- read:packages scope to download container images and read their metadata.
- write:packages scope to download and upload container images and read and write their metadata.

If you want to delete the packages, also use this scope:
- delete:packages scope to delete container images.

![Personal Access Token Creation](/images/20210106/20210106_02_PAT.png)

# Using a GitHub workflow to build and push an image
To push a new image from a workflow, use the complete example below.

The steps used are as follows:

1. Get the source code with the docker file and anything you need to build the image.
``` yaml
    - uses: actions/checkout@v1
```

2. Build the image
``` yaml
    - name: Build the Docker image
      run: docker build -t ghcr.io/<<ACCOUNT NAME>>/<<IMAGE NAME>>:<<VERSION>> .
```

3. The normal `docker build` step where I am tagging the image with the tag I want to push to the registry
``` yaml
    - name: Build the Docker image
      run: docker build -t ghcr.io/<<ACCOUNT NAME>>/<<IMAGE NAME>>:<<VERSION>> .
```

4. Authenticate with the GitHub Container Registry
Using the recommended setup from [GitHub](https://docs.github.com/en/packages/guides/pushing-and-pulling-docker-images#authenticating-to-github-container-registry)) for safety  
``` yaml
{% raw  %}
    - name: Setup GitHub Container Registry
      run: echo "${{ secrets.GH_PAT }}" | docker login https://ghcr.io -u ${{ github.actor }} --password-stdin
```

5. The normal `docker push` step to push the container
``` yaml
    - name: push to GitHub Container Registry
      run:  docker push ghcr.io/<<ACCOUNT NAME>>/<<IMAGE NAME>>:<<VERSION>>
``` 

## Full workflow example
``` yaml
name: Build and Push Docker container

on: 
  push:
    branches:
      - main

jobs:
  build-and-push:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v1

    - name: Build the Docker image
      run: docker build -t ghcr.io/<<ACCOUNT NAME>>/<<IMAGE NAME>>:<<VERSION>> .

    - name: Setup GitHub Container Registry
      run: echo "${{ secrets.GH_PAT }}" | docker login https://ghcr.io -u ${{ github.actor }} --password-stdin

    - name: push to GitHub Container Registry
      run:  docker push ghcr.io/<<ACCOUNT NAME>>/<<IMAGE NAME>>:<<VERSION>>
```

## Secret names
Do note that I am using `secrets.GH_PAT` to inject the PAT token I'm using into the workflow. You cannot use `GITHUB` as a prefix for the secret name, so you need to change that. The secrets user interface doesn't tell you about that in a great way, which I have sent GitHub feedback on through the [GitHub Community](https://github.community/t/add-a-warning-or-explanation-when-saving-a-secret-with-a-wrong-name/154018).

# Consuming the new image
By default the images are kept behind a login, so if you want to make the image publicly available you need to do that for each package. 

## Keep the image behind a login 
To use the image behind the login, you'll need to authenticate with the registry first:
``` powershell
echo "$env:GH_PAT" | docker login https://ghcr.io -u USERNAME --password-stdin
```

## Enable the public registry
#### Note: this is a one way trip: it cannot be made private after making it publicly available

To change this setting: go to the package and to its settings:
![Package settings](/images/20210106/20210106_03_MakePackagePublic.png)  

And make the image publicly available:
![Make the image public](/images/20210106/20210106_04_MakePackagePublic.png)