---
layout: post
title:  "Tealeaf Academy Course Three/Week Three - Capybara"
date:   2015-02-24 11:59:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

Before I discuss Capybara I think it will help if I discuss to discuss about the type of testing you can use to ensure that a feature of you site works from beginning to end.

Feature specs are used when you want to test things from the user browser and integrate the different Rails components such as models, controllers, views, helpers, etc to ensure that a feature is properly implemented

Request specs are used when you want to go across multiple requests and responses to ensure that things execute in a sequence.

<!--more-->

Request specs are typically used to ensure that a particular business process works which goes across multiple request/responses.  The choice within Tealeaf Academy is to not use request specs, because the request spec process can be done from a feature spec point of view.  The features specs will operate on the user level as opposed to the request specs which operate on the controller level.  Using feature specs will ensure that the user experience of going through the business process is tested which really is your main focus if the business process is important to you.

#Capybara

I'll be using Capybara for my feature specs will allows me to test my web application by simulating how a real user would interact with my app.  Capybara comes with a default driver, ```Rack::Test``` built in and also supports Selenium.

RackTest is a headless driver which makes it very quick as it doesn't actually have to load up the browser.  However, your application must be a Rack application such as Rails and Sinatra in order for it to work.  Additionally is does not have any support for executing JavaScript.

If you need to test JavaScript then you can use Selenium or Capybara-webkit.  Selenium is quite slow because it actually fires up a real browser and allows you to see how things are happening.  Capybara-webkit is faster because it is a headless browser and therefor doesn't load up the browser although it will be slower than RackTest.

Capybara, like RSpec, has a very intuitive syntax and below are some of the basic commands that can be used:

    visit('page_url') # navigate to page
    click_link('id_of_link') # click link by id
    click_link('link_text') # click link by link text
    click_button('button_name') # fill text field
    fill_in('First Name', :with => 'John') # choose radio button
    choose('radio_button') # choose radio button
    check('checkbox') # check in checkbox
    uncheck('checkbox') # uncheck in checkbox
    select('option', :from=>'select_box') # select from dropdown
    attach_file('image', 'path_to_image') # upload file
    
Someone has kindly produced a cheatsheet for Capybara that provides even more examples and can be found [here](https://gist.github.com/zhengjia/428105)
    
#Example

Below is an example test written in Capybara:

    require 'spec_helper'

    feature "video searches" do
      background do
        object_generator(:video, title: "Godfather")
        sign_in_user
      end

      scenario "user searches for video with exact title" do
        fill_in :video_title, with: "Godfather"
        click_button "Search"
        expect(current_path).to eq(search_videos_path)
        expect(page).to have_selector(".video")
      end
    end
    
This code is used to test a search box I have in the header of my site.  The code for the looks as follows:

    %section#top-header.row
      %h1.col-md-2
        = link_to "MyFLiX"
      - if logged_in?
        %ul.col-md-4.clearfix
          %li= link_to "Videos"
          %li= link_to "My Queue"
          %li= link_to "People"
        = form_tag search_videos_path, method: 'get', class: "col-md-5 navbar-form" do
          .form-group
            = text_field_tag :video_title, nil, class: "form-control", placeholder: "Search for videos here"
            = submit_tag 'Search', name: nil, class: "btn btn-default"

        #user_links.pull-right
          %ul
            %li.dropdown
              %a(href="#" id="dlabel" role="button" data-toggle="dropdown" class="dropdown-toggle" data-target="#")
                Welcome, #{current_user.full_name}
                %b.caret
              %ul.dropdown-menu(role="menu" aria-labelledby="dlabel")
                %li
                  %a(href="#") Account
                  %a(href="#") Plan and Billing
                  %a(href="/sign_out") Sign Out
                  
but the important part of code I need to focus on is this:

    = form_tag search_videos_path, method: 'get', class: "col-md-5 navbar-form" do
      .form-group
        = text_field_tag :video_title, nil, class: "form-control", placeholder: "Search for videos here"
        = submit_tag 'Search', name: nil, class: "btn btn-default"
        
From my tests you can see that ```fill_in :video_title, with: "Godfather"``` simulates entering the text "Godfather" in my text_field_tag, ```:video_title```.  In a similar way ```click_button "Search"``` simulates clicking the submit_tag button ```Search```.

#Another Example

Below is another simple example, this time for a basic sign in form and helps to demonstrate some best practise:

    = form_tag sessions_path do
      = label_tag :username, 'Username'
      = text_field_tag :username
      %br
      =submit_tag 'Sign in', class: 'btn'

and the test is as follows:

    require 'spec_helper'

      feature "User signs in" do
        background do
          User.create(username: 'Jeff', full_name: "Jeff Knox")
        end

        scenario "with existing username" do
          visit root_path
          fill_in 'Username', with: 'Jeff'
          click_button "Sign in"
          expect(page).to have_content("Jeff Knox")
        end
      end
      
Notice in my test that I used the text on the label for ```fill_in```.  This would work equally as well with

    fill_in :username, with: 'Jeff'
    
but typically best practise says to use the label text because it is easier to read.

And there we have a simple introduction to Capybara. Now I'm off to start writing some feature tests!