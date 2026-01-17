package services

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"rustfs-manager/internal/config"
	"rustfs-manager/internal/dto"
	"rustfs-manager/internal/models"
	"rustfs-manager/internal/repository"
)

type UserService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) *UserService {
	return &UserService{
		repo: repo,
	}
}

// CreateUser creates a new user
func (s *UserService) CreateUser(user *models.User) error {
	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hashedPassword)

	return s.repo.Create(user)
}

// GetUserByUsername retrieves a user by username
func (s *UserService) GetUserByUsername(username string) (*models.User, error) {
	return s.repo.FindByUsername(username)
}

// GetUserByID retrieves a user by ID
func (s *UserService) GetUserByID(id uint) (*models.User, error) {
	return s.repo.FindByID(id)
}

// ValidatePassword validates a user's password
func (s *UserService) ValidatePassword(user *models.User, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	return err == nil
}

// GenerateToken generates a JWT token for a user
func (s *UserService) GenerateToken(user *models.User) (string, error) {
	cfg := config.Load()
	
	claims := jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(cfg.JWT.Secret))
}

// Login authenticates a user and returns a token
func (s *UserService) Login(username, password string) (string, *models.User, error) {
	user, err := s.GetUserByUsername(username)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", nil, dto.ErrInvalidCredentials
		}
		return "", nil, err
	}

	if !user.Active {
		return "", nil, dto.ErrAccountDisabled
	}

	if !s.ValidatePassword(user, password) {
		return "", nil, dto.ErrInvalidCredentials
	}

	token, err := s.GenerateToken(user)
	if err != nil {
		return "", nil, dto.ErrTokenGeneration
	}

	return token, user, nil
}

// ListUsers returns all users
func (s *UserService) ListUsers() ([]models.User, error) {
	return s.repo.List()
}

// UpdateUser updates a user
func (s *UserService) UpdateUser(user *models.User) error {
	return s.repo.Update(user)
}

// DeleteUser deletes a user
func (s *UserService) DeleteUser(id uint) error {
	return s.repo.Delete(id)
}