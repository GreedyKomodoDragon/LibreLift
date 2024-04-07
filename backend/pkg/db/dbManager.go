package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog/log"
)

type DBManager interface {
	AddRepo(username int64, id int64) error
	GetUsersRepos(username int64) ([]int64, error)
	GetAllProducts() ([]Product, error)
	GetAllProductsForRepo(repoId int64) ([]RepoProduct, error)
	AddProductToRepo(productId, repoId int64, oneOffId, recurringId string) error
	GetRepoOptions(repoId int64) ([]RepoOption, error)
	GetProductNameAndPrice(prodId int64) (string, int64, error)
	GetPriceId(repoId, prodId int64) (string, error)
}

type postgresManager struct {
	conn *pgxpool.Pool
}

type Product struct {
	Id    int64  `json:"id"`
	Name  string `json:"name"`
	URL   string `json:"url"`
	Price int64  `json:"price"`
}

type RepoProduct struct {
	Id      int64  `json:"id"`
	Name    string `json:"name"`
	URL     string `json:"url"`
	Price   int64  `json:"price"`
	IsAdded bool   `json:"isAdded"`
}

type RepoOption struct {
	Id    int64  `json:"id"`
	Name  string `json:"name"`
	URL   string `json:"url"`
	Price int64  `json:"price"`
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

func (p *postgresManager) AddRepo(username int64, id int64) error {
	// Uses a built in postgres function to insert the item into the table
	_, err := p.conn.Exec(context.Background(), "SELECT insert_into_repo_table($1, $2)", id, username)
	return err
}

func (p *postgresManager) GetUsersRepos(username int64) ([]int64, error) {

	results, err := p.conn.Query(context.Background(), "SELECT get_all_repo_ids_for_user($1)", username)
	if err != nil {
		log.Error().Int64("username", username).Err(err).Msg("failed to run GetUsersRepos query")
		return nil, err
	}

	defer results.Close()

	// check if there is any
	ids := []int64{}
	for results.Next() {
		anySlice, err := results.Values()
		if err != nil {
			log.Error().Err(err).Msg("failed to run get values")
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

		price, ok := anySlice[2].(int64)
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

		price, ok := anySlice[3].(int64)
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

func (p *postgresManager) AddProductToRepo(productId, repoId int64, oneOffId, recurringId string) error {
	_, err := p.conn.Exec(context.Background(), "INSERT into repo_products values ($1, $2, $3, $4);", repoId, productId, oneOffId, recurringId)
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

		price, ok := anySlice[3].(int64)
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

func (p *postgresManager) GetProductNameAndPrice(prodId int64) (string, int64, error) {
	result, err := p.conn.Query(context.Background(), "SELECT price, prod_name FROM products WHERE id = $1;", prodId)
	if err != nil {
		return "", 0, err
	}

	if !result.Next() {
		return "", 0, fmt.Errorf("not data returned in GetProductInfo")
	}

	anySlice, err := result.Values()
	if err != nil {
		return "", 0, err
	}

	if len(anySlice) != 2 {
		return "", 0, fmt.Errorf("invalid row structure returned in GetProductInfo")
	}

	price, ok := anySlice[0].(int64)
	if !ok {
		return "", 0, fmt.Errorf("invalid row structure returned, on price column in GetProductInfo")
	}

	name, ok := anySlice[1].(string)
	if !ok {
		return "", 0, fmt.Errorf("invalid row structure returned, on name column in GetProductInfo")
	}

	return name, price, nil
}

func (p *postgresManager) GetPriceId(repoId, prodId int64) (string, error) {
	result, err := p.conn.Query(context.Background(), "SELECT oneoffid FROM repo_products WHERE repo_id = $1 AND product_id = $2;", repoId, prodId)
	if err != nil {
		return "", err
	}

	if !result.Next() {
		return "", fmt.Errorf("not data returned in GetPriceId")
	}

	anySlice, err := result.Values()
	if err != nil {
		return "", err
	}

	if len(anySlice) != 1 {
		return "", fmt.Errorf("invalid row structure returned in GetPriceId")
	}

	priceId, ok := anySlice[0].(string)
	if !ok {
		return "", fmt.Errorf("invalid row structure returned, on priceId column in GetPriceId")
	}

	return priceId, nil
}
