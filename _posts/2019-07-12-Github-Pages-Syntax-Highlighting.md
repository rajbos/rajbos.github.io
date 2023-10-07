---
layout: post
title: "Fixing GitHub Pages Syntax Highlighting"
date: 2019-07-12
---

Today I noticed that my syntax highlighting was not working on this blog. Here is how I fixed it!

I am using Jekyll on GitHub pages as I wrote [before](/blog/2017/12/17/trying-out-jekyll-on-github-pages).

![](/images/2019/20190712.02/zach-reiner-unsplash.jpg)

#### <a style="background-color:black;color:white;text-decoration:none;padding:4px 6px;font-family:-apple-system, BlinkMacSystemFont, &quot;San Francisco&quot;, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Roboto, Noto, &quot;Segoe UI&quot;, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1.2;display:inline-block;border-radius:3px" href="https://unsplash.com/@_zachreiner_?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge" target="_blank" rel="noopener noreferrer" title="Download free do whatever you want high-resolution photos from Zach Reiner"><span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-2px;fill:white" viewBox="0 0 32 32"><title>unsplash-logo</title><path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path></svg></span><span style="display:inline-block;padding:2px 3px">Photo by Zach Reiner</span></a>

Looking at the generated HTML indicated that there was some parsing done during the build of the page, but there were no CSS classes available to them:
![Showing correctly generated HTML with extra tags](/images/2019/20190712.02/20190712_02.png)

I tried searching for documentation about this issue and found some [basic stuff](https://help.github.com/en/articles/page-build-failed-invalid-highlighter-language).
This hinted that I needed to set up a highlighter in my `_config.yml`:
```yml
highlighter: rouge
```
There is another highlighter ([Pygments](http://pygments.org/)), but this is not supported. It even seems that `rouge` is just the default, so you do not need to set it at all!

I found a [Stack Overflow question](https://stackoverflow.com/questions/42188235/jekyll-github-pages-syntax-highlighting-not-working) that indicated I needed to include a CSS file with the highlighting I want myself.

Lazy as I am, I searched around and found a [gist](https://gist.github.com/) with a SCSS setup in it. I modified that to be just CSS and added it to my `head.html` like so:
```html
<link href="/css/syntax.css" rel="stylesheet">
```

I also needed to add the syntax name that I am using in lowercase to get it all to work: so `powershell` instead of `PowerShell`.

### Cool feature of GitHub Pages
GitHub pages is already cool by itself, but did you now they actually send you an e-mail if there is an issue with you setup that prevents the yml-build from working?
![E-mail error from GitHub with Page Build Warning](/images/2019/20190712.01/20190712_01.png)