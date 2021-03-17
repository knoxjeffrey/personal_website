---
layout: post
title:  "Rails - API with Authentication"
date:   2015-10-07 14:19:00
categories: Rails
banner_image: ""
featured: false
comments: true
---

A lot of the information came from [this post](https://www.reddit.com/r/rails/comments/3dzvha/how_to_handle_users_with_a_rails_api_and_js/) which helped me no end for setting up my API.  I'll add a bit more detail in this post to help explain some of the settings and I needed to do quite a bit of reading to understand it all.  My intention is to build a Rails API and then build a separate React.js frontend to consume that API.  In this post I'll just discuss the setting up of the Rails API but may write a post later about React.

<!--more-->

## Initial Setup

To build my API I'll be using the ```rails-api``` gem and my API also needs to store data for which I'll be using PostgreSQL.  If you don't have it already installed, type the following from the command line ```gem install rails-api``` and then ```rails-api new api_app_name --database=postgresql``` to setup your API.

To register users I will be using the Devise gem and for signing in I'm using the Doorkeeper(OAuth 2) gem.  This is no doubt different to your usual Rails experience but an important note is that an API should not handle sessions.  Essentially the API should be stateless which means that it provides a response after you supply it with a request and that's it.  No knowledge of previous or future state is required for it to work.  Therefore the flow of authentication should be a client request with an email and password for example.  The user resource is returned along with an authentication token.  For every route in the API that requires authentication, the client has to send the authentication token.  OAuth 2.0 is great for authorisation flows in web applications and Doorkeeper makes it simple to introduce OAuth 2.0 functionality to a Rails application.

With that said here is the basics of my Gemfile:

``` ruby
source 'https://rubygems.org'


gem 'rails', '4.2.4'

gem 'rails-api'

gem 'pg'

gem 'devise'
gem 'doorkeeper'
gem 'rack-cors', :require => 'rack/cors'

group :development, :test do
  gem 'byebug'
end

group :development do
  gem 'spring'
  gem 'better_errors'
  gem 'web-console', '~> 2.0'
end
```

One other point of interest is the ```rack-cors``` gem (cross-origin resource sharing) which will allow other applications, running on a different server, to talk to the Rails API.  I'll go into the settings for that later in the post

Next, in the terminal type ```rails generate devise:install```, then ```rails generate devise user``` and finally ```rails generate doorkeeper:install```.  Make a quick addition to ```config/environments/development.rb``` with the following code:  

``` ruby
config.action_mailer.default_url_options = { host: 'localhost', port: 3000 }
```

In my case I also wanted to add a ```full_name``` column to the user model so ensure you run a migration if you need any additions to the model.  With that done all that is needed is to run ```rake db:migrate```.

## Register and Sign In

In order to register I will override the Devise registration with a controller that only works over JSON and accepts a create action.  An organised way of overriding Devise controllers is with the use of namespaces and therefore my controller will be at ```app/controllers/users/registrations_controller.rb```:

``` ruby
class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json
  respond_to :html, only: []
  respond_to :xml, only: []

  skip_before_filter :verify_authenticity_token

  before_filter :not_allowed, only: [:new, :edit, :cancel]

  def not_allowed
    raise MethodNotAllowed
  end

  private

  def sign_up_params
    params.require(:user).permit([
      :email,
      :password,
      :password_confirmation,
      :full_name
    ])
  end

  def account_update_params
    params.require(:user).permit([
      :email,
      :full_name
    ])
  end
end
```

From what I can understand, Devise requires the ```sign_up_params``` parameter to be passed in the create method and ```account_update_params``` for the update method and the above code overrides these Devise methods.

One thing I'm not totally sure about is this line: ```skip_before_filter :verify_authenticity_token```.  When I setup my Rails app using the rails-api gem it didn't add the line ```protect_from_forgery with: :exception``` to ```ApplicationController``` as it does with a regular Rails application and in fact it doesn't recognise the method if I try to add it.  Therefore the API isn't protecting against CSRF attacks but reading the docs for the rails-api gem it says this is fine if you aren't using cookie based authentication for the API. Therefore the filter isn't really doing anything in this case so I have just deleted it.  However, if I have a logged in user then surely I need to maintain some sort of state like I do in a Rails app by using a session cookie?  How do I go about this in the API so the user doesn't have to log in with every request without using something like cookie based authentication? If I'm then maintaining state then surely I'm vulnerable to CSRF attacks?  I'd really appreciate any feedback on this so I know that I'm not creating a glaring security issue!

I have to setup my routes to initialise Doorkeeper and force Devise to use the above controller rather than its default:

``` ruby
Rails.application.routes.draw do
  use_doorkeeper

  devise_for :users,
  only: :registrations,
  controllers: {
    registrations: 'users/registrations'
  }
end
```

As mentioned earlier, I now need to do some CORS setup to allow other applications to communicate with my API.  This is the code for ```config/application.rb```:

``` ruby
module SiteAnalysisApi
  class Application < Rails::Application

    ...

    config.middleware.insert_before 0, "Rack::Cors" do
      allow do
        origins '*'
        resource '*',
          headers: :any,
          methods: [:get, :post, :delete, :put, :options],
          max_age: 0
      end
    end

    config.middleware.use ActionDispatch::Flash

  end
end
```

The above will allow GET, POST, DELETE, PUT or OPTIONS requests from any origin on any resource.  I'll tweak the origins to be more selective at a later date as seen [here for example](http://www.rubydoc.info/gems/rack-cors/0.2.9).

I also have to add ```config.middleware.use ActionDispatch::Flash``` so I can visit the oauth paths (check out http://localhost:3000/rails/info/routes when you run your server) because the rails-api gem has stripped out a lot of the Rails middleware and I would get an ```unidentified method 'flash'``` error message.

I also have to set some HTTP headers to enable CORS which I have done globally in ApplicationController:

``` ruby
class ApplicationController < ActionController::API

  before_filter :cors_preflight_check
  after_filter :cors_set_access_control_headers

  def cors_preflight_check
    if request.method == 'OPTIONS'
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS'
      headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-Prototype-Version, Token'
      headers['Access-Control-Max-Age'] = '1728000'

      render text: '', content_type: 'text/plain'
    end
  end

  def cors_set_access_control_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization, Token'
    headers['Access-Control-Max-Age'] = "1728000"
  end

  private

  def current_resource_owner
    User.find(doorkeeper_token.resource_owner_id) if doorkeeper_token
  end

end
```
The ```cors_preflight_check``` filter  will "preflight" the request by sending an OPTIONS request to the server first.  This essentially asks the server if it would allow a type of client request before the request is actually sent. The server will respond with only the necessary headers and an empty text/plain.  If the request is authorised then the client can then send the actual request and the server can respond. Note that again I have the origin set to ```'*'``` which I will change at a later date.

The ```cors_set_access_control_headers``` filter occurs after the content has been generated but before it is sent to the client so the CORS access control headers can be sent with the response for this controller.

Also of note is the current_resource_owner method. This (by calling doorkeeper_token.resource_owner_id) is what will retrieve the access token owner from the OAuth authenticated model once Doorkeeper has issued a token and you've included it in a request. You'd call current_resource_owner in lieu of Devise's generated method. In this case it would have been current_user but this requires a session so will not work for my application.

Next up is to set the Doorkeeper initialiser in ```config/initializers/doorkeeper.rb```:

``` ruby
Doorkeeper.configure do
  # Change the ORM that doorkeeper will use (needs plugins)
  orm :active_record

  # This block will be called to check whether the resource owner is authenticated or not.
  resource_owner_authenticator do
    warden.authenticate!(scope: :user)
  end

  resource_owner_from_credentials do |routes|
    u = User.find_for_database_authentication(email: params[:email])
    u if u && u.valid_password?(params[:password])
  end

  # Access token expiration time (default 2 hours)
  access_token_expires_in 24.hours

  # Define access token scopes for your provider
  # For more information go to https://github.com/applicake/doorkeeper/wiki/Using-Scopes
  default_scopes  :api
  optional_scopes :write

  skip_authorization do |resource_owner, client|
    true
  end

  grant_flows %w(password)
end
```

In this example because I intend to have full control over the server and the client, it’s fine to ask the user in the webapp client for username and password directly. This then allows me to use the password grant authentication flow.  One other very important thing to note is that when using the OAuth 2.0 authentication it is highly recommended to use HTTPS to prevent the authorisation token being visible.  To read more about the grant flow types [read this article](https://aaronparecki.com/articles/2012/07/29/1/oauth2-simplified#browser-based-apps) and [here is a great video about the password grant flow](https://www.youtube.com/watch?v=FNz0Lupp8HM).

The ```resource_owner_from_credentials``` block checks the users email and password to see if they match an entry in the database and will return an access token to the client if they are valid.

Authorisation scopes are a way to determine to what extent the client can use resources located in the provider.  Default Scopes are the ones that are selected for authorisations that do not specify which scopes they need. In other words, if the client does not pass scope parameter in the authorisation URI then these are the scopes that they will get assigned. [See this resource for more information](https://github.com/doorkeeper-gem/doorkeeper/wiki/Using-Scopes).

## Does it all work?

At this point I can run my server and I'll use Postman to test the end points.  First up is registering a new user for which I use a POST request to ```http://localhost:3000/users.json``` with the following JSON in the body:

``` ruby
{
  "user": {
    "email": "knoxjeffrey@outlook.com",
    "password": "password",
    "password_confirmation": "password",
    "full_name": "Jeff Knox"
  }
}
```

When you check the database all being well the newly submitted data should be there.  Next I'll test logging in with a POST request to ```http://localhost:3000/oauth/token``` and the following in the body:

``` ruby
{
  "grant_type": "password",
  "email": "knoxjeffrey@outlook.com",
  "password": "password"
}
```

Once again, all being well, you should see the something like the following response:

``` ruby
{
  "access_token": "ce496b1301086a288358f314098c2f620d086e3d469a2911df35cb853bbb8b0d",
  "token_type": "bearer",
  "expires_in": 86400,
  "scope": "api",
  "created_at": 1444265281
}
```

and in the ```oauth_access_tokens``` table you will see a new record has been added.

## API calls

What I want to do next is to setup a controller that will manage all the rules for accessing my API at ```app/controllers/api_controller```:

``` ruby
class ApiController < ApplicationController
  before_action -> { doorkeeper_authorize! :api }
end
```

This differs from the example as ```doorkeeper_for``` no longer works.  This is using the default scope of ```api``` from earlier to ensure the access token for the client has this scope to access data in the API.

Following the example I will also create my first controller that is hidden behind OAuth.  This can only be accessed with a token and appropriate authorisation headers.  The example uses this end point to sync the current user's attributes to the client after a page refresh.  Add the following to ```app/controllers/api/v1/users_controller```:

``` ruby
module Api

  module V1
    class UsersController < ApiController

      def sync
        render json: current_resource_owner.attributes, status: 200
      end

    end
  end

end
```

Notice that I have added version control to my API to ensure that any changes can be easily managed without breaking the application consuming the API.  In this cases it's not such a big deal however as I plan to own both the client application and the API but it's a good habit to stick to.

Lastly I need to setup my route, again with the necessary namespacing:

``` ruby
Rails.application.routes.draw do
  use_doorkeeper

  devise_for :users,
  only: :registrations,
  controllers: {
    registrations: 'users/registrations'
  }

  namespace :api do

    namespace :v1 do
      get 'users/sync', to: 'users#sync'
    end

  end

end
```

In order to test this I will again use Postman, this time with a GET request to ```http://localhost:3000/api/v1/users/sync``` but also with the token added to the Headers. In Postman you enter ```Authorization``` for the Header and ```Bearer fe087c17dd15a84b3c939fbbbd1bbfd196d7ea28cfafbf1d6f15a6c74822ef30``` for the Value (obviously changing the token for the use you want to test for).  If all goes well then the response body will look something like the following:

``` ruby
{
  "id": 1,
  "email": "knoxjeffrey@outlook.com",
  "encrypted_password": "$2a$10$957PrTHcMt8aLkCQgCjwyOxw24/zkZ1VFJQrIIjiy//T27ZqQL5A2",
  "reset_password_token": null,
  "reset_password_sent_at": null,
  "remember_created_at": null,
  "sign_in_count": 1,
  "current_sign_in_at": "2015-10-08T00:46:27.456Z",
  "last_sign_in_at": "2015-10-08T00:46:27.456Z",
  "current_sign_in_ip": {
    "family": 30,
    "addr": 1,
    "mask_addr": 340282366920938463463374607431768211455
  },
  "last_sign_in_ip": {
    "family": 30,
    "addr": 1,
    "mask_addr": 340282366920938463463374607431768211455
  },
  "created_at": "2015-10-08T00:46:27.386Z",
  "updated_at": "2015-10-08T00:46:27.461Z",
  "full_name": "Jeff Knox"
}
```

You can also check this out from the browser by simply typing ```http://localhost:3000/api/v1/users/sync?access_token=fe087c17dd15a84b3c939fbbbd1bbfd196d7ea28cfafbf1d6f15a6c74822ef30``` and you will see the json response.

Excellent, I've got the basics of a working API and that's as far as I have gone so far.  A lot of the concepts in this very pretty foreign to me so I had to do quite a bit of reading to better understand it.  I'd really appreciate any feedback to let me know if I've made any glaring errors and especially some help with the CSRF issue I mentioned earlier.

## Extra Stuff!

I just wanted to add a bit extra to this to improve my versioning after I read [this resource by Abraham Kuri Vargas](http://apionrails.icalialabs.com/book/chapter_two).  Read this article before continuing so you understand what I'm about to write.  

He suggested that a way to remove the ```api/v1``` from the URL by using routing constraints and accept headers.

My ```routes.rb``` file will now look as follows:

``` ruby
Rails.application.routes.draw do
  use_doorkeeper

  devise_for :users,
  only: :registrations,
  controllers: {
    registrations: 'users/registrations'
  }

  namespace :api, defaults: { format: :json }, path: '/' do

    scope module: :v1, constraints: ApiConstraints.new(version: 1, default: true) do

      get 'users/sync', to: 'users#sync'

    end

  end

end
```

Using ```path: '/'``` removes the need to use ```api``` in the url.  ```v1``` uses a constraint to check if a version has been added in the Accept Header by using the class ```ApiConstraints``` at ```lib/api_constraints.rb```:

``` ruby
class ApiConstraints
  def initialize(options)
    @version = options[:version]
    @default = options[:default]
  end

  # This is a method of constraints as used in routes.rb and requires a 'true' result
  # to follow the route. If false, it moves on through the routes until true
  # True will result from either default being specified in routes or if the request header,
  # Accept, contains the string in this method.
  # the client.
  def matches?(req)
    @default || req.headers['Accept'].include?("application/vnd.marketplace.v#{@version}")
  end
end
```

I've added some documentation to the ```matches?``` method so you better understand how it works because I needed to do a bit of reading up on it.

My spec for this at ```lib/spec/api_constraints_spec.rb``` is almost exactly the same at what was in the article, just some changes to the host and changing from using should to expect:

``` ruby
require 'rails_helper'

describe ApiConstraints do
  let(:api_constraints_v1) { ApiConstraints.new(version: 1) }
  let(:api_constraints_v2) { ApiConstraints.new(version: 2, default: true) }

  describe "matches?" do

    it "returns true when the version matches the 'Accept' header" do
      request = double(host: 'http://localhost:3000',
                       headers: {"Accept" => "application/vnd.marketplace.v1"})
      expect(api_constraints_v1.matches?(request)).to be true
    end

    it "returns the default version when 'default' option is specified" do
      request = double(host: 'http://localhost:3000')
      expect(api_constraints_v2.matches?(request)).to be true
    end
  end
end
```

Excellent, now you can drop the ```api/v1``` from the URL.  As you add new versions just set the latest to be the deafult and therefore if people want to use an older version then they need to set the Accept Header to include the version.  Also remember to keep the default version at the end of the list of versions.  If you have it at the top then it will automatically use that and not check the headers for the request to use an older version.
