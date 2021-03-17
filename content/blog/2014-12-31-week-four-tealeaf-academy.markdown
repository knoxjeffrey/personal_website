---
layout: post
title:  "Tealeaf Academy Week Four"
date:   2014-12-31 09:49:00
categories: Tealeaf Academy
banner_image: "/media/sinatra.gif"
featured: true
comments: true
---

Well, that's it I've finished week four and also the first Tealeaf Academy course.  It has been a massive learning curve but I've got my first web application up and running called [Blackjack World](http://knoxjeffrey-blackjack.herokuapp.com). Check it out and have a play!

<!--more-->

##Week 4 of Course 1

Week 4 built upon the work I did in the previous week by using [jQuery](http://jquery.com/), [Ajax](http://api.jquery.com/jquery.ajax/) and hosting the application at [Heroku](https://www.heroku.com/).  There wasn't quite as much work involved this week but I still managed to make it hard by making some stupid mistakes!

##Must Stop Making Stupid Mistakes!

The first problem that took me a while to debug was based around a feature of the game that automated the dealer taking cards after the user had decided to stick.  I has this up and running quickly on the first implmentation when there was no Ajax:

    <% if @dealer_playing %>
      <script>setInterval(function () {window.location = "/dealer_hit"}, 1500);</script>
    <% end %>
    
This worked fine intially because as soon as the dealer had finished then the url path would change and the setInterval would no longer take effect.  After adding Ajax the method looked as follows:

    <% if @is_dealer_playing %>
      <script>setInterval(function () {
        $.ajax({
            type: 'GET',
            url: '/blackjack/dealer'
        }).done(function(msg) {
            $('#blackjack').replaceWith(msg);
        });
        return false;
        }, 1500);
      </script>
    <% end %>
    
The problem now was that with Ajax the url path was not changing so even when the dealer was finished the setInterval was still running and executing other code in main.rb like adding or subtracting to/from the bank account.  Because this code worked initially I didn't even think this would be the issue and it took me a while to figure out what was wrong.  In the end all it needed was a simple rewrite of changing setInterval to setTimeout so that the code only executed once each time it was called. Several hours work for for something that took 2 seconds to change! I guess that's the way it's going to be at the start as I'm learning and I'll get quicker at identifying issues.  It's definitely easier finding bugs though when there's an error stack trace to look at. The problem in this case was that the code all worked, just not as expected and that's another debugging skill I'll have to learn. 

One other problem I had was with hosting the app on Heroku.  I had all my previous procedural and OOP blackjack code in a folder and I just added the web app code in a sub folder totally forgetting that Heroku needed the app code to be in the root folder.  After messing with the Heroku install for quite some time and reading documentation, it finally clicked what I had done wrong.  Won't be doing that again!

##Bootstrap

I went about this project with the thinking that first I get the application working and then I start changing the user interface.  This seems like a good approach to take with any future projects so I can quickly prototype ideas and show how they work to clients.  There's a good chance that a client will want to make functional changes as I work through the development stages and it seems like a waste of resources to worry about the user interface at this stage.  Once the function is better defined then I can work on the interface.  This stage looks like it will almost take more work that the backend and it would be better to only have to do it once rather than constantly making large scale UI changes throughout the development process. 

I've only ever used templates before for any sites I've built on Wordpress and tinkered a bit with the CSS so this is the first time I've started with a blank canvas.  There was a bit of a learning curve to Bootstrap but the documentation is really good so I could figure things out and with a bit more practise it'll only get easier.  I was really happy with the end product, especially given that it will work across different screen sizes.

##End Of The Course

Sinatra is a really nice DSL that I'm sure I'll use again for simple web applications where the full power of Rails isn't needed.  I've enjoyed manually handling the backend process to get a better feel for how it all works.  In the past I've only had an understanding of the front end and this course has massively helped my understanding of the entire process, not just what the user sees.  I still find myself having to go back to the HTTP book that I read in week 3 but all the information is starting to stick in my head better now especially after the practical application of building the game.

Can't wait for the second part of the course now and getting my hands on Rails!

