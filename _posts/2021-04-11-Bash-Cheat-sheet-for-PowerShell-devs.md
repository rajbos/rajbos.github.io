---
layout: post
title: "Bash cheat-sheet for PowerShell devs"
date: 2021-04-11
tags: [PowerShell, Bash, cheat, sheet, developers]
---

Coming from years of Windows dev experience to using a Bash shell took a while to know some of the differences between the two. Since I often still run into these things, I thought it would help me and perhaps other people as well if I wrote some of it down. I suspect this will be a work in progress, so this page will receive some updates over time 😁.

# Working with variables
Working with variables is a bit different in Bash. Setting a variable is done by using its name:
* if it doesn't exists, it will be created
* if it already exists, its value is updated

### Set variable example
``` sh
myVar=12
```

### Using the variable example:
To use the variable, you need to add the $ sign in front of it. This means you want to use the value in the variable.
Watch out though! The shell will try to execute whatever is in the variable. So using the same command you are used to in PowerShell will not work:
``` sh
$myVar # error here: the shell wants to execute the value in the variable, which is 12 in this case.
```

**Example and output:**
In order to set the variable and then echo it's value to the prompt, you can use this setup:
``` sh
myVar=12
echo "$myVar" # handle the value as a string and output it
```

![Variables example results](/images/2021/20210411/2021/20210411_Variables.png)

# String interpolation in Bash
String interpolation works differently as well. Injecting the variable into a string using double quotes will interpret it and inject the value in to the string:
``` sh
echo "this is my value $myVar" # this wil inject the value of myVar as a string
```

Wrapping the string in single quote will inject *the object* into the string and not the value:
``` sh
echo "this is my value $myVar" # this wil inject the object myVar
```
Especially when someone is using the single quotes in a script, this has bitten me once or twice: it took some time to figure out why my value wasn't visible.

![String interpolation results](/images/2021/20210411/2021/20210411_StringInterpolation.png)

# Fileheaders
Add a file header (first line) to the file contents to indicate how the shell should run this file. Example:
``` sh
#!/bin/sh
```

This will indicate it needs to feed this file to the `sh` command inside the `bin` folder.
It will be used when you execute the file from the command line like this:
``` sh
.\myShellscript
```

# Outputting to a file
Sending some output to a file is similar to the use in PowerShell:
``` sh
"my string value" > myShellScript # this wil always create a new file and set its content
"my string value" >> myShellScript # this wil add the string to its content
```
The thing that always gets me, is that dang string interpolation difference:

![Output of this example](/images/2021/20210411/2021/20210411_NewFile.png)

# cls command
In bash there is no cls command shortcut. Always use `clear` to have the same result.

# LastExitCode and returning it from a script
Just like in PowerShell you can use `$?` to check the last exit codes. In the example below I'm deploying a CDK stack to AWS (Infrastructure as code).
And saving the exit code of the npm command so I can check it, log it and return it to the caller of this shell script.

```
npm --silent run cdk -- deploy --require-approval never --context env=${env} --context tag=${TAG} ${stack_name}
exitCode=$?
if [ $exitCode != "0" ]
then
  echo "NPM deploy cdk step failed: $exitCode"
  exit $exitCode
fi
```