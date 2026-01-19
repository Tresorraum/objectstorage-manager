package dto

type PostgresBackupRequest struct {
	PostgresInstanceID uint   `json:"postgres_instance_id" binding:"required"`
	DestinationType    string `json:"destination_type" binding:"required"` // "local" or "vps"
	VPSInstanceID      *uint  `json:"vps_instance_id"`                     // Required if destination_type is "vps"
}
