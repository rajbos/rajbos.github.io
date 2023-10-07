---
layout: post
title: "Git clone error: Filename too long on Windows 10"
date: 2020-09-23
---

Today I ran into an issue that I tried to clone a Git repository with large filenames/folder paths in it.

```
fatal: cannot create directory at 'src/Modules/<long path here>': Filename too long
warning: Clone succeeded, but checkout failed.
```

![Photo of windy road with car lights in long exposure](/images/2020/20200923/federico-beccari-cyg3DD6Y69A-unsplash.jpg)

The folder path display was only 195 characters long, but adding my root folder with 38 characters got awfully close to the known [260 characters limit in Windows](https://docs.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation?WT.mc_id=DOP-MVP-5003719).

# Fixing the issue
To fix this you need to do two things:

1. Tell Windows to support long file paths
2. Tell Git to support long file paths

## Configure Windows for long file paths:

You can do this either by updating the local Group Policy Setting through the [Editor](https://docs.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/how-to-configure-security-policy-settings?WT.mc_id=DOP-MVP-5003719):

```
1. Windows Run --> gpedit.msc
2. Computer Configuration > Administrative Templates > System > Filesystem > Enable Win32 long paths
```

Or by using the [registry editor](https://support.microsoft.com/en-us/help/4027573/windows-10-open-registry-editor?WT.mc_id=DOP-MVP-5003719):
```
1. Windows Run --> regedit
2. Path:  HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem
Key name: LongPathsEnabled
Value: 1
```
After updating this setting you either need to Sign Out and back on, or reboot the machine.

## Configure Git for long file paths
Git doesn't know about the changes in Windows and is installed by default without the LongPath setup we need. Enable it from the command line:

```
git config --system core.longpaths true
```

Now you can clone the repository again.