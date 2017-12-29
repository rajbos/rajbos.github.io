---
layout: post
title: "Using excerpts in Jekyll"
date: 2017-12-29
---

I wanted to include at least some more information in the index page of my blog instead of just the publish date and title, so I searched around for some help to include an excerpt in Jekyll and found some help on <a href="http://frontendcollisionblog.com/jekyll/snippet/2015/03/23/how-to-show-a-summary-of-your-post-with-jekyll.html"> this</a> blog.

The solution was very straightforward, but I'll include it here for future reference.

#### Index page
In the index page, you can search the content of a post, check for specific tags and use the text between them:

``` html
<!-- index.html -->
<p class="post-excerpt">

{% if post.content contains '<!--excerpt.start-->' and post.content contains '<!--excerpt.end-->' %}
	{{ ((post.content | split:'<!--excerpt.start-->' | last) | split: '<!--excerpt.end-->' | first) | strip_html | truncatewords: 20 }}
{% else %}
	{{ post.content | strip_html | truncatewords: 20 }}
{% endif %}

</p>
```
Note: if the specified tags aren't found in the content, the first **20** words will be used.
#### Posts
In a post, you can now include the excerpt tags to add a specific excerpt:
``` html
<!-- _posts/some-random-post.html -->
<p>
Here's all my content, and <!--excerpt.start-->here's where I want my summary to begin, and this is where I want it to end<!--excerpt.end-->.
</p>
```