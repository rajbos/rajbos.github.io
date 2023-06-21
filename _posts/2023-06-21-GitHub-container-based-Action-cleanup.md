---
layout: post
title: "Cleaning up files changed by a GitHub Action that runs in a container"
date: 2023-06-21
tags: [GitHub, GitHub Actions, Container, Container based, Action, Cleanup, self-hosted runners]
---

A common issue we see with self-hosted runners is that they can leave behind files that were created or modified by the action. This is because the action runs in a container and the container is using a `root` user to do its work. 

The GitHub documentation says to run the the runner service as `root` as well, to have the most compatibility with most runners. This is not a good idea, as it can lead to security issues, so a lot of people run the runner service as a non-root user. This can lead to permission issues when the action touches files in the workspace directory that get's mounted. 

![Photo of a ray of sun in between the clouds](/images/2023/20230621/aakanksha-panwar-SOOTeA8nL4o-unsplash.jpg)  
##### Photo by <a href="https://unsplash.com/ko/@aakanksha_panwar?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Aakanksha Panwar</a> on <a href="https://unsplash.com/photos/SOOTeA8nL4o?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

## Examples
One common example is the [super-linter](https://github.com/marketplace/actions/super-linter) action. Depending on the checks that run, it can touch files on disc that then get owned by the `root` user. 

Another example is running the entire job inside of a container, with using the keyword `container` on the job level:

```yaml
jobs:
  build:
    runs-on: self-hosted
    container: ubuntu:22.04
    steps:
      - uses: actions/checkout@v2
      - run: echo "Hello World"
```

The checkout action will create a `.git` directory in the workspace directory with the repo contents, which will be owned by the `root` user as the `ubuntu-22.04` container runs as `root`. The job itself will complete just fine, but the next time you run another job for this repository on the same runner, the checkout action will try to cleanup the $GITHUB_WORKSPACE directory to get a clean starting point, and will fail with a permission error since the job is not running as root, but as the non-root user the runner service is executing under.

There are multiple ways to tackle this issue:
* Prevent it from happening: Run the runner service as `root` and run the job as `root` as well. This is recommended by GitHub to prevent this from happening, that is how the service has been designed. Most people I talk with do not agree since the user has to much permissions and it can lead to security issues.
* Change the action to not run as root, which is not realistic when using actions from the public marketplace.
* Get the user to cleanup inside of the container, or add a cleanup action in their job.
* Add cleanup configuration on the container level configuration in the runner
* Add cleanup configuration on the runner configuration itself
* Do not run the container with any persistence: run as `ephemeral`, where the runner is alive for a single job execution, and then gets completely deleted and cleaned up so there is no reuse.

I'll go over the last 4 options in this post.

## Get the user to cleanup inside of the container, or add a cleanup action in their job.
You could hunt for the jobs that cause this issue, and 'ask' the user to add a cleanup action in the job itself. There is for example a [cleanup action](https://github.com/asilbek99/action-cleanup) available in the marketplace that runs in a container that uses root, and that cleans up the workspace directory. This is not a good solution, as it requires a lot of manual work, and you will have to keep track of the jobs that cause this issue. The following options are probably manageable in a better way. 

## Add cleanup configuration on the container level configuration in the runner
You can configure the runner with specific customization commands that get executed before and after the job, as well as other options:
* prepare_job: Called when a job is started.
* cleanup_job: Called at the end of a job.
* run_container_step: Called once for each container action in the job.
* run_script_step: Runs any step that is not a container action. 
See the entire configuration and examples [here](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/customizing-the-containers-used-by-jobs). This is rather complex and more suited for configuring sidecars or other complex scenarios. I prefer to use the next option.

## Add cleanup configuration on the runner configuration itself
By setting 2 environment variables before the job starts, you can run specific scripts before and after the job starts. The completed job can then be a docker run command that mounts the $GITHUB_WORKSPACE and cleans everything up while running as `root`. This is the easiest option in my opinion:
* ACTIONS_RUNNER_HOOK_JOB_STARTED: The script defined in this environment variable is triggered when a job has been assigned to a runner, but before the job starts running.
* ACTIONS_RUNNER_HOOK_JOB_COMPLETED: The script defined in this environment variable is triggered after the job has finished processing.
Find more information in the documentation [here](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/running-scripts-before-or-after-a-job).

## Do not run the container with any persistence
The best advice is to always start runners as `ephemeral`, where the runner is alive for a single job execution, and then gets completely deleted and cleaned up so there is no reuse. You will need to provide a mechanism to cleanup the Virtual Machine or Container setup where you execute the runner on. The best method I've found is to use [Actions Runner Controller](https://github.com/actions/actions-runner-controller) where the runner is executing inside of a container that gets deleted after the job is done. This will prevent any data to linger around on the runner as well, and gets you a clean execution environment every time.

There might be some valid reasons to still have a persistent runner, but I would recommend to use ephemeral runners as much as possible.