---
layout: post
title:  "Tealeaf Academy Course Three/Week One - Quick Info On Rake Commands"
date:   2015-02-12 09:47:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

This is a very short post but I just wanted to make a quick note on rake commnads that I found out this week.  Here's a few things I found useful:

```rake -T``` to get the most common rake commands

```rake -T -A``` to get all of the rake tasks

```rake -T -A | grep seed``` will only pick out the command and/or descriptions that include the word seed

The last one will show up ```rake db:setup``` that is a command which will create the database, load the scheme and initialize with the seed data.  However, I need to run ```rake db:reset``` first in order to drop the existing database.  This is useful if I have added to my ```seeds.rb``` file again and need to include this new data without copying that entire seed file on top of what is already in my test database.

That's all, told you it was a short one!