---
layout: post
title: "SonarQube setup on Azure App Service"
date: 2019-04-29
---

As noted in a [previous post](https://rajbos.github.io/blog/2018/10/20/SonarQube-setup), you can host a [SonarQube](https://www.sonarqube.org/) on an Azure App Service, thanks to [Nathan Vanderby](https://www.linkedin.com/in/nathan-vanderby-92a19814/), a Premier Field Engineer from Microsoft. He created an ARM template to run the SonarQube installation behind an Azure App Service with a Java host. This saves you a lot of steps mentioned above! You can find the scripts for it on [GitHub](https://github.com/vanderby/SonarQube-AzureAppService) or deploy it from the big `deploy on Azure` button. 

![](/images/20190429/vikram-sundaramoorthy-1351879-unsplash.jpg)
<a style="background-color:black;color:white;text-decoration:none;padding:4px 6px;font-family:-apple-system, BlinkMacSystemFont, &quot;San Francisco&quot;, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Roboto, Noto, &quot;Segoe UI&quot;, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1.2;display:inline-block;border-radius:3px" href="https://unsplash.com/@vikram46?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge" target="_blank" rel="noopener noreferrer" title="Download free do whatever you want high-resolution photos from vikram sundaramoorthy"><span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-2px;fill:white" viewBox="0 0 32 32"><title>unsplash-logo</title><path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path></svg></span><span style="display:inline-block;padding:2px 3px">Photo by Vikram Sundaramoorthy</span></a>

Several benefits you get from hosting SonarQube on an App Service:
* You don't have to manage a Virtual Machine anymore.
* Setting up SSL becomes easier, thanks to the Azure App Service SSL being simpler (and free if you run on `*.azurewebsites.net`).
* Using a KeyVault for your secrets is now an option, you can inject those values as environment options.
* If you already have an App Service Plan, you can use that for hosting and cut down on your resources and cost (although, running on a burstable VM isn't that expensive)

The biggest benefit is that the App Service already has Java installed! So no more downloading the JRE by hand, installing it manually and starting the SonarQube service by hand! 

Setting up a new SonarQube server this way is a breeze. Updating it should be easier as well and that is the another big plus: you now have the ability to run the installation on a [Deployment Slot](https://docs.microsoft.com/en-us/azure/app-service/deploy-staging-slots), let it update the database and then switch to the slot. No manual updating anymore! 

# Set up
After creating the basic SonarQube App Service from GitHub or the ARM template, you need to create a new SQL database. Do note that you need to set the database to the correct collation for it to work: `SQL_Latin1_General_CP1_CS_AS`. Next, create a new SQL user by running this on the `Master` Database:
``` sql 
CREATE LOGIN SonarQubeUI WITH password='<make a new secure password here>';
```
Then create a login from the new user account by running this statement `on the new database`:
``` sql
CREATE USER SonarQubeUI FROM LOGIN SonarQubeUI 
```

Copy these settings for next use:
* SQL Server address (`mysqlserver.database.windows.net`)
* DatabaseName
* MSSQL Username and password

## App Service update
In the [Azure Portal](portal.azure.com), find your new App Service and navigate to Advanced Tools --> Kudu   
![Advanced tools](/images/20190429/2019-04-29-01_AdvancedTools.png)  

Open a debug console:  
![](/images/20190429/2019-04-29-02-Kudu%20Services.png)  

And navigate to the configuration folder of your SonarQube and open the file sonar.properties.
``` dos
D:\home\site\wwwroot\sonarqube-7.7\conf>
```

Update these properties:
```dos
sonar.jdbc.username=SonarQubeUI
sonar.jdbc.password=<your sql server user password>
sonar.jdbc.url=jdbc:sqlserver://mysqlserver.database.windows.net:1433;databaseName=SonarQubeDb
```
Note the portnumber and the property of `databaseName` instead of `database` (this was changed in SonarQube > 5.3). 
Also note that the database name your enter is CASE-SENSITIVE! SonarQube is running on Java, hence the sensitivity.

# Azure Active Directory

Setting up authentication for the users with Azure Active Directory is very easy, thanks to the work of the [ALM Rangers](https://www.almdevopsrangers.org/). 

Follow the setup [here](https://github.com/hkamel/sonar-auth-aad/wiki/Setup)  

Do note the Server base URL in SonarQube, I missed it the first time. By default, this is empty! Go to `Administration`, `Configuration`, `General` --> `Server base URL`.