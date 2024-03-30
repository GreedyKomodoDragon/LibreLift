package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

type DBManager interface {
	AddRepo(username int64, id int64) error
	GetUsersRepos(username int64) ([]int64, error)
	GetAllProducts() ([]Product, error)
	GetAllProductsForRepo(repoId int64) ([]RepoProduct, error)
	AddProductToRepo(productId, repoId int64) error
	GetRepoOptions(repoId int64) ([]RepoOption, error)
	// Used to close the client connection to the database
	Close()
}

type postgresManager struct {
	conn *pgx.Conn
}

type Product struct {
	Id    int64  `json:"id"`
	Name  string `json:"name"`
	URL   string `json:"url"`
	Price int32  `json:"price"`
}

type RepoProduct struct {
	Id      int64  `json:"id"`
	Name    string `json:"name"`
	URL     string `json:"url"`
	Price   int32  `json:"price"`
	IsAdded bool   `json:"isAdded"`
}

type RepoOption struct {
	Id    int64  `json:"id"`
	Name  string `json:"name"`
	URL   string `json:"url"`
	Price int32  `json:"price"`
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

func (p *postgresManager) GetAllProducts() ([]Product, error) {

	results, err := p.conn.Query(context.Background(), "SELECT products.prod_name, products.url, products.price, products.id FROM products")
	if err != nil {
		return nil, err
	}
	defer results.Close()

	products, err := p.convertRowsToProduct(results)
	if err != nil {
		return nil, err
	}

	return *products, nil
}

func (p *postgresManager) GetAllProductsForRepo(repoId int64) ([]RepoProduct, error) {

	results, err := p.conn.Query(context.Background(), `
	SELECT 
    	CASE 
        	WHEN products.id in (select product_id from repo_products where repo_id = $1) THEN true 
        	ELSE false 
    	END AS isSelected, 
		prod_name, url, price, id
	FROM products;
	`, repoId)

	if err != nil {
		return nil, err
	}
	defer results.Close()

	products, err := p.convertRowsToRepoProduct(results)
	if err != nil {
		return nil, err
	}

	return *products, nil
}

func (p *postgresManager) convertRowsToProduct(results pgx.Rows) (*[]Product, error) {
	// check if there is any
	products := []Product{}
	for results.Next() {
		anySlice, err := results.Values()
		if err != nil {
			return nil, err
		}

		if len(anySlice) != 4 {
			return nil, fmt.Errorf("invalid row structure returned")
		}

		name, ok := anySlice[0].(string)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on first column")
		}

		url, ok := anySlice[1].(string)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on second column")
		}

		price, ok := anySlice[2].(int32)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on third column")
		}

		id, ok := anySlice[3].(int64)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on fourth column")
		}

		products = append(products, Product{
			Id:    id,
			Name:  name,
			URL:   url,
			Price: price,
		})

	}

	return &products, nil
}

func (p *postgresManager) convertRowsToRepoProduct(results pgx.Rows) (*[]RepoProduct, error) {
	// check if there is any
	products := []RepoProduct{}
	for results.Next() {
		anySlice, err := results.Values()
		if err != nil {
			return nil, err
		}

		if len(anySlice) != 5 {
			return nil, fmt.Errorf("invalid row structure returned")
		}

		isAdded, ok := anySlice[0].(bool)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on first column")
		}

		name, ok := anySlice[1].(string)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on second column")
		}

		url, ok := anySlice[2].(string)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on third column")
		}

		price, ok := anySlice[3].(int32)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on fourth column")
		}

		id, ok := anySlice[4].(int64)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on 5th column")
		}

		products = append(products, RepoProduct{
			Id:      id,
			IsAdded: isAdded,
			Name:    name,
			URL:     url,
			Price:   price,
		})

	}

	return &products, nil
}

func (p *postgresManager) AddProductToRepo(productId, repoId int64) error {
	_, err := p.conn.Exec(context.Background(), "INSERT into repo_products values ($1, $2);", repoId, productId)
	return err
}

func (p *postgresManager) GetRepoOptions(repoId int64) ([]RepoOption, error) {
	results, err := p.conn.Query(context.Background(), `
	SELECT id, prod_name, url, price
	FROM products
	WHERE products.id in (select product_id from repo_products where repo_id = $1);
	`, repoId)

	if err != nil {
		return nil, err
	}
	defer results.Close()

	products, err := p.convertRowsToRepoOption(results)
	if err != nil {
		return nil, err
	}

	return *products, err
}

func (p *postgresManager) convertRowsToRepoOption(results pgx.Rows) (*[]RepoOption, error) {
	products := []RepoOption{}

	for results.Next() {
		anySlice, err := results.Values()
		if err != nil {
			return nil, err
		}

		if len(anySlice) != 4 {
			return nil, fmt.Errorf("invalid row structure returned")
		}

		id, ok := anySlice[0].(int64)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on id column")
		}

		name, ok := anySlice[1].(string)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on second column")
		}

		url, ok := anySlice[2].(string)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on third column")
		}

		price, ok := anySlice[3].(int32)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on fourth column")
		}

		products = append(products, RepoOption{
			Id:    id,
			Name:  name,
			URL:   url,
			Price: price,
		})

	}

	return &products, nil
}
