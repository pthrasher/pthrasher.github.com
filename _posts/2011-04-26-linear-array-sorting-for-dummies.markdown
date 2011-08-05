---
layout: post
title: Linear Array Sorting for Dummies
---

Before I begin, let it be known that I (yes, me) am not one of the elite super-ridiculously intellegent people on earth. On top of this, I did not got to college at all. I work with big data at my current job, and doing so require knowledge of at least a few cool CS algorithms. CS majors have had the luxury of having this info force fed to them. I, however was not so lucky.

This post is a simple one to show the answer to a "simple" qualifying question a Google engineer told me he asks potential interview candidates over the phone. The question is as follows:

"If I have an array with random integers in it, if you we're to think of this array as a 'horizontal object' how would you move all of the even numbers to the left side of the array, and all the odd to the right side of the array?"

What he meant was splitting the array up like below:

Original random array:  
[even, odd, odd, even, even, odd, odd]  
New array:  
[even, even, even, odd, odd, odd, odd]  

Essentially this is just a partitioning algorithm. Now, you could do something nasty like searching through the array, popping off any odd numbers, and then pushing them onto the end of the array. The only problem with that approach is that it is a quadratic time algorithm. What you want is linear time. We want to go through this array only once, and move all items within that one array without making any copies.

It's a pretty neat exercise. My first response to him was the quadratic time idea. Since this was a simple problem, I wasn't trying to think of any advanced method to solve it. It wasn't like it needed to scale. It just needed to work. But this taught me an important lesson about Google. Everything... no matter how innocuous, needs to be able to scale.

Here's the code:
{% highlight python %}
def partition(to_partition):
    first_odd = 0
    for a in range(len(to_partition)):
        if not to_partition[a] % 2 and a > first_odd:
            to_partition[a], to_partition[first_odd] =  to_partition[first_odd], to_partition[a]
            first_odd += 1
    return to_partition

import random
mylst = [random.randint(1,1000) for i in range(20)]
print mylst
# => [816, 229, 645, 194, 423, 480, 242, 307, 254, 587, 694, 437, 465, 390, 970, 926, 910, 66, 447, 654]
print partition(mylst)
# => [194, 480, 242, 254, 816, 694, 390, 970, 926, 910, 66, 654, 437, 465, 229, 645, 307, 587, 447, 423]
{% endhighlight %}
