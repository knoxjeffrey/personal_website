---
layout: post
title:  "Two factor Authentication with Twilio"
date:   2015-01-24 20:50:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

In order to do this I will need phone and pin columns added to the users table with a migration.  The logic for authentication will be as follows:

    after successful login, is a phone number present?
      - if not then normal login
      - if yes then:
        - generate a pin (not shown to user)
        - send off to Twilio
        - show a form to enter pin returned by Twilio
          - restrict access only if successful login. You don't want people to be able to just go straight to this and then start trying to hack pin codes
          
<!--more-->
          
On the signup page I can now add a field to capture the user phone number and also add phone to strong params in Users Controller:

    def user_params
      params.require(:user).permit(:username, :password, :time_zone, :phone)
    end
  
I can code out the above logic within my SessionController when creating a new session:
  
      def create
        user = User.find_by(username: params[:username])

        if user && user.authenticate(params[:password])
          if user.two_factor_auth?
            #session[:two_factor] is only set true if the user has successfully entered username and password
            #but has not successfully entered the pin yet. Means that only registered users can reach the pin_path
            session[:two_factor] = true
            user.generate_pin!
            user.send_pin_to_twilio
            redirect_to pin_path
          else
            login_user!(user)
          end
        else
          flash[:danger] = "There is a problem with your username or password"
          redirect_to login_path
        end
      end
      
  And then implement the above methods in User model:
  
      def two_factor_auth?
        !self.phone.blank?
      end

      def generate_pin!
        self.update_column(:pin, rand(10 ** 6)) # random 6 digit number
      end

      def remove_pin!
        self.update_column(:pin, nil) # remove the pin
      end
      
      #this code comes from twilio
      def send_pin_to_twilio
        # put your own credentials here 
        account_sid = 'enter your account' 
        auth_token = 'enter your token' 

        # set up a client to talk to the Twilio REST API 
        client = Twilio::REST::Client.new account_sid, auth_token 

        msg = "Hi, please input the pin to continue login: #{self.pin}"

        client.account.messages.create({
            :from => 'enter your twilio number', 
            :to => self.phone, 
            :body => msg,  
        })
      end
      
as well as implement the login_user!(user) method because this will be used several times and would have redundant code otherwise:
  
      def login_user!(user)
        session[:user_id] = user.id #this is backed by the browsers cookie to track if the user is authenticated
        flash[:notice] = "Welcome #{current_user.username}, you're logged in!"
        redirect_to root_path
      end
      
  Next I have to implement the pin_path in routes:
  
      get '/pin', to: 'sessions#pin'
      
  Then implment a pin ation in the SessionsController:
  
      def pin
        access_denied if session[:two_factor].nil?

        if request.post?
          user = User.find_by(pin: params[:pin])
          if user
            session[:two_factor] = nil
            user.remove_pin!
            login_user!(user)
          else
            flash[:error] = "Sorry, something is wrong with your pin number"
            redirect_to pin_path
          end
        end
      end
      
  and then create a pin.html.erb file for the user to enter their pin:
  
      <%= render 'shared/content_title', title: "Enter Your Pin To Log In"%>
      <h5>
        Your account is locked.  You will receive a text message with a pin number.
        Enter the pin number to unlock your account and proceed with login.
      </h5>
      <div class="col-sm-8 well">
          <%= form_tag '/pin' do %>

              <div class="form-group">
                  <%= label_tag :pin, "Pin Number" %>
                  <%= text_field_tag :pin, params[:pin] || '', class: "form-control" %>
              </div>
              <br/>
              <%= submit_tag 'Unlock your account', class: "btn btn-danger" %>
          <% end %>
      </div>
      
  and then then implment the post route for '/pin'
  
        post '/pin', to: 'sessions#pin'
        
  And that's it, a nice feature added to my application to improve security.