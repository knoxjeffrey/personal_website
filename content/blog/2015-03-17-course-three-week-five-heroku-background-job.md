---
layout: post
title:  "Tealeaf Academy Course Three/Week Five - Heroku Background Jobs"
date:   2015-03-17 15:48:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

In my previous post about using Sidekiq for sending emails as a background job I went through the process of setting it up on a local server but in this post I'm going to talk about getting it working with my production server on Heroku.

<!--more-->

(Click on the link to read my post on [Sidekiq Backgound Email Job](../../../../2015/03/17/course-three-week-five-sidekiq-background-email-job/))

For my application I can have both web processes and worker processes and this can be seen in the last post when I started the rails server for the web process and then Sidekiq for the worker process.

This is pretty simple on my local environment but what happens when I want to deploy to Heroku?  Heroku has a convenient way to deal with this called a Procfile whereby you use it to define all the different types of processes in the application.  Procfile is a text file called ```Procfile``` located at the root of the application.

Within Procfile I can define the Rails server I wish to use as well as the worker.  In my case this will look like:

    web: bundle exec rails server -p $PORT
    worker: sidekiq

If I pushed to Heroku now it would automatically start the processes I have defined but don't do that yet because you will be charged due to needing an extra dyno to run the worker. I'll show how to get around that in a bit.  You can type ```heroku ps``` in the terminal to see how many processes you currently have running.

## Puma

The problem with the default Rails server is that it can only process one request at a time.  The Puma web server offers a big advantage in that it allows for processing of concurrent requests.  You can follow the guide [here](https://devcenter.heroku.com/articles/deploying-rails-applications-with-the-puma-web-server) but I'll go through the steps below.  The documentation for the Tealeaf Academy course suggested using the Unicorn web servers but the [docs on Heroku](https://devcenter.heroku.com/articles/rails-unicorn) suggested using Puma to prevent against a slow client attack. Not a big issue for my coursework application but thought I'd try using Puma anyway.

The other big difference between Puma and Unicorn is that Puma also uses threads in addition to worker processes.  This simply means that Unicorn can handle multiple processes with its workers but each process can only handle one request at a time.  When it's finished, the worker is added back into the pool of workers that are available to handle another incoming request.  Puma has the advantage of also having multiple workers but because it allows for multi-threading it means that each of those worker processes can concurrently handle multiple requests simultaneously.  This will make more use of the available CPU.

One thing to keep in mind is that you can only utilize threads in Puma if the entire code-base is thread-safe, otherwise Puma is still fine to use but you should only utilize the worker processes.  Your code is thread safe if it only manipulates shared data structures in a manner that guarantees safe execution by multiple threads at the same time.  [This article should help to shed more light on what exactly is meant by thread-safe](https://bearmetal.eu/theden/how-do-i-know-whether-my-rails-app-is-thread-safe-or-not/?utm_source=rubyweekly&utm_medium=email).

Adding Puma to the web server is simple, just add the gem to the Gemfile:

     gem 'puma'
     
and ```bundle install```.  Next I need to create a configuration file for Puma at ```config/puma.rb``` with the following code:

    workers Integer(ENV['WEB_CONCURRENCY'] || 2)
    threads_count = Integer(ENV['MAX_THREADS'] || 5)
    threads threads_count, threads_count

    preload_app!

    rackup      DefaultRackup
    port        ENV['PORT']     || 3000
    environment ENV['RACK_ENV'] || 'development'

    on_worker_boot do
      ActiveRecord::Base.establish_connection
    end

To use the Puma server I also need to make a change to my Procfile by replacing this:

    web: bundle exec rails server -p $PORT
    
with this:

    web: bundle exec puma -C config/puma.rb
    
Because I haven't set ```ENV["WEB_CONCURRENCY"]``` it will use the default value of 2 to have 2 Pumas running and therefore with a single Heroku web dyno I will now be running 2 servers.  Amazing!

## Free Background Job

I mentioned above about the worker needing an extra dyno and there would be a cost to this.  However, when you use Puma as your webserver you can spawn Sidekiq workers within your web dyno as described in [this article](https://coderwall.com/p/fprnhg/free-background-jobs-on-heroku)(written for Unicorn but works the same).  All I have to do is change this:

    on_worker_boot do
      ActiveRecord::Base.establish_connection
    end
    
to this:

    on_worker_boot do
      @sidekiq_pid ||= spawn("bundle exec sidekiq -c 2")
      ActiveRecord::Base.establish_connection
    end

Additionally I need to remove the following line from my Procfile:

    worker: sidekiq
    
## Redis To Go

One last thing I need in order to enable background jobs on Heroku is to install Redis To Go on my production server. Click [here](https://addons.heroku.com/redistogo) to visit the page and this has a free plan.

The recent version of Sidekiq no longer has built in support for Reddis To Go so I need to run this line to set the environment variable on your production server:

    heroku config:set REDIS_PROVIDER=REDISTOGO_URL
    
# Foreman

It would be an advantage for my local webserver to load the same processes as my production server and I can run the same webserver by typing ```foreman start``` from the command line which will read from the ```Procfile```.  One issue with this is that I still have to run Sidekiq and the Redis server in separate windows which is a pain.  Another issue is that the [log level](http://guides.rubyonrails.org/debugging_rails_applications.html#log-levels) with Puma (and Unicorn) is set to ```info``` rather than ```debug``` which is fine for production but I get much less detail in my development environment which makes it harder to figure things out when there are problems.

There may well be a better way to do this but in the end I use 2 Procfiles, ```Procfile``` and ```Procfile.dev```.  ```Procfile``` was simply:

    web: bundle exec puma -C config/puma.rb
    
and ```Procfile.dev```:

    web: bundle exec puma -C config/puma.rb -p 3000
    devlog: tail -f log/development.log
    worker: redis-server
    worker: sidekiq
    
Lastly to run my development web server and workers I have to type the following in the command prompt:

    foreman start -f Procfile.dev
    
This works fine but it's a bit of a pain to type this out every time so what I did was to add a new file to the root of my application called ```forman.sh``` with the following code:

    #!/bin/bash

    foreman start -f Procfile.dev
    
and then from the command line from within the directory I typed

    chmod +x ./foreman.sh
    
which sets the script file into an executable that can be run in the shell.  Now all I have to type from the shell is ```./foreman.sh```

Hopefully you've found my post interesting this week, it took me a while to figure out some of this stuff so hopefully you can benefit.