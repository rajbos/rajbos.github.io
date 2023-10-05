---
layout: post
title: "Writing to the $GITHUB_STEP_SUMMARY with the core npm package"
date: 2023-06-08
tags: [GitHub, GITHUB_STEP_SUMMARY, GitHub Actions, Summary, Typescript]
---

Every time I need to write to the GITHUB_STEP_SUMMARY in GitHub Actions from the [actions/github-script](https://github.com/actions/github-script) action (or from Typescript), I need to search for the [blogpost that announced](https://github.blog/2022-05-09-supercharging-github-actions-with-job-summaries/) it's existence. So I'm writing this blogpost to make it easier for myself to find it a lot easier, including some working examples.

![Photo of around 20 white puzzle pieces against a white background](/images/2023/20230608/markus-winkler-aYPtEknQmXE-unsplash.jpg)  
##### Photo by <a href="https://unsplash.com/@markuswinkler?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Markus Winkler</a> on <a href="https://unsplash.com/photos/aYPtEknQmXE?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

The code for the summaries lives in the [actions/core](https://github.com/actions/toolkit/blob/main/packages/core/src/summary.ts) package on npm, but figuring out how to use it can be a bit hard. The only example I've seen is in the blogpost I mentioned.

``` typescript
  import * as core from '@actions/core' 
  
  await core.summary
  .addHeading('Test Results')
  .addCodeBlock(generateTestResults(), "js")
  .addTable([
    [{data: 'File', header: true}, {data: 'Result', header: true}],
    ['foo.js', 'Pass ✅'],
    ['bar.js', 'Fail ❌'],
    ['test.js', 'Pass ✅']
  ])
  .addLink('View staging deployment!', 'https://github.com')
  .write()
```

This does a lot of things at the same time, but we get the general idea that you can:
* add headings
* add code blocks
* add tables
* add links
And at the end you need to write the summary itself, which will be added to the file in the GITHUB_STEP_SUMMARY environment variable.

## Working with the table output
There are no methods to break the table into chunks, like:
1. Add a header
1. Add a row

The only method there is, is adding the table in one go, with each row as an array of objects, and some configuration in the first row as that will define if the cell is a header or not. So assuming you have an array of results that you want to show, you can convert that array with properties into an array of rows, with each property value being an item in the row array.

The interesting thing I ran into, is that the row cells **must be a string**. Sending in integers for example does not work.
Take the following example:

``` typescript
await core.summary
            .addHeading('Example')
            .addTable([
                        [{data: 'Topic', header: true}, {data: 'Count', header: true}, {data: 'Public', header: true}],
                        ['foo.js' , "1", "2"],
                        ['bar.js' , '3', '4'],
                        ['test.js', 100, 200]
                      ])
            .write()
```
In this example, all rows will be added to the summary, and as long as the content is a valid string, it will be shown in the table as well. In this example, the values in the last row are integers, and they will be not visible in the table.

![Screenshot of the table output, with the integer values missing in the last row](/images/2023/20230608/20230608_ExampleOutput.png)  

A full example of creating the header array with hardcoded cells, and then adding the rows from an array of objects can be seen below. Here I have an array stored as output in a previous step, so I read that file and map it (as string values!) to an array containing the rows.
The next step is to join the two arrays (header + summary) and pass that to the addTable method.

``` yaml
- name: Show information in the GITHUB_STEP_SUMMARY
    uses: actions/github-script@v6
    env:
    summaryFile: ${{ steps.get-repo-info.outputs.summary-file }}
    with: 
    script: see below in other markup for better readability
```

``` typescript
        const fs = require('fs')
        const summary = fs.readFileSync(process.env.summaryFile, 'utf8')

        // make the heading array for the core.summary method
        const headingArray = [{data: 'Topic', header: true}, {data: 'Count', header: true}, {data: 'Public', header: true},{data: 'Internal', header: true},{data: 'Private', header: true}]
    
        // convert the summary array into an array that can be passed into the core.summary method
        const summaryArray = JSON.parse(summary).map(t => [t.name, t.count.toString(), t.public.toString(), t.internal.toString(), t.private.toString()])

        // join the two arrays
        const tableArray = [headingArray, ...summaryArray]

        await core.summary
                .addHeading(`Topics used on repos in the [${process.env.org}] organization`)
                .addTable(tableArray)
                .write()
```

# Writing raw text to the summary
If you want to add some lines of text to the summary with this, then let me save you some time on figuring this out (writing this for a friend 🙈):  
You are writing the raw text as **Markdown**, which I often forget. That means that everything has a meaning, especially after a header! 

Here is an example of some of my logging:. The end of lines are also needed!
``` typescript
    await core.summary.addHeading("Repo info")
                      .addRaw(``).addEOL()
                      .addRaw(`Total repos: ${repos.length}  `).addEOL()
                      .addRaw(`Large repos: ${largerRepoCount}  `).addEOL()
                      .addRaw(`Gitattributes: ${largerRepoHasGitAttributes}  `).addEOL()
                      .write()
``` 
