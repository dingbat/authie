1. if you're using `api_only` in your rails app, you'll need to add to
   `config/application.rb`:

```rb
config.session_store :cookie_store, key: "_authie_session_#{Rails.env}"
config.middleware.use ActionDispatch::Cookies
config.middleware.use ActionDispatch::Session::CookieStore, key: "_yourappname"
```

2. if you're using `rack-cors` (how could you not), you need to add
   `credentials: true` to your `resource` so that cookies get transmitted.

```rb
resource(
  "*",
  headers: :any,
  methods: [:get, :post, :delete, :put, :patch, :options, :head],
  max_age: 86400,
  credentials: true,
)
```

3. add to your `ApplicationController`:

```rb
  include ActionController::RequestForgeryProtection
  protect_from_forgery with: :null_session
```

4. set up your custom devise route:

```rb
  devise_for :users, only: []
  devise_scope :user do
    post "users/sign_in" => "users/sessions#create"
    delete "users/sign_out" => "users/sessions#destroy"
  end
```

and custom devise sessions controller:

```rb
class Users::SessionsController < Devise::SessionsController
  skip_before_action :verify_authenticity_token, only: [:create]
  skip_before_action :verify_signed_out_user

  # POST /users/sign_in
  # { "user": { "email": "my_email", "password": "my_password", "remember_me": true } }
  def create
    self.resource = warden.authenticate!(auth_options)
    sign_in(:user, resource)
    render json: { csrf_token: masked_authenticity_token(session) }
  end

  # DELETE /users/sign_out
  def destroy
    sign_out(:user)
    head :no_content
  end
end
```

the customizations are:

1. don't validate CSRF on login, since the SPA won't have one yet, and this is
   not a security risk (CSRF attacks can't read responses)
2. don't verify that the user is logged in before logging them out - this check
   500 since we are in API mode, and there is no real reason to return an error
   here
3. return the CSRF token in the sign_in action

4. in your SPA, when you `fetch`, make sure you include the CSRF token and
   credentials is set to `"include"` (for all requests, this will send the
   cookies).

```js
  fetch(path,
    method,
    body,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf,
    },
    credentials: "include",
  };
```

6. in your SPA, set the CSRF variable to the `csrf_token` value in the response
   from `POST /users/sign_in` (login). make a call to login as soon as the app
   starts. if it succeeds, the user is still logged in, and you can set the CSRF
   token. if it fails, show the user the login page. payload to sign_in looks
   like { user: { email: "email", password: "password", remember_me: true/false
   } }. the entire payload can be empty for the initial check.

7. password reset

   1. for creating a password reset email - no need to use a devise controller
      or anything here, just have a controller action look up the user by email
      and call `user.send_reset_password_instructions`
   2. customize mailer - the default template will fail as it'll try to use
      `edit_user_password_url`, which doesn't exist (since our API is not going
      to serve this web route). to cutomize the mailer template, you can use
      `rails generate devise:views -v mailer`, and then delete everything except
      for, or you can just create the file
      `app/views/devise/mailer/reset_password_instructions.html.erb`:

      ```erb
      Hi <%= @user.first_name %>,
      Someone has requested a link to change your password. You can do this through the link below:
      <%= link_to 'Change my password', "http://myfrontend.com/reset-password?token=#{@token}" %>
      ```

   3. for updating a password -

8. in order to prevent session timeout, hit the sign in endpoint every regular
   interval (10 mins, 1 hr) to get a new session
