package dto

// CreatePostgresInstanceRequest represents the request to create a PostgreSQL instance
type CreatePostgresInstanceRequest struct {
	Name        string `json:"name" binding:"required"`
	Host        string `json:"host" binding:"required"`
	Port        int    `json:"port" binding:"required"`
	Database    string `json:"database" binding:"required"`
	Username    string `json:"username" binding:"required"`
	Password    string `json:"password" binding:"required"`
	SSL         bool   `json:"ssl"`
	Description string `json:"description"`
}

// UpdatePostgresInstanceRequest represents the request to update a PostgreSQL instance
type UpdatePostgresInstanceRequest struct {
	Name        string `json:"name"`
	Host        string `json:"host"`
	Port        int    `json:"port"`
	Database    string `json:"database"`
	Username    string `json:"username"`
	Password    string `json:"password"` // Optional - only update if provided
	SSL         bool   `json:"ssl"`
	Description string `json:"description"`
}

// PostgresInstanceResponse represents the response for a PostgreSQL instance
type PostgresInstanceResponse struct {
	ID          uint   `json:"id"`
	UserID      uint   `json:"user_id"`
	Name        string `json:"name"`
	Host        string `json:"host"`
	Port        int    `json:"port"`
	Database    string `json:"database"`
	Username    string `json:"username"`
	SSL         bool   `json:"ssl"`
	Description string `json:"description"`
	Status      string `json:"status"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}
