---
layout: post
title: Yes, The Styles for This Site Are Loaded
published: false
---

Don't freak out, there's no broken CDN, my stylesheet didn't fail to load, and
yes, I do in fact know what I'm doing. At least a teeny tiny bit.

My site looks this way because I'm starting an experiment. I'm going to enhance
the design of my blog step by step and explain each step in a series of blog
posts. The site is plain, undesigned, and generally not pleasant because this
is step 1. The beginning.

Unfortunately, I can't say there are *no* styles. There are in fact a bare
minimum of styles on the page. I first did this with no styles, and that was
just too horrible to look at, so I felt I should at least add in these:

{% highlight css %}
body {
    font-family: 'Helvetica Neue', 'Helvetica', sans-serif;
    font-style: 'Normal';
    font-size: 16px;
    line-height: 18px;
    background: #fff;
    color: #444;
}
h1, h2 h3, h4, h5, h6 { font-style: 'light'; }
p { font-family: Georgia, 'Times New Roman', Serif; }
a { color: #555; }
a:visited { color: #777; }
{% endhighlight %}

Here's a picture of what it looks like at this stage:

![Post List](/img/step-1-index.png)


![Post View](/img/step-1-post.png)
