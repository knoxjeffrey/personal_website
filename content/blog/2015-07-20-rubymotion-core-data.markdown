---
layout: post
title:  "RubyMotion - Core Data"
date:   2015-07-20 11:51:00
categories: RubyMotion
banner_image: ""
featured: false
comments: true
---

In today's post I'll quickly go over the setup process to create your models in core data with the CDQ gem.  I won't go into actually working with the models in your app just yet but I will cover that in a later app.  This should serve as a handy reminder for the setup process and I'll use two example models in this example.

<!--more-->

If you've come from a Rails background you'll feel right at home with the CDQ gem as it feels very like working with ActiveRecord.  To get started you need to add the gem to your Rakefile:

``` ruby
gem 'cdq'

bundle
```

Then run the command ```cdq init``` which creates a schemea folder to hold the information about your models and have a boiler plate file to get you started.  Clear that boiler plate code and add your own code.  In this case I'm going to use 2 models, Person and Post:

``` ruby
schema "0001 initial" do

  entity "Person" do
    string :name
    string :bio

    has_many :posts
  end

  entity "Post" do
    string :title
    string :content

    datetime :created_at
    datetime :updated_at

    belongs_to :person
  end

end
```

Then run the command ```rake schema:build``` to build the data model which you will see in the resources folder with extension ```.xcdatamodeld```.

One other thing to not about ```cdq init``` is that it adds ```task :"build:simulator" => :"schema:build"``` to the bottom of your Rakefile to ensure the schema is up to date.  However, this only works for the simulator.  If you are building for your device you will have to run ```rake "schema:build"``` first.

Then create the model classes:

``` ruby
cdq create model person

cdq create model post
```

You will now have a model folder with the ```person.rb``` and ```post.rb``` files that have a basic class structure inheriting from ```CDQManagedObject```. Here is the post class for example:

``` ruby
class Post < CDQManagedObject

end
```

That's really all there is to the setup and you're now ready to start working with the models in your application which I will cover in a later post.
