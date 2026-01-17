package services

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"rustfs-manager/internal/config"
	"rustfs-manager/internal/models"
)

type UserService struct {
	db *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{db: db}
}

// CreateUser creates a new user
func (s *UserService) CreateUser(user *models.User) error {
	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hashedPassword)

	return s.db.Create(user).Error
}

// GetUserByUsername retrieves a user by username
func (s *UserService) GetUserByUsername(username string) (*models.User, error) {
	var user models.User
	err := s.db.Where("username = ?", username).First(&user).Error
	return &user, err
}

// GetUserByID retrieves a user by ID
func (s *UserService) GetUserByID(id uint) (*models.User, error) {
	var user models.User
	err := s.db.First(&user, id).Error
	return &user, err
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
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", nil, errors.New("invalid credentials")
		}
		return "", nil, err
	}

	if !user.Active {
		return "", nil, errors.New("account is disabled")
	}

	if !s.ValidatePassword(user, password) {
		return "", nil, errors.New("invalid credentials")
	}

	token, err := s.GenerateToken(user)
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}

// ListUsers returns all users
func (s *UserService) ListUsers() ([]models.User, error) {
	var users []models.User
	err := s.db.Find(&users).Error
	return users, err
}

// UpdateUser updates a user
func (s *UserService) UpdateUser(user *models.User) error {
	return s.db.Save(user).Error
}

// DeleteUser deletes a user
func (s *UserService) DeleteUser(id uint) error {
	return s.db.Delete(&models.User{}, id).Error
}