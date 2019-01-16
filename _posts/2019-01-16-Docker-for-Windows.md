---
layout: post
title: "Docker for Windows: fix unauthorized errors"
date: 2019-01-16
---

After installing [Docker for Windows](https://docs.docker.com/docker-for-windows/) (recently renamed to Docker Desktop) I could not get the basic command `docker run hello-world` working. I checked my install, read more docs, got confused if it was in my Hyper-V setup, the networking stack in it, or something else. Finally a light bulb went off and I found the solution! 

# The issue

After installation Docker present you with a login screen.
Since that login worked just fine, I'd expect that everything is setup correctly.

The next step is then to verify that you can run at least `hello-world`:

```
C:\Users\RobBos> docker run hello-world
Unable to find image 'hello-world:latest' locally
C:\Program Files\Docker\Docker\Resources\bin\docker.exe: Error response from daemon: Get https://registry-1.docker.io/v2/library/hello-world/manifests/latest: unauthorized: incorrect username or password.
See 'C:\Program Files\Docker\Docker\Resources\bin\docker.exe run --help'.
```

That message: 'Error response from daemon: Get https://registry-1.docker.io/v2/library/hello-world/manifests/latest: unauthorized: incorrect username or password.' can send you down a wild goose-chase to figure out what is wrong!!!

Since it tells you the call back to the docker registry is not authorized, you think you need to login again, even though Docker tells you, you are logged in.... Hmm, already strange, let's try that nonetheless.

# Logging in again
If I run `docker login`, it shows me the currently logged in user, which I did via the login interface after the installation:  

![](/images/2019_01_16_Docker_For_Windows_Login.png)  
Notice that I am using my e-mail address here. The login is just fine:  

![](/images/2019_01_16_Docker_for_Windows_Email_Logged_In.png)

Still, calling `docker run hello-world` gives me the same error:

```
C:\Users\RobBos> docker run hello-world
Unable to find image 'hello-world:latest' locally
C:\Program Files\Docker\Docker\Resources\bin\docker.exe: Error response from daemon: Get https://registry-1.docker.io/v2/library/hello-world/manifests/latest: unauthorized: incorrect username or password.
See 'C:\Program Files\Docker\Docker\Resources\bin\docker.exe run --help'.
```

After testing all sorts of stuff, reinstalling Docker (reboots required) and searching around some more, I *finally* got to a comment somewhere on another issue... And the issue is.... I am logged in with my **e-mail** address and **not** with my "insert curse" username! 

# Fixing it
Switching to use the **username** in Docker will switch the login for the session, and all of a sudden it just works!

![](/images/2019_01_16_Docker_for_windows_logged_in_user.png)  
Very odd that docker does accept both for the login here, while the e-mail address is not working. Somebody probably enabled that for the webfront end and didn't test the CLI.

Maybe someone else will find this post when hitting the same issue and it saves them a lot of time!  
