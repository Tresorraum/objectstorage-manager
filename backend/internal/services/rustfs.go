package services

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"rustfs-manager/internal/models"
)

type RustFSService struct {
	clients map[uint]*minio.Client
}

func NewRustFSService() *RustFSService {
	return &RustFSService{
		clients: make(map[uint]*minio.Client),
	}
}

// GetClient returns or creates a MinIO client for the given RustFS instance
func (s *RustFSService) GetClient(instance *models.RustFSInstance) (*minio.Client, error) {
	if client, exists := s.clients[instance.ID]; exists {
		return client, nil
	}

	client, err := minio.New(instance.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(instance.AccessKey, instance.SecretKey, ""),
		Secure: instance.SSL,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create RustFS client: %w", err)
	}

	s.clients[instance.ID] = client
	return client, nil
}

// TestConnection tests the connection to a RustFS instance
func (s *RustFSService) TestConnection(instance *models.RustFSInstance) error {
	client, err := s.GetClient(instance)
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Try to list buckets to test connection
	_, err = client.ListBuckets(ctx)
	return err
}

// GetStorageInfo returns storage information for an instance
func (s *RustFSService) GetStorageInfo(instance *models.RustFSInstance) (*StorageInfo, error) {
	client, err := s.GetClient(instance)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	buckets, err := client.ListBuckets(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list buckets: %w", err)
	}

	info := &StorageInfo{
		BucketCount: len(buckets),
		Buckets:     make([]BucketInfo, 0, len(buckets)),
	}

	var totalSize int64
	var totalObjects int64

	for _, bucket := range buckets {
		bucketInfo := BucketInfo{
			Name:         bucket.Name,
			CreationDate: bucket.CreationDate,
		}

		// Get bucket statistics
		objectCh := client.ListObjects(ctx, bucket.Name, minio.ListObjectsOptions{Recursive: true})
		for object := range objectCh {
			if object.Err != nil {
				log.Printf("Error listing objects in bucket %s: %v", bucket.Name, object.Err)
				continue
			}
			bucketInfo.ObjectCount++
			bucketInfo.Size += object.Size
		}

		totalSize += bucketInfo.Size
		totalObjects += bucketInfo.ObjectCount
		info.Buckets = append(info.Buckets, bucketInfo)
	}

	info.TotalSize = totalSize
	info.TotalObjects = totalObjects

	return info, nil
}

// ListBuckets returns all buckets for an instance
func (s *RustFSService) ListBuckets(instance *models.RustFSInstance) ([]BucketInfo, error) {
	client, err := s.GetClient(instance)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	buckets, err := client.ListBuckets(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list buckets: %w", err)
	}

	result := make([]BucketInfo, 0, len(buckets))
	for _, bucket := range buckets {
		bucketInfo := BucketInfo{
			Name:         bucket.Name,
			CreationDate: bucket.CreationDate,
		}

		// Get bucket size and object count
		objectCh := client.ListObjects(ctx, bucket.Name, minio.ListObjectsOptions{Recursive: true})
		for object := range objectCh {
			if object.Err != nil {
				continue
			}
			bucketInfo.ObjectCount++
			bucketInfo.Size += object.Size
		}

		result = append(result, bucketInfo)
	}

	return result, nil
}

// CreateBucket creates a new bucket
func (s *RustFSService) CreateBucket(instance *models.RustFSInstance, bucketName, region string) error {
	client, err := s.GetClient(instance)
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	return client.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{Region: region})
}

// DeleteBucket deletes a bucket
func (s *RustFSService) DeleteBucket(instance *models.RustFSInstance, bucketName string) error {
	client, err := s.GetClient(instance)
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	return client.RemoveBucket(ctx, bucketName)
}

// GetBucketPolicy returns the policy for a bucket
func (s *RustFSService) GetBucketPolicy(instance *models.RustFSInstance, bucketName string) (string, error) {
	client, err := s.GetClient(instance)
	if err != nil {
		return "", err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	return client.GetBucketPolicy(ctx, bucketName)
}

// SetBucketPolicy sets the policy for a bucket
func (s *RustFSService) SetBucketPolicy(instance *models.RustFSInstance, bucketName, policy string) error {
	client, err := s.GetClient(instance)
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	return client.SetBucketPolicy(ctx, bucketName, policy)
}

// StorageInfo represents storage information
type StorageInfo struct {
	TotalSize    int64        `json:"total_size"`
	TotalObjects int64        `json:"total_objects"`
	BucketCount  int          `json:"bucket_count"`
	Buckets      []BucketInfo `json:"buckets"`
}

// BucketInfo represents bucket information
type BucketInfo struct {
	Name         string    `json:"name"`
	CreationDate time.Time `json:"creation_date"`
	Size         int64     `json:"size"`
	ObjectCount  int64     `json:"object_count"`
}