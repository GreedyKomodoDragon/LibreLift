package search

import (
	"context"

	"github.com/elastic/go-elasticsearch/v8"
)

type SearchManager interface {
	CreateSearchDocument(int64, string, string) (string, error)
	SearchUsingTerm(string) error
}

type elasticsearchManager struct {
	client *elasticsearch.TypedClient
}

type SearchDocument struct {
	Id          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

func NewElasticsearchManager(client *elasticsearch.TypedClient) SearchManager {
	return &elasticsearchManager{
		client: client,
	}
}

// CreateSearchDocument implements SearchManager.
func (e *elasticsearchManager) CreateSearchDocument(id int64, name string, description string) (string, error) {
	resp, err := e.client.Index("librelift").
		Request(SearchDocument{
			Id:          id,
			Name:        name,
			Description: description,
		}).
		Do(context.Background())
	if err != nil {
		return "", err
	}

	return resp.Id_, nil
}

// SearchUsingTerm implements SearchManager.
func (e *elasticsearchManager) SearchUsingTerm(string) error {
	panic("unimplemented")
}
