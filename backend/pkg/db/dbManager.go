package db

import (
	"context"

	"github.com/jackc/pgx/v5"
)

type DBManager interface {
	AddRepo(username int64, id int64) error
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
	_, err := p.conn.Exec(context.Background(), "SELECT insert_into_repo_table($1, $2)", username, id)
	return err
}

func (p *postgresManager) Close() {
	p.conn.Close(context.Background())
}
