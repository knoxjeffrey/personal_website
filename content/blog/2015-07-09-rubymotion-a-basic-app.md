---
layout: post
title:  "RubyMotion - a basic app"
date:   2015-07-09 17:21:00
categories: RubyMotion
banner_image: ""
featured: false
comments: true
---

To date I have mainly focused on learning Rails as well as improving my front end skills with HTML, CSS, Javascript and jQuery.  However, I'm also really keen to build iOS apps and given my Ruby background I think [RubyMotion](http://www.rubymotion.com/) will be a great way to start building my first app.

<!--more-->

Check out the Rubymotion link above to learn more but in a nutshell, RubyMotion is a way to write native iOS apps (also OS X and Android) in your favourite Ruby language.

## Hello World

The app I'm going to build in this post is a simple hello world type app using a controller and view that displays a simple label and image.

To build the app I initially followed this video by [MotioninMotion](https://motioninmotion.tv/screencasts/50) which I suggest watching first as it explains an awful lot about the basics of running an iOS app.  You can then see how I have changed things around.

However, the video doesn't introduce the concept of separating out contollers and views which I wanted to explore.  I also wanted a cleaner style of code when writing my iOS applications and many RubyMotion tutorials use a very procedural style of coding.  To help get started with this I took inspiration from this [Ray Wenderlich tutorial by Gavin Morrice](http://www.raywenderlich.com/82172/rubymotion-tutorial-for-beginners-part-1) which again I highly recommend reading.

## Getting Started

To kick things off, navigate to the directory where you want to store your iOS app and type ```motion create hello_rubymotion```.  You will see that a new folder is created with everything you need to run the app.  First up, open ```app/app_delegate.rb``` which is a basic class but is the launching point for setting up your application with the method ```application:didFinishLaunchingWithOptions```.  When you open the file you will be presented with the following code:

``` ruby
class AppDelegate

  def application(application, didFinishLaunchingWithOptions:launchOptions)
    rootViewController = UIViewController.alloc.init
    rootViewController.title = 'hello_motion'
    rootViewController.view.backgroundColor = UIColor.whiteColor

    navigationController = UINavigationController.alloc.initWithRootViewController(rootViewController)

    @window = UIWindow.alloc.initWithFrame(UIScreen.mainScreen.bounds)
    @window.rootViewController = navigationController
    @window.makeKeyAndVisible

    true
  end

end
```

It was at this point (straight away!) that I wanted to start introducing a cleaner coding style that whilst may involve slightly more lines of code, I feel it makes reading the code a heck of a lot easier.  This is especially true as the file size starts to grow.  I refactored this to look as follows:

``` ruby
class AppDelegate

  def window
    @window ||= UIWindow.alloc.initWithFrame(UIScreen.mainScreen.bounds)
  end

  def navigation_controller
    @navigation_controller ||= UINavigationController.alloc.initWithRootViewController(main_view_controller)
  end

  def main_view_controller
    @main_view_controller ||= MainViewController.alloc.initWithNibName(nil, bundle: nil)
  end

  def application(application, didFinishLaunchingWithOptions:launchOptions)  
    window.rootViewController = navigation_controller    
    window.makeKeyAndVisible

    true
  end

end
```

Rather than have all the code in a single long method (remember the rules by [Sandi Metz](https://www.youtube.com/watch?v=npOGOmkxuio)), I have used several getter methods which I feel make it easier to see the main features of the app at a glance.  If the style of these methods isn't familiar to you then make sure you read the [Ray Wenderlich tutorial](http://www.raywenderlich.com/82172/rubymotion-tutorial-for-beginners-part-1) to find out more about it.

In this code I have simply set ```navigation_controller``` as the ```rootViewController``` of the window.  The window manages and coordinates the views that an app displays on the device screen and the rootViewController is the main point of navigation for the interface.  All applications are expected to have a root view controller at the end of application lauch.

```navigation_controller``` then instantiates ```main_view_controller``` that is used to control what appears on this initial screen and can also handle user inputs/interactions as well as coordinate with data models or other view controllers.  In this case the view controller will have an easy time of it as all it has to do is load the view.

I am going to follow the Rails file structure and create a new directory for controller files in ```app/controllers/main_view_controller``` that will hold the class ```MainViewController``` and will look as follows:

``` ruby
class MainViewController < UIViewController

  def loadView
    self.view = MainView.alloc.initWithFrame(CGRectZero)
  end

  def viewDidLoad
    self.title = 'Hello'
  end

end
```

A view controller will call the ```loadView``` method automtically when its view property is requested which is done with the method ```initWithNibName:bundle``` in the ```main_view_controller``` method in AppDelegate.  I have set the nibName and nibBundle to nil because I am programatically creating my views rather than using Interface Builder in Xcode.  You can read more about this in the Apple developer docs.

```initWithFrame``` will initialise and return a newly allocated view object with the specified frame rectangle.  In this case I am setting the frame rectangle to ```GRectZero``` which sets the location on screen to (0, 0) and width and height to 0.  This is the eqivalent of ```CGRectMake(0, 0, 0, 0)```.  I set this to zero upon initialisation because I'll be styling the view in my view class.  To to this create a new file in ```app/views/main_view.rb```:

``` ruby
class MainView < UIView

  def initWithFrame(frame)

    super.tap do
      self.backgroundColor = UIColor.whiteColor
      addSubview(label)
      addSubview(red_square)
    end

  end

  def label
    @label ||= UILabel.new.tap do |label|
      label.text = "Hello RubyMotion!"
      label.frame = [[20, 100], [280, 30]]
    end
  end

  def red_square
    @red_square ||= UIView.new.tap do |square|
      square.frame = [135, 150], [50, 50]
      square.backgroundColor = UIColor.redColor
    end
  end

end
```

You may not have seen ```tap``` before but it lets you call methods on an object within a block and returns that object at the end of the block's execution.  This comes in really handy with something like ```initWithFrame``` which normally requires ```return self``` to be placed at the end.

You can see that I am overriding initWithFrame to add subviews to my main view.  The coordinates for the subviews will be in reference to the initialised frame which remember was set to (0, 0, 0, 0).

That's all there is to this simple app and now you are ready to compile check out your work!  To do this simply run ```rake``` from the terminal.  This will run your app in the simulator.  You can also declare the device you would like to use in the simulator with the command ```rake device_name="iPhone 6 Plus"```.  If you have a developer license you can also run the app on your device with the command ```rake device```.  

One last thing that will come in handy is the ability to make changes to the app on the fly.  As a simple example, hold down the cmd key and click on the "Hello Rubymotion!" text.  You will see ```UILabel``` appear in the command line and you can simply type ```self.text = "I've changed it!"``` and the text will change on the app. Nice!

I hope this has been a useful tutorial and I'd be happy to hear your feedback.
