---
layout: post
title: "DevOps Principles series - Recording setup "
date: 2019-07-10
---

Read more on why I created short video's wherein I explain some of the DevOps principles and practices [here](/blog/2019/07/10/DevOps-Principles-series).

![DevOps Continues Cycle](/images/2019/20190710/20190710_01_DevOps.png)

Creating these video's helps me getting a little more comfortable speaking to an audience, even if it is through a camera lens and with the ability to stop and do it again 😄. It also helps that I have some time to think through the message I'm trying to explain to the team. From there I am trying to get my intonation and articulation under control. This stuff is all new to me, so I am figuring this all out live on the job. I'm learning tons of stuff I didn't really think about before. This will be explained below. Somehow I like to challenge myself and do this stuff out in the open 😁.

## Setup
Let's start with the basic setup. As I am trying to find out how this all works and where to go next, I am using the hard- and software I have available. As a laptop I happen to have a Dell XPS 15. The XPS range has a couple of issues in their design. The biggest one relevant to this post is the position of the webcam. Apparently the good people at Dell found the slim bezel on the top and sides of the screen more important than the actual usability of the webcam. So *up the nose shots* it will be, unless you try to overcome that (more on that later).

![Webcam position lower left corner of the screen](/images/2019/20190710/20190710_Webcam.jpg)

## Software
I've tried a couple of different software downloads that are freely available, for example with a trial version. I know a couple of colleagues use [Camtasia](https://www.techsmith.com) for this stuff, but I am not ready to commit to a € 260+ yearly purchase for a small series of video's. Surely there must be something available that is sufficient for my objectives?

Windows 10 already has some options build in, like the default camera application. Unfortunately that will not let you record  the screen as well, so only audio and the video through your webcam. What I want to achieve, is a PowerPoint presentation, with audio and my webcam in the lower right corner, taking about the subject at hand.

I once came across [Soapbox](https://wistia.com/soapbox), a Chrome plugin that can record the screen and impose your webcam video on top of it. This seemed like a nice solution, except that I found out that you need to pay to export the video! My goal is to create a playlist of all the video's on my YouTube account and then share the video's as needed. I am all for paying for the product if it adds value, yet I find that I am not ready to commit to anything yet.

## PowerPoint!
Finally I came across a blog post that had a top 10 of video tools on Windows and it mentioned that PowerPoint has some functionality built in to record yourself while giving a presentation. This is to help the presenter with their timings, articulation and other things they need to see while rehearsing the presentation. Sounds like a good option, so I went ahead with it!

![PowerPoint Slide Show Menu](/images/2019/20190710/20190710_02_PowerPoint.png)

## Height
Trying to prevent the weird shots, I've been testing with different setups. The goal is to find a setup where the camera is around my eye level and where I can sit comfortably talking over a presentation.

![Setup on desk with a pile of books underneath the laptop](/images/2019/20190710/20190710_Setup.jpg)

Next up is trying out to record the videos while trying to look AT the camera.

## Light
I found out that light in your recording setup is really important, especially if you use the in-laptop webcam for it. More light is better! I tried recording with all the lights on in my living room, in front of a window and behind a large lamp in the kitchen. None of these were adequate enough for me: I need to invest in a good camera that I can freely position on the top of my laptop for a better view.

## Sound
For sound, I recorded the first videos with the onboard microphone. You can hear the poor quality in the first three videos! As different options, I've used my iPhone headset (better), my Sony WH-1000XM2 Headset (bluetooth of the Dell XPS is crap, it flunks out after 30 seconds or so) and finally got my hands on a [Trust Mantis GXT232 Streaming Microphone](https://www.coolblue.nl/en/product/816891/trust-mantis-gxt232-streaming-microphone.html).
![Trust Microphone](/images/2019/20190710/TrustMicrophone.jpg)

This is the extra microphone that I needed! I even recorded with this one in a hotel, because of it's size, it can easily be taken with me on-the-go.

## Recording
After using PowerPoint I found that I needed a way to suppress the fans of my laptop: they do start to make a sound that you can hear in the first video's: as soon as I start recording, everything goes over the video card and the fans start spinning 🙁. To overcome this I now use [Streamlabs OBS](https://streamlabs.com/streamlabs-obs). This open source streaming tool can also record and has the key-feature that I needed: noise filtering! Getting the level of the filter setup is still a search, so in some of the video's the sound is rather soft. I trust that this will improve with more experience.

```
Note: Streamlabs OBS is an adaptation of another open source tool: [OBS](https://obsproject.com/).
OBS itself doesn't have great HiDPI support that I really needed on my 4K screen. It's not doable without it. Streamlabs has better support for it and the navigation is a lot easier to use.
```

## Playlist:

You can find the entire playlist [here](https://www.youtube.com/watch?v=eEB9h8mU8rY&list=PLXVVwOM8uv2wQyhQ7mB_Nv_iXyMuXf-GT).
Some of the topics explained are:
* What is DevOps?
* If it hurts, do it more often
* T-Shaped engineers
* Shift Left

I try to keep them as short as possible.