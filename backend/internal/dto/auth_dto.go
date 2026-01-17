package dto

import "rustfs-manager/internal/models"

// Request DTOs
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role"`
}

// Response DTOs
type AuthResponse struct {
	Token string      `json:"token"`
	User  *UserDTO    `json:"user"`
}

type UserDTO struct {
	ID        uint   `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	IsPremium bool   `json:"is_premium"`
	Active    bool   `json:"active"`
}

// Mapper functions
func ToUserDTO(user *models.User) *UserDTO {
	return &UserDTO{
		ID:        user.ID,
		Username:  user.Username,
		Email:     user.Email,
		Role:      user.Role,
		IsPremium: user.IsPremium,
		Active:    user.Active,
	}
}
