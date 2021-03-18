---
layout: post
title:  "Tealeaf Academy Course Three/Week One - Custom Form Builder"
date:   2015-02-12 11:02:00
categories: Tealeaf Academy
banner_image: ""
featured: false
comments: true
---

In this post I want to demonstrate how I can code up my own custom form builder that will help to cut down on the amount of repetition across my application and also make my forms look a lot cleaner.  

<!--more-->

Below is an example of a simple registration form:

    .col-sm-10.col-sm-offset-1.form-horizontal
      = form_for @user do |f|
        %header
          %h1 Register
        %fieldset
          .form-group
            .control-label.col-sm-2
              = f.label :email_address
            .col-sm-6
              = f.text_field :email_address, class: "form-control"

          .form-group
            .control-label.col-sm-2
              = f.label :password
            .col-sm-6
              = f.password_field :password, class: "form-control"
        
          .form-group
            .control-label.col-sm-2
              = f.label :full_name
            .col-sm-6
              = f.text_field :full_name, class: "form-control"
        
        %fieldset.actions.control-group.col-sm-offset-2
          .controls
            = f.submit "Sign Up", class: "btn btn-default"
      
This form will work but there is no way to handle errors on the form that inform the user of what they inputed incorrectly.  I could extend the code above to handle the errors but as I said, this starts to involve a lot of repetition if I have multiple forms in my application. A better way would be write my own custom form builder in ```app/helpers/custom_form_builder.rb```

    class CustomFormBuilder < ActionView::Helpers::FormBuilder
      def label(method, text = nil, options = {}, &block)
        errors = object.errors[method.to_sym]
        if errors.present?
          text += " <span class=\"error\">#{errors.first}</span>"
        end
        super(method, text.html_safe, options, &block)
      end
    end
    
What this will do is to overwrite the label method and will look at the errors on the object (in this case the user object) for the specific labels which are ```:username``` and ```:email``` for my example.  Where there are errors this custom from builder will append the error message to the label.  After that, the control will be delegated back to the default form builder.

All I need to do now is hook this up to my form like so:

    = form_for @user, builder: CustomFormBuilder do |f| 
    
That is better but there will still be repetition by having to write ```builder: MyFormBuilder``` each time so this can be further improved by adding to ```helpers/application_helper.rb``` and this should have the same parameters as the default form_form as seen in the docs [here](http://api.rubyonrails.org/classes/ActionView/Helpers/FormHelper.html#method-i-form_for) which gives us ```form_for(record, options = {}, &block)```

    module ApplicationHelper

      def custom_form_for(record, options = {}, &block)
        form_for(record, options.merge!({builder: CustomFormBuilder}), &block)
      end
      
    end
    
This manually merges in ```builder: MyFormBuilder``` and now my entire form will look like this:

    .col-sm-10.col-sm-offset-1.form-horizontal
      = custom_form_for @user do |f|
        %header
          %h1 Register
        %fieldset
          .form-group
            .control-label.col-sm-2
              = f.label :email_address
            .col-sm-6
              = f.text_field :email_address, class: "form-control"

          .form-group
            .control-label.col-sm-2
              = f.label :password
            .col-sm-6
              = f.password_field :password, class: "form-control"
        
          .form-group
            .control-label.col-sm-2
              = f.label :full_name
            .col-sm-6
              = f.text_field :full_name, class: "form-control"
        
        %fieldset.actions.control-group.col-sm-offset-2
          .controls
            = f.submit "Sign Up", class: "btn btn-default"
      
##Another Way

When I used this custom form builder it was with a horizontal form and when the error message was displayed beside the label it didn't look as good because it had to wrap around onto a new line due to the text field being right beside it.

I decided to see if I could generate the error messages within the text field to get around this problem and also use it as a nice little programming exercise!  Once again, I looked at the documentation, this time for text_field, email_field and password_field to see what the parameters were and I ended up with this code: 


    class CustomFormBuilder < ActionView::Helpers::FormBuilder
    
      def text_field(method, options = {})
        errors = object.errors[method.to_sym]
        if errors.present?
          options = { placeholder: "#{errors.first}", class:  "form-control text-field-error" }
        end
        super(method, options)
      end

      def email_field(method, options = {})
        errors = object.errors[method.to_sym]
        if errors.present?
          options = { placeholder: "#{errors.first}", class:  "form-control text-field-error" }
        end
        super(method, options)
      end

      def password_field(method, options = {})
        errors = object.errors[method.to_sym]
        if errors.present?
          options = { placeholder: "#{errors.first}", class:  "form-control text-field-error" }
        end
        super(method, options)
      end

    end
    
The ```text-field-error``` class was added to style the text field border in red to draw the attention of the user and the error message itself was inserted as a placeholder.  This worked well but the amount of repetition was bugging me and I wanted to DRY up the code.  This was a little harder than I imagined but after some reading I found out that the ```field_helpers``` attribute contained the names of all helper methods and therefore I could cycle through this array and pull out the helpers I needed. Finally, I needed a little meta-programming (my first time!) to dynamically create the helper methods with the ```define_method``` method and the resulting code is:

    class CustomFormBuilder < ActionView::Helpers::FormBuilder

      # field_helpers contains the names of all helper methods and I'm setting rules for the ones I need
      # define_method is used to dynamically create the helper methods I need
      field_helpers.each do |name|
        case name
        when :text_field, :password_field
          define_method(name) do |method, options = {}|
            errors = object.errors[method.to_sym]
            if errors.present?
              options = { placeholder: "#{errors.first}", class: "form-control text-field-error" }
            end
            super(method, options)
          end
        end
      end

    end

One annoying bug I came across with this was that my Chrome browser would try to autofill the email and password field which would therefore hide my placeholder error messages.  It used to be possible to turn autofill off by setting the autocomplete attribute to off but most browsers now ignore this so I had to come up with a different solution that wasn't quite so elegant.  

What I ended up doing was to add a stop-autofill class attribute to my email address field:

    .form-group
      .control-label.col-sm-2
        = f.label :email_address
      .col-sm-6
        = f.text_field :email_address, class: "form-control stop-autofill"
        
then attached some jQuery to handle this:

    $(window).load(function() {
      $('.stop-autofill').val(' ');
      setTimeout(function(){
        $('.stop-autofill').val('');
      }, 80);
    });
    
I said this wasn't as elegant as just setting an autocomplete attribute!  Basically what this does is add a space to the the text field and this stops the autofill happening and then I remove the space after a small delay.  I needed the delay otherwise the autofill would override my code. Total pain and a bit of a hack but I got it working!  Note that I could have added the space in the forms themselves but this was better as I only have to do it once rather than in every place I need it in a form.

Finally I had to alter my CustomFormBuilder to handle the edge cases.  The main issue was that the email field was being cleared when it was a valid entry but there were other errors on the form.  So my final code is this:

    class CustomFormBuilder < ActionView::Helpers::FormBuilder

      # field_helpers contains the names of all helper methods and I'm setting rules for the ones I need
      # define_method is used to dynamically create the helper methods I need
      # see my jQuery to handle .stop-autofill
      # .text-field-error is defined in css to add red border
      field_helpers.each do |name|
        case name
        when :text_field, :password_field
          define_method(name) do |method, options = {}|
            #strip .stop-autofill html class to stop email_address being cleared if it is valid but there are other errors present
            if method == :email_address && object.errors.present? && object.errors.messages[:email_address].blank?
              options = { class: "form-control" }
            end
            errors = object.errors[method.to_sym]
            if errors.present?
              if method == :email_address && object.errors.messages[:email_address].present?
                options = { placeholder: "#{errors.first}", class: "form-control text-field-error stop-autofill" }
              else
                options = { placeholder: "#{errors.first}", class: "form-control text-field-error" }
              end
            end
            super(method, options)
          end
        end
      end

    end

You may have also noted that I made the ```email_address``` a ```text_field``` rather than an ```email_field``` and this again came down to the issues with autofill.  In this case the autofill would add a yellow background even though I had removed the autofill text so the ```text_field``` solved this. To add some basic validation to make sure it was an email address being entered I added a validation to my User model:

    validates_format_of :email_address, with: /@./
    
to at least make sure there was and @ symbol and a . in the email address.
      
##Form Gem

To be honest, I did this as a coding exercise to see what I could do by myself and it was a lot of effort but I could also do it the easy way by using the [Rails Bootstrap Forms](https://github.com/potenza/rails-bootstrap-forms) gem which would work well for me as I am using Twitter Bootstrap.  But it was nice to get it all working by myself and I learned a lot along the way!