package search

type SearchManager interface {
	DropIndexes(ids []int64) error
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
