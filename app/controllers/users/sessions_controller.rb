# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  skip_before_action :verify_authenticity_token, only: [:create]
  skip_before_action :verify_signed_out_user

  # POST /users/sign_in
  def create
    resource = User.find_for_database_authentication(email: params[:email])

    if resource&.valid_password?(params[:password])
      reset_session
      sign_in :user, resource
      render nothing: true
    else
      render json: { error: "Invalid credentials provided." }, status: :unprocessable_entity
    end
  end

  def destroy
    sign_out(:user)
    head :no_content
  end
end
