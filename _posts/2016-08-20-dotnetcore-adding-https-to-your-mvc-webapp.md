---
layout: post
title: "DotNetCore: Adding HTTPS to your MVC webapp"
date: 2016-08-20
---
<p>
I wanted to use https in my dotnetcore application (v. 1.0.0-rc2-final) and had to dig around the web quite a bit to find the most recent
and working method to accomplish this. Eventually a link in the MVC github site lead to an example how to fix this 
(<a title="link" href="https://github.com/Rinsen/HttpsProblemWithKestrel" target="_blank">link</a>).
</p>
<p>
First, the most easy way I've found to do this, is to add some custom middleware for redirecting all http requests to https:
</p>
``` c#
public class HttpsRedirectMiddleware
    {
        readonly RequestDelegate _next;
        
        public HttpsRedirectMiddleware(RequestDelegate next)
        {
            _next = next;
         }

        public async Task Invoke(HttpContext context)
        {
            if (!context.Request.IsHttps)
            {
                HandleNonHttpsRequest(context);
            }
            else
            {
                await _next(context);
            }
        }
        
        void HandleNonHttpsRequest(HttpContext context)
        {
            // only redirect for GET requests, otherwise the browser might not propagate the verb and request
            // body correctly.
            if (!string.Equals(context.Request.HttpContext.Request.Method, "GET", StringComparison.OrdinalIgnoreCase))
            {
                context.Response.StatusCode = 403;
            }
            else
            {
                var newUrl = string.Concat(
                    "https://",
                    context.Request.Host.ToUriComponent(),
                    context.Request.PathBase.ToUriComponent(),
                    context.Request.Path.ToUriComponent(),
                    context.Request.QueryString.ToUriComponent());
                context.Response.Redirect(newUrl, permanent: true);
            }
        }
    }
```
<p>
  I've added this right before the Mvc call:
</p>

``` c#
services.AddMvc();
```
