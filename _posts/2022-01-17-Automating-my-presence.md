---
layout: post
title: "Automating my home setup: turning on the lights when the camera is in use"
date: 2022-01-17
---

I have a nice working from [home setup](/blog/2021/05/13/home-setup) that allows me to use a great camera, lights and microphone. I have so many stuff, that I wanted to automate some of it to detect if I am working or not and then toggle them all on or of. 

I already use [Home Assistant](https://www.home-assistant.io/) to remotely toggle loads of stuff in the house, so why not integrate everything? 

![Photo of home office setup](/images/20210513/SetupUpdate2022.jpg)  

# Home Assistant Scenes
For this I have create some Home assistant scenes and a script to automate these actions. Next I want to toggle based on the state of things on my laptop.  

![Screenshot of home assistant scenes](/images/2022/20220117/20220117_homeassistant.png)   

## Scene 1 - Office lights
When this one is triggered, my office lights (small desk lamp), my 'Do Epic Shit' signal and my speakers will turn on: everything I need to start working (laptop and monitor have their own flow and can be considered as 'Always on'). I've set this up as with Shelly Plug S and an extension cord that powers all three devices. Wrapped it in a scene in Home Assistant together with my Elgato Light Strip for easy switching it on and off.

Devices:
- Shelly Plug S (extension cord, Speakers, Epic Shit signal)
- Elgato Light Strip

## Scene 2: Camera On (to be automated)
When the camera is on (I have two different ones to use), I switch on this scene to turn on the 2 Elgato Key Light Airs that I have, so that people can actually see me (check my blogpost on my setup here). When I am done with the call, I switch off the scene and the lights turn off.

Devices:
- Elgato Key Light Air Left
- Elgato Key Light Air Right

## Scene 3: Office Leave
When I stop working, everything I have automated needs to turn off again, so this scene switches of the desk lamp, the Light strip, the 'Do epic shit' signal, the speakers and the Key Lights.

Devices
- Shelly Plug S (extension cord, Speakers, Epic Shit signal)
- Elgato Light Strip
- Elgato Key Light Air Left
- Elgato Key Light Air Right

# Trigger - Starting to work
When I logon to my machine, I want to trigger the Office Lights & Speaker setup (Scene 1). For this I need to send the `Office Lights On` signal to Home Assistant. For this purpose it has a [REST API](https://developers.home-assistant.io/docs/api/rest/) that you can configure to securely send the signal to your Home Assistant.

Since I am running on a Windows Laptop, I can leverage the Windows Task Scheduler to automate this. I have a Windows Task is triggered on 'workstation unlock' and run a [PowerShell script](https://github.com/rajbos/home-automation/blob/main/WindowsLogin.ps1) that sends the signal to Home Assistant.

##### Note: Make sure to use the `pwsh` command as the program to start the script, otherwise it fails because of missing modules/parameters on PowerShell

To make sure this only runs when I am at home, I configured the Windows Task to only run when the network connection from home is available.

To make sure this only runs when I am at my office space (that means that my peripherals are plugged in), I have a check in the script to verify if there are more than one monitors available by making this call:
``` powershell 
Get-CimInstance -Namespace root\wmi -ClassName WmiMonitorBasicDisplayParams
```
This prevents the lights from turning on while I am using the laptop at the couch 😁.

# Camera on/off
I also want to toggle the lights on or off depending if I am using the camera or not. Since I have multiple camera's setup and LOADS of video conference applications in use (I always think I have them all, until something obscure pops up), I want to do this automatically **by detecting if a camera is in use**.

Looking around you can find solutions like [Presence Light](https://github.com/isaacrlevin/PresenceLight), that only look at the status in the Office365 API. Since I also use different tools, I needed something more. 

Searching around I had to put some things together and I created [this PowerShell script](https://github.com/rajbos/home-automation/blob/main/camera-check.ps1) that checks ALL cameras that are connected to the machine and then checks if any process is using them. 

## Step 1: Find all camera's on the machine
You can get all the connected devices from the `Get-PnpDevice` (plug and play) commandlet. Give it the classes 'camera' and 'image' to get all devices that can be used as a camera.
``` powershell
Get-PnpDevice -Class Camera,Image
```
If you have ever used a camera at a different location (I connect to a standalone camera at our office space for example), you'll see that those devices are stored there as well.

## Step 2: For each camera, see if they are connected
Only for connected camera's, you get a `Physical Device Object Name` (PDON) back from the call below that you can use to check if the camera is in use. If the result is empty, the device is not connected so you don't need to check if it is use.
``` powershell	
Get-PnpDeviceProperty -InstanceId $device.InstanceId -KeyName "DEVPKEY_Device_PDOName"
```
This call also returns the **current** file that can be used to see if a process has a handle on that file. It will look  something like this: '\Device\000000ac'. See the logs below for more examples.

## Step 3: Check if any process is using the camera
That file can be used to check if any process is using the camera by checking the handles. For this you can use the [handle](https://docs.microsoft.com/en-us/sysinternals/downloads/handle) tool from SysInternals.

# Tie it all together
For starting a loop that checks all camera's and sees if they are in use, I use a Windows Scheduled Task again: If connected to the home wi-fi, when I unlock my laptop, start running a PowerShell script that continuously checks if any camera is in use. If so, turn on the lights. If not, turn them off. I run this check every minute, since finding **all** handles is a bit of a computational expensive operation.

## Output example
Below you can find an example of the output of the script. You can see that it found 5 camera devices: 
- the internal camera is in the list twice, no idea why
- I have two USB camera's connected
- The Elgato Facecam is the camera from our office space

After scanning I wait for the remainder of the minute to not continue check for cameras in use and make the fans fly off 😀.

```
13:13:31 Searching for camera devices
13:13:32 Found [5] camera devices
13:13:32 1.  No PDON found for [Elgato Facecam] so skipping it
13:13:32 2.  Checking handles in use for [Logitech BRIO] and PDON [\Device\000000ac]
13:13:38   - Found [2] handles on Logitech BRIO
13:13:38   - Found process [Teams.exe] that has a handle on [Logitech BRIO]
13:13:38 Found active camera device
13:13:38 Running action to make the state [True]
13:13:38 Sleeping for 54 seconds
```

# Tested with these video conferencing applications
So far I have tested this with the following applications:
- Zoom
- Teams
- OBS Studio
- Calls through Edge browser with Teams and Zoom
- Slack

## Run with highest privileges
For some of these tools the preview window (before you join a meeting) runs in a svchost.exe process. That means you need to run the handle calls with admin privileges. You can set this checkmark in the main window of the Windows Task.

## Prevent the PowerShell window from popping up
If you run with the setting 'Run only when the user is logged on' on your Windows Task, you'll see the PowerShell window pop up. To prevent this, check the 'Run whether the user is logged in or not' box.

# Repo with the scripts
You can find the [repo](https://github.com/rajbos/home-automation) with all my setup on GitHub.