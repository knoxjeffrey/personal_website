---
layout: post
title:  "RubyMotion - UILabel Padding"
date:   2015-07-22 16:18:00
categories: RubyMotion
banner_image: ""
featured: false
comments: true
---

A fairly quick post today but one which covers a problem that took me quite a while to figure out how to do it in an elegant way.  In short I had a UILabel and wanted to add some right padding to it and I figured it should be pretty easy to do.  Several hours later...

<!--more-->

On my first attempt I though it would be nice and simple to add some trailing white space to my text to create the padding I needed such as ```my_label.text = "my text  "```.  No such luck as the trailing white space is removed.

After a bit of reading I tried subclassing UILabel and overriding ```drawTextInRect```:

``` ruby
def drawTextInRect(rect)
  insets = UIEdgeInsets.new(0, 0, 0, 10)
  super.drawTextInRect(UIEdgeInsetsInsetRect(rect, insets))
end
```

I'm not sure if I've done this wrong or if it is to do with RubyMotion but it kept crashing the app so that was another dead end.

Another way could have been to add another view and arrange things that way but it seemed pretty ridiculous for something so simple and eventually I found this way of doing it using ```NSAttributedString```:

``` ruby
edit_style = NSMutableParagraphStyle.new
edit_style.tailIndent = -10
text_attributes = { NSParagraphStyleAttributeName => edit_style }
my_label.attributedText = NSAttributedString.alloc.initWithString("my text", attributes: text_attributes)
```

Not at all obvious but a fairly elegant solution in the end, well certainly more so than adding an extra view to create a little bit of padding!
