---
layout: post
title: "VSTS Bulk Change WorkItemType"
date: 2018-02-23
---


## Update proces templates
Recently I had a customer request to update their process definition in Visual Studio Team Services (VSTS). They had 30+ different processes migrated from TFS (Team Foundation Server), so they were all Hosted XML processes.  

Somehow they had the process setup like this:  

- Epic --> Product Backlog Item

Which they requested me to convert to this:

- Epic --> Feature --> Product Backlog Item

In TFS you would grab [witadmin](https://docs.microsoft.com/en-us/vsts/work/customize/reference/witadmin/witadmin-customize-and-manage-objects-for-tracking-work?WT.mc_id=DOP-MVP-5003719) and change the process in a pretty straigthforward manner (once you've figured out all places you need to update!).
Unfortunately, you cannot run the change commands in witadmin against VSTS, only the list and export commands will work: see [here](https://docs.microsoft.com/en-us/vsts/work/customize/reference/witadmin/witadmin-import-export-categories?WT.mc_id=DOP-MVP-5003719). Microsoft is working on a REST api to perform administrative tasks against VSTS. Luckily for me, they have also wrapped the REST calls in a nice C# NuGet package ([link](https://www.nuget.org/packages/Microsoft.TeamFoundationServer.Client/))! 

Making changes to the process template isn't available (yet?), although there is a strange method available named 'UpdateWorkItemTypeDefinitionAsync' in the 'WorkItemTrackingClient'. The only info I can find about this is [here](https://asyoulook.com/computers%20&%20internet/rest-usage-updateworkitemtypedfeinition-how-to/259543), which seems to indicate that you can only update (maybe add) a specific Work Item Type.   Since I also needed to update the tree structure in the ProcessConfiguration.xml file, I still need to export the process, make the necessary changes in the xml files, zip it back up and upload the file back into VSTS.

![VSTS screenshot](/images/20180226_01.png)

## Updating work items to the new type
After doing so, the request was to convert **all** the old Epics to the new Features. Off course, you can do this by using a query on the Epic work item type and using the UI to change them to Features, but this would take a lot of manual actions to do.

Luckily  you can do this with the [TeamFoundationServer.Client](https://www.nuget.org/packages/Microsoft.TeamFoundationServer.Client/) NuGet package! When you start looking into this, I can highly recommend using Microsofts Github repo containing a lot of samples [here](https://github.com/Microsoft/vsts-dotnet-samples).  

It took me some figuring out to get a good workflow in an application, so I have made the tools source available on my [github account](https://github.com/rajbos/VSTSClient).      