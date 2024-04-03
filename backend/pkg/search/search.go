package search

import (
	"context"
	"encoding/json"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/typedapi/core/search"
	"github.com/elastic/go-elasticsearch/v8/typedapi/types"
	"github.com/elastic/go-elasticsearch/v8/typedapi/types/enums/operator"
	"github.com/rs/zerolog/log"
)

type SearchManager interface {
	CreateSearchDocument(int64, string, string) (string, error)
	Search(string) ([]SearchDocument, error)
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
func (e *elasticsearchManager) Search(query string) ([]SearchDocument, error) {
	lenient := true

	repo, err := e.client.Search().Index("librelift").
		Request(&search.Request{
			Query: &types.Query{MultiMatch: &types.MultiMatchQuery{
				Query:     query,
				Lenient:   &lenient,
				Operator:  &operator.Or,
				Fuzziness: "AUTO",
				Fields:    []string{"name", "description"},
			}},
		}).
		Do(context.TODO())
	if err != nil {
		return nil, err
	}

	documents := []SearchDocument{}
	for _, hit := range repo.Hits.Hits {
		var document SearchDocument
		if err := json.Unmarshal(hit.Source_, &document); err != nil {
			log.Err(err).Msg("failed to Unmarshal search document from elasticsearch")
			continue
		}

		documents = append(documents, document)
	}

	return documents, nil
}
