class TestController < ApplicationController
  before_action :authenticate_user!

  def create
    render json: { ok: "ok" }
  end

  def csrf
    render json: { csrf: masked_authenticity_token(session) }
  end
end
