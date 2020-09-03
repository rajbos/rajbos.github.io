---
layout: post
title: "Windows 10: Enable 8.1 fly-out style WiFi / VPN menu"
date: 2016-01-09
---
I'm not the only one who is annoyed by the new Windows 10 way to connect to VPN connections. The new route takes a lot of new clicks, just to connect to a VPN! The old Windows 8 style was a lot faster. Since I frequently change connections at work, It's a recurring annoyance everyday :-(.

Today, I've found out that there is a simple registry setting to revert the dialogs to the old Windows 8 style. 

Registry key:
```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Control Panel\Settings\Network\ReplaceVan
```
Values:
```
0 - Default
1 - Network settings in settings app
2 - Windows 8 style
```

Note: you'll need administrator rights to change the settings, or use a tool like [RegOwnershipEx](http://winaero.com/) to change the settings. Take ownership of the folder and then open the register editor to change the value. 

Thanks to [Nick Craver](https://twitter.com/Nick_Craver/status/685593210186543107), for mentioning it was possible to change it.