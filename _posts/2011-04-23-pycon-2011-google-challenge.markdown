---
layout: post
title: Google Challenge from PyCon 2011
---

I could have sworn I had already posted this, but looking back, it is apparent I did not. I live in Atlanta, GA, and attended PyCon this past march. It was great fun. There were a lot of really awesome talks, but one thing I spent a bit of time on was the google challenge. Google was there with their booth, and they had an open challenge for anyone to solve. The intructions were as follows:

1. Find the quantity of numeric palindromes between 0 and a googol.
1. Find the sum of each digit in that (very long) number.
1. This must be done in a python function named googol.
1. Your function must return a 2-tuple with the quantity first, and the sum of each digit second.
1. Your program cannot take more than 10 minutes to run.
1. Your program cannot be longer than 500 characters.


When I was first attempting to solve this, I was completely over-engineering it. I was trying to figure out how to actually quickly count all the palindromes without storing them on disk, etc. Needless to say, it was tough. This was not the answer. So, I figured I'd take a step back for a bit and think about it.

I decided I needed to look at the palindromes to see if there was a pattern that could be followed. I wrote a brute force loop to determine the first 1000 or so. I looked at them for a while. There were a lot of small patterns, like the inner two characters would count up etc. 

Those patterns were unfortunately too small for me to write a function to follow. So, I printed it out in scientific notation. This is when a huge pattern was immediately apparent.

From 0-9 there are 9 palindromes, from 10-99 there are also 9 palindromes. From 100-999 and 1000-9999 there are 90 palindromes in each range, and so on and so forth. With each increase in digit (every other time) the quantity of palindromes within that range was multiplied by 10. I had found it! This was the pattern. So I wrote a function that essentially stepped through each digit, and changed the multiplier each step.

number of digits, quantity of palindroms

1, 9   
2, 9   
3, 90   
4, 90   
5, 900   
6, 900   
7, 9000   
8, 9000   

...   

97, 9000000000000000000000000000000000000000000000000   
98, 9000000000000000000000000000000000000000000000000   
99, 90000000000000000000000000000000000000000000000000   


Here's the code:
{% highlight python %}
def googol():
  # q = quantity to add each iteration
  # t = total
  q = t = 9
  for i in range(1, 100):
    #if this is odd, lets multiply q*10... we're in a new range
    if not i%2: q *= 10
    #add the new range's quantity to our total
    t += q
  # Return the total, then convert that into a
  # string so we can add all the individual digits together.
  return (t, sum(map(int,str(t))),)
{% endhighlight %}