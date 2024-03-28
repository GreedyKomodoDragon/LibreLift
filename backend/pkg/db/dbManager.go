package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

type DBManager interface {
	AddRepo(username int64, id int64) error
	GetUsersRepos(username int64) ([]int64, error)
	// Used to close the client connection to the database
	Close()
}

type postgresManager struct {
	conn *pgx.Conn
}

func NewDBManager(connectionURL string) (DBManager, error) {
	conn, err := pgx.Connect(context.Background(), connectionURL)
	if err != nil {
		return nil, err
	}

	return &postgresManager{
		conn: conn,
	}, nil

}

func (p *postgresManager) AddRepo(username int64, id int64) error {
	// Uses a built in postgres function to insert the item into the table
	_, err := p.conn.Exec(context.Background(), "SELECT insert_into_repo_table($1, $2)", id, username)
	return err
}

func (p *postgresManager) Close() {
	p.conn.Close(context.Background())
}

func (p *postgresManager) GetUsersRepos(username int64) ([]int64, error) {

	results, err := p.conn.Query(context.Background(), "SELECT get_all_repo_ids_for_user($1)", username)
	if err != nil {
		return nil, err
	}
	defer results.Close()

	// check if there is any
	ids := []int64{}
	for results.Next() {
		anySlice, err := results.Values()
		if err != nil {
			return nil, err
		}

		for i, v := range anySlice {
			switch val := v.(type) {
			case int64:
				ids = append(ids, val)
			default:
				// Handle unsupported types or unexpected data
				fmt.Printf("Unsupported type at index %d: %T\n", i, v)
			}
		}

	}

	return ids, nil
}
