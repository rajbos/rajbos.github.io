---
layout: post
title: "Using Azure CLI with PowerShell: error handling explained"
date: 2019-07-12
---

I found myself searching the internet again on how to use the Azure CLI from PowerShell so that I can use it in Azure Pipelines to create new Azure resources. The reason I want to do this with PowerShell is twofold:

1. Azure Pipelines has a task for using the Azure CLI, but this only has the options to use the command line (.cmd or .com files), or from bash (.sh). I don't like them that much, I want to use PowerShell (Personal preference)!
1. Running the Azure CLI from PowerShell has the issue that it was not created specifically for use with PowerShell. You'll need to do some extra work.

I've fixed it before, but it took a while to find it again. That is why I am documenting it here, to save me some yak shaving in the future.

![Yak to shave](/images/20190712/Yak.jpg)

## The issue in PowerShell
Running this Azure CLI command in PowerShell will result in an error, because storage accounts cannot have a dash in the name:
```powershell
$StorageAccountName = "testRb-001"
$ResourceGroup = "myResourceGroup"
$location = "westeurope"
az storage account create -n $StorageAccountName -g $ResourceGroup -l $location --sku Standard_LRS
```

Result:  
![Error displayed in PowerShell](/images/20190712/20190712_02_Error.png)  

Seems like an error, what's the issue then?  
Well, adding error handling like you'd expect from PowerShell will not work!  

```powershell
$StorageAccountName = "testRb-001"
$ResourceGroup = "myResourceGroup"
$location = "westeurope"
try {
  az storage account create -n $StorageAccountName -g $ResourceGroup -l $location --sku Standard_LRS
  Write-Host "Just continues"
}
catch {
    Write-Host "An error occurred!"
}
```

You can see that PowerShell doesn't notice the error and just continues:  
![Error handling will not do anything with the error](/images/20190712/20190712_03_ErrorHandling.png)  

Even adding -ErrorAction will not work. 

## How to add error handling yourself
The Azure CLI runs on JSON: it will try to give you JSON results on every call, so we can use that to see if we got any data back from the call. After converting the result, we can test to see if it has data:  
  
```powershell
$StorageAccountName = "testRb-001"
$ResourceGroup = "myResourceGroup"
$location = "westeurope"
$output = az storage account create -n $StorageAccountName -g $ResourceGroup -l $location --sku Standard_LRS | ConvertFrom-Json
if (!$output) {
    Write-Error "Error creating storage account"
    return
}
```

Do remember to wrap **every** call you need to run with this setup, and return to prevent PowerShell to continue with the next statement.  

Writing the error to the output helps with:
1. Displaying the error correctly
1. Blocking the release in Azure DevOps, which is were I needed this the most.

![](/images/20190712/20190712_04_ErrorHandlingCorrectly.png)  

### Why am I using the Azure CLI?
After posting this, I got asked why I am using the CLI to do this at all? Surely, Azure PowerShell or ARM Templates would be sufficient.

Here is why:
1. Azure PowerShell is not idempotent, so not so great to use in Azure Pipelines.
1. CLI is much terser than ARM, although it feels like you need to do a little more work, linking resources together.
1. Read [Pascal Naber](https://twitter.com/pascalnaber) 's post: [Stop using ARM templates! Use the Azure CLI instead](https://pascalnaber.wordpress.com/2018/11/11/stop-using-arm-templates-use-the-azure-cli-instead/).
1. I am looking into doing this with [Terraform](https://www.terraform.io/), because the declaration is a lot shorter as well. It is a new paradigm to learn, and needs installation in your Azure Pipeline. The CLI was already available. 

## Why not use bash?
The reasons for not using bash is that:
1. It will not work on a Windows Azure Pipelines Agent (and that is what I am using here).
1. You need to include [JQ](https://stedolan.github.io/jq/) as a library to be able to parse the JSON. This seems like extra work to me. I also find the JQ syntax not that straightforward.

Here is a shell example to make sure you are connected to the correct [Azure](https://azure.com) Subscription, to be complete:

```shell
# Switch to the correct subscription
az account set --subscription ${SUBSCRIPTION_ID}
output=$(az account show | jq '.')
[[ -z "$output" ]] && printf "${FAILURE}Error using subscriptionId, halting execution${NEUTRAL}\n" && exit 1

subscriptionId=$(echo $output | jq -r '.id')
```