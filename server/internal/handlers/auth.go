package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"rukhalt/internal/dto"
	"rukhalt/internal/models"
	"rukhalt/internal/services"
)

type AuthHandler struct {
	userService *services.UserService
}

func NewAuthHandler(userService *services.UserService) *AuthHandler {
	return &AuthHandler{userService: userService}
}

// Login handles user login
func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrBadRequest))
		return
	}

	token, user, err := h.userService.Login(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse(err))
		return
	}

	// Remove password from response
	user.Password = ""

	c.JSON(http.StatusOK, dto.AuthResponse{
		Token: token,
		User:  dto.ToUserDTO(user),
	})
}

// Register handles user registration
func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrBadRequest))
		return
	}

	// Set default role if not provided
	if req.Role == "" {
		req.Role = "user"
	}

	user := &models.User{
		Username: req.Username,
		Email:    req.Email,
		Password: req.Password,
		Role:     req.Role,
		Active:   true,
		IsPremium: true,
	}

	if err := h.userService.CreateUser(user); err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(err))
		return
	}

	// Generate token for the new user
	token, err := h.userService.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(dto.ErrTokenGeneration))
		return
	}

	// Remove password from response
	user.Password = ""

	c.JSON(http.StatusCreated, dto.AuthResponse{
		Token: token,
		User:  dto.ToUserDTO(user),
	})
}

// RefreshToken handles token refresh
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse(dto.ErrUnauthorized))
		return
	}

	user, err := h.userService.GetUserByID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse(dto.ErrUserNotFound))
		return
	}

	if !user.Active {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse(dto.ErrAccountDisabled))
		return
	}

	token, err := h.userService.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(dto.ErrTokenGeneration))
		return
	}

	// Remove password from response
	user.Password = ""

	c.JSON(http.StatusOK, dto.AuthResponse{
		Token: token,
		User:  dto.ToUserDTO(user),
	})
}
