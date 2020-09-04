---
layout: post
title: "Not geting new windows 10 preview builds after reverting to an older build?"
date: 2016-03-03
---
If you previously had a new Windows 10 preview build installed in your computer and then you reverted back to an older build, you could lose access to the new build where the new build is no longer offered as an upgrade option. If you want to install that build again, deleting that build number from the list in the Registry Editor will restore the ability to upgrade.
```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\WindowsSelfHost\Applicability\RecoveredFrom 
```

[Source](https://www.askvg.com/fix-windows-10-insider-preview-build-10240-not-appearing-on-windows-update/)
