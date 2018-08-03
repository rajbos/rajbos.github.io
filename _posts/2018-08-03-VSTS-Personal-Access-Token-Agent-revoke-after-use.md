Today I was listening to [RadioTFS episode 163](http://www.radiotfs.com/Show/163/DevOpsDevOpswithWouterdeKortandHenryBeen) on my commute, with guests [Wouter de Kort](https://twitter.com/wouterdekort) and [Henry Been](https://twitter.com/henry_been/). During the show Wouter mentioned that he always revoked his [VSTS Personal Access Token](https://roadtoalm.com/2015/07/22/using-personal-access-tokens-to-access-visual-studio-online/) after using it, especially when used for a Build Agent. 

![](/images/2018_08_03_VSTS.png)

Apparantly the PAT is only used for the initial authentication to VSTS/TFS and after that it isn't needed anymore! That indeed means that you can revoke the token after it has been used and that you don't need to keep the token around. Until this day, I had alwas copied the token into [keepass](https://keepass.info/) for keepsake, but I don't need to do that anymore. 

If I ever need to register another agent, I can always create a new one. Revoking the old one also means that it cannot be used anymore, so that's also less of a security concern then :-).

Off course I had to test it first to see if it actually works, but it did :-). So wanted to save this for later in this post.  
 
![](/images/2018_08_03_PAT.png)