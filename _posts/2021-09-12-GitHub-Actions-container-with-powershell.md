---
layout: post
title: "GitHub Actions: Run PowerShell in Container"
date: 2021-09-12
---

You can create GitHub Actions running in a container, which allows you to execute 'anything' in an action that can be run inside a container, including PowerShell, my favorite scripting language. To get started, you can use the available [template repo](https://github.com/actions/container-action) to create a new repository filled with the contents of the template. 

![Image of the template repository with a border around the 'use this template' button](/images/20210912/20210912_Template.png)

The moving parts of the template are as follows:
* action.yml
* Dockerfile
* entrypoint.sh

## action.yml
The `action.yml` contains the setup for your action repository when it is used in a GitHub Actions workflow as well as the listing of it on the GitHub Actions Marketplace. In it are the description of the action, the author, the version, and the list of inputs and outputs.

It also tells the workflow runner (the thing that executes the action), how to run the action. In this case we use the `using` property to tell the engine to use a Docker image to run in. The `image` property tells the engine which Docker image to use. If you use `Dockerfile` as its value, it will use the Docker file in the root of the current repository. In the `args` section you tell it the arguments to pass into the container when it starts. These are then added **in the order the are added to this list**. So the array has index 0 for the first argument, 1 for the second, and so on. That will also be the order in which the arguments are passed to the entrypoint file in the container.
![image of the args being passed in as an array: ${{ inputs.organization }} and ${{ inputs.PAT }}](/images/20210912/20210912_ActionYML.png)

## Dockerfile
The 'Dockerfile' will be build on the spot when the action is executed. With the `ENTRYPOINT` you tell it what script to run when the container starts. This is the point where you can put your PowerShell script. Remember that the parameters are injected into the script as variables.

``` Docker
FROM ghcr.io/rajbos/actions-marketplace/powershell:7

COPY /Src/PowerShell/*.ps1 /src/

ENTRYPOINT ["pwsh", "/src/entrypoint.ps1"]
```

## PowerShell
The PowerShell script is in the `entrypoint.ps1` file. I declare the parameters that PowerShell will then map in the order the script was started with. Remember that the order is determined in the action.yml file. Which is nice, since that means you are in control of the order and the user cannot make mistakes with it. If the arguments are optional, *they will still be injected but with the default or empty value for them*.

You can leverage that feature like I do below. I test for the values to see if they are empty and if so, I use a default environment variable to run in the current GitHub context (a user account or an organization). If not all minimal values have been set, I still fail the action.

``` powershell
param (
    [string] $organization,
    [string] $PAT
)

if ($null -eq $organization -or "" -eq $organization) {
    Write-Host "Using default for organization: [$($env:GITHUB_REPOSITORY_OWNER)]"
    $organization = $($env:GITHUB_REPOSITORY_OWNER)
}

if ($null -eq $PAT -or "" -eq $PAT) {
    Write-Error "No value given for input PAT: Use at least [GITHUB_TOKEN]"
    throw
}

$actions = (.\load-used-actions.ps1 -orgName $organization -PAT $PAT)
```

Note: failing the action can be done by exiting the entrypoint script with a non-zero exit code. 
I use this setup for it:
``` powershell
try {
    # always run in the correct location, where our scripts are located:
    Set-Location $PSScriptRoot

    # call main function:
    main

    # return the container with the exit code = Ok:    
    exit 0
}
catch {
    # return the container with an erroneous exit code: 
    Write-Error "Error loading the actions:"
    Write-Error $_
    # return the container with an erroneous exit code:
    exit 1
}
```

# PowerShell container image
For full reference you can find the Dockerfile I used below:
``` shell
FROM ubuntu:20.04

# install powershell for Ubuntu 20.04
RUN apt-get update \ 
    && apt-get install -y wget apt-transport-https software-properties-common \
    && wget -q https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb \
    && apt-get update \
    # Register the Microsoft repository GPG keys
    && dpkg -i packages-microsoft-prod.deb \ 
    # Update the list of products
    && add-apt-repository universe \
    && apt-get update \
    && apt-get install libssl-dev -y \
    && apt-get install gss-ntlmssp -y \
    && apt-get install powershell -y \
    && apt-get install curl -y \
    && apt-get install git -y 

# install the module we need
RUN ["pwsh", "-Command", "install-module -name powershell-yaml -Force -Repository PSGallery"]
SHELL ["pwsh"]
```