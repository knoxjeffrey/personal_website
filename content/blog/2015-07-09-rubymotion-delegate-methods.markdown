---
layout: post
title:  "RubyMotion - Custom Delegate Methods"
date:   2015-07-09 21:02:00
categories: RubyMotion
banner_image: ""
featured: false
comments: true
---

In this post I'm going to extend the previous post to show how to delegate a button press in a UIView to a UIViewController.  The button will simply push another instance of my UIViewController onto stack and is a simple example of a custom delegate method in RubyMotion.

<!--more-->

(Click on the link to read my last post about [a basic app in RubyMotion](../../../../2015/07/09/rubymotion-a-basic-app/))

To start with, my AppDelegate class is exactly the same as before:

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

Next I'll show the code for my UIView which I've changed a bit from the last post.  There is no longer a UILabel and UIView added as subviews but instead a UIButton:

``` ruby
class MainView < UIView

  attr_accessor :delegate

  def initWithFrame(frame)

    super.tap do
      self.backgroundColor = UIColor.whiteColor
      addSubview(button)
    end

  end

  def button
    @button ||= UIButton.new.tap do |button|
      button.setTitle("Say Hello Again", forState: UIControlStateNormal)
      button.setTitleColor(UIColor.blueColor, forState: UIControlStateNormal)

      button.addTarget(self, action: :delegate_button_press, forControlEvents: UIControlEventTouchUpInside)

      button_width = 280
      screen_center = UIScreen.mainScreen.bounds.size.width/2
      button.frame = [[screen_center - button_width/2, 100], [button_width, 30]]
    end
  end

  def delegate_button_press
    if self.delegate.respond_to?("say_hello_again")
      self.delegate.say_hello_again
    end
  end

end
```

The first thing to notice is that I create getter and setter methods for delegate by using ```attr_accessor :delegate```.  Within the button method I set the method for the action that happens when a button is pressed.  ```delegate_button_press``` will check to see if the view controller for this view responds to a method called ```say_hello_again``` and if so then it calls the method.  This will make sense when you see the code for the UIViewController:

``` ruby
class MainViewController < UIViewController

  def loadView
    @main_view = MainView.alloc.initWithFrame(CGRectZero).tap do |view|
      view.delegate = self
    end

    self.view = @main_view
  end

  def viewDidLoad
    self.title = 'Hello'
  end

  # delegate method
  def say_hello_again
    main_view_controller = MainViewController.alloc.initWithNibName(nil, bundle: nil)
    self.navigationController.pushViewController(main_view_controller, animated: true)
  end

end
```

You can see in the ```loadView``` method that I have set the delegate of the view to be this UIViewController and then you can see where I have declared the ```say_hello_again``` method that the button in the UIView calls.  

This is a simple example of how to create a custom delegate method but this is a technique that will be used time and time again so it's really useful to understand how to implement it.  Happy delegating!
