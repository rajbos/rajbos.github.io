---
layout: post
title: "GitHub Models and Inference API"
date: 2024-09-29
tags: [GitHub, GitHub Models, Azure OpenAI]
---

Need to use the Azure Inference AI SDK in Python against Azure OpenAI? Then this tip is for you! I ran into an issue converting the default examples to not run against GitHub's Model endpoint but against an Azure OpenAI endpoint. 
The code example below says it all: configure your credential the correct way to get this to work.

``` python

import os
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential

# Set the runtime to "GITHUB" if you are running this code in GitHub 
# or something else to hit your own Azure OpenAI endpoint
runtime="AZURE"
client = None
if runtime=="GITHUB":
    print("Running in GitHub")
    token = os.environ["GITHUB_TOKEN"]
    ENDPOINT = "https://models.inference.ai.azure.com"

    client = ChatCompletionsClient(
    endpoint=ENDPOINT,
    credential=AzureKeyCredential(token),
)
else:
    print("Running in Azure")
    token = os.environ["AI_TOKEN"]
    ENDPOINT = "https://xms-openai.openai.azure.com/openai/deployments/gpt-4o"

    client = ChatCompletionsClient(
        endpoint=ENDPOINT,
        credential=AzureKeyCredential(""),  # Pass in an empty value here!
        headers={"api-key": token}, # Include your token here
        #api_version="2024-06-01"  # AOAI api-version is not required
    )
```
