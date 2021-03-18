---
layout: post
title:  "Tealeaf Academy Course Three/Week Seven - Payments With Stripe Part 3 - Testing"
date:   2015-04-02 13:14:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

In my previous post I went over some of the changes I made to receive Stripe payments in my application and today I'm going to go over ways to test this.  I had previously used the [stripe-ruby-mock](https://github.com/rebelidealist/stripe-ruby-mock) gem which saves a lot of time and effort but I also want to learn the skills of how to write tests myself that can be used to test a 3rd party service.

<!--more-->

(Click on the link to read my last post on the [Payments With Stripe Part 2](../../../../2015/04/01/course-three-week-seven-payments-with-stripe-part-2/)).

## Payment Tests

The first thing I want to test is the ```ExternalPaymentProcessor``` class which looks as follows:

    class ExternalPaymentProcessor
      require "#{Rails.root}/lib/stripe_payment_processor.rb"

      attr_accessor :processed, :error

      def self.create_payment_process(options={})
        response = payment_processor.new(options).process_card
        response == true ? new(processed: response) : new(error: response)
      end

      private

      def initialize(options={})
        @processed = options[:processed]
        @error = options[:error]
      end

      def self.payment_processor
        StripePaymentProcessor
      end

    end

I wanted to test this to check that payments work with valid card details and also that there is an error message and no charge if there are invalid card details.  I won't go into too much detail of the actual test for this rather explain a gem I used called [vcr](https://github.com/vcr/vcr).  The first time I run the tests, the payment providers servers will be hit but vcr will record this first test.  Any future tests will then just re-run this recording and not actually hit the servers of the payment provider.  Therefore the tests will run a lot faster.

In order to use vcr I need to configure it in my ```spec_helper``` file:

    VCR.configure do |c|
      c.allow_http_connections_when_no_cassette = true
      c.cassette_library_dir = 'spec/cassettes'
      c.hook_into :webmock
      c.configure_rspec_metadata!
      c.ignore_localhost = true
    end

and also add the following:

    RSpec.configure do |config|
      config.treat_symbols_as_metadata_keys_with_true_values = true
    end
    
I will explain the configuration options I have used.  Setting ```allow_http_connections_when_no_cassette``` means I can dictate whether I want to allow HTTP requests.  Usually, HTTP requests made when no cassette is inserted will result
in an error.  ```cassette_library_dir``` is where the recording will be stored.  ```hook_into``` determines how vcr hooks into the HTTP requests to record and replay them.  For vcr to work I'm using the [webmock gem](https://github.com/bblimke/webmock) which ties in at the HTTP request level, letting me define mock responses.  For the first request, vcr will allow a real HTTP request but will record the response.  Webmock will then prevent all subsequent HTTP requests and pass back the recorded response that is stored in 'spec/cassettes'.  ```configure_rspec_metadata!``` helps vcr to integrate with RSpec using metadata.  By passing ```:vcr``` as an additional argument after the description
string it will use set the cassette name based on the example's full description.  For example take the follow section of a test:

    describe ExternalPaymentProcessor do

      describe :charge do

        context "with valid card details" do
          it "makes a successful charge", :vcr do

By passing ```:vcr``` the cassette will be stored at 

    spec/cassettes/ExternalPaymentProcessor/charge/with valid card details/makes a successful charge.yml
    
Setting ```treat_symbols_as_metadata_keys_with_true_values = true``` means that you can pass in ```:vcr``` rather than ```vcr: true```.

The ```ignore_localhost``` configuration option can be used to prevent VCR from having any affect on localhost requests. If set to true, it will never record them and always allow them.

##Controller Tests

The important part of my [last post](../../../../2015/04/01/course-three-week-seven-payments-with-stripe-part-2/) for testing was my create action for UsersController:

    def create
      @user = User.new(user_params)
      if @user.valid?
        attempt_card_payment = registration_payment_processor
        if attempt_card_payment.processed
          @user.save
          flash[:success] = "Thank you for registering, please sign in."
          redirect_to sign_in_path
        else
          handle_create_error(attempt_card_payment.error)
        end
      else
        handle_create_error("Please fix the errors in this form.")
      end
    end 
    
    private
    
    def registration_payment_processor
      ExternalPaymentProcessor.create_payment_process(
        amount: 999,
        email: @user.email_address,
        token: params[:stripeToken]
      )
    end
    
    def handle_create_error(error)
      flash[:danger] = error
      render :new
    end
    
You can see in my code that ```attempt_card_payment``` is equal to ```registration_payment_processor``` which instantiates the ExternalPaymentProcessor class.  I won't go into the details of that here although you can read the last post for more info on it.  All you need to know is that this will hit the external servers of my payment provider (Stripe in this case).  I want to be able to run my tests for the UsersController without actually hitting the servers.  I can test the interaction with the payment provider in the ```ExternalPaymentProcessor``` tests but that's not what I need to test here.  In this case I'm just interested in verifying that the flow of the create method works as expected.

In order to stop ```ExternalPaymentProcessor``` hitting the external servers I will use what are known as doubles and stubs in RSpec.

A test double is a simplified object which takes the place of another object in a test. In this case I want a double to take the place of ```attempt_card_payment```.  As an example, take this snippet of my code:

    describe "POST create" do
      context "valid personal details" do

        context "valid card details" do

          let(:attempt_card_payment) { double(:attempt_card_payment) }
          before do
            expect(attempt_card_payment).to receive(:processed).and_return(true)
            allow(ExternalPaymentProcessor).to receive(:create_payment_process).and_return(attempt_card_payment) 
          end

As you can see, I have defined the double ```:attempt_card_payment``` and also asserted that I want ```:processed``` to return true for this test because I am testing valid card details.  Lastly I also want to stub the ```create_payment_process``` on ```ExternalPaymentProcessor``` to let it return whatever I like without ever hitting the external payment provider servers.  Stubbing is also really useful for TDD because it lets me specify the code I want to have without relying on code that’s already there.

## Feature Tests

Lastly I want to talk through my feature test for when a user registers on my site.  I have been using Capybara for my feature tests which works well but this particular page I am testing includes javascript for the payment process.  I will show a snippet of my code below and explain how to make it all work:

    require 'spec_helper'

    feature "User registers", js: true, vcr: true do
      background do 
        visit register_path 
      end

      context "with valid personal info" do
        scenario "with valid card info" do
          fill_in_valid_user_info
          fill_in_valid_card_info
          click_sign_up

          expect(page).to have_content("Thank you for registering, please sign in.")
        end
        
I have already talked about vcr but also note that I have set ```js: true``` which switches to the ```Capybara.javascript_driver``` which is ```:selenium``` by default.  You can read more about the drivers available [here](https://github.com/jnicklas/capybara#asynchronous-javascript-ajax-and-friends).  I used both selenium and poltergeist for my feature tests. Selenium is really handy when you need to debug because it opens the browser when it's running the tests and you can visually see what is happening. However it is also very slow so when I'm done debugging I switch over to poltergeist.  I initially used capybara-webkit but found it to not be as reliable so I switched to poltergeist.  For this to work I need to install both the selenium and poltergeist gems: ```gem 'selenium-webdriver'``` and ```gem 'poltergeist'``` and then in my ```spec_helper``` file I added in ```Capybara.javascript_driver = :poltergeist``` to make poltergeist my default choice.  However, if I wanted to run selenium on an individual test then I could just add it into that test like so:

    feature "User registers", js: true, vcr: true, driver: :selenium do
    
There are a couple of additions I need to make for selenium. Selenium will run on a port other than 3000 so in ```spec_helper``` also add:

    Capybara.server_port = 52662
    
Additionally, in ```config/environments/test.rb``` you need to change ```config.action_mailer.default_url_options = { host: 'localhost:3000' }``` to ```config.action_mailer.default_url_options = { host: 'localhost:52662' }```.
    
I also alter the default Capybara wait time for my tests because they sometimes wouldn't complete in the default 2 seconds so for that simply add to ```spec_helper```:

    Capybara.default_wait_time = 5
    
Lastly, if you use selenium you will also need to install ```gem 'database_cleaner'``` in order to clean the database.  You can read more about this [here](http://devblog.avdi.org/2012/08/31/configuring-database_cleaner-with-rails-rspec-capybara-and-selenium/) but I'll show the settings in ```spec_helper``` to make it work:

    RSpec.configure do |config|

      config.treat_symbols_as_metadata_keys_with_true_values = true

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
    end
    
This is explained much better than I ever could in the last article I linked to so make sure to check it out!

That's it for this post but hopefully this will save you time with setting up your tests because there was quite a few steps to work through for this especially when javascript is involved.