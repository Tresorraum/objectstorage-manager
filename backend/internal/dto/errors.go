package dto

import "errors"

var (
	// Auth errors
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrAccountDisabled    = errors.New("account is disabled")
	ErrUserNotFound       = errors.New("user not found")
	ErrTokenGeneration    = errors.New("failed to generate token")
	
	// Instance errors
	ErrInstanceNotFound      = errors.New("instance not found")
	ErrInstanceLimitReached  = errors.New("instance limit reached for free users")
	ErrConnectionFailed      = errors.New("failed to connect to instance")
	
	// Backup errors
	ErrBackupJobNotFound     = errors.New("backup job not found")
	ErrBackupLimitReached    = errors.New("backup limit reached for free users")
	ErrServerBackupRestricted = errors.New("server backups require premium subscription")
	ErrInvalidBackupType     = errors.New("invalid backup type")
	
	// Common errors
	ErrUnauthorized    = errors.New("unauthorized")
	ErrForbidden       = errors.New("forbidden")
	ErrBadRequest      = errors.New("bad request")
	ErrInternalServer  = errors.New("internal server error")
)

type ErrorResponse struct {
	Error string `json:"error"`
}

func NewErrorResponse(err error) ErrorResponse {
	return ErrorResponse{Error: err.Error()}
}
