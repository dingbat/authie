Rails.application.routes.draw do
  devise_for :users, only: []
  devise_scope :user do
    delete "users/sign_out" => "users/sessions#destroy"
    post "users/sign_in" => "users/sessions#create"
  end

  post "test", to: "test#create"
end
