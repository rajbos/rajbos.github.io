---
layout: post
title: "Using a self signed certificate on a SonarQube server with VSTS/TFS"
date: 2018-08-12
---

Recently I got a customer request to help them with provisioning a [SonarQube](https://www.sonarqube.org/) server hosted in Azure. Fortunately there is an [ARM template](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-authoring-templates?WT.mc_id=AZ-MVP-5003719) available for it: [link](https://github.com/Azure/azure-quickstart-templates/tree/master/sonarqube-azuresql). 

I ran into some issues with the ARM template at first and then tried to use the new SonarQube server within VSTS. 

## TL;DR
I didn't manage to get the SonarQube VSTS Tasks working with the self-signed certificate. I think it's probably possible, but you'll be much easier off 

![SonarQube logo](/images/2018_08_12_SonarQube.png)

# ARM template issues
At my first go with it, it took some time to figure out that the reason we couldn't connect to it came from the way the self-signed certificate was created: the template didn't create the certificate with a [fully qualified domain name](https://en.wikipedia.org/wiki/Fully_qualified_domain_name). A couple of years ago that would've worked, but with the tighter security rules in browsers that doesn't work anymore. Luckily I changed that with a small adjustment in the script and a [pull request](https://github.com/Azure/azure-quickstart-templates/pull/4692) later that problem has been fixed.

A little later I found out that SonarQube updated their download links, deprecating the older TLS 1.2 versions which gave another issue. Another [pull request](https://github.com/Azure/azure-quickstart-templates/pull/4840) later and that is also fixed.

# Java installation
Now that those issues have been handled, you'll probably find that you've missed the comments in the readme: the ARM template **cannot** provision the Java JDK needed for installation, because Oracle will not let you download it from an open folder (like SonarQube does)!

For this step you'll need to RDP into the server and install the JDK by hand.   
**Do note**: don't forget to change the default passwords for logging in to the SonarQube installation!!

After that you'll find out that the template provisions an IIS installation to host the SSL certificate and then be the proxy for the SonarQube server. 

![SonarQube project page](/images/2018_08_12_SonarQube_Project_page.png)

# Using the SonarQube server in VSTS / TFS
When you have the server up and running, you'll want to use it in VSTS. If you start adding the necessary steps to your build (find out more about it [here](https://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Extension+for+VSTS-TFS), you'll find out that the builds will fail with some obscure messages connecting to the SonarQube server. If you are using a [private agent](https://docs.microsoft.com/en-us/vsts/pipelines/agents/agents?view=vsts#install?WT.mc_id=DOP-MVP-5003719), you can log into the server and try to remediate these issues.

![SonarQube Tasks](/images/2018_08_12_SonarQube_VSTS.png)

First, you'll hit it in the "Prepare analysis on SonarQube" step. Thinking it runs on the agent server on Windows, you can trust the server's certificate in your local certificate store, using the [certificate snap-in](https://docs.microsoft.com/en-us/dotnet/framework/wcf/feature-details/how-to-view-certificates-with-the-mmc-snap-in?WT.mc_id=AZ-MVP-5003719). Double check the user the agent is running on or trust the certificate machine-wide.
Don't forget to check your proxy configuration if you have one in between!

Unfortunately: this doesn't work! Nest, you double check and find out a part of this step actually creates a local Java Virtual Machine [JVM](https://en.wikipedia.org/wiki/Java_virtual_machine) that has its own version of the local certificate store. To add your own certificate in it, you can follow the steps from [here](https://docs.microsoft.com/en-us/sql/connect/jdbc/configuring-the-client-for-ssl-encryption?view=sql-server-2017?WT.mc_id=DOP-MVP-5003719).

Next, you'll find that NodeJS is used to send the requests to the SonarQube server! Great, now that also has its own version of the trust chain setup...

# End result
And this is where we couldn't figure out how to include the certificate here. Given the time that it already cost to get here and the expectation that a hosted agent could still be needed (where you cannot trust your own certificates and need to have an official one), we stopped searching around for the solution and got an actual certificate. That prevented all these errors and also enables the usage of a hosted agent.