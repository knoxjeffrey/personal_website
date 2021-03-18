---
layout: post
title:  "Rails - Common Tasks"
date:   2015-05-10 09:11:00
categories: Rails
banner_image: ""
featured: false
comments: true
---

This won't be the most ground breaking of posts but I wanted to note down a lot of the common tasks I perform in the making of a rails application so I have a single point of reference.

<!--more-->

## Starting off

When kicking off work on a rails project you'll either be starting completely fresh and could follow this sequence of commands to begin:

``` ruby
ruby -v
sqlite3 --version
gem install rails
rails new myproject
```

I like to work with PostgreSQL as my database because this is what I tend to work with in production and it's always a good idea to build your application using the same datbase in development as you would in production.  This could be setup with the command: ```rails new myproject --database=postgresq

If you haven't worked with PostgreSQl before then [this is a handy resourse to follow to get it setup on your machine](http://www.gotealeaf.com/blog/how-to-install-postgresql-on-a-mac){:target="_blank"}.

Next up change the file at ```config/database.yml``` to look something like this:

``` ruby
development:
  adapter: postgresql
  encoding: unicode
  database: myproject_development
  pool: 5
  username: knoxjeffrey
  password:

test:
  adapter: postgresql
  encoding: unicode
  database: myproject_test
  pool: 5
  username: knoxjeffrey
  password:
```

From the command line run ```rake db:create:all``` to create the development and test databases.

The other option is to fork an existing project.  Navigate to the project you wish to fork in GitHub and click "Fork" in the top right corner and choose where you wish to fork it.  That's it, you have a remote copy but of course you'll want to create a local copy.

In your newly forked repository click the button on the right of the page to copy the address to clone your repo.  In the terminal navigate to where you want the repo to be stored locally and enter the following:

```
mkdir ForkedProject
cd ForkedProject
git clone https://github.com/your-username/ForkedProject.git
```

You now have a local clone!

Want to sync your fork with the original repo?  Go back to the original repo you forked from on GitHub and copy the clone url for the repo from the right hand side.  Back in the terminal in your local copy type ```git remote -v``` to see your current remote repositories which of course will be your own remote repository.  To add addition remote repositories type:

    git remote add upstream https://github.com/other-persons_repository/ForkedProject.git

Type ```git remote -v``` again and you'll see the new repository added as an upstream branch.  Good instructions for syncing a fork can be [found here](https://help.github.com/articles/syncing-a-fork/).

# Install gems

Before you install any Rails gems for your project make sure you have Bundler installed.  Bundler provides a consistent environment for Ruby projects by tracking and installing the exact gems and versions that are needed.

    gem install bundler

When you add gems to your Rails Gemfile it's as simple as ```bundle install``` to install them for your project.

## Debugging

