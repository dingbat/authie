class TestController < ApplicationController
  before_action :authenticate_user!

  def create
    render json: { ok: "ok" }
  end
end
