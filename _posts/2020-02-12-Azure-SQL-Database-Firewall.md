---
layout: post
title: "Azure SQL Database Firewall"
date: 2020-02-12
---

Did you know you have more than one option to set the SQL firewall settings on an Azure SQL Database? Most people know you can set firewall rules on the **server** level:

![Firewall rules on the database level](/images/20200212/20200212_01_ServerFirewallRules.png)  

## Example settings
![Example of Firewall rules on the server level](/images/20200212/20200212_01_ServerFirewallRulesExample.png)  

##### Do note that toggling the setting for `Allow Azure services and resources to access this server` opens up connection from **anywhere** inside of the Azure Cloud: this is not limited to your own subscription!

# Firewall settings on the database level
There is one extra option, which is very helpful if you want more control per database, instead of opening the firewall for all databases on the same server. 

You can set the firewall rules on the database level as well! These will be checked after the server level settings, so you can mix and match. 

There is no editor available, you need to edit the settings in the database itself, for example with the Query editor or through a query or table editor with the SQL Server Management Studio or Azure Data Studio
![Firewall rules on the database level](/images/20200212/20200212_02_DatabaseFirewallRules.png)  

## Opening up the connection for Azure Cloud resources
To open the connection from other Azure resources (note: not limited to **your** subscriptions), you can toggle the setting for IP-address `0.0.0.0`.