The gem [byebug](https://github.com/deivid-rodriguez/byebug) is a handy gem for debugging your Rails application and all you have to do is drop byebug into your code to inspect it at that point in the codebase.

# Working with the database

## New tables

Rails makes it super easy to create database tables. For example, if I want a users table in the database (all database table names are plural) then I can create a migration file with the terminal command ```rails g migration create_users```. This automatically creates a migration file with the following code:

``` ruby
class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
    end
  end
end
```

Within the ```create_table``` block there are many options to add new columns to the database table and below I'll include several examples to show the different types and options:

``` ruby
class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.string :email, null: false, unique: true
      t.integer :age
      t.text :about,  default: ""
      t.integer :credit, default: 0
      t.references :organisation
      t.datetime :current_sign_in_at
      t.datetime :last_sign_in_at

      t.timestamps
    end
  end
end
```

I'll quickly explain what some of the options mean.  ```null: false``` means that the entry cannot be NULL for that particular entry.  ```unique: true``` means that no two entries can have the same data for that column.  ```default: ""``` will automatically create an empty string for the data entry if noting has been entered. ```t.references :organisation``` automatically creates a foreign key of ```organisation_id``` and also ensures it is indexed.  For more info about why you should index your foreign keys [read this](https://tomafro.net/2009/08/using-indexes-in-rails-index-your-associations).

Below is a list of available types:

    integer
    primary_key
    decimal
    float
    boolean
    binary
    string
    text
    date
    time
    datetime
    timestamp

Don't forget to ```rake db:migrate``` when you have finished editing your migrations.

## Add columns

To add a new column type the following example from the terminal ```rails g migration add_gender_to_users```

``` ruby
class AddGenderToUsers < ActiveRecord::Migration
  def change
    add_column :users, :gender, :string
  end
end
```

## Remove columns

To remove a column type the following example from the terminal ```rails g migration remove_gender_from_users```

``` ruby
class RemoveGenderFromUsers < ActiveRecord::Migration
  def change
    remove_column :users, :gender
  end
end
```

## Rename a table

To rename a table type ```rails g migration rename_organisation_table

``` ruby
class RenameOrganisationTable < ActiveRecord::Migration
  def change
    rename_table :organisations, :companies
  end
end
```

## Rename a table column

To rename a table column ```rails g migration rename_users_email_column

``` ruby
class RenameUsersEmailColumn < ActiveRecord::Migration
  def change
    rename_column :users, :email, :email_address
  end
end
```

# Rails models  

Below is an example of how the implementation of a Rails model could look:

``` ruby
class User < ActiveRecord::Base

  has_many :posts, -> { order start: :asc }
  belongs_to :organisation
  has_many :groups, -> { order group_name: :asc }, through: :user_groups

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true

end
```

## Polymorphic associations

With polymorphic associations, a model can belong to more than one other model, on a single association.  I've written a post on this already which can be found [here](../../../../../tealeaf/academy/2015/01/20/course-two-weekthree-voting/).

## Has many through

For this example I have a ```posts``` and ```categories``` table.  A post can have many categories and to record this I will use a ```post_categories``` table.  The basic setup of the models could look as follows:

``` ruby
class Post < ActiveRecord::Base

  has_many :post_categories
  has_many :categories, through: :post_categories

end

class Category < ActiveRecord::Base

  has_many :post_categories
  has_many :posts, through: :post_categories

end

class PostCategory < ActiveRecord::Base
  belongs_to :post
  belongs_to :category
end
```

##  Changing relationship names

Sometimes you may wish to use a more descriptive term to describe the relationship between Rails models.  For example is you have ```users```  and ```posts``` models the Post model would normally look as follows:

``` ruby
class Post < ActiveRecord::Base
  belongs_to :user
  has_many :post_categories
  has_many :categories, through: :post_categories
end
```

However, it would be more descriptive to say that a post has a creator for example rather than a user.  In this case the code would be:

``` ruby
class Post < ActiveRecord::Base
  belongs_to :creator, foreign_key: 'user_id', class_name: 'User'
  has_many :post_categories
  has_many :categories, through: :post_categories
end
```

Nothing in the database has to change we are just renaming the relationship to use in Rails.  Now rather than typing something like ```post.user``` it would be ```post.creator``` which is a lot more descriptive.

## Seeds

Seeding is extremely useful when developing your application.  It allows you to populate your database with data to make it easy to test your application.  The seeds file can be found under ```db/seeds.rb``` and it's as simple as the following to add data:

``` ruby
User.create(email: 'knoxjeffrey@outlook.com', password: 'password', full_name: "Jeff Knox")
User.create(email: 'joe_bloggs@hotmail.com', password: 'password', full_name: "Joe Bloggs")
User.create(email: 'ann_other', password: 'password', full_name: "Ann Other")
```

Just keep following this pattern for any other data you would like in your testing database.  There is a really useful gem called [Fabrication](http://www.fabricationgem.org/) which makes it really easy to create lots of fake data.  For example if I want to create lots of random users I could simply type ```Fabricate.times(50, :users)```  and this would create 50 new user objects for me in the database.  I'll go into more details about Fabricator in the section about testing in this post.

The first time you create the ```seeds.rb``` data you will need to type ```rake db:setup``` from the terminal to populate the database.  If you make any changes after that it is best to use ```rake db:reset``` in order to clear out the database and then repopulate.

## Rails controllers

One of the things I've been trying to work on is keeping my Controllers skinny but also to standardise them as much as possible and use descriptive terms to allow the reader to quickly understand what the controller does.  Here's a sample users controller:

``` ruby
class UsersController < ApplicationController

  attr_reader :user

  def index
    set_users
  end

  def new
    build_user
  end

  def create
    build_user
    if user.save!
      flash[:notice] = "Welcome #{current_user.name}!"
      redirect_to root_path
    else
      render :new
    end
  end

  def show
    set_user
  end

  def edit
    set_user
  end

  def update
    set_user
    if user.update(user_params)
      flash[:notice] = "Your details have been changed #{current_user.name}!"
      redirect_to root_path
    else
      render :edit
    end
  end

  private

  def set_users
    @users = User.all
  end

  def set_user
    @user = User.find(params[:id])
  end

  def build_user
    @user = User.new(user_params)
  end

  def user_params
    if params.has_key?(:user)
      params.require(:user).permit(:name, :email, :phone, :mobile)
    else
      {}
    end
  end

end
```

## Name spacing rails controllers

Name spacing is particularly useful is you several different roles  on your site such as user, admin, moderator, etc.  I have written a post on this previously which you can [find here](../../../../../tealeaf/academy/2015/03/20/course-three-week-six-admins-and-securing-access/)

## Forms

A simple form_for in Rails could look as follows:

``` ruby
= form_for @post do |f|

  = render 'shared/errors', controller_object: @post

    .form-group
      =f.label :title
      = f.text_field :title, class: "form-control"

    .form-group
      = f.label :url
      = f.text_field :url, class: "form-control"

    .form-group
      = f.label :description
      = f.text_area :description, rows: 5, class: "form-control"

    = f.submit @post.new_record? ? "Submit Post" : "Update Post", class: "btn btn-danger"
```

The file in ```shared/_errors.html.slim``` would be as follows:

``` haml
- if controller_object.errors.any?
  .alert alert-danger
    h5
      = pluralize(controller_object.errors.count, 'error') %> in this form:
    ul
      - controller_object.errors.full_messages.each do |msg|
        li= msg
```

A nice gem to help tidy up your forms if you're using Bootstrap is [Rails bootstrap forms](https://github.com/bootstrap-ruby/rails-bootstrap-forms).  The above would then look as follows:

``` ruby
= bootstrap_form_for @post do |f|

  = f.text_field :title
  = f.text_field :url
  = f.text_area :description, rows: 5

  = f.submit @post.new_record? ? "Submit Post" : "Update Post", class: "btn btn-danger"
```

## Name spaced forms

Sometimes you will have forms that are name spaced under admins for example and in that case the beginning of the form would be:

``` ruby
= bootstrap_form_for [:admins, @post] do |f|
```

## Additional form options

In the example below I have a form where a user can edit their details and also upload an avatar image.  I have specified options such as the url and method:

``` ruby
= bootstrap_form_for @user, url: user_path(@user), method: :put, :html => { :multipart => true } do |f|
  = f.email_field :email
  = f.password_field :password
  = f.text_field :full_name
  = f.hidden_field :avatar_cache
  = f.file_field :avatar, label: "Choose Your Profile Image"

  = f.submit "Update", class: "btn bg-olive btn-flat btn-lg"
```

## Collection select

Below is an example of creating a list of check boxes in a form:

``` ruby
= f.collection_check_boxes :group_ids, current_user.groups, :id, :group_name, label: 'Request To Group'
```

When you use ```_ids``` this means it is a polymorphic relationship and your strong params check in the controller would look something like the following:

``` ruby
params.require(:request).permit(:start, :finish, group_ids: [])
```

## Nested attributes

Nested attributes allows you to save attributes on associated records through the parent and has to be turned on by using the ```accepts_nested_attributes``` class method eg:

``` ruby
class Booking < ActiveRecord::Base

  has_many :event_bookings

  has_many :events, through: :event_bookings

  has_many :delegates, through: :event_bookings

  ...

  accepts_nested_attributes_for :event_bookings

  ...

end
```

In the form we would need to use ```fields_for``` which makes it possible to specify additional model objects in the same form. For example:

``` ruby
= bootstrap_form_for(@booking) do |f|

  = f.hidden_field :booker_id, value: current_user.id
  = f.fields_for :event_bookings do |ff|
    = ff.collection_select :delegate_id, User.users_allowed_to_attend_conferences, :id, :name
    = ff.hidden_field :event_id, value: @event.id
```

The controller strong params code would then look something like this:

``` ruby
params.require(:booking).permit(:booker_id, event_bookings_attributes: [:event_id, :delegate_id])
```

This would result in a new entry being created in the ```bookings``` and ```event_bookings``` tables.

# Testing

## Object generators

As mentioned earlier, I use the Fabricator gem for generating new objects.  With Fabricator I can create my object generators in the ```spec/fabricators``` folder.  A User object for example would be stored at ```spec/fabricators/user_fabricator.rb``` and could look as follows:

``` ruby
Fabricator(:user) do
  email { Faker::Internet.email }
  password { Faker::Internet.password(6) }
  full_name { Faker::Name.name }
end
```

Note that I'm using the [Faker gem](https://github.com/stympy/faker) which is really handy to greate randomly generated data for things like names, emails, dates and a whole lot more.

One other thing I've done is to generalise my object generator by creating a new file under ```spec/support/factory_helper.rb``` which looks as follows:

``` ruby
def object_generator(*args)
  Fabricate(*args)
end

def generate_attributes_for(*args)
  Fabricate.attributes_for(*args)
end
```

This means that if I ever change the gem I'm using to generate objects I can easily change the commands in one place rather than have to go through my entire test suite and make changes there.

## Model specs

Here is an example snippet of one of my specs for a user model which is found at ```spec/models/user_spec.rb```:

``` ruby
require 'spec_helper'

describe User do
  it { should have_many(:reviews).order(created_at: :desc) }
  it { should have_many(:queue_items).order(list_position: :asc) }

  it { should validate_presence_of :email_address }
  it { should validate_presence_of :password }
  it { should validate_presence_of :full_name }

  it { should validate_uniqueness_of :email_address }

  it { should_not allow_value("test@test").for(:email_address) }

  it { should validate_length_of(:password).is_at_least(5) }

  describe :queue_item_exists? do
    let(:user) { object_generator(:user) }
    let(:video) { object_generator(:video) }

    it "returns true if current user already has video in the queue" do
      object_generator(:queue_item, user: user, video: video)
      expect(user.queue_item_exists?(video)).to be true
    end

    it "returns false if current does not have video in the queue" do
      object_generator(:queue_item, video: video)
      expect(user.queue_item_exists?(video)).to be false
    end
  end

  ...

end
```
Here are some other simple examples when writing the expect code to test the outcome:

``` ruby
expect(user.waiting_and_accepted_requests).to eq([request2])
expect(user.waiting_and_accepted_requests).to match_array([request1, request2])
expect(user.waiting_and_accepted_requests).to eq([])
expect(Request.first.status).to eq('expired')
expect(tokens_array.sum).to eq(46)
```

## Controller specs

Whilst I initially started out with controller testing I have recently started to move away from them, preferring to test at a higher level with Capybara for example.

## Feature specs

I use Capybara for my feature specs which allows me to test my web application by simulating how a real user would interact with my app.  One thing to note is that you cannot test JavaScript with Capybara but I'll get onto that in the next section.

The first thing I do for my feature specs is to create some helper methods for frequently used actions such as signing in and out for example.  I have to make a small addition in my ```spec_helper.rb``` file:

``` ruby
...

RSpec.configure do |config|
  config.include FeatureSessionHelper, type: :feature

...
```

and then in ```spec/support/feature_session_helper.rb``` I have the following example code:

``` ruby
# only for features. Creates a user and signs them in so they are on the home path
module FeatureSessionHelper

  def sign_in_user(a_user=nil)
    a_user ||= object_generator(:user)
    visit sign_in_path
    fill_in :email_address, with: a_user.email_address
    fill_in :password, with: a_user.password
    click_button "Sign In"
    expect(current_path).to eq(home_path)
  end

  def sign_out
    visit sign_out_path
  end

end
```

I can then create a spec to test the user sign in process at ```spec/features/user_sign_in_spec.rb```:

``` ruby
require 'spec_helper'

feature "user signs in" do

  given(:valid_user) { object_generator(:user) }

  scenario "with existing email and correct password" do
    sign_in_user(valid_user)
    expect_drop_down_to_contain_full_name(valid_user)
  end

  scenario "with incorrect login details" do
    visit sign_in_path
    enter_incorrect_login_details(valid_user)
    click_button "Sign In"
    expect_to_return_to_sign_in_page_and_see_error
  end

  def expect_drop_down_to_contain_full_name(user)
    expect(page.find('.dropdown .dropdown-toggle').text).to have_content user.full_name
  end

  def enter_incorrect_login_details(user)
    fill_in "Email", with: user.email
    fill_in "Password", with: "totally wrong password"
  end

  def expect_to_return_to_sign_in_page_and_see_error
    expect(current_path).to eq(sign_in_path)
    expect(page).to have_content "There is a problem with your username or password"
  end
end
```

Note that, like my controllers, I try to keep my scenarios as descriptive as possible so they are easy to understand at a glance.

## Inspect Capybara errors

Capybara has the handy command ```save_and_open_page``` to allow you to visually see what's happening in the browser which can be really useful for debugging.

To allow CSS and Javascript to be loaded when we use save_and_open_page, the development server must be running at localhost:3000 as specified below or wherever you want. See original issue [here](https://github.com/jnicklas/capybara/pull/609) and final resolution [here](https://github.com/jnicklas/capybara/pull/958).  Add the following to ```spec_helper.rb```

``` ruby
Capybara.asset_host = "http://localhost:3000"
```

## Tests with JavaScript

For tests with JS I prefer to use the [poltergeist gem](https://github.com/teampoltergeist/poltergeist).  In order to switch to the Capybara js driver in your tests you can do the following at the beginning in your scenario:

``` ruby
scenario "user successfully invites friend and is accepted", js: true do
```

Selenium is the default but as mentioned I prefer Poltergeist so I need to set this up in ```spec_helper.rb```:

``` ruby
Capybara.javascript_driver = :poltergeist
Capybara.register_driver :poltergeist do |app|
  Capybara::Poltergeist::Driver.new(app, js_errors: true)
end
```

Sometimes you'll setup records in the test DB, only to have the feature tests act like those records never existed. A way to solve this is with the [database cleaner gem](https://github.com/DatabaseCleaner/database_cleaner) and the setup in ```spec_helper.rb``` looks as follows:

``` ruby
RSpec.configure do |config|

  ...

  config.before(:suite) do
    DatabaseCleaner.clean_with(:truncation)
  end

  config.before(:each) do
    DatabaseCleaner.strategy = :transaction
  end

  config.before(:each, :js => true) do
    DatabaseCleaner.strategy = :truncation
  end

  config.before(:each) do
    DatabaseCleaner.start
  end

  config.after(:each) do
    DatabaseCleaner.clean
  end

  config.use_transactional_fixtures = false

  ...

end
```
