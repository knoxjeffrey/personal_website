---
layout: post
title:  "Extract Common Model Code to Modules"
date:   2015-01-24 20:07:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

In a previous post I wrote a post about how to do this and this post goes through some more ways to achieve the same result in a slightly more succint way.  In order to use a module in this case I have to define a path in rails in which to find the module.  I need to go to application.rb and add in this line of code:

    config.autoload_paths += %W(#{config.root}/lib)
    
This is essentially saying to add the array (%w is a notation to write an array of strings eg %w(foo bar) returns ['foo', 'bar']) into the autoload paths.  config.root is the application root path and lib is the folder under this.

<!--more-->

In my application I have repeated code for counting votes in my Post and Comment models. I can extract this to a voteable.rb file under the lib file and create a module called Voteable:

    module Voteable
      #this means that all my instance methods in here are going to be instance methods when I include or mixin this module
      extend ActiveSupport::Concern
    
      def total_votes
        up_votes - down_votes
      end

      def up_votes
        self.votes.where(vote: true).size
      end

      def down_votes
        self.votes.where(vote: false).size
      end
    
    end
    
Now just type ```include Voteable``` in any class you want to use it in.  

Other redundant code in my models is ```has_many :votes, as: :voteable``` so ActiveSupport::Concern gives me the ability to include this in my Voteable module by doing the following:

    included do
      has_many :votes, as: :voteable
    end
    
Using Concerns is a rails specific way to do it.  Another traditional Ruby metaprogramming approach would be to do the following instead:

    module Voteable
      def self.included(base)
        base.send(:include, InstanceMethods)
        base.extend ClassMethods
        base.class_eval do
          my_class_method
        end
      end
      
      module InstanceMethods
      
        def total_votes
          up_votes - down_votes
        end

        def up_votes
          self.votes.where(vote: true).size
        end

        def down_votes
          self.votes.where(vote: false).size
        end
      end
      
      module ClassMethods
        def my_class_method
          has_many :votes as: :voteable
        end
      end
    end
    
    
With the voting taken care of I have some more redundant code to clear up in Post, User and Category for dealing with generating a slug.  Once again I create a file in /lib, this time called sluggable.rb that has a module called Sluggable. Now, in my Post model I have to include the model with ```include Sluggable```.  This time I have one other step to make and that is to pass into the module the column name that holds the slug name because this will be different for every class that includes my Sluggable module.  This is done by adding

    sluggable_column :title

It is title in this case but just change this to whatever column you want to base the slug on. Mu moule now looks as follows:

    module Sluggable
      extend ActiveSupport::Concern

      #this is run as soon as the module is included
      included do
        before_save :generate_slug!
        class_attribute :slug_column
      end

      #changes to_param method to look for slug rather than the default of id
      def to_param
        self.slug
      end

      def generate_slug!
        #self.class will be the model that includes the module and slug_column is the
        #class attribute set in the class method
        #therefore self.send will equate to self.title or example is title is the class attribute
        the_slug = to_slug(self.send(self.class.slug_column.to_sym))
        obj = self.class.find_by(slug: the_slug)
        count = 2
        #will keep appending a number if the slug name generated is the same as one already set in the database
        #eg. if "something" is already in the database then it will be something-2, etc
        while obj && obj != self
          the_slug = append_suffix(the_slug, count)
          obj = self.class.find_by slug: the_slug
          count += 1
        end
        self.slug = the_slug.downcase
      end

      def append_suffix(str, count)
        if str.split('-').last.to_i != 0
          return str.split('-').slice(0...-1).join('-') + '-' + count.to_s
        else
          return str + "-" + count.to_s
        end
      end

      def to_slug(name)
        str = name.strip
        str.gsub!(/\s*[^A-Za-z0-9]\s*/, '-') #replace all non alphnumerics with a -
        str.gsub!(/-+/, '-') #replace consequtive - with a single -
        str.gsub!(/(^-+)|(-+$)/, '') #strip out - at start and end of string
        str.downcase
      end

      #the class method is called as soon as the module is included due to sluggable_column in the model
      #the column name passed in from the model is used to set the slug_column class_attribute
      module ClassMethods
        def sluggable_column(column_name)
          self.slug_column = column_name
        end
      end
    end

I've commented this fairly heavily to make it easier to understand what is going on but it is quite complicated and involves some metaprogramming which is quite new to me.  Now I just include the module in the other models I want to use it in, remembering to set the sluggable_column each time.