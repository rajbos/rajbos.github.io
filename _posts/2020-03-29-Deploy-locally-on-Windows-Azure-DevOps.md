---
layout: post
title: "Deploy local IIS application on Windows with Azure DevOps"
date: 2020-03-29
---

Sometimes you need to deploy an application on a machine, but there is no option to use [PowerShell remoting](https://docs.microsoft.com/en-us/powershell/scripting/learn/remoting/running-remote-commands?view=powershell-7.1&WT.mc_id=DOP-MVP-5003719) from the outside. In that case, you can deploy an Azure DevOps agent on that machine and use that for local deployments.

These are the steps to deploy an application with Azure DevOps on the localhost of the agent. As an example I'm using IIS to deploy a web application to for this.

![Image of a light bulb](/images/20200329/alex-holyoake-PmzdQjCCPws-unsplash.jpg)
##### <a style="background-color:black;color:white;text-decoration:none;padding:4px 6px;font-family:-apple-system, BlinkMacSystemFont, &quot;San Francisco&quot;, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Roboto, Noto, &quot;Segoe UI&quot;, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1.2;display:inline-block;border-radius:3px" href="https://unsplash.com/@stairhopper?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge" target="_blank" rel="noopener noreferrer" title="Photo by Alex Holyoake"><span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-2px;fill:white" viewBox="0 0 32 32"><title>unsplash-logo</title><path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path></svg></span><span style="display:inline-block;padding:2px 3px">Alex Holyoake</span></a>

## Local Windows User
First, create a local windows user to run the agent with. We need to give the account some extra rights later on, and we should not do that with the default service account the Azure DevOps Agent uses.

* We need a Windows user for the agent to run with
* Make a local service user to run the agent with
* Make sure it has run as service rights (use the Group Policy Editor with gpoedit.msc in the 'Run' command)
* Store the password for the user somewhere safe.

## IIS deployments specific
The user needs to be added to the local Administrator group to be able to execute **AppExec** commands, used for administrative tasks in IIS, like creating a website. I've checked, but couldn't find better ways to do this with a less privileged account.

## Windows Remote Management (WinRM)
The default [deploy task](https://github.com/microsoft/azure-pipelines-extensions/blob/master/Extensions/IISWebAppDeploy/Src/Tasks/IISWebAppMgmt/IISWebAppMgmtV1/README_IISAppMgmt.md) in Azure DevOps use PowerShell with remote management to do the administrative tasks through [AppCmd](https://docs.microsoft.com/en-us/iis/get-started/getting-started-with-iis/getting-started-with-appcmdexe?WT.mc_id=DOP-MVP-5003719). You can enable to use this from a remote host, but you can also use this on the local host! 

#### Check locally trusted hosts:
Check the existing trusted hosts to see if the local host is already in the list:
`Get-Item WSMan:\localhost\Client\TrustedHosts`
By default it is not added to the list.

#### Set them open for localhost and a specific DNS name
If you don't find the localhost in the trusted list, you'll need to add them:
```
Set-Item WSMan:\localhost\Client\TrustedHosts -Value 127.0.0.1
Set-Item WSMan:\localhost\Client\TrustedHosts -Value servername.FQDNdomain.com
```
I add them with both the local IP-address and the fully qualified domain name so it will work with both, so if we later do get an option to use it from the outside, it will still work.

### Test WinRM sessions
You can then test the connectivity with the created user with a PowerShell script (run it on the VM).

#### Test the session
Get credential from a windows popup and set up a session:
```
$USER = Get-Credential
Enter-PSSession -ComputerName 127.0.0.1 -Credential $USER
```

Or you can skip the popup for easier testing, remove the password from the file when done!
```
$Username = '\AzurePipelinesSVC'
$Password = '1234512345'
$pass = ConvertTo-SecureString -AsPlainText $Password -Force

$SecureString = $pass
```

And create a session with the user and credentials you've stored:
```
$USER = New-Object -TypeName System.Management.Automation.PSCredential -ArgumentList $Username, $SecureString

# Entering the session, after that you can for example use $env:computername to see where that session is opened.
Enter-PSSession -ComputerName 127.0.0.1 -Credential $USER
```