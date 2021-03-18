---
layout: post
title:  "Tealeaf Academy Course Three/Week Eight - Subscriptions With Stripe"
date:   2015-04-08 11:09:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

I've covered making payments with Stripe in my recent blog posts and the final part of this is creating and handling customer subscriptions rather than just one off payments.

<!--more-->

In order to handle subscriptions I have to first go to the Stripe dashboard and click "Plans" and then create a new plan.  The next step is to subscribe a customer to a plan within the application and the way to do this can be found in the [Stripe documentation](https://stripe.com/docs/tutorials/subscriptions).  Using this I have extended my ```StripePaymentProcessor``` class from the previous posts to include a subscribe_customer method:

    class StripePaymentProcessor

      attr_reader :amount, :email, :token
      attr_accessor :error_message, :response

      def initialize(options={})
        @amount = options[:amount]
        @email = options[:email]
        @token = options[:token]
      end

      def process_card
        begin
          charge = Stripe::Charge.create(
          amount: amount,
          currency: "gbp",
          source: token,
          description: "Charge for #{email}"
          )
          self.response = charge
        rescue Stripe::CardError => e
          self.error_message = e.message
        end 
      end

      def subscribe_customer
        begin
          customer = Stripe::Customer.create(
            :source => token,
            :plan => "myflix",
            :email => email
          )
          self.response = customer
        rescue Stripe::CardError => e
          self.error_message = e.message
        end
      end

    end

You may notice that I have altered my response for successful charges slightly to return the entire response from Stripe rather than just returning true.  This was because I needed more information from the response for a subscription as you will see below.  To be honest this is probably a better design anyway to keep the class more flexible.

I mentioned before that I have designed my 3rd party services to not be too tightly coupled with my application so I have an ```ExternalPaymentProcessor``` class that I use so I can easily swap payment providers.

    class ExternalPaymentProcessor
      require "#{Rails.root}/lib/stripe_payment_processor.rb"

      attr_accessor :processed, :error

      #based on whether the response from the payment processor returns an id.
      def self.create_payment_process(options={})
        payment_response = payment_processor.new(options).process_card
        create_new_instance_from_response(payment_response)
      end

      def self.create_customer_subscription(options={})
        payment_response = payment_processor.new(options).subscribe_customer
        create_new_instance_from_response(payment_response)
      end

      def successful?
        processed.present?
      end

      def customer_token
        processed.id
      end

      private

      def initialize(options={})
        @processed = options[:processed]
        @error = options[:error]
      end

      def self.payment_processor
        StripePaymentProcessor
      end

      def self.create_new_instance_from_response(payment_response)
        payment_response.try(:id).present? ? new(processed: payment_response) : new(error: payment_response)
      end

    end
    
## Pulling Info From Stripe Response

I mentioned above that I need to extract more information from the Stripe response when dealing with subscriptions because I need to store a Stripe customer reference within my ```Users``` table and also a reference id within my database.  This information will help me deal with failed payments that happen after the initial signup.  My customers on MyFLiX will be charged monthly and if one of those payments fail then I need a way to know which customer has failed the payment so I can lock them out of the application.  I also want to keep a log of customer payments within my database so a payment reference will need to be extracted for this.

In order to achieve this I need to be notified of events that happen in my Stripe account not just at the initial sign up but also when payments fail at some point in the future.  This can be achieved by using a webhook.  In order to use the webhook I need to register a URL that stripe can notify any time an event happens in my account.

A simple way to test this initially is to use [RequestBin](http://requestb.in/) to register a URL with Stripe.  Simply go to RequestBin and create a request which will give you a URL.  Copy that URL and go to your Stripe Account Settings, click "Webhooks" and then "Add Endpoint". Paste in the URL and when it is created send a test webhook with an event of "charge.succeeded".  With that done go back to RequestBin and refresh the page to see the raw body response.

I can test the response again by actually going through the process of signing up a user in my application and then visiting "Events and Webhooks" on the Stripe dashboard.  If I click on the event of the charge for £9.99 then I can click on the Webhook details to once again get the response.  Refreshing RequestBin you will also see the same info.

That's all well and good to see the response but now I need a way to integrate a Stripe Webhook into my application and for this I will use the [stripe_event](https://github.com/integrallis/stripe_event) gem.  With that installed I need to define my webhook URL in ```routes.rb```:

    mount StripeEvent::Engine, at: '/stripe_events'
    
and then in ```config/initializers/stripe.rb``` I need to handle the different events and for now I will start with the basic template for ```charge.succeeded```:

    Stripe.api_key = ENV['STRIPE_SECRET_KEY']

    StripeEvent.configure do
      subscribe 'charge.succeeded' do |event|

      end
    end
    
At this point it is worth mentioning about testing because I am not using a controller to handle the post given that the post is done by Stripe so instead I need to make use of RSpec's Request Spec to store my test under ```spec/requests/create_payment_on_successful_charge_spec.rb``` and in the test I can use the response info from earlier to build up my test conditions:

    require 'spec_helper'

    describe "Create payment on successful charge" do

      let(:event_data) do
        {
          "id" => "evt_15otUBHKQF0Nl4V6P32npDqY",
          "created" => 1428400751,
          "livemode" => false,
          "type" => "charge.succeeded",
          "data" => {
            "object" => {
              "id" => "ch_15otUBHKQF0Nl4V63YD9IWT6",
              "object" => "charge",
              "created" => 1428400751,
              "livemode" => false,
              "paid" => true,
              "status" => "succeeded",
              "amount" => 999,
              "currency" => "gbp",
              "refunded" => false,
              "source" => {
                "id" => "card_15otU9HKQF0Nl4V6RmxN2794",
                "object" => "card",
                "last4" => "4242",
                "brand" => "Visa",
                "funding" => "credit",
                "exp_month" => 4,
                "exp_year" => 2015,
                "fingerprint" => "6lWhPIX7MfuqxkVU",
                "country" => "US",
                "name" => nil,
                "address_line1" => nil,
                "address_line2" => nil,
                "address_city" => nil,
                "address_state" => nil,
                "address_zip" => nil,
                "address_country" => nil,
                "cvc_check" => "pass",
                "address_line1_check" => nil,
                "address_zip_check" => nil,
                "dynamic_last4" => nil,
                "metadata" => {},
                "customer" => "cus_60vKaWIn4BUzXr"
              },
              "captured" => true,
              "balance_transaction" => "txn_15otUBHKQF0Nl4V6IJkAxQVS",
              "failure_message" => nil,
              "failure_code" => nil,
              "amount_refunded" => 0,
              "customer" => "cus_60vKaWIn4BUzXr",
              "invoice" => "in_15otUBHKQF0Nl4V6gKSsP6BO",
              "description" => nil,
              "dispute" => nil,
              "metadata" => {},
              "statement_descriptor" => nil,
              "fraud_details" => {},
              "receipt_email" => nil,
              "receipt_number" => nil,
              "shipping" => nil,
              "application_fee" => nil,
              "refunds" => {
                "object" => "list",
                "total_count" => 0,
                "has_more" => false,
                "url" => "/v1/charges/ch_15otUBHKQF0Nl4V63YD9IWT6/refunds",
                "data" => []
              }
            }
          },
          "object" => "event",
          "pending_webhooks" => 1,
          "request" => "iar_60vKtXvoFmgoxA",
          "api_version" => "2015-03-24"
        }
      end
      
      it "creates a payment with the webhook from stripe for a successful charge", :vcr do
        post '/stripe_events', event_data
        expect(Payment.count).to eq(1)
      end

      ...

    end
    
You can see from the above snippet of a test that I'm sending a post request with the ```event_data``` which I expect to be handled by ```subscribe 'charge.succeeded' do |event|``` and within that I will be creating a new payment in the ```Payments``` table.

My ```stripe.rb``` ended up looking like this in order to handle this:

    Stripe.api_key = ENV['STRIPE_SECRET_KEY']

    StripeEvent.configure do
      subscribe 'charge.succeeded' do |event|
        charge_info = event.data.object
        user = User.find_by(customer_token: charge_info.customer)
        Payment.create(user: user, amount: charge_info.amount, reference_id: charge_info.id)
      end
    end
    
The first thing it looks for is the customer string in the event data in order to identify the user.  The customer string is created by Stripe when the user first subscribes to the MyFLiX application.  I capture the customer string in the ```UsersController``` at the point of signing up:

    class UsersController < ApplicationController

      ...

      def create
        @user = User.new(user_params)
        if @user.valid?
          attempt_card_payment = subscription_payment_processor
          if attempt_card_payment.successful?
            @user.customer_token = attempt_card_payment.customer_token
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

      def show
        @user = User.find(params[:id])
      end

      ...

      private

      def user_params
        params.require(:user).permit(:email_address, :password, :full_name)
      end

      def subscription_payment_processor
        ExternalPaymentProcessor.create_customer_subscription(
          email: @user.email_address,
          token: params[:stripeToken]
        )
      end

      def handle_create_error(error)
        flash.now[:danger] = error
        render :new
      end

    end
    
I am capturing the data with the following line from above:

    @user.customer_token = attempt_card_payment.customer_token
    
which uses the ```customer_token``` method from my ```ExternalPaymentProcessor``` class.  If you look at that class again you will see that I am taking the ```id``` from the Stripe response when creating a new customer on signup and you can see that response in the documentation [here](https://stripe.com/docs/api/ruby#customers).  Obviously I also have to create a ```customer_token``` column in the users table.

I also need to create the ```payments``` table with columns from user_id, amount and reference_id.  One important thing to remember for the amount is to store the value as an integer and therefore in pence (or whatever the currency is) so there is no ambiguity in the amount that you would have with decimal values.  The model is pretty simple because I just need to be able to query the users table from payments:

    class Payment < ActiveRecord::Base
      belongs_to :user
    end
    
## ngrok
    
At this point I am nearly done but one last thing to note is that the webhooks from Stripe cannot hit my local machine directly so what I need is a tunnelling service which establishes a secure tunnel between the tunnelling server and my local machine and that tunnelling server can pass through all the traffic to my local machine.  For this I used the [ngrok](https://ngrok.com/) with the command ```brew install ngrok```.  Then to start this up simply type ```ngrok 3000``` if you are using port 3000.  With this running simply copy the forwarding url and then enter this as the webhook in Stripe with the extension of where you have your StripeEngine mounted which in my case looked like this:

    http://ca13feb.ngrok.com/stripe_events
    
Also make sure to delete the webhook earlier from RequestBin.

That's all for now, in the next post I'll go over how to handle failed payments and how to lock down access to the MyFLiX application