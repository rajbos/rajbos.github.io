---
layout: post
title: "Don't use self signed certificates on GitHub Enterprise"
date: 2021-05-16
---

Often you come across an organization that has a policy to use self signed certificates on internal services: as long as you control the workstations used to connect to them, that is a solution that might work. Sometime you still run into issues from them and they usually have a workaround available. Maybe IT-services likes to be in control who can create and hand out certificates that way. In a real DevOps environment I'd want the team to have control over them, and even automate their deployment and refresh them automatically in a regular interval.

# GitHub Enterprise Server
For GitHub Enterprise server, this has so many downsides that I really recommend **not** using self signed certificates on that: get a proper cert with a full certification chain on it. Let's go over the things that you will run into when you install a self signed certificate:

## Users cannot connect to GitHub Enterprise
Browsers will give you errors if the certificate on the site is not trusted on the machine. This happens with a self signed cert that does not have a full certification chain. Fixing this one is easy: if IT already has self signed certificates setup throughout the internal services, they will also have a way to add a new certificate to the internal trust stores. Those are distributed to the workstations and servers and therefor all clients connecting will have no issues doing so.

## GitHub Actions on Virtual Machines
When you start using actions in GitHub Enterprise (available in version 3.0), you'll probably start with [self hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners/adding-self-hosted-runners) as well: there was a reason for hosting your own GitHub Enterprise server, so internal runners will come next. For starters lets assume you are running them on a virtual machine (VM).

When you create the VM, you now also need to trust the self signed certificate into the VM. If you don't do that, then you cannot use the [checkout action](https://github.com/marketplace/actions/checkout) on the VM: when it does a Git Checkout it will use the the remote url to get the code from the repository: that will use the self signed certificate that it doesn't trust. If there is no Git installed on the VM, it will execute an HTTPS fetch from the repository, that will need the self signed certificate that it doesn't trust.

Alright, this also has a straightforward fix: trust the self signed certificate on the runners VM (please automate the creation of the VM's and the installation of the runner 😉).

You can load the local Linux cert directory if the action is running on a VM by adding this setting to the action:
``` yaml
SSL_CERT_DIR: /etc/ssl/certs
```

Or use the node settings to load a specific cert if the action is build on node:
``` yaml
- name: Checkout
    uses: actions/checkout@v2
    env: 
      NODE_EXTRA_CA_CERTS: /etc/ssl/certs/ca-bundle.crt
```
The downside of this is that you need to add these workaround into each and every workflow that users create (and tell them they need to).

## GitHub Actions running Docker containers
A good security practice to protect your runners, is to use Docker containers to run Actions you don't (want to) trust: run them inside a container as an extra security boundary to [limit the access](https://devopsjournal.io/blog/2021/02/07/GitHub-Actions-Security-Private-Runners) the runner user has on your VM. If you have setup the runner with least-privileges then the container boundary is hard to break out of.

If you start running Actions or jobs in a container, you are now bound to the certificate trust chain **of the container** and you are no longer running in the context of the runner that reads it's certificate trust chain from the host. That means you will find it hard to use the self signed certificate. From something like a call to an internal NPM endpoint (with a self signed certificate as well), you could go all-in and just ignore the full SSL certificate completely by adding `NODE_TLS_REJECT_UNAUTHORIZED = 0` to your environment. This is highly insecure and will open up your environment to a person-in-the-middle attack. I'm sure that is not what you want?

You could also add the file onto the container (volume mount it or download it as an artefact) and add it to NPM so it can find it: 
``` shell
npm config set cafile "<path to your certificate file>"
```

What you now have accomplished is that each and every developer who wants to use your internal service with a self signed certificate needs to add extra steps to the workflows to get them to work, adding a lot of extra friction. If you had added a certificate with a full trust chain, things would work out of the box, without any workarounds.

## Start the runner with skip validation setting
You can also start the workflow runner with `--sslskipcertvalidation` which is another bad practice opening you up to a person-in-the-middle attack. Please don't use it!

## Mount the certificate store:
Another option is to mount the cert store in the job that is running the container: 

``` yaml
jobs:
  build:
    runs-on: self-hosted
    container: 
      image: node:10.16-jessie
      volumes:
        - /etc/ssl/
    name: Checkout will happen inside the container
    steps:
    - name: Checkout current repo
      uses: actions/checkout@v2
```
This will still mean your DevOps engineers will need to remember to think about the volume mount when using Actions. Even worse: depending on the base-image they are using, the volume to mount even might be different!

## Make your own base images
A better (and safer option all around in my opinion) would be to create your own base images that the DevOps engineers can use: lock down and harden those images any way you want, and then install your own certificate in the image as well!

# Conclusion:
You can find workarounds for the GitHub runner / action or runner to be able to get things working. A lot of workarounds have impacts that for example mean you need to include them in each and every workflow you want to run. The easier way then is to get a proper certificate setup on your GitHub Enterprise server: now things will work as intended and you don't have to tell your users to add the workaround to their workflows.