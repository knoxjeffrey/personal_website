---
layout: post
title:  "Tealeaf Academy Course Three/Week Eight - Subscription Payment Failures With Stripe"
date:   2015-04-08 17:21:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

In the last post I talked about how to create a customer subscription within my application and today I will explain how to deal with a future payment failure for customer subscriptions.  This can happen for many reasons such as the card becoming expired for example.

<!--more-->

(Click on the link to read my last post on the [Subscriptions With Stripe](../../../../2015/04/08/course-three-week-eight-subscriptions-with-stripe/))

When a payment fails, Stripe will send a callback to my webhook with the ```charge.failed``` event.  In order to build a test for this I need to examine the response and I can do this by going to the Stripe dashboard and clicking on "Customers".  Click on one of the valid customers that has a valid card.  What I want to do is to then simulate a failed payment for this customer.  Go to the [Stripe testing docs](https://stripe.com/docs/testing) and look for the card number "4000000000000341" which allows you to attach the card to a customer but any attempts to charge the card will fail.  Copy that number and add it to the customer, also delete the valid card.

Still on that customer, just below where you added the card, click "create a payment" and make the payment.  You will be informed that the payment failed.  Go back to "Events and Webhooks" and search for that payment failed event.  Click on that and then open up the webhook details to get the response.

Copy that and I can create a new request spec under ```spec/requests/deactivate_user_on_failed_charge.rb``` which will look something like this:

    require 'spec_helper'

    describe 'Deactivate user on failed charge' do

      let(:event_data) do
        {
          "id" => "evt_15pF2nHKQF0Nl4V6p6hZA7oS",
          "created" => 1428483621,
          "livemode" => false,
          "type" => "charge.failed",
          "data" => {
            "object" => {
              "id" => "ch_15pF2nHKQF0Nl4V66gthOpky",
              "object" => "charge",
              "created" => 1428483621,
              "livemode" => false,
              "paid" => false,
              "status" => "failed",
              "amount" => 999,
              "currency" => "gbp",
              "refunded" => false,
              "source" => {
                "id" => "card_15pF1gHKQF0Nl4V6CMT7I7Jd",
                "object" => "card",
                "last4" => "0341",
                "brand" => "Visa",
                "funding" => "credit",
                "exp_month" => 4,
                "exp_year" => 2016,
                "fingerprint" => "28HCaSm99cD0Xpct",
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
                "customer" => "cus_60zoM8D3o61YcN"
              },
              "captured" => false,
              "balance_transaction" => nil,
              "failure_message" => "Your card was declined.",
              "failure_code" => "card_declined",
              "amount_refunded" => 0,
              "customer" => "cus_60zoM8D3o61YcN",
              "invoice" => nil,
              "description" => "this will fail",
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
                "url" => "/v1/charges/ch_15pF2nHKQF0Nl4V66gthOpky/refunds",
                "data" => []
              }
            }
          },
          "object" => "event",
          "pending_webhooks" => 1,
          "request" => "iar_61HcD5FWrkFtxL",
          "api_version" => "2015-03-24"
        }
      end

      it "deactivates a user with the webhook data from stripe for charge failed", :vcr do
        valid_user = object_generator(:user, customer_token: "cus_60zoM8D3o61YcN")
        post "/stripe_events", event_data
        expect(valid_user.reload).not_to be_active
      end

    end
    
I can then handle this in my ```stripe.rb``` file in the ```charge.failed``` event:

    Stripe.api_key = ENV['STRIPE_SECRET_KEY']

    StripeEvent.configure do
      subscribe 'charge.succeeded' do |event|
        charge_info = event.data.object
        user = User.find_by(customer_token: charge_info.customer)
        Payment.create(user: user, amount: charge_info.amount, reference_id: charge_info.id)
      end

      subscribe 'charge.failed' do |event|
        charge_info = event.data.object
        user = User.find_by(customer_token: charge_info.customer)
        user.deactivate!
      end
    end
    
I now need to create the ```deactivate!``` method in ```user.rb```:

    class User < ActiveRecord::Base

      ...

      def deactivate!
        self.update_column(:active, false)
      end
    end
    
Additionally I need to create a new column in the users table called active with the following migration:

    class AddActiveToUsers < ActiveRecord::Migration
      def change
        add_column :users, :active, :boolean, default: true
      end
    end
    
Note that I have to set a default of true because without this all my users will have active set as false.  Note that this updates all of the user records in the application to have active set as true.

The last thing to do is to ensure that a deactivated user cannot sign in and I can handle this in my ```SessionsController``` with a check of ```user.active?```:

    class SessionsController < ApplicationController

      ...

      def create
        user = User.find_by(email_address: params[:email_address])

        if user && user.authenticate(params[:password])
          if user.active?
            login_user!(user)
          else
            flash[:danger] = "Your account has been suspended, please contact customer services."
            redirect_to sign_in_path
          end
        else
          flash[:danger] = "There is a problem with your username or password"
          redirect_to sign_in_path
        end
      end

      ...

      private

      def login_user!(user)
        session[:user_id] = user.id #this is backed by the browsers cookie to track if the user is authenticated
        flash[:success] = "Welcome #{current_user.full_name}, you're logged in!"
        redirect_to home_path
      end

      ...

    end
    
That's a simple walkthrough of how to handle payment failures in Stripe but feel free to add more to this such as sending an email to inform the customer that their account is suspended.