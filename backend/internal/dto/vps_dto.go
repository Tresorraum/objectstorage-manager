package dto

// CreateVPSInstanceRequest represents the request to create a VPS instance
type CreateVPSInstanceRequest struct {
	Name        string `json:"name" binding:"required"`
	Host        string `json:"host" binding:"required"`
	Port        int    `json:"port" binding:"required"`
	Username    string `json:"username" binding:"required"`
	AuthType    string `json:"auth_type" binding:"required,oneof=password ssh_key"`
	Password    string `json:"password"` // Required if auth_type is password
	SSHKey      string `json:"ssh_key"`  // Required if auth_type is ssh_key
	BackupPath  string `json:"backup_path" binding:"required"`
	Description string `json:"description"`
}

// UpdateVPSInstanceRequest represents the request to update a VPS instance
type UpdateVPSInstanceRequest struct {
	Name        string `json:"name"`
	Host        string `json:"host"`
	Port        int    `json:"port"`
	Username    string `json:"username"`
	AuthType    string `json:"auth_type" binding:"omitempty,oneof=password ssh_key"`
	Password    string `json:"password"` // Optional - only update if provided
	SSHKey      string `json:"ssh_key"`  // Optional - only update if provided
	BackupPath  string `json:"backup_path"`
	Description string `json:"description"`
}

// VPSInstanceResponse represents the response for a VPS instance
type VPSInstanceResponse struct {
	ID          uint   `json:"id"`
	UserID      uint   `json:"user_id"`
	Name        string `json:"name"`
	Host        string `json:"host"`
	Port        int    `json:"port"`
	Username    string `json:"username"`
	AuthType    string `json:"auth_type"`
	BackupPath  string `json:"backup_path"`
	Description string `json:"description"`
	Status      string `json:"status"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}
