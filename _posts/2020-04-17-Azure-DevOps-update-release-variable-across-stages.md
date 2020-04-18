---

layout: post
title: "Azure DevOps: Update release variables across stages"
date: 2020-04-17
---

In Azure DevOps I needed to determine a variable in one deployment stage, and use it in another. I remember finding and implementing this solution before but couldn't figure out how I did things, so this post is for me to find it easier next time 😉.

For example, in a stage I want to set a variable with the name `ReleaseVariableName` to a value. Searching online points you to an example on how to do this with for example the PowerShell command below. You first create a variable in the variable tab and then set/overwrite its value:
```powershell
Write-Host "##vso[task.setvariable variable=ReleaseVariableName;]Value1.0"
```
#### Note that you don't necessarily need to create variable, Azure DevOps does that for you. But it helps in figuring out what is happening later on.

![Image of sandlike waves](/images/20200417/melissa-guzzetta-IYh4J2zp4sk-unsplash.jpg)
##### <a style="background-color:black;color:white;text-decoration:none;padding:4px 6px;font-family:-apple-system, BlinkMacSystemFont, &quot;San Francisco&quot;, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Roboto, Noto, &quot;Segoe UI&quot;, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1.2;display:inline-block;border-radius:3px" href="https://unsplash.com/@mguzz?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge" target="_blank" rel="noopener noreferrer" title="Photo from Melissa Guzzetta"><span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-2px;fill:white" viewBox="0 0 32 32"><title>unsplash-logo</title><path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path></svg></span><span style="display:inline-block;padding:2px 3px">Photo from Melissa Guzzetta</span></a>

## The issue
Testing the code above will prove that this works, but that the variable values are reset in a new Agent Job or another Stage. This stems from the fact that each job or stage can be run on a different Agent (and even in parallel) and that the values are not synced across.

# The fix: use the REST API for Azure DevOps
The only way I found to update the variable value is to use the REST API for Azure DevOps, find the current release we're in and then overwrite the variable value there. Then the next Stage / Job will pick up the new value and you can continue. 

##### Do note that this updated value will not be available with this in the *same stage* as you're updating it in! Handle that separately.

```powershell
#region variables
$ReleaseVariableName = 'StageVar'
$releaseurl = ('{0}{1}/_apis/release/releases/{2}?api-version=5.0' -f $($env:SYSTEM_TEAMFOUNDATIONSERVERURI), $($env:SYSTEM_TEAMPROJECTID), $($env:RELEASE_RELEASEID)  )
#endregion

#region Get Release Definition
Write-Host "URL: $releaseurl"
$Release = Invoke-RestMethod -Uri $releaseurl -Headers @{
    Authorization = "Bearer $env:SYSTEM_ACCESSTOKEN"
}
#endregion

#region Output current Release Pipeline
Write-Output ('Release Pipeline variables output: {0}' -f $($Release.variables | ConvertTo-Json -Depth 10))
#endregion

#region Update StageVar with new value
Write-Host "Updating release variable with name [$(ReleaseVariableName)] with new value [$(ReleaseVariableValue)]"
$release.variables.$(ReleaseVariableName).value = "$(ReleaseVariableValue)"
#endregion

#region update release pipeline
Write-Output ('Updating Release Definition')
$json = @($release) | ConvertTo-Json -Depth 99
Invoke-RestMethod -Uri $releaseurl -Method Put -Body $json -ContentType "application/json" -Headers @{Authorization = "Bearer $env:SYSTEM_ACCESSTOKEN" }
#endregion

#region Get updated Release Definition
Write-Output ('Get updated Release Definition')
Write-Host "URL: $releaseurl"
$Release = Invoke-RestMethod -Uri $releaseurl -Headers @{
    Authorization = "Bearer $env:SYSTEM_ACCESSTOKEN"
}
#endregion

#region Output Updated Release Pipeline
Write-Output ('Updated Release Pipeline variables output: {0}' -f $($Release.variables | ConvertTo-Json -Depth 10))
#endregion
```

*Note*: you will need to set the Job you are running this in to have access to the OAuth Access Token:  

![OAuth Setting](/images/20200417/20200417_01_OAuthToken.png)  

## Even easier, download the Task Group definition
Making implementing this even easier, you can download my exported Task Group [here](\images\20200417\rajbos%20-%20Update%20Release%20Variable%20value%20across%20stages.json) and import it (after reviewing it for security issues of course!) into your own environment.

### Authorization for the Service account you are using
Good to note that you need `Manage Releases` with the service you are running the deployment pipeline with, otherwise you will run into an error like this:
```
VS402904: Access denied: User Project Collection Build Service (AzDoServiceAccountName) does not have manage releases permission. Contact your  release manager.
```

## Future Azure DevOps update
There is a new update for Azure DevOps on its way to make this even easier as noted by the Azure DevOps team [here](https://github.com/microsoft/azure-pipelines-tasks/issues/4743#issuecomment-614721900). You can see that the initial issues was created in 2017 and the solution is rolling out in 2020 😄.

# Update for yaml pipelines
After reading this blog post, Sebastian Schütze new about another way to fix this issue in a yaml pipeline: you have the option there to upload an artefact from the pipeline that can be downloaded in any subsequent stage/job. 

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Just created a new blog post: Variables Cross Stage in Azure DevOps with YAML <a href="https://twitter.com/hashtag/AzureDevOps?src=hash&amp;ref_src=twsrc%5Etfw">#AzureDevOps</a> <a href="https://twitter.com/hashtag/DevOps?src=hash&amp;ref_src=twsrc%5Etfw">#DevOps</a> <a href="https://twitter.com/hashtag/AzurePipelines?src=hash&amp;ref_src=twsrc%5Etfw">#AzurePipelines</a> <a href="https://twitter.com/hashtag/AzureDevOps?src=hash&amp;ref_src=twsrc%5Etfw">#AzureDevOps</a> <a href="https://twitter.com/hashtag/Cross?src=hash&amp;ref_src=twsrc%5Etfw">#Cross</a>-Stage <a href="https://twitter.com/hashtag/Variables?src=hash&amp;ref_src=twsrc%5Etfw">#Variables</a> <a href="https://twitter.com/hashtag/YAML?src=hash&amp;ref_src=twsrc%5Etfw">#YAML</a> AzureDevOps AzureDevOps <a href="https://t.co/CI94l1K8yG">https://t.co/CI94l1K8yG</a></p>&mdash; Sebastian Schütze 🚀☁️ (@RazorSPoint) <a href="https://twitter.com/RazorSPoint/status/1251537984366743553?ref_src=twsrc%5Etfw">April 18, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

You can read his post here: [www.razorspoint.com](https://www.razorspoint.com/2020/04/18/variables-cross-stage-in-azure-devops-with-yaml/).

## Recreation in Classic Pipeline
I wanted to check to see if I could replicate the behavior in a classic pipeline and it all seemed good: there is a Publish Pipeline Artifact task available that is meant just for cases like this.

![Screenshot of Publish pipeline artifact](/images/20200417/20200417_02_PublishPipelineArtefact.png)

[docs](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/utility/publish-pipeline-artifact?view=azure-devops&viewFallbackFrom=vsts)

You can then retrieve the file in the next stage/job and read it back in.... Or so was the plan:

![Screenshot of Publish pipeline artifact](/images/20200417/20200417_03_ReadPublishedPipelineArtefact.png)


![Screenshot of Publish pipeline artifact](/images/20200417/20200417_04_ErrorReadingPublishedPipelineArtefact.png)

The Upload Artifact task cannot be run in a release pipeline! 😠💩
It has been added to the [documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/utility/publish-pipeline-artifact?view=azure-devops&viewFallbackFrom=vsts), but why they then show the task as being available and all, is beyond me. There have been more people who want this to work, as you can find in this [GitHub issue](https://github.com/Microsoft/azure-pipelines-tasks/issues/8812).

There is an option to upload a file to the release pipeline, but then you cannot download it again:
```powershell
Write-Host "##vso[task.uploadfile]$($file.FullName)"
```
##### Note: you can then download this file with the logs for the release pipeline.