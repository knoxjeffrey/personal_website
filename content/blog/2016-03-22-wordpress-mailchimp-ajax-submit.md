---
layout: post
title:  "Wordpress - Mailchimp AJAX Submit"
date:   2016-03-22 00:50:00
categories: Wordpress
banner_image: ""
featured: false
comments: true
---

It's been quite some time since my last post as it's been pretty hectic with a new job, kids, etc. It's time to get back in the habit of writing again!  This is just a quick one to start with about how I wrote a custom Mailchimp embedded form in Wordpress with php and Javascript that would keep the user on my page and not send them over to Mailchimp.

<!--more-->

## php

The form itself is simply an email address and submit button that I includes in my ```header.php``` file:

``` php
<?php if ( is_single() ) { ?>
  <div id='top_signup'>
    <?php get_template_part( 'mailchimp_embedded_form' ); ?>
  </div>
<?php } ?>
```

This links to the ```mailchimp_embedded_form.php``` file with the following code:

``` php
<?php
  // just need to change these 2 variables if using a different account or list id in mailchimp
  $u = 'ee2f3xxxxxxxxxxxxf1ec62';
  $list_id = '81xxxxx368';

  $concat_1 = "http://floatapp.us1.list-manage.com/subscribe/post-json?u=" . $u . "&amp;id=" . $list_id;
  $concat_2 = "b_" . $u . "_" . $list_id;
?>

<form action=<?php echo $concat_1 ?> method="post" id="mc-embedded-subscribe-form-small" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
  <input type="email" value="" name="EMAIL" class="email_input" id="mce-EMAIL" placeholder="Email address" required>
  <span style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name=<?php echo $concat_2 ?> tabindex="-1" value=""></span>
  <span class="clear"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="submit_button"></span>
</form>
```

I've hidden the values for ```$u``` which is my account id in Mailchimp and ```$list_id``` which is the id of the Mailchimp list so you just need to put in your values.

## jQuery

Next up is my jQuery, and I'm also using Sweet Alerts to give much nicer modals to give user feedback if emails addresses are not valid, etc.  There's quite a lot of code but I'll put it below and then talk through it.

``` javascript
// *** MAILCHIMP AJAX SIGNUP WITH SWEET ALERTS ***
ajaxMailChimpForm($("#mc-embedded-subscribe-form-small"));

// Turn the given MailChimp form into an ajax version of it.
// If resultElement is given, the subscribe result is set as html to
// that element.
function ajaxMailChimpForm($form){
  // Hijack the submission. We'll submit the form manually.
  $form.submit(function(e) {
    e.preventDefault();
    if (!isValidEmail($form)) {
      swal({  title: "A valid email address must be provided!",
              allowOutsideClick: true,
              allowEscapeKey: true,
              type: 'error'
      });
    } else {
      swal({  title: "Subscribing...",
              allowOutsideClick: true,
              allowEscapeKey: true,
              showConfirmButton: false
      });
      submitSubscribeForm($form);
    }
  });
}

// Validate the email address in the form
function isValidEmail($form) {
  // If email is empty, show error message.
  // contains just one @
  var email = $form.find("input[type='email']").val();
  if (!email || !email.length) {
    return false;
  } else if (email.indexOf("@") == -1) {
    return false;
  }
  return true;
}

// Submit the form with an ajax/jsonp request.
// Based on http://stackoverflow.com/a/15120409/215821
function submitSubscribeForm($form) {
  $.ajax({
    type: "GET",
    url: $form.attr("action"),
    data: $form.serialize(),
    cache: false,
    dataType: "jsonp",
    jsonp: "c", // trigger MailChimp to return a JSONP response
    contentType: "application/json; charset=utf-8",
    error: function(error){
      // According to jquery docs, this is never called for cross-domain JSONP requests
    },
    success: function(data){
      $('.sweet-overlay').hide();
      $('.sweet-alert').hide();
      if (data.result != "success") {
        var message = data.msg || swal({  title: "Sorry", text: "Unable to subscribe. Please try again later.", allowOutsideClick: true, allowEscapeKey: true, type: "error"});
        swal({  title: ( data.msg.replace(/(<([^>]+)>(.*?)<([^>]+)>)/,"")),
                allowOutsideClick: true,
                allowEscapeKey: true,
                type: 'info'
        }); //strips out the html from the message
      } else {
        swal({  title: "Thank you!",
                text: "You must confirm the subscription in your inbox. Please check your junk mail if it does not appear after 30mins.",
                allowOutsideClick: true,
                allowEscapeKey: true,
                type: 'success'
        });
        $('#signup_content').hide();
        $.cookie('name', 'hide_float_subscription_status_year', { expires: 365, path: '/' });
      }
      $('.email_input').val('');
    }
  });
}

// *** END AJAX SIGNUP ***
```

It looks like a lot of code but the majority is pretty straight forward.  The ```ajaxMailChimpForm``` function is well commented so you can see what's happening.  You'll notice ```swal``` in there which is used for [Sweet Alerts](http://t4t5.github.io/sweetalert/) popups. I def recommend checking that library out, they give beautiful notifications with little effort.

The email validator it really quite simple and is just used to check if the email given looks to be valid before it is sent to Mailchimp.

The ```submitSubscribeForm``` has a bit more going on but initially it just serializes the form and makes use of jsonp to overcome the cross-domain restrictions imposed by browsers to allow data to be retrieved from systems other than the one the page was served by.

The rest is just handling the successful or failed result, again with Sweet Alerts.

## Conclusion

It's certainly more effort than the standard Mailchimp workflow but the end result is much nicer and customisable.  It also has the bonus of keeping the user on the site.
