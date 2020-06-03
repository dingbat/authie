Rails.application.routes.draw do
  devise_for :users, only: []
  devise_scope :user do
    post "users/sign_in" => "users/sessions#create"
    delete "users/sign_out" => "users/sessions#destroy"

    post "users/password" => "users/passwords#create"
    put "users/password" => "users/passwords#update"
  end

  post "test", to: "test#create"
end
