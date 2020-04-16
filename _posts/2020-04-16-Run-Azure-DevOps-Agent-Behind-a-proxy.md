---
layout: post
title: "Install an Azure DevOps Agent behind a proxy"
date: 2020-04-16
---
Sometimes you need to run the Azure DevOps Agent behind a proxy. If you search around you can find a lot of posts regarding this, and I wanted to have my own overview of all the things you need to keep in mind. At least I've tested this list myself 😁.

To run the Azure DevOps agent behind a proxy, the proxy must be updated with the urls below in the allow-list. The origination of this list comes from [Microsoft](https://docs.microsoft.com/en-us/azure/devops/organizations/security/allow-list-ip-url?view=azure-devops) and [Jesse Houwing](https://jessehouwing.net/azure-devops-what-domains-are-used-by-your-account/).

# Proxy allow-list
To be able to install the agent we have requested these urls to be added to the allow-list:

### Organization specific:
Replace ORGANIZATIONNAME with the name of your organization of course.

https://ORGANIZATIONNAME.visualstudio.com 
https://ORGANIZATIONNAME.vsrm.visualstudio.com  
https://ORGANIZATIONNAME.pkgs.visualstudio.com  
https://ORGANIZATIONNAME.vssps.visualstudio.com  
http://sso.ORGANIZATIONNAME.com  
https://sso.ORGANIZATIONNAME.com  
https://login.ORGANIZATIONNAME.com  

### Generic
https://login.microsoftonline.com  
https://app.vssps.visualstudio.com  
https://login.live.com  
https://auth.gfx.ms  
https://app.vsspsext.visualstudio.com  
https://\*.ods.opinsights.azure.com  
https://\*.oms.opinsights.azure.com  
https://ods.systemcenteradvisor.com  
https://secure.aadcdn.microsoftonline-p.com  
https://\*.dev.azure.com  
https://dev.azure.com  
https://login.microsoftonline.com  
https://management.core.windows.net  
https://api.nuget.org  
https://login.microsoftonline.com  
https://microsoftonline.com  
https://go.microsoft.com  
https://microsoft.com  
https://app.vssps.dev.azure.com  
https://dev.azure.com  
https://aex.dev.azure.com  
https://vstsagentpackage.azureedge.net  
https://graph.windows.net  
https://aadcdn.msauth.net  
https://aadcdn.msftauth.net  
https://windows.net  
https://visualstudio.com  
https://live.com  
https://app.vssps.visualstudio.com  
https://cdn.vsassets.io  
https://gallerycdn.vsassets.io  
https://static2.sharepointonline.com  
https://spsprodweu2.vssps.visualstudio.com  
https://vssps.dev.azure.com  
https://vsrm.dev.azure.com  

## Start the installation by making it aware of the proxy:
The installation will then do the rest.
```
.\config.cmd --proxyurl "https://fqdn.url.of.your.proxy:3128"
```
If there are any errors, it will be logged in the `_diag` folder.