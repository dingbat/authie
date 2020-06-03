# frozen_string_literal: true

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
