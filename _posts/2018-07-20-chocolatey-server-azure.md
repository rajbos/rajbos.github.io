---
layout: post
title: "Chocolatey Server in Azure"
date: 2018-07-20
---

Recently I wanted to demo an example of how you can rollout [Chocolatey](https://chocolatey.org/) packages via your own choco server. Sometimes we cannot save every binary in VSTS to use it in a pipeline as an artifact and therefor I needed a different artifact server. Chocolatey provides a NuGet wrapper around binaries that you can easliy track different versions with.

Since that worked out an I now have a local document with the neccesary steps to do so, I wanted to share that for later reuse.

![chocolatey](/images/chocolatey.png)

Ofcourse, Microsoft just announced that they started working on a different artifact server in VSTS (called [Universal Package Management](https://blogs.msdn.microsoft.com/devops/2018/07/09/universal-packages-bring-large-generic-artifact-management-to-vsts/)), next to the already available NuGet / npm / Maven [package management](https://visualstudio.microsoft.com/team-services/package-management/).

Since I needed something to show, I started researching how you can do this with your own Chocoserver. Unfortunately, the installation for Choco.Server on Windows consists of [multiple steps](https://chocolatey.org/docs/how-to-set-up-chocolatey-server#setup-normally) that can take up some time. That just doesn't feel right, so I wanted to see if I could wrap that inside of a PowerShell script being triggered from an [ARM template](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-authoring-templates) and Azure Automation DSC. I couldn't seem to find the time to really start on it, but fortunately enough, my colleague [Reinier van Maanen](http://rvanmaanen.github.io) needed a bit of a challenge and picked this up. You can find his ARM template [here](https://github.com/rvanmaanen/arm.chocolateyserver), together with the necessary PowerShell script. The script needs a little more tweaking, due to the fact that a new server without IIS doesn't give you access to the PowerShell commandlets after adding it to Windows, but those last commands actually run fast :-).

Beneath you can find the steps to get a working Choco.Server and Client up and running with a first basic package.

# Install a Choco.Server
First, you'll need a server to host the packages. You can host that with a couple of steps thanks to [Reinier](https://twitter.com/MaanenReinier).
```
Git clone https://github.com/rvanmaanen/arm.chocolateyserver.git
cd arm.chocolateyserver
Connect-AzureRmAccount
Open parameters.json 
 - change dnsNameForPublicIP (max. 15 characters!)
 - change allowRdpFromThisIpAddress
.\Deploy-AzureResourceGroup.ps1 -ResourceGroupLocation "West Europe" -StorageAccountName "ChocoARM"
```
~~Do note that the ARM template will report failure on the DSC step. To still get a working server you'll need to log in to the new VM and execute the last 5 lines by hand.~~ Update: thanks to [Reinier](https://twitter.com/MaanenReinier) this is now fixed! The ARM template now uses 2 steps to make sure the IIS management cmdlets are available for the second step. You can read how he fixed that [here](https://r-vm.com/depend-on-multiple-arm-script-extensions). 

To check it, you can navigate to [http://localhost/](http://localhost/). 
We are aware of the use of http, we need still to add that step to the script. We decided we could live with it for a small demo and blocking it from your own IP-address.

![Chocopackagelisting](/images/2018_07_20_Choco_Server_packagelistexample.png)

# Create package on different machine
Install choco (elevated PowerShell) with this command:
``` powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
```
You are now ready to create new packages and push it to the Choco.Server. I did this on my own laptop, so therefor I am using the public IP address of the Azure server.
To wrap the files Chocolatey uses the well known [NuSpec](https://docs.microsoft.com/en-us/nuget/reference/nuspec) file, known from its use in [NuGet](https://www.nuget.org/).
``` 
choco new testpackage creates the default nuspec in that folder
change it, add notepad.exe into the \tools directory
remove ps1 files from the tools directory
choco pack on the folder containing the nuspec file.
choco push testpackage.{your.version.number.here}.nupkg --source http://{public.ip.of.chocoserver}/chocolatey --api-key={please update your key in the web.config} -force
```
Note: the `-force` is necessary because we are using http instead of https.

# Client machine (in the same resourcegroup/nsg/network!)
For demo purposes I created another Azure Windows Server in the same resourcegroup, connected to the same network so the servers could easily connect to each other.  
On that extra server, verify that it can see the Choco.Server by navigating to [http://local.ip.of.chocoserver/chocolatey](http://local.ip.of.chocoserver/chocolatey) to see if you get a valid result.  
Then you can install the chocolatey client, link you own server as a source and use that server to install your own package. 

Steps:
```
Install choco with the PowerShell command (see 'create package')
choco source add --name=internal_machine --source=http://local.ip.of.chocoserver/chocolatey
disable Internet Explorer Enhanced Security Configuration (IE ESC) to prevent the http page from loading (you are on a server). This step should be simpler when you are using https (as we should).
choco install testpackage
Files are copied into C:\ProgramData\chocolatey\bin\ by default
```

All in all, I found the process pretty straight forward. Now to start using the Choco.Server and push new versions to it! 