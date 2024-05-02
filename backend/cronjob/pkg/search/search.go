package search

import (
	"context"
	"fmt"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/esapi"
	"github.com/elastic/go-elasticsearch/v8/esutil"
)

type SearchManager interface {
	DropIndexes(ids []int64) error
}

type elasticManager struct {
	client *elasticsearch.Client
}

func NewSearchManager(client *elasticsearch.Client) SearchManager {
	return &elasticManager{
		client: client,
	}
}

func (e *elasticManager) DropIndexes(ids []int64) error {
	requestBody := map[string]interface{}{
		"query": map[string]interface{}{
			"terms": map[string]interface{}{
				"id": ids,
			},
		},
	}

	// Create the delete by query request
	req := esapi.DeleteByQueryRequest{
		Index: []string{"librelift"},
		Body:  esutil.NewJSONReader(requestBody),
	}

	// Perform the delete by query request
	res, err := req.Do(context.Background(), e.client)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf(res.String())
	}

	return nil
}

// Example for deleting using elastic api
// POST /your_index/_delete_by_query
// {
//   "query": {
//     "terms": {
//       "your_field": ["A", "B", "C"]
//     }
//   }
// }
