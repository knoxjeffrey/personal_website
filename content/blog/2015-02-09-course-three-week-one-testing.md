---
layout: post
title:  "Tealeaf Academy Course Three/Week One - Testing"
date:   2015-02-10 11:24:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

When talking about testing there are three main techniques to talk about:

- Unit tests: models, views, helpers, routes

- Functional tests: controller

- Integration tests: emulate the end user

<!--more-->

Unit tests will test components in isolation.  Functional tests check that given a request this is the response I should get. They test a single request/response cycle so you can see how individual components work together.  Integration tests follow a business process such as register button, fill in form, register, etc.

Within this course I will focus on testing models, helpers, controllers and integration tests for important business logic.

##Testing With RSpec

Adding RSpec to my rails application is pretty straight forward and the instructions can be found [here](https://github.com/rspec/rspec-rails).

In my Gemfile I add:

    group :development, :test do
      gem 'rspec-rails', '~> 3.0'
    end
    
and then I ```bundle install```

From the command line and from the root of my rails application I need to add an rspec folder:

    rails generate rspec:install
    
and this creates a .rspec file file and a spec folder with a ```spec_helper.rb``` file which I can use to configure RSpec.

First up, I want to unit test my models in my Netflix clone, MyFLiX. I create a folder in my spec folder called ```models``` and I'll test my video model first.  Create a new file called ```video_spec.rb```

At this stage my model is quite small and should be easy to test so I'll set it up like so:

    require 'spec_helper'
    
    describe Video do
      
    end
    
I can test this right away to make sure everything is working okay by going to the root of my rails application and typing ```rspec``` and I should see the test running with confirmation in green stating there are zero examples and zero failures.

You can think about writing tests as being more a task of writing a specification by specifying what you want the model to do.  First up I simply want the model to be able to save itself so within the describe block I can specify that by typing:

    it "saves itself"
    
and if I once again type rspec from the command line then I'll be informed that I now have one example and one test pending.  It's really useful to be able to do this because as I think of tests I'd like to implement in the future then I can write them in this way to remind me to implement those features without causing the whole test to just fail.  Then at some point in the future I can then properly code up the feature in the model and write the full test.

To complete the test I now have to fill out the rest of the test like so:

    it "saves itself" do
      video = Video.new(title: "Monk", description: "Series about a detective")
      
      video.save
      expect(Video.first.title).to eq("Monk")
      expect(Video.first.description).to eq("Series about a detective")
      
    end
    
Now I can ```rspec``` this from the command line and this time I will have a notification in green stating that I have one example and zero failures.

##Prepare Database
 
Before Rails 4.1 in order to prepare the test database you would have to run ```rake db:migrate rake db:prepare``` but now Rails takes care of this for you.  Your test database will have the same structure as the development database when you ```rake db:migrate```
    
##Save Yourself Some Work!

I've shown how to write a test to check that a simple save will work but there is no need to actually do this because Rails does this for us and there's really no need to test Rails.  Something to keep in mind is that you should only really test the code that you own.  The above code was just a bit of practise to show the syntax of a test!

What I do need to test though is that video ```belongs_to :category``` and this can simply be written as:

    it { should belong_to :category }
    
and I can also check my validations for the video model like so:

    it { should validate_presence_of :title }
    it { should validate_presence_of :description }
    
Well, that's basics of testing but there's still quite a bit of work to do in week one so I'll write another blog post on further tests I've written.  