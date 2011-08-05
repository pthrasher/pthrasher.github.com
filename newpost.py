import datetime
import unicodedata
import os
import sys
import re
import json

from subprocess import call

def confirm(prompt=None, resp=False):
    """prompts for yes or no response from the user. Returns True for yes and
    False for no.

    'resp' should be set to the default value assumed by the caller when
    user simply types ENTER.

    >>> confirm(prompt='Create Directory?', resp=True)
    Create Directory? [y]|n: 
    True
    >>> confirm(prompt='Create Directory?', resp=False)
    Create Directory? [n]|y: 
    False
    >>> confirm(prompt='Create Directory?', resp=False)
    Create Directory? [n]|y: y
    True

    """
    
    if prompt is None:
        prompt = 'Confirm'

    if resp:
        prompt = '%s [%s]|%s: ' % (prompt, 'y', 'n')
    else:
        prompt = '%s [%s]|%s: ' % (prompt, 'n', 'y')
        
    while True:
        ans = raw_input(prompt)
        if not ans:
            return resp
        if ans not in ['y', 'Y', 'n', 'N']:
            print 'please enter y or n.'
            continue
        if ans == 'y' or ans == 'Y':
            return True
        if ans == 'n' or ans == 'N':
            return False


def slugify(s):
    slug = unicodedata.normalize('NFKD', unicode(s))
    slug = slug.encode('ascii', 'ignore').lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug).strip('-')
    return re.sub(r'[-]+', '-', slug)


title = raw_input("title: ")
slug = slugify(title)
published = confirm(prompt="published? ")
today = datetime.date.today()

fname = "%s-%s.markdown" % (today.strftime("%Y-%m-%d"), slug)
yaml = """
---
layout: post
title: %s
published: %s
---
""" % (title, json.dumps(published))
f = open("_posts/%s" % fname, "w")
f.write(yaml)
f.close()
call(["mvim", "_posts/%s" % fname])

