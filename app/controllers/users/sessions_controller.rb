# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  skip_before_action :verify_authenticity_token, only: [:create]
  skip_before_action :verify_signed_out_user

  # POST /users/sign_in
  def create
    if user_signed_in?
      render_csrf_token
    else
      auth_params = params.require(:user)
      user = User.find_for_database_authentication(email: auth_params[:email])

      if user&.valid_password?(auth_params[:password])
        reset_session
        warden.authenticate!
        sign_in :user, user

        render_csrf_token
      else
        render json: { error: "Invalid credentials provided." }, status: :unprocessable_entity
      end
    end
  end

  def destroy
    sign_out(:user)
    head :no_content
  end

  private

  def render_csrf_token
    render json: { csrf_token: masked_authenticity_token(session) }
  end
end
