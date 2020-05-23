Rails.application.routes.draw do
  devise_for :users, controllers: { sessions: "users/sessions" }
  get "csrf", to: "test#csrf"
  post "test", to: "test#create"
end
