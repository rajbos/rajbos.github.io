---
layout: post
title: "Setting up Azure Monitor to trigger your Azure Function"
date: 2019-01-21
---

I wanted to trigger an Azure Function based on changes in the Azure Subscription(s) we where monitoring. The incoming data can than be used to do interesting things with: keeping track of who does what, see new resources being deployed or old ones being deleted, etc. Back when I started working on this, there was no [Event Grid](https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-event-grid?WT.mc_id=AZ-MVP-5003719) option to use in Azure Functions, so I started with linking it to [Azure Monitor](https://docs.microsoft.com/en-us/azure/azure-monitor/overview?WT.mc_id=AZ-MVP-5003719) events. I haven't checked the current options, so I cannot compare them yet. 

In this blog I wanted to show how you can do this, both by using the Azure Portal and the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/?view=azure-cli-latest&WT.mc_id=AZ-MVP-5003719).

## Architecture
To get [Azure Monitor](https://docs.microsoft.com/en-us/azure/azure-monitor/overview?WT.mc_id=AZ-MVP-5003719) to send in the changes that we need to see, I use this architecture:  
![](/images/2019_01_21_Azure_Monitor_Architecture.png)

## Steps
To configure Azure Monitor to send all activities into an EventHub and then into our Function, you'll need to execute several steps.

1. Create a new event hub
1. Configure the Activity Monitor to send the changes into the event hub
1. Configure the Event Hub to send the messages to the changes function

# Use the Azure Portal 
How to do this manually via the Azure Portal is described below.

### Create a new event hub to send the Activity Log to:
![](/images/2019_01_21_Azure_Monitor_CreateEventHub.png)  
The default setting of 1 throughput unit is enough for this setup, as mentioned by Microsoft's documentation.

### Create the export of the Activity Log

Go to Activity Log, hit the `export` button: 
 
![](/images/2019_01_21_Azure_Monitor_Activity_log_Configuration.png)  

 **PICK ALL REGIONS!!** Most activities we want to see are GLOBAL and those would be missed otherwise.

![](/images/2019_01_21_Azure_Monitor_LinkEventHubToActivityLogExport.png)

## Configure the event hub to send the messages to the Azure Function
Choose the EventHub entity you picked for the Azure Monitor to export the activities to:  
![](/images/2019_01_21_Azure_Monitor_EventHubChooseHub.png)

You can add a consumer group to it, named '$default` by default.

### Get the Access Policy
Go to `Shared Access Policies` and create a policy. We only need to have the `Listen` rights so we can listen to incoming events.  
![](/images/2019_01_21_Azure_Monitor_EventHubAccessPolicy.png)  

Copy either on of the `Connection strings` and configure the Azure Function host with it:

![](/images/2019_01_21_Azure_Monitor_AzureFunctionEventHub.png)  

No need to restart the function app: the platform does that for you.

# Use the Azure CLI
How to do this via the Azure CLI is described below.

## Step 1: Create an Event Hub
First we need to check if there already is an Event Hub and if we could use it. Use these commands to list the available namespaces in the current subscription:

``` powershell
az login # login with an account that has the correct access rights to deploy resources on subscription level 
az eventhubs namespace list
```

To search for the namespaces in a specific resource group and subscription, you can also add those parameters:
``` powershell
$resourceGroup = "<resourceGroupName>"
$subscription = "<subscriptionId>"
az eventhubs namespace list --resource-group $resourceGroup --subscription $subscription
```

You'll get back `[]` as an empty JSON array indicating that there are no namespaces in that list.

If there is an existing namespace, you can use that to create the Log Profile with. Of course, you'll need to check how this namespace is being used and where it sends the messages! 

### Create a new namespace with the CLI
Use this command to create a new namespace:

``` powershell
az eventhubs namespace create --resource-group $resourceGroup --subscription $subscription --name EventHubNameSpaceCLI
```

This will take a couple of minutes to complete and will return the newly created namespace. You can save the JSON response in an object with this command:

``` powershell
$namespace = az eventhubs namespace show --resource-group $resourceGroup --subscription $subscription --name EventHubNameSpaceCLI | ConvertFrom-JSON
```

### Create a new EventHub in the namespace
``` powershell
$eventhub = az eventhubs eventhub create --subscription $subscription --resource-group $resourceGroup --namespace-name $namespace.Name --name EventHubCLI | ConvertFrom-Json
```

### Create a new authorization rule in the EventHub
To be able to connect to the new EventHub, we need an authorization rule. That will have an Id that will be used as a connection string. 
``` powershell
$ruleName = "<authorization rule name>"
$rule = az eventhubs eventhub authorization-rule create --resource-group $resourceGroup --namespace-name $namespace.Name --eventhub-name $eventhub.Name --subscription $subscription --name ListenRule --rights Listen | ConvertFrom-Json
# The Id of the rule that you need:
$rule.Id
```

## Step 2: Create an Azure Monitor Log Profile

### Reconnaissance
First, connect the CLI and check if there already is a profile available
``` powershell
az login # login with an account that has the correct access rights to deploy resources on subscription level 
az monitor log-profiles list # list the current log-profiles
``` 
Note: this will run against the currently selected (or default) subscription.
You could get one of two results: 

1. No profile set for this subscription: `[]`
2. There already is a profile for this subscription:  
![](/images/2019_01_21_Azure_Monitor_AzureMonitorExportProfile.png)

If there already is a profile, carefully read through the results to see if it contains everything we need.  
*Note*: there can only be one profile per subscription. If there is only one subscription with a profile and that is set to export to the correct EventHub, that is fine.
From top to bottom this is the information you see in the image above:
* Profile categories: We needs all of these, so if necessary, add the missing categories.
* The SubscriptionId for this profile
* The locations for which this profile will export activities. We needs at least Global and the regions that your resources have been deployed to.
* The ServiceBusRuleId will indicate the namespace and authorization rule the activities will be send to. The name of this setting comes from the fact that EventHubs are build on top of Azure ServiceBusses. We needs this to be set correctly to send the activities to the EventHub that the function will listen to.
* The StorageAccount indicate if this profile also exports the activities to a StorageAccount. This can be used for accountability reporting for instance: it contains all the information to find out what account executed what actions within the Azure Subscription.

## Existing profile
If there already is an export configured to a Storage Account (but no ServiceBusRuleId), you can check the locations and categories, if those are sufficient, you can update the profile to also have a ServiceBusRuleId set to send the data into the EventHub you need.

If the locations or categories are **not** sufficient, you need to check the Storage Account that is being used if to see if it hurts if you send more information there. This depends on the setup that is used on top of that information.

### Cannot update the existing profile?
If changing this profile is an issue, you are toast. You can create a new profile on a different subscription, but all activities on the default subscription will only be sent to the profile on that subscription!

## No profile
If there is no profile setup, you can create a new profile with the necessary settings like this:  
``` powershell
az monitor log-profiles create --name "default" --location null --locations "global" "eastus" "westus" "westeu" "northeu" --categories "Delete" "Write" "Action"  --enabled true --days 1 --service-bus-rule-id "/subscriptions/<subscriptionId>/resourceGroups/<resourceGroupName>/providers/Microsoft.EventHub/namespaces/<nameSpaceName>/authorizationrules/RootManageSharedAccessKey"
```
Important parameters for us:
* Locations: the locations you want to send the activities for: always include `global`
* Categories: what are the activity categories you want to receive?
* Service-bus-rule-id: the EventHub rule to send the activities to.

### Finding the service bus rule
``` powershell
az login # login to the account
az account set --subscription "<SubscriptionId you want to use>" # switch to the correct subscription
$resourceGroup = "<resource group name>" # name of the resourcegroup the EventHub is in
az eventhubs namespace list -g $resourceGroup # list all the eventhub namespaces in the given resourcegroup
```
Find the name of the namespace you want to use and use that in the next set of commands   
``` powershell
$EventHub = az eventhubs namespace show -g $resourceGroup --name "<name of the namespace>" | ConvertFrom-Json
az eventhubs eventhub list -g $resourceGroup --namespace-name $EventHub.Name
```

Find the name of the event hub in the list and use that in the next set of commands:
``` powershell
$NameSpace = az eventhubs eventhub show -g $resourceGroup --namespace-name $EventHub.Name --name "<name of the eventhub>" | ConvertFrom-Json
# find all authorization rules
az eventhubs eventhub authorization-rule list --resource-group $resourceGroup --namespace-name $NameSpace.Name --eventhub-name $EventHub.Name
$AuthRule = az eventhubs eventhub authorization-rule show --resource-group $resourceGroup --namespace-name $EventHub.Name --eventhub-name $NameSpace.Name | ConvertFrom-Json
# search for the rule with the name you want
$ruleName = "<authorization rule name>"
$rule = az eventhubs eventhub authorization-rule show --resource-group $resourceGroup --namespace-name $NameSpace.Name --eventhub-name $EventHub.Name --name $ruleName | ConvertFrom-Json
```

## Linking the EventHub connection to the Azure Function
The Azure Function needs to be told about the connection to the EventHub that it needs to listen on. For that, you need the Id of the authorization rule that we created in the previous section.

You can retrieve that Id from the rule we saved:
``` powershell
# The Id of the rule that you need:
$rule.Id
```

And then you can set that into the corresponding app setting for it:
``` powershell
az functionapp config appsettings set --resource-group $resourcegroup --name $functionapp --settings EventHubConnectionAppSetting=$rule.Id
```
The name of the setting we are changing here (`EventHubConnectionAppSetting`) needs to match the name of the Connection you gave the parameter on the function:

``` c#
[FunctionName("EventHubActivitiesFunction"))]
        public static async Task Run(
            [EventHubTrigger("insights-operational-Logs", Connection = "EventHubConnectionAppSetting")]
            EventData eventHubMessage,
            ILogger log)
        { ... }
```

For more documentation about the Event Hub binding, check [docs.microsoft.com](https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-event-hubs?WT.mc_id=AZ-MVP-5003719).