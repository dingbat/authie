# frozen_string_literal: true

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
