class User < ApplicationRecord
  devise :database_authenticatable, :recoverable, :rememberable, :validatable, :timeoutable, timeout_in: 10.seconds
end
