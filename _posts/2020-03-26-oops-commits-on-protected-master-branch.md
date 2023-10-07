---
layout: post
title: "Oops, you've worked on the master branch and cannot push to the remote"
date: 2020-03-26
---

We've all been there, what happens when you commit changes to the master branch and during the sync to the remote you get an error.

![Screenshot of Visual Studio Error](/images/2020/20200326/2020/20200326_02_VisualStudio_Error.png)


Starting point: you didn't check the branch you where committing to:
So during the sync you get an error:
![Screenshot of the cause in Visual Studio](/images/2020/20200326/2020/20200326_01_VisualStudio_Cause.png)

In the output window this message is shown:
```
Pushing to https://**********.visualstudio.com/DefaultCollection/CICD/_git/DemoRepo
To https://**********.visualstudio.com/DefaultCollection/CICD/_git/DemoRepo
Error: failed to push some refs to 'https://**********.visualstudio.com/DefaultCollection/CICD/_git/DemoRepo'
Error encountered while pushing to the remote repository: rejected master -> master (TF402455: Pushes to this branch are not permitted; you must use a pull request to update this branch.)
This means the remote branch is protected and that you can only update it via a Pull Request.
```

You changes will not be lost! Here's what to do:
**Step 1.** Move your changes to a new branch, by creating a new branch from here:
 (note the master branch as the source)!
![Screenshot of creating the new branch in Visual Studio](/images/2020/20200326/2020/20200326_03_VisualStudio_CreateNewBranch.png)

### Now you can push that branch to the remote and create a Pull Request with you changes.

**Step 2.** If you switch back to the master branch, you'll still see those commits on it and you still cannot push...

We need to reset the commit from the master branch. There is no way to do this with Visual Studio, so we need to use the command line for that.

Open a command line and go to your repository folder. I'm using Windows Terminal here.

Run `git status` in the folder to check if you are in the correct location and state:

![Screenshot of creating the new branch in Visual Studio](/images/2020/20200326/2020/20200326_03_CommandLine_Reset.png)

To reset the last N commits, use this command: `git reset --hard HEAD^N`

As an example: to reset the last 2 commits: `git reset --hard HEAD^2`


**Be aware:** this is a destructive operation: data from the master branch in those commits will be lost! That's why we saved them to another branch.