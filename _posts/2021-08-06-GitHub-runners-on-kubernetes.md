---
layout: post
title: "Hosting GitHub runners on Kubernetes"
date: 2021-08-06
tags: [GitHub, GitHub Actions, GitHub runner, runners, kubernetes, k8s, self-hosted, hosting]
---

If you need to host your own [GitHub Actions](https://github.com/features/actions) runners that will execute your workflow, you have multiple options: you can go the traditional route and host them on your own VM's. You can even host multiple runners on the same VM, if you want to increase the density and reuse your CPU or RAM capacity on your VM. The first downside of this is that VM's are harder to scale and often a bit more costly to run then other options. Even more important reason not to use VM's because it is not a great option for having an environment that is clean for every run: GitHub Actions will leave several files on disk for both reuse (the actions downloaded and used for example, or the docker images you run on). Even the [checkout](https://github.com/actions/checkout) action will only cleanup the source code when it is executed, to make sure that the latest changes are checked out. You can include a cleanup action at the end, but often that is not added.

Even worse are the [potential security pitfalls](/blog/2021/03/07/GitHub-Actions-one-workflow-per-runner) that come from reusing an environment between runs of a workflow, or different workflows in different repositories: the first run could leave some files behind, like from a package manager you use, or overwrite a local docker image for example. Subsequent runs on that machine will look in the local cache first, and use the (potentially) compromised files. These are some of the examples of supply chain attacks that are [more and more](https://xpir.it/Solorigate) common these days.

To combat those risks, you want to have ephemeral runners: the environment only exists during the execution of the workflow: after it is done, everything is cleaned up. The does mean that caching things becomes a little harder. There are ways to combat that with for example a proxy close by your environment that can do the caching for your (note: this is still a potential risk!).

![Photo of air balloons against a blue sky](/images/20210806/ian-dooley-DuBNA1QMpPA-unsplash.jpg)
###### Photo by <a href="https://unsplash.com/@sadswim?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">ian dooley</a> on <a href="https://unsplash.com/s/photos/launch?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  

# Ephemeral runners
GitHub does not have any support for hosting your runner inside a container with some 'bring your own compute' options. It uses that setup on the GitHub hosted runners, where a runner environment is created just for your run and destroyed afterwards, but hasn't released anything for their customers. When you start looking for options, you will find a community curated lists of [awesome runners](https://github.com/jonico/awesome-runners) that have been made by the community to host your runners inside k8s, AWS EC2, AWS Lambda's, Docker, GKE, OpenShift or Azure VM's (at the time of writing 😄).

# Actions runner controller
The one that got recommended to me was the [actions-runner-controller](https://github.com/actions-runner-controller/actions-runner-controller): it had an active community (82 contributors, including me now! lots of stars) with a lot of communication on the issues and discussions list. 

# Hosting in Azure Kubernetes Service 
For testing to see if I could get things to working with my bare minimum of k8s knowledge, I created an [Azure Kubernetes Service](https://azure.microsoft.com/en-us/services/kubernetes-service?WT.mc_id=AZ-MVP-5003719) cluster with all the defaults and installed the actions runner controller in it, with all the information in the [readme]((https://github.com/actions-runner-controller/actions-runner-controller)) of the project. Even used a GitHub app for authentication and things worked straight out of the box. You can just run one runner for quick testing, or use the build in scaling options to scale up and down between your limits (for example 0 runners when there is nothing to run and 100 runners as a maximum), or scale up and down based on time windows you define (so scale up to 30 runners at 7AM on workdays, if your company still folows tradditional time slots people are working on).

## A remark on scaling
During testing I found that the scaling options for [actions-runner-controller](https://github.com/actions-runner-controller/actions-runner-controller) have a downside: it can only look at the current queue of **workflows** and not the set of **jobs** inside those workflows. That is because GitHub currently does not support loading the queue based on jobs inside workflows. There is development being done on that side, but I have not seen any progress yet.

# Hosting on internal Rancher server
My customer that wanted this setup for their own GitHub Enterprise Server (GHE) to have a local runner as well. The security team also wanted to do a security check on the setup and didn't want to use AKS for that (and notify Microsoft of active pen testing activities on the cluster). They had an internal [Rancher](https://rancher.com/) setup available that they wanted me to use. The thing is, that this cluster was already tight down a lot: it only could pull internal Docker images, and it had a lot of other restrictions, like using a proxy for all its traffic. This is where things got a little bit more complicated. Their internal images host was a private registry hosted on Artifactory and pulling from public container registries was not available.

# Configuring images used by the controller manager
The first thing I ran into was that our Rancher setup sat behind an internal proxy / load balancer that forced all images to be downloaded from an internal Artifactory registry. Depending on the original registry a lookup was done in the allow listed images in Artifactory. These where the images we added to the allow list in Artifactory:
* summerwind/actions-runner-controller:v0.18.2
* summerwind/actions-runner:v0.18.2
* quay.io/brancz/kube-rbac-proxy:v0.8.0
* docker:dind

The only image that could not be pulled transparently with our setup was the one from `quay.io`: this registry was not mirrored transparently, which meant that the label was different in Artifactory. As an initial fix I choose to override the image name **manually** after it has been deployed, using this command:
``` shell
kubectl set image deployment/controller-manager kube-rbac-proxy=registry.artifactory.mydomain.com/brancz/kube-rbac-proxy:v0.8.0 -n actions-runner-system
``` 
This means that the controller-manager deployment gets a new image assigned that has the name kube-rbac-proxy and it will reload that container. After that, things actually started running and I could the runner to be available on either the organization or repository level. 

# Docker in docker (DinD) with internal certs
Our Rancher setup used an internal proxy to pull our images from an Artifactory server that was signed with an internal certificate (without a full trust chain). This meant that the Docker client used to pull the images had to be configured to trust the internal certificate as well or you only got pull errors with an untrusted cert. To accomplish this I build a new DinD container on our runners that where running on a VM and had the certificates installed locally. 

Action.yml that build the image:
``` yaml
    - uses: actions/checkout@v2
    - name: Build
      run: |
        cd dind
        # certs on RHEL are found here:
        cp -R /etc/pki/ca-trust/source/anchors/ certificates/
        docker build -t ${DIND_NAME}:${TAG} -f Dockerfile --build-arg http_proxy="$http_proxy" --build-arg https_proxy="$http_proxy" --build-arg no_proxy="$no_proxy" .
```

So that we could load the local `certificates` folder into the image (note that you can also used the commented RUN command to hardcode a specific certificate):

``` shell
FROM docker:dind

# Add the certs from the VM we are running on to this container for secured communication with Artifactory 
COPY /certificates /etc/ssl/certs/

# add the crt to the local certs in the image and call system update on it:
#RUN cat /usr/local/share/ca-certificates/docker_registry.crt >> /etc/ssl/certs/ca-certificates.crt
RUN update-ca-certificates
```

## Note: tested with `$DOCKER_TLS_CERTDIR` as well: didn't work
``` shell
# Add the certs to this image for secured communication with Artifactory 
COPY docker_registry.crt $DOCKER_TLS_CERTDIR # Docker should load the certs from here, didn't work
```

## Note: tested with daemon.json as well: didn't work
I also tested by adding a daemon.json
``` json
{
    "insecure-registries" : []
}
```
And then copied that json file over:

``` shell
COPY daemon.json /etc/docker/daemon.json # see https://docs.docker.com/registry/insecure/,  didn't work
```
Somehow this file seemed to be ignored and pulling the images from the internal registry still failed.

# Loading the new DinD image

Loading the new DinD image could not be done by the same 'hack' as used for the image from quay.io. After reaching out to the [community](https://github.com/actions-runner-controller/actions-runner-controller/issues/701) they helped me with actually overwriting the controller-manager deployment with both the image from `quay.io` and the new `DinD` image:
``` yaml
# controller-manager.yaml:
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    control-plane: controller-manager
  name: controller-manager
  namespace: actions-runner-system
spec:
  replicas: 1
  selector:
    matchLabels:
      control-plane: controller-manager
  template:
    metadata:
      labels:
        control-plane: controller-manager
    spec:
      containers:
      - args:
        - --metrics-addr=127.0.0.1:8080
        - --enable-leader-election
        - --sync-period=10m
        - --docker-image=registry.artifactory.mydomain.com/actions-runner-dind:latest
        command:
        - /manager
        env:
        - name: GITHUB_TOKEN
          valueFrom:
            secretKeyRef:
              key: github_token
              name: controller-manager
              optional: true
        - name: GITHUB_APP_ID
          valueFrom:
            secretKeyRef:
              key: github_app_id
              name: controller-manager
              optional: true
        - name: GITHUB_APP_INSTALLATION_ID
          valueFrom:
            secretKeyRef:
              key: github_app_installation_id
              name: controller-manager
              optional: true
        - name: GITHUB_APP_PRIVATE_KEY
          value: /etc/actions-runner-controller/github_app_private_key
        image: summerwind/actions-runner-controller:v0.18.2
        name: manager
        ports:
        - containerPort: 9443
          name: webhook-server
          protocol: TCP
        resources:
          limits:
            cpu: 100m
            memory: 100Mi
          requests:
            cpu: 100m
            memory: 20Mi
        volumeMounts:
        - mountPath: /tmp/k8s-webhook-server/serving-certs
          name: cert
          readOnly: true
        - mountPath: /etc/actions-runner-controller
          name: controller-manager
          readOnly: true
      - args:
        - --secure-listen-address=0.0.0.0:8443
        - --upstream=http://127.0.0.1:8080/
        - --logtostderr=true
        - --v=10
        image: registry.artifactory.mydomain.com/brancz/kube-rbac-proxy:v0.8.0
        name: kube-rbac-proxy
        ports:
        - containerPort: 8443
          name: https
      terminationGracePeriodSeconds: 10
      volumes:
      - name: cert
        secret:
          defaultMode: 420
          secretName: webhook-server-cert
      - name: controller-manager
        secret:
          secretName: controller-manager
```	

After that, we could deploy our own Single-runner.yaml, which has an option to specify the image to use for the runner:
```	
# runner.yaml
apiVersion: actions.summerwind.dev/v1alpha1
kind: Runner
metadata:
  name: gh-runner
spec:
  repository: robbos/testing-grounds
  image: registry.artifactory.mydomain.com/actions-runner # overwriting the runner to use our own runner image, the DinD runner comes from the controller
```

# Runner fix
I actually had to patch the runner image as well, because our setup had a tmp folder on a different device, which was causing [errors](https://github.com/actions-runner-controller/actions-runner-controller/issues/686) during the bootup of the container. I copied the container definition over from the actions-runner-controller repo and fixed the script, published our own image and told the runner deployment to use it by setting the `spec.image` as in the example above.

# Other observations

## Namespace 
Something that took me a while to figure out: the namespace `actions-runner-system` is hardcoded in all deployment files, so you cannot change it (easily). Keep that in mind if you want to land in a pre existing namespace with internal pod security policies for example.

## Community 
The community creating these runner setups is active on both creating the solutions and helping people out. Given that the used setup is actively maintained and they supported me with my questions is a great sign of a good community. Without the community, I would not have been able to get this done, so thanks a lot!


![Drawing of two hands held up next to each other in lots of colors](/images/20210806/tim-mossholder-bo3SHP58C3g-unsplash.jpg)
###### Photo by <a href="https://unsplash.com/@timmossholder?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Tim Mossholder</a> on <a href="https://unsplash.com/s/photos/team?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  