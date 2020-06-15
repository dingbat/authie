class ApplicationController < ActionController::API
  include ActionController::RequestForgeryProtection
  protect_from_forgery with: :null_session

  before_action :extend_remember_me

  private

  include ActionController::Cookies
  include Devise::Controllers::Rememberable
  def extend_remember_me
    remember_me(current_user) if remember_me_is_active?(current_user)
  end
end
