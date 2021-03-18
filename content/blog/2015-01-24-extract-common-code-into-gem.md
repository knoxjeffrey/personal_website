---
layout: post
title:  "Extract Common Code Into A Gem"
date:   2015-01-24 20:20:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

If I had another project that I wanted to add the functionality of voting to then I would be better making a Gem. To begin with I need to install gemcutter.  Next I have to make sure I exit my current project folder because the Gem is a completely separate project. Then create a new project called voteable-gem and then it needs a gem specification file which I call ```voteable.gemspec``` and it will look as follows:

    Gem::Specification.new do |s|
      s.name = "voteable_knoxjeffrey"
      s.version = '0.0.0'
      s.date = "2015-01-23"
      s.summary = "A voting gem"
      s.description = "A simple gem for counting votes"
      s.authors = ['Jeffrey Knox']
      s.email = 'knoxjeffrey@outlook.com'
      s.files = ['lib/voteable_knoxjeffrey.rb']
      s.homepage = "htp://github.com"
    end
    
<!--more-->
    
If you look at s.files you will see the folder and file in which my code exists so I now have to add a lib folders and my ```voteable_knoxjeffrey.rb``` file.  In that file I can just copy and paste the code from earlier:

    module VoteableKnoxjeffrey
      extend ActiveSupport::Concern

      included do
        has_many :votes, as: :voteable
      end

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

With that done I have to package the gem into a .gem file (need gemcutter for this) so first I have to build the gem with the command ```gem build voteable.gemspec``` and that will create a .gem file in my directory.  I can now push the gemfile to rubygems.org:

    gem push voteable_knoxjeffrey-0.0.0.gem
    
I can double check the gem is there with ```gem list -r voteable_knoxjeffrey```

The cool thing now is that I can include this gem in my project and remove my Voteable module as well as the include references to it in my Post and Comment models. Go to the Gemfile and include the gem:

    gem 'voteable_knoxjeffrey'
    
Now, in order to use the gem I have to navigate to application.rb and add ```require 'voteable_knoxjeffrey'```. Additionally I have to add ```include VoteableKnoxjeffrey``` to my Post and Comment models.

In the future, if I want to make changes to the VotableKnoxjeffrey gem then I have to change the version number and I'll now have 2 versions on my local machine but when I upload to rubygems.org that latest one will replace the older one.  I will also have to reference the actual version in my rails Gemfile so it knows there's a new version.

Something interesting to know is that if I'm testing locally I don't want to have to keep pushing to rubygems so in this case I can specify the local pathname in my rails Gemfile:

    gem 'voteable_knoxjeffrey', path: '/Users/knoxjeffrey/Rails/voteable-gem'
    
and then ```bundle install``` to use it.
    
The handy thing about using the local gem is that I don't have to bundle install every time I make a modification to the VoteableKnoxjeffrey module. The when I'm done I can upload it to rubygems.

If I ever want to remove the gem from rubygems I can issue this command:

    gem yank voteable_knoxjeffrey -v '0.0.0'