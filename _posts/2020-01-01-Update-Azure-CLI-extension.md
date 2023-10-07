---
layout: post
title: "Update Azure CLI Extensions"
date: 2020-01-09
---

After getting a message that a command I wanted to use was not available in my local installation, I needed to update an Azure CLI extension. Finding that information was scattered around the internet, and took me to long to find. So for future reference, I'll document it here 😄. Should be way easier to find next time 🙈.

If you know the name of the extension, you can find it version by using the show command:
```
az extension show --name azure-devops --output table
```

In the result you can find out the version that you have installed:
![Powershell output of the command showing the version number](/images/2020/20200109/2020/20200109_01_ExtensionShowVersion.png)

If you don't know the name of the extension you can list ALL extensions and try to find it.
For example I didn't know the name of the Azure DevOps extension: the command always is `az devops ***`, but the extension **name** is `azure-devops`. I understand why they kept the command name short, but you need to know how to look and where to figure out what is going on.

``` powershell
 az extension list-available --output table
```

You can then update the extension with the following command.

 ```
 az extension update --name azure-devops
 ```

 Do note, that the command will tell you nothing that displays if the update was successful or not! Apparently the decision was made to not show you any feedback during default execution. If you want more information, you can add `--verbose` to the end of the command.

### Updating the Azure CLI itself
 Do note, that you cannot update the CLI itself by using any commands for it. You need to download and install the latest version from [Microsoft](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest&WT.mc_id=AZ-MVP-5003719).