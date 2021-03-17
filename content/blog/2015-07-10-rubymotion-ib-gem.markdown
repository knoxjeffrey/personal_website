---
layout: post
title:  "RubyMotion - IB Gem"
date:   2015-07-10 19:30:00
categories: RubyMotion
banner_image: ""
featured: false
comments: true
---

In todays post I'm going to walk through using the interface builder in Xcode based on a tutorial by [MotioninMotion](https://motioninmotion.tv/screencasts/42).  I highly recommend signing up to the tutorials for this site as I've found them to be extremely helpful.

<!--more-->

First up, create a new project with the command ```motion create interface_builder``` and then go to the Gemfile and add the following line ```gem 'ib'```. Then run ```bundle``` from the command line and wait for the gem to be installed.

With that done it's time to create a new UIViewController called MasterViewController and here is my completed code for that class:

``` ruby
class MasterViewController < UIViewController

  extend IB

    outlet :title_label, UILabel
    outlet :text_field, UITextField
    outlet :button, UIButton

    def button_pressed(sender)
      title_label.text = text_field.text
      text_field.text = ""
    end

  end

end
```

You will see initially that I have added ```extend IB```.  You have no doubt used ```include``` before but you may have not seen ```extend``` so here's a quick explanation.  Include is for adding methods to an instance of a class and extend is for adding class methods as seen [here](http://www.railstips.org/blog/archives/2009/05/15/include-vs-extend-in-ruby/).

Next there are 3 outlets. An outlet is basically a way to let interface builder know that it can assign a view to this property from the interface builder files that we create.  The object containing an outlet is often a custom controller object such as a view controller.

When I get to the interface builder I will set the ```button_pressed``` action to the UIButton view.  This will simply change the text of ```title_label``` to be the text that is in the ```text_field``` and then clears the ```text_field```.

## XCode

Running ```rake ib``` will create a ib.xcodeproj in the root of your app and open XCode. You can create Storyboards or nibs, and save them in your resources directory in order to be picked up by RubyMotion.

Every time you make a change in your ruby files (like adding a new outlet or action method) you have to run ```rake ib``` in order to let Interface Builder see the changes.

The ib gem parses the Ruby code and generates two Objective-c files (Stub.m and Stub.h) which are populated with the classes, methods and outlets you have defined. This is necessary for Interface Builder to bind outlets and actions to your code.  You can see the outlets in XCode by looking at the ```ib/Supporting Files``` directory and checking out the ```Stubs.h``` file.  The .h is called the Header file and contains the code related to the interface and there is also a .m file which is called the Implementation file.

The interface specifies exactly how a given type of object is intended to be used by other objects. In other words, it defines the public interface between instances of the class and the outside world. The implementation includes the executable code for each method declared in the interface.

Next up, go to the folder ```Resources/resources``` and right click to create a new file. In the pop up window, click ```User Interface```under the iOS header.  Then select Storyboard and click the next button.  I then saved as ```Main.storyboard```.

Now you're ready to start using storyboards!

## Storyboards

Next up click the Object Library button at the bottom right of the screen and search for a View Controller and drag that onto your storyboard canvas.  Next up is a bit that got me a bit stuck.  At the bottom of the screen you will see selectors for width and height.  Make sure you set that to ```Any Any``` as this will give you the general settings for all devices.  You can then fine tune things if you like for specific devices.  This is a great addition to make it easy to quickly design for lots of different screeen sizes.

Click at the top of the view controller and set the class as ```MasterViewController``` in the identity inspector as well as selecting "is initial view controller" in the attributes inspector to ensure this will be set as the root view controller.

Now you can drag on a label, text field and button into the view controller and lay them out as you like.

Next you can have some fun with autolayout which is a great way to ensure your layouts remain constant across multiple screen sizes and screen orientations.  I'll try and explain it here using the label as an example which I have at the top of the screen.

Press ctrl on the keyboard and then click on the label and drag the mouse to the top of the view and release. You then select the option "Top space to top layout guide".  The label will now always stay locked to that part of the view no matter the screen size.  Do the same by dragging from the label to each side of the view and select "Leading space to container margin".  The label will now always stay that exact distance from the edges of the screen and will expand or shirk depending on the screen size.  Lastly, click and drag inside the label in an up or down direction and release inside the label and select "Height" to ensure the label always stays this height.  Do the same for the rest of the views in the controller except have them pinned to the views above them rather than the top of the view controller.  Again I highly recommend to watch the tutorial I mentioned at the top as it will no doubt be a lot clearer.

Now open up the assistant editor and open the ```Stubs.h``` file. You can ctrl and drag from the UILabel on the storyboard to it's property in the Stubs.h file which connects the view to it's corresponding outlet. Do the same of the other and additionally drag from the button to the ```button_pressed```action.

## AppDelegate

That's all for XCode and now back to the app delegte and my code looks as follows:

``` ruby
class AppDelegate

  def window
    @window ||= UIWindow.alloc.initWithFrame(UIScreen.mainScreen.bounds)
  end

  def storyboard
    @storyboard ||= UIStoryboard.storyboardWithName("Main", bundle: nil)
  end

  def application(application, didFinishLaunchingWithOptions:launchOptions)
    window.rootViewController = storyboard.instantiateInitialViewController
    window.makeKeyAndVisible

    true
  end
end
```

Again I've tidied up my methods but the main thing to note is how I instantiate my storyboard and then set it as the root view controller.

All that's let is to run ```rake``` from the terminal and check out the app. Try it on different screen sizes and rotate the screen to see how the view is always kept consistent.  

That's all for today, hope you enjoyed this introduction to the interface builder with RubyMotion.
