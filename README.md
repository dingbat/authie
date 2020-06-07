JWTs have become popular as an auth method for SPA / API combos, but there is a
[lot of content online](http://cryto.net/~joepie91/blog/2016/06/13/stop-using-jwt-for-sessions/)
about how this is a bad idea. as everyone says, if there's anything to not
roll-your-own it's auth, but unfortunately there are not very many established
auth gems for rails besides devise, which does not offer out-of-the-box support
for an API app. after a lot of digging and researching about how to set up
devise for an API / SPA combo, there was nothing to be found online, thus:

## API

1.  if you're using `api_only` in your rails app, you'll need to add to
    `config/application.rb`:

    ```rb
    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore, key: "_yourappname", domain: :all
    ```

    NOTE: the `domain: :all` is only needed if your API lives on a different
    subdomain than the SPA.

2.  if you're using `rack-cors` (how could you not), you need to add
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

3.  add to your `ApplicationController`:

    ```rb
    include ActionController::RequestForgeryProtection
    protect_from_forgery with: :null_session
    ```

4.  set up your custom devise routes to only allow what we'll need:

    ```rb
    devise_for :users, only: []
    devise_scope :user do
      post "users/sign_in" => "users/sessions#create"
      delete "users/sign_out" => "users/sessions#destroy"

      post "users/password" => "users/passwords#create"
      put "users/password" => "users/passwords#update"
    end
    ```

5.  sign in & sign out. create a custom devise sessions controller
    (`app/controllers/users/sessions_controller.rb`)

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

    the differences from the base devise controller are:

    1. don't validate CSRF on login, since the SPA won't have one yet, and this
       is not a security risk (CSRF attacks can't read responses)
    2. don't verify that the user is logged in before logging them out - this
       check 500 since we are in API mode, and there is no real reason to return
       an error here
    3. return the CSRF token in the sign_in action
    4. return JSON instead of redirecting to devise routes

6.  password reset. create a custom devise passwords controller
    (`app/controllers/users/passwords_controller.rb`)

    ```rb
    class Users::PasswordsController < Devise::SessionsController
      skip_before_action :verify_authenticity_token

      # POST /users/password
      # { "user": { "email": "my_email" } }
      def create
        user = User.find_by(email: resource_params[:email]&.strip)

        if user
          user.send_reset_password_instructions
          render json: {}, status: :created
        else
          render json: { error: "Email not found" }, status: :unprocessable_entity
        end
      end

      # PUT /users/password
      # { "user": { "reset_password_token": "abc", "password": "pw", "password_confirmation": "pw_confirmation" } }
      def update
        self.resource = resource_class.reset_password_by_token(resource_params)
        if resource.errors.any?
          render json: { errors: resource.errors }, status: :unprocessable_entity
        else
          sign_out(:user)
          render json: {}
        end
      end
    end
    ```

    the differences from the base devise controller are:

    1. for creating a reset email - nothing fancy here. i'm finding the user
       manually and calling `user.send_reset_password_instructions` directly
       instead of
       `resource_class.send_reset_password_instructions(resource_params)` which
       does both of those for you (and is what the original devise controller
       does) but i don't like this because it doesn't strip the input (you also
       may want to do a case-insensitive find, or consider using `citext` for
       your user email column)

    2. for updating a password, this is almost identical to the original devise
       controller, but also includes a best practice suggested by OWASP which is
       to sign out the user on a successful password reset (surprised devise
       doesn't do this)
    3. return JSON instead of redirecting to devise routes of course

7.  customize password reset mail template. the default template for reset
    password instructions will fail as it'll try to use
    `edit_user_password_url`, which doesn't exist (since our API is not going to
    serve this web route). to cutomize the mailer template, you can use
    `rails generate devise:views -v mailer`, and then delete everything except
    for, or you can just create the file
    `app/views/devise/mailer/reset_password_instructions.html.erb`:

    ```erb
    Hi <%= @user.first_name %>,
    Someone has requested a link to change your password. You can do this through the link below:
    <%= link_to 'Change my password', "http://myfrontend.com/reset-password?token=#{@token}" %>
    ```

## SPA

1. when you `fetch`, make sure you include the CSRF token and credentials is set
   to `"include"` (for all requests, this will send the cookies).

   ```js
   fetch(path, {
     method,
     body,
     headers: {
       Accept: "application/json",
       "Content-Type": "application/json",
       "X-CSRF-Token": csrf,
     },
     credentials: "include",
   });
   ```

2. when we first enter the app, we need to check if we're already authenticated
   (either thru remember me or refresh / new tab in an existing session). to do
   this, just call `POST /users/sign_in` (sign in endpoint), with an empty body
   (`{}`). it will succeed if we're already logged in, and fail if we're not (so
   we should show the login page). on any successful sign in, either automatic
   one with empty body or from the login page (with username & password), save
   the `csrf_token` value in the response, and use it where the `csrf` variable
   is used in the `fetch` above.

3. sign out is easy - call `DELETE /users/sign_out`. if it's successful, would
   suggest redirecting the user to the login page

4. reset password is also easy - just call `POST /users/password`

5. updating password - in the template above we directed the user to a page with
   the reset password token in the query params - retrieve this value from the
   route, and simply call `PUT /users/password` with it and the new passwords.
   display the errors that come back if any
