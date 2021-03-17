---
layout: post
title:  "Tealeaf Academy Course Three/Week Six - Payments With Stripe"
date:   2015-03-26 13:46:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

The last part of week three in the Tealeaf Academy course involved implementing another feature that I was excited to learn about - making payments.  Show me the money!

<!--more-->

In the course we are using [Stripe](https://stripe.com/) to process our payments which makes it super simple because of its great documentation. No merchant accounts and no card information flowing through your own servers, everything is handled by Stripe so you receive the money (minus a small handing charge of course) without the hassle.

Naturally the first thing to do at this point is to sign up to Stripe and when you do you will notice that they have a live mode and test mode which is great because whilst building the application I never need to use a real card.  Have a look at the [testing documentation](https://stripe.com/docs/testing) and you can see that that there are lots of card numbers they provide for use in test mode that will generate different outcomes.

Next up include ```gem 'stripe'``` in the Gemfile and ```bundle install```.

The next thing to do is to find your API keys under Account Settings and then generate ENV variables in your application.  I'm using Figaro for this so for instance I would store my data like so in ```application.yml```:

    production:
      STRIPE_SECRET_KEY: 'your secret key'
      STRIPE_PUBLISHABLE_KEY: 'your publishable key'
      
Just replace my mock info with whatever your keys are.

For my example I am actually going to build a [custom form](https://stripe.com/docs/tutorials/forms) with Stripe although you can also use the simpler [Stripe Checkout](https://stripe.com/docs/checkout/guides/rails).  I prefer to use the custom form so I can make the payment form match the look and feel of the rest of my site.

For the MyFLiX application I am getting users to pay a subscription fee when they sign up and for this I need a ```form_for```. The important parts of the ```form_for``` are as follows:

    = form_for @user, html: {id: 'payment-form'} do |f|
    
Notice the id of ```payment-form``` which is really important because it allows me to add a jQuery event handler when hitting submit on my forms.  To include the handler I need to add the following to the top of my view:

    = content_for :head do
      %script(type="text/javascript" src="https://js.stripe.com/v2/")
      :javascript
        Stripe.setPublishableKey("#{ENV['STRIPE_PUBLISHABLE_KEY']}");
      = javascript_include_tag "payment"
      
The ```content_for``` will attach the scripts into the head of my page because of the way my ```application.html.haml``` file is setup:

    !!! 5
    %html(lang="en-US")
      %head
        %title MyFLiX - a video on demand service
        %meta(charset="UTF-8")
        %meta(name="viewport" content="width=device-width, initial-scale=1.0")
        = csrf_meta_tag
        = stylesheet_link_tag "application"
        = javascript_include_tag "application"
        = yield :head
      %body
        %header
          = render 'shared/header'
        %section.content.clearfix
          = render 'shared/messages'
          = yield
        %footer
          &copy 2013 MyFLiX
    
Notice where I have ```= yield :head```, this is where the javascript will be inserted.  The rest of the info in my sign up form is explained in the documentation although notice I have used my ENV variable and I have also included ```= javascript_include_tag "payment"```.  I have this file in ```app/assets/javascripts/payment.js``` which looks as follows:

    jQuery(function($) {
      $('#payment-form').submit(function(event) {
        var $form = $(this);

        // Disable the submit button to prevent repeated clicks
        $form.find('button').prop('disabled', true);

        Stripe.card.createToken($form, stripeResponseHandler);

        // Prevent the form from submitting with the default action
        return false;
      });

      function stripeResponseHandler(status, response) {
        var $form = $('#payment-form');

        if (response.error) {
          // Show the errors on the form
          $form.find('.payment-errors').html('<div class="alert alert-danger">' + response.error.message);
          $form.find('button').prop('disabled', false);
        } else {
          // response contains id and card, which contains additional card details
          var token = response.id;
          // Insert the token into the form so it gets submitted to the server
          $form.append($('<input type="hidden" name="stripeToken" />').val(token));
          // and submit
          $form.get(0).submit();
        }
      };
    });

Notice that it includes that id of ```payment-form``` to attach the event handler when the form is submitted.  Again, you can get all of this from the Stripe documentation but I'll quickly explain how this works.

When the submit button is hit, this function is called ```Stripe.card.createToken($form, stripeResponseHandler);```.  ```$form``` contains all of the credit card data which gets submitted to Stripe and ```stripeResponseHandler``` is used to handle the response from Stripe.  If there are errors it gets displayed on the page so you will need a class of ```.payment-errors``` on the page in order to see the errors.  If successful, a token is returned and inserted into the form in a hidden field.

Going back to the ```form_for``` I also need to include the fields for entering the card data:

    %fieldset.credit_card
      %span.payment-errors
      .form-group
        %label.control-label.col-sm-2 Credit Card Number
        .col-sm-6
          %input.form-control#stripe_number(type="text" size="20" data-stripe="number")
      .form-group
        %label.control-label.col-sm-2 Security Code
        .col-sm-6
          %input.form-control#stripe_cvc(type="text" size="4" data-stripe="cvc")
      .form-group
        %label.control-label.col-sm-2 Expiration
        .col-sm-3
          = select_month(Date.today, {add_month_numbers: true},  class: 'form-control', data: { stripe: "exp-month" })
        .col-sm-2
          = select_year(Date.today.year, {start_year: Date.today.year, end_year: Date.today.year + 4}, class: 'form-control', data: { stripe: "exp-year" })
          
I have other info in my form to collect the user data but for the sake of keeping it simple I haven't included it above.  That's pretty much it for the form to collect the card details.  It looks like quite a lot but most of the above is taken from the Stripe documentation so it's actually quite straightforward.  One other thing to note is that the from will be submitted to my servers without any card details, just the user info and token.  This is because there are no name attributes on the form for the card details.  This is one of the main things that makes Stripe so good, I don't have to worry about any of the regulations that go with handling sensitive financial data on my servers.

With that done I need to edit my create action for my UsersController so the payment can be processed if the token is returned from Stripe.  This looks as follows:

    def create
      ActiveRecord::Base.transaction do
        @user = User.new(user_params)
        if @user.save
          if process_payment.is_successful
            redirect_to sign_in_path and return
          else
            flash[:danger] = process_payment.error_message
            raise ActiveRecord::Rollback #jumps to end of transaction
          end
        else
          render :new and return
        end
      end
      redirect_to register_path if !process_payment.is_successful
    end 
    
    private
  
    def payment_processor
      StripePaymentProcessor.new('999', @user.email_address, params[:stripeToken])
    end
  
    def process_payment
      payment_processor.charge_card
    end
  
In the Tealeaf course a user would still be created even if the payment process failed which isn't ideal although they will deal with this later in the course. However, I've had a go at this myself by using a transaction to allow me to rollback the database if the payment process fails which means that the user record will not be stored in the database.

If the payment fails then you can see that I call ```raise ActiveRecord::Rollback```.  What I didn't realise initially is that once this call is made, it will jump to the line immediately after the end of the transaction.  This took me a while to debug and was why I have the ```redirect_to register_path``` at the end of the transaction.  If I didn't do the redirect after ```raise ActiveRecord::Rollback``` then I was getting an error that the controller was expecting a view template.  I also tried using [```rescue_from```](http://api.rubyonrails.org/classes/ActiveSupport/Rescuable/ClassMethods.html) to handle this but I could not get it to work for ```ActiveRecord::Rollback``` which is why I ended up with the method above.

I'll also talk through my ```process_payment``` method as well.  I originally had the code for processing the Stripe payment in the controller but I felt that it really didn't belong there and therefore I extracted it as a service object in ```app/services/process_stripe_payment.rb``` and the code is as follows:

    class StripePaymentProcessor

      attr_reader :amount, :email, :token
      attr_accessor :error_message, :is_successful

      def initialize(amount, email, token)
        @amount = amount
        @email = email
        @token = token
      end

      def charge_card
        begin
          Stripe.api_key = ENV['STRIPE_SECRET_KEY']
          Stripe::Charge.create(
          amount: amount,
          currency: "gbp",
          source: token,
          description: "Charge for #{email}"
          )
          self.is_successful = true
        rescue Stripe::CardError => e
          self.error_message = e.message
        end 
        self
      end

    end

Note that in the charge_card method I am returning self which returns the stripe service object and there therefore allows me to call ```process_payment.is_successful``` and ```process_payment.error_message``` in the controller.

Creating my service object has helped to clean up my controller a lot, made it easier to test the payment process and I've tried to make it loosely coupled so it can be used elsewhere in my application if other payments need to be made.  I haven't actually written the tests for this yet but I'll get that after I submit the code for the course to get feedback on how I have done it.  However, I will talk about the issues with my existing tests next.

## Tests With Stripe

Once I got my payment code up and running I ran my test suite and noticed that I was getting failures on the user signup process because a successful payment had to be made in order for my user to be registered.  I'll include one of my UsersController specs to give an example:

    describe "POST create" do
      context "valid input details" do

        before { post :create, user: Fabricate.attributes_for(:user) }

        it "creates user record" do
          expect(User.count).to eq(1)
        end
      end
    end

You can see that there is no token in the response for this test which is making it fail.  Now for my tests I don't want to be actually hitting the Stripe servers so after looking around I found the the [stripe-ruby-mock](https://github.com/rebelidealist/stripe-ruby-mock) gem which allowed me to get around this.  With this included I now set my test up as follows:

    describe "POST create" do
      context "valid input details" do

        let(:stripe_helper) { StripeMock.create_test_helper }
        before do
          StripeMock.start
          post :create, user: generate_attributes_for(:user), stripeToken: stripe_helper.generate_card_token 
        end
        after { StripeMock.stop }

        it "creates user record" do
          expect(User.count).to eq(1)
        end
      end
    end  
    
I also had the same issue with my feature test that was checking that a user could sign up after being invited by a friend:

    require 'spec_helper'

    feature "user invites friend" do
      scenario "user successfully invites friend and is accepted" do
        inviter = object_generator(:user)

        sign_in_user(inviter)
        invite_friend

        open_email(friend_email)
        click_accept_invitation

        friend_signs_up
        expect_to_be_on_sign_in_path
        friend_signs_in

        expect_friend_to_follow(inviter)
        expect_inviter_to_follow_friend(inviter)

        clear_emails
      end
    end

Now you'll see that I have abstracted a lot of my code away but the important method is ```friend_signs_up``` and the code for this is:

    def friend_signs_up
      StripeMock.start
      fill_in_password
      fill_in 'Full Name', with: friend_name
      fill_in 'stripe_number', with: '4242424242424242'
      fill_in 'stripe_cvc', with: '123'
      click_button "Sign Up"
      StripeMock.stop
    end
    
That's some examples of how to test with Stripe and now my test suite is passing.

Keep an eye out for other posts on this topic from me in the near future because we'll be tackling aspects of this next week I think.  However, this should be enough to keep you busy for a while!