---
layout: post
title:  "TomDoc For Ruby"
date:   2014-12-30 21:53:00
categories: Ruby
banner_image: ""
featured: false
comments: true
---
##TomDoc Style
I have been introduced to a code documentation specification called [TomDoc](http://tomdoc.org/) that at it's most descriptive looks like this:

    # Public: Duplicate some text an arbitrary number of times.
    #
    # text  - The String to be duplicated.
    # count - The Integer number of times to duplicate the text.
    #
    # Examples
    #
    #    multiplex('Tom', 4)
    #    # => 'TomTomTomTom'
    #
    # Returns the duplicated String.
    def multiplex(text, count)
      text * count
    end

<!--more-->

##Code Commenting
To be honest, for most methods this level of documentation is overkill especially if I use descriptive method names and ensure I stick to single responsibility. Essentially the code itself will become self documenting.  

However, I have found a good use for stating a quick desciption and return type and that is that it forces me to think about the method in more detail. I have found with a few methods that as I start describing it in plain English, it quickly becomes apparent that the method is doing too much and that I should be splitting the method.

Therefore, the value in simple documentation for me is that it will help me build single responsibility methods that are easy to reuse and change in the long run.  I'm sure this will become easier for me as I gain experience but documentation will be a really good help in the beginning.