---
layout: post
title:  "Tealeaf Academy Course Three/Week Seven - Mocks And Stubs"
date:   2015-04-03 14:42:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

This is a quick post to discuss the idea of mocks in Rails testing.  I demonstrate this using the code I ended up with at the end of my last post:

    class ProjectController < ApplicationController

      ...

      def create
        @project = Project.new(project_params)
        CreditDeduction.new(current_user).deduct_credit
      end  

      ...
    end

<!--more-->

(Click on the link to read my last post on the [Beyond MVC](../../../../2015/04/03/course-three-week-seven-beyond-mvc/))

Mocks in tests are used to simply record and verify expectations.  In the example above I will use a mock to verify that ```CreditDeduction.new(current_user)``` does indeed receive the method ```deduct_credit``` but I don't care what actually happens after it receives the method.

For example, my controller test for the create action could look like this:

    it "delegates to CreditDeduction to deduct_credit" do
      credit_deduction = double("credit_deduction")
      CreditDeduction.stub(:new).with(user_object).and_return(credit_deduction)
      expect(credit_deduction).to receive(:deduct_credit)
      post: create, project: {name: "code project", description: "a test project"}
    end

As you can see, I'm only checking to see to see if the method is actually received, nothing else.  Stubs are slightly different and I'll use a previous code example to illustrate my point:

Here is a controller action:

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
    
And a snippet of a test for this action:

    describe "POST create" do
      context "valid personal details" do

        context "valid card details" do

          let(:attempt_card_payment) { double(:attempt_card_payment) }
          before do
            expect(attempt_card_payment).to receive(:processed).and_return(true)
            allow(ExternalPaymentProcessor).to receive(:create_payment_process).and_return(attempt_card_payment) 
          end
          
In this case I still don't want to actually run the ```create_payment_process``` on ```ExternalPaymentProcessor``` as was the case in the mock example but this time I do actually care about the state of ```ExternalPaymentProcessor``` because it affects the flow of my controller action.  In this case I can test what happens if ```attempt_card_payment``` is true and can also write more tests to verify what happens when it is not.

It is a subtle difference between the two but hopefully this helps to clarify it a bit more.  You can read more on this by reading [this post by Martin Fowler](http://martinfowler.com/articles/mocksArentStubs.html).