---
layout: post
title: "Lets Encrypt: Manually get a certificate on Windows for an Azure App Service"
date: 2019-08-27
---

Recently I had to refresh a [Let's Encrypt](https://letsencrypt.org/) certificate for an Azure App Service after the first certificate had expired. Of course, refreshing a certificate should be done by some tooling, either in a CI/CD pipeline or another service. I tried setting up the [Lets Encrypt Extension](https://github.com/sjkp/letsencrypt-siteextension/wiki/How-to-install) on the App Service, but could not get it to work. Eventually I even ran into the Let's Encrypt rule that you can only try to get a certificate 5 times a week for a production environment, after which they blocked me. Therefor I decided to update the certificate by hand, because that should not be too hard at all.... Unfortunately this was not as straight forward as I wanted it, so I decided to document the process here for later referral when I run into this again. Hopefully I've remembered to have automated this the next time!

There will be steps in here that can be executed easier. If you have any tips, please let me know!

![Underwater photo of a school of fish](/images/2019/20190827/johnny-chen-CE1_qYPbMBU-unsplash.jpg)
##### <a style="background-color:black;color:white;text-decoration:none;padding:4px 6px;font-family:-apple-system, BlinkMacSystemFont, &quot;San Francisco&quot;, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Roboto, Noto, &quot;Segoe UI&quot;, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1.2;display:inline-block;border-radius:3px" href="https://unsplash.com/@johnnyafrica?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge" target="_blank" rel="noopener noreferrer" title="Download free do whatever you want high-resolution photos from Johnny Chen"><span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-2px;fill:white" viewBox="0 0 32 32"><title>unsplash-logo</title><path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path></svg></span><span style="display:inline-block;padding:2px 3px">Photo by Johnny Chen</span></a>

## Let's encrypt process
To be able to get a Let's Encrypt certificate you first need to prove that the domain you are using is actually owned by you. Most identity challenges do this by requiring a specific txt-record in the root of the domain so they can request that from the DNS server. The more modern way to do this is by setting up a specific well known route on the webserver for this specific use. It seems that the industry standard is moving to the same setup. Let's encrypt sends a request to a sub-url on the domain you are validating to  `\.well-known\acme-challenge\unique_file_name`.  It checks to see if a specific set of characters is in the file. If you can set that information up on the domain, it proves to Let's Encrypt that you are the domain owner and they can generate a certificate for you.

## Windows Subsystem for Linux!
To get that filename and its contents you can use the Certbot, that is available for a couple of different Linux distro's. Since I have Ubuntu running on my Windows machine inside Windows Subsystem for Linux (WSL), I wanted to use that. I followed the installation steps from the [documentation](https://certbot.eff.org/lets-encrypt/ubuntubionic-other).
After the installation I can now run the certbot with:
``` bash
sudo certbot certonly --manual
```

The bot will then ask you a couple of questions, like the domain(s) you want to get the certificate for, your email address so they can e-mail you when the certificate is about to expire and if you are OK with logging your IP-address.
![Example of Certbot commands in WSL](/images/2019/20190827/2019-08-27_CertBot.png)

``` dos
IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/www.gdbc-challenges.com/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/www.gdbc-challenges.com/privkey.pem
   Your cert will expire on 2019-11-25. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot
   again. To non-interactively renew *all* of your certificates, run
   "certbot renew"
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le
```

## Uploading the challenge files to an App Service
In the screenshot above you can see the name of the file and the contents Let's Encrypt expects in the challenge. In the Windows Terminal I am using you can select the text with the left mouse button and then copy it to the clipboard with the right mouse button. **Trying to do this with the keyboard will send a key to the shell and will be seen as a 'return' key-press!** When this happens, Let's Encrypt will try to validate the file and you can start over again! Luckily it will rotate the expected file and content, so after two or three tries you will be back at the initial values 😉.

Create a new file in the Azure App Service with the correct name through Kudu:
![Example of opening Kudu in the Azure Portal](/images/2019/20190827/2019-08-27_Kudu.png)
You can only do this with the editor in Kudu, since the App Service Editor will only enable you to create or edit files within the `/site/` folder. The acme-challenge lives outside of it.

## Extracting the Let's Encrypt files
After Let's Encrypt validates the domain, the CertBot will write down a couple of files that you can use for the certificate.  It will tell you that it wrote the files in the following location: `etc\letsencrypt\live\your_domain_here`. To get to those files from Windows, you need to find out where WSL saves its local files. The root the file store is `%userprofile%\AppData\Local\Packages`. As I am using Ubuntu, the folder for that subsystem is `CanonicalGroupLimited.Ubuntu18.04onWindows_79rhkp1fndgsc` from where I can navigate to `LocalState\rootfs\etc\` to find the root file system and then the rest of the path.
![Example of Certbot result files](/images/2019/20190827/2019-08-27_ETC.png)

**Be aware** the files in this directory only contain links to an archive folder!
![Links to other files in the archive folder](/images/2019/20190827/2019-08-27_Links.png)
Get the actual files from that path, you can see they are all suffixed with the number one in the filename.

## Converting the pem files to a pfx
Azure App service wants to have a pfx file instead of the pem file that was generated. After all, it is IIS behind the covers, so it behaves the same way as IIS.  This means we need to convert the pem file to a pfx file. You can do that in several ways, but the OpenSSL tooling that was mentioned in this [Stack Overflow question](https://stackoverflow.com/questions/808669/convert-a-cert-pem-certificate-to-a-pfx-certificate) seemed rather straightforward. Unfortunately [OpenSSL](https://www.openssl.org/source/) does not provide the binaries for the different platforms anymore. You can only download the Git repository and try to build it from there. Luckily I found the binaries hosted [here](http://slproweb.com/products/Win32OpenSSL.html) and I used them to execute the next steps.

Navigate to the OpenSSL path and execute this command to generate a pfx based from the pem files Let's Encrypt generated:
``` powershell
.\openssl pkcs12 -inkey "C:\Users\RobBos\Desktop\GDBC Challenges\privkey1.pem" -in "C:\Users\RobBos\Desktop\GDBC Challenges\fullchain1.pem" -certfile "C:\Users\RobBos\Desktop\GDBC Challenges\cert1.pem" -export -out "C:\Users\RobBos\Desktop\GDBC Challenges\gdbc_challenges.pfx"
```
It will request a password that can be left empty for usage in Windows itself, but Azure App Service requires a password on it.
![Powershell command to convert the pem files to a pfx](/images/2019/20190827/2019-08-27_CovertPEM.png)


## Uploading the new certificate
Uploading a certificate to Azure App Service can be done in just a few steps. Upload the new certificate and bind it with an SNI Binding to the correct domain.

![Upload certificate](/images/2019/20190827/2019-08-27_UploadCert.png)