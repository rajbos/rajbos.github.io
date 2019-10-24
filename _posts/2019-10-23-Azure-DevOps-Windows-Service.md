---
layout: post
title: "Deploy Windows Service using Azure DevOps"
date: 2019-10-23
---

Ever needed to deploy a Windows Service onto a machine with Azure DevOps? It turns out this is really easy (some caveat's apply 😄, see section at the bottom)!

There is an [extension](https://marketplace.visualstudio.com/items?itemName=automagically.ManageRemoteWindowsService) on the [Azure DevOps Marketplace](https://marketplace.visualstudio.com) that is a wrapper around the [SC tool](https://support.microsoft.com/en-us/help/251192/how-to-create-a-windows-service-by-using-sc-exe) from Windows:  
![Azure DevOps screenshot](/images/20191023/20191023_02_Extension.png)  

Add the extension and perform the tasks that you need:  
![Azure DevOps screenshot](/images/20191023/20191023_01_Tasks.png)  

In this case, I use these tasks:
* delete the existing service (will fail on the first try when the service is not available!)
* copy the files to the destination path
* set up the parameters for that server 
* install the service on the remote server

## Caveats
There are some small caveats to get this to work:  
1. [WinRM](https://docs.microsoft.com/en-us/windows/win32/winrm/portal) needs to be enabled on the target server.
1. This extension cannot use the standard service user accounts to run the service as. This means you are tied to local user accounts on the target server and cannot use `Local System` or `Network Service`.
1. Only works for X64 server and installed agent.
