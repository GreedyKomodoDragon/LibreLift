package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type DBManager interface {
	MarkAndGetExpiredSubscriptions() ([]*UserSubs, error)
	DeleteCompletedUsersAndGetRepos([]int64) ([]int64, error)
}

type postgresManager struct {
	conn *pgxpool.Pool
}

type UserSubs struct {
	User int64
	Subs []*string
}

func NewDBManager(connectionURL string) (DBManager, error) {
	dbpool, err := pgxpool.New(context.Background(), connectionURL)
	if err != nil {
		return nil, err
	}

	return &postgresManager{
		conn: dbpool,
	}, nil
}

func (p *postgresManager) MarkAndGetExpiredSubscriptions() ([]*UserSubs, error) {
	result, err := p.conn.Query(context.Background(), `SELECT * FROM process_deactivated_accounts_and_update();`)
	if err != nil {
		return nil, err
	}
	defer result.Close()

	userSubs := []*UserSubs{}
	lastId := int64(0)
	for result.Next() {
		anySlice, err := result.Values()
		if err != nil {
			return nil, err
		}

		if len(anySlice) != 2 {
			return nil, fmt.Errorf("invalid data length returned")
		}

		accountId, ok := anySlice[0].(int64)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on accountId column in MarkAndGetExpiredSubscriptions")
		}

		// As the data is ordered we can keep a slice instead of map -> avoids hash function calls
		if lastId != accountId {
			userSubs = append(userSubs, &UserSubs{
				User: accountId,
				Subs: []*string{},
			})
			lastId = accountId
		}

		paymentId, ok := anySlice[1].(string)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on paymentId column in MarkAndGetExpiredSubscriptions")
		}

		lastIndex := len(userSubs) - 1
		userSubs[lastIndex].Subs = append(userSubs[lastIndex].Subs, &paymentId)

	}

	return userSubs, nil
}

func (p *postgresManager) DeleteCompletedUsersAndGetRepos(users []int64) ([]int64, error) {
	result, err := p.conn.Query(context.Background(), `SELECT * FROM remove_user_and_their_references($1::BIGINT[]);`, users)
	if err != nil {
		return nil, err
	}
	defer result.Close()

	repoids := []int64{}
	for result.Next() {
		anySlice, err := result.Values()
		if err != nil {
			return nil, err
		}

		if len(anySlice) != 1 {
			return nil, fmt.Errorf("invalid data length returned")
		}

		repoId, ok := anySlice[0].(int64)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on repoId column in DeleteCompletedUsersAndGetRepos")
		}

		repoids = append(repoids, repoId)

	}

	return repoids, nil
}
