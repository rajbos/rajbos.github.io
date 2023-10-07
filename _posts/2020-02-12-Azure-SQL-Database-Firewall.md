---
layout: post
title: "Azure SQL Database Firewall"
date: 2020-02-12
---

Did you know you have more than one option to set the SQL firewall settings on an Azure SQL Database? Most people know you can set firewall rules on the **server** level:

![Firewall rules on the database level](/images/2020/20200212/2020/20200212_01_ServerFirewallRules.png)

## Example settings
![Example of Firewall rules on the server level](/images/2020/20200212/2020/20200212_01_ServerFirewallRulesExample.png)

##### Do note that toggling the setting for `Allow Azure services and resources to access this server` opens up connection from **anywhere** inside of the Azure Cloud: this is not limited to your own subscription!

# Firewall settings on the database level
There is one extra option, which is very helpful if you want more control per database, instead of opening the firewall for all databases on the same server.

You can set the firewall rules on the database level as well! These will be checked after the server level settings, so you can mix and match.

Do note that the server level settings are evaluated **after** the database level settings have been checked. So if you have deleted an IP-address from the database level but it is still active on the server level, the IP-address can still access the database. See the docs [here](https://docs.microsoft.com/en-us/azure/azure-sql/database/firewall-configure#server-level-versus-database-level-ip-firewall-rules?WT.mc_id=AZ-MVP-5003719) for more information.

There is no editor available, you'll need to edit the settings in the database itself, for example with the Query editor or through a query or table editor with the SQL Server Management Studio or Azure Data Studio
![Firewall rules on the database level](/images/2020/20200212/2020/20200212_02_DatabaseFirewallRules.png)

You can use the table `sys.database_firewall_rules` to find the current settings and then use the stored procedures
[sp_set_database_firewall_rule](https://docs.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-set-database-firewall-rule-azure-sql-database?view=azuresqldb-current&WT.mc_id=AZ-MVP-5003719) to set a rule or [sp_delete_database_firewall_rule](https://docs.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-delete-database-firewall-rule-azure-sql-database?view=azuresqldb-current?WT.mc_id=AZ-MVP-5003719) to delete them.

## Opening up the connection for Azure Cloud resources
To open the connection from other Azure resources (note: not limited to **your** subscriptions), you can toggle the setting for IP-address `0.0.0.0`.

### Other options
You can set the server level firewall rules with the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/sql/server/firewall-rule?view=azure-cli-latest&WT.mc_id=AZ-MVP-5003719), with a login on the [master database](https://docs.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-set-firewall-rule-azure-sql-database?view=azuresqldb-current&WT.mc_id=AZ-MVP-5003719) or through [PowerShell](https://docs.microsoft.com/en-us/azure/sql-database/sql-database-firewall-configure#server-level-versus-database-level-ip-firewall-rules?WT.mc_id=AZ-MVP-5003719).
For database level, your only option is the SQL statements.