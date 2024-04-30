package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog/log"
)

// TODO: Split this into more managable interfaces than a god interface
type DBManager interface {
	AddUserAccount(id int64) error
	AddRepo(username int64, id int64) error
	GetUsersRepos(username int64) ([]int64, error)
	GetAllProducts() ([]Product, error)
	GetAllProductsForRepo(repoId int64) ([]RepoProduct, error)
	AddProductToRepo(productId, repoId int64, oneOffId, recurringId string) error
	GetRepoOptions(repoId int64) ([]RepoOption, error)
	GetProductNameAndPrice(prodId int64) (string, int64, error)
	GetPriceId(repoId, prodId int64, isSubscription bool) (string, error)
	AddPurchase(userId, repoId, productId, purchaseTime int64, isSub bool, paymentId string) error
	GetUserPurchases(userId int64) ([]ProductPurchase, error)
	GetPaymentId(id int64) (string, error)
	UpdateSubScriptionToPending(id string) error
	EndSubscription(id string) error
	EnableSubscription(id string) error
	GetRefundablePaymentId(id int64) (string, error)
	SetPaymentToPending(id int64) error
	UpdatePaymentToRefunded(id string) error
	SavePaymentAccount(userId int64, paymentAccountId string) error
	GetPaymentAccount(userId int64) (string, bool, error)
	SetPaymentAccountToActive(id string) error
	GetAccountIdFeeAndPriceId(repoId, prodId int64, isSubscription bool) (string, string, int64, error)
	AddToMailingList(email string) error
	MarkAccountAsRevoked(id int64) error
	IsAccountPendingRevoke(id int64) (bool, error)
	IsRepoOwnedByRevokePendingUser(repoId int64) (bool, error)
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

type ProductPurchase struct {
	Id       int64  `json:"id"`
	RepoId   int64  `json:"repoId"`
	IsOneOff bool   `json:"isOneOff"`
	UnixTs   int64  `json:"unixTS"`
	ProdName string `json:"prodName"`
	Price    int64  `json:"price"`
	Url      string `json:"url"`
	Status   string `json:"status"`
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
				log.Error().Err(err).Int("index", i).Interface("value", v).Msg("Unsupported type")
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

	defer result.Close()

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

func (p *postgresManager) GetPriceId(repoId, prodId int64, isSubscription bool) (string, error) {
	sql := "SELECT oneoffid FROM repo_products WHERE repo_id = $1 AND product_id = $2;"
	if isSubscription {
		sql = "SELECT recurringid FROM repo_products WHERE repo_id = $1 AND product_id = $2;"
	}

	result, err := p.conn.Query(context.Background(), sql, repoId, prodId)
	if err != nil {
		return "", err
	}

	defer result.Close()

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

func (p *postgresManager) AddPurchase(userId, repoId, productId, purchaseTime int64, isSub bool, paymentId string) error {
	_, err := p.conn.Exec(context.Background(), "INSERT INTO purchases (repo_id, userId, product_id, isOneOff, unixTS, paymentId, stat) VALUES ($1, $2, $3, $4, $5, $6, 'active');", repoId, userId, productId, !isSub, purchaseTime, paymentId)
	return err
}

func (p *postgresManager) GetUserPurchases(userId int64) ([]ProductPurchase, error) {
	results, err := p.conn.Query(context.Background(), `
	SELECT repo_id, isoneoff, unixts, prod_name, price, url, pur.id, stat
	FROM purchases pur
	JOIN products p ON pur.product_id = p.id
	WHERE userid = $1
	ORDER BY unixts DESC;
	`, userId)

	if err != nil {
		return nil, err
	}

	purchases := []ProductPurchase{}
	for results.Next() {
		anySlice, err := results.Values()
		if err != nil {
			return nil, err
		}

		if len(anySlice) != 8 {
			return nil, fmt.Errorf("invalid row structure returned")
		}

		repoId, ok := anySlice[0].(int64)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on repoId column")
		}

		isOneOff, ok := anySlice[1].(bool)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on isOneOff column")
		}

		unixTs, ok := anySlice[2].(int64)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on unixTs column")
		}

		prodName, ok := anySlice[3].(string)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on prodName column")
		}

		price, ok := anySlice[4].(int64)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on 5th column")
		}

		url, ok := anySlice[5].(string)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on 5th column")
		}

		id, ok := anySlice[6].(int64)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on 5th column")
		}

		stat, ok := anySlice[7].(string)
		if !ok {
			return nil, fmt.Errorf("invalid row structure returned, on 5th column")
		}

		purchases = append(purchases, ProductPurchase{
			Id:       id,
			RepoId:   repoId,
			ProdName: prodName,
			UnixTs:   unixTs,
			IsOneOff: isOneOff,
			Price:    price,
			Url:      url,
			Status:   stat,
		})

	}

	return purchases, nil
}

func (p *postgresManager) GetPaymentId(id int64) (string, error) {
	sql := "SELECT paymentid FROM purchases WHERE id = $1;"

	result, err := p.conn.Query(context.Background(), sql, id)
	if err != nil {
		return "", err
	}

	defer result.Close()

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

	payId, ok := anySlice[0].(string)
	if !ok {
		return "", fmt.Errorf("invalid row structure returned, on paymentId column in GetPriceId")
	}

	return payId, nil
}

func (p *postgresManager) UpdateSubScriptionToPending(id string) error {
	sql := "UPDATE purchases SET stat = 'pending' WHERE paymentId = $1 AND stat = 'active';"

	result, err := p.conn.Exec(context.Background(), sql, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("unable to find and update row")
	}

	return err
}

func (p *postgresManager) EndSubscription(id string) error {
	sql := "UPDATE purchases SET stat = 'refunded' WHERE paymentId = $1 AND stat = 'pending';"

	result, err := p.conn.Exec(context.Background(), sql, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("unable to find and update row")
	}

	return err
}

func (p *postgresManager) EnableSubscription(id string) error {
	sql := "UPDATE purchases SET stat = 'active' WHERE paymentId = $1 AND stat = 'pending';"

	result, err := p.conn.Exec(context.Background(), sql, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("unable to find and update row")
	}

	return err
}

func (p *postgresManager) GetRefundablePaymentId(id int64) (string, error) {
	// 1209600 - is two weeks
	// TODO: Make this an env variable
	sql := `
	SELECT paymentid FROM purchases 
	WHERE isoneoff = true 
		AND (unixts + (1209600)) > (SELECT extract(epoch from now()))
		AND id = $1
		AND stat = 'active'
	LIMIT 1;`

	result, err := p.conn.Query(context.Background(), sql, id)
	if err != nil {
		return "", err
	}

	defer result.Close()

	if !result.Next() {
		return "", fmt.Errorf("not data returned, cannot find a refundable paymentId")
	}

	anySlice, err := result.Values()
	if err != nil {
		return "", err
	}

	if len(anySlice) != 1 {
		return "", fmt.Errorf("invalid row structure returned in GetPriceId")
	}

	payId, ok := anySlice[0].(string)
	if !ok {
		return "", fmt.Errorf("invalid row structure returned, on paymentId column in GetPriceId")
	}

	return payId, nil
}

func (p *postgresManager) SetPaymentToPending(id int64) error {
	sql := "UPDATE purchases SET stat = 'pending' WHERE id = $1 AND stat = 'active';"

	result, err := p.conn.Exec(context.Background(), sql, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("unable to find and update row")
	}

	return err
}

func (p *postgresManager) UpdatePaymentToRefunded(id string) error {
	sql := "UPDATE purchases SET stat = 'refunded' WHERE paymentId = $1 AND stat = 'pending';"

	result, err := p.conn.Exec(context.Background(), sql, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("unable to find and update row")
	}

	return err
}

func (p *postgresManager) SavePaymentAccount(userId int64, paymentAccountId string) error {
	sql := "INSERT INTO paymentAccounts VALUES ($1, $2, FALSE);"

	result, err := p.conn.Exec(context.Background(), sql, userId, paymentAccountId)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("unable to insert result")
	}

	return nil
}

func (p *postgresManager) GetPaymentAccount(userId int64) (string, bool, error) {
	sql := "SELECT paymentAccountId, isActive FROM paymentAccounts WHERE userId = $1 LIMIT 1;"

	result, err := p.conn.Query(context.Background(), sql, userId)
	if err != nil {
		return "", false, err
	}

	defer result.Close()

	if !result.Next() {
		return "", false, fmt.Errorf("unable to get row")
	}

	anySlice, err := result.Values()
	if err != nil {
		return "", false, err
	}

	if len(anySlice) != 2 {
		return "", false, fmt.Errorf("invalid row structure returned in GetPriceId")
	}

	paymentAccountId, ok := anySlice[0].(string)
	if !ok {
		return "", false, fmt.Errorf("invalid row structure returned, on paymentId column in GetPriceId")
	}

	active, ok := anySlice[1].(bool)
	if !ok {
		return "", false, fmt.Errorf("invalid row structure returned, on isActive column in GetPriceId")
	}

	return paymentAccountId, active, nil
}

func (p *postgresManager) SetPaymentAccountToActive(id string) error {
	sql := "UPDATE paymentAccounts SET isActive = TRUE WHERE paymentAccountId = $1;"

	result, err := p.conn.Exec(context.Background(), sql, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("unable to update record")
	}

	return nil
}

func (p *postgresManager) GetAccountIdFeeAndPriceId(repoId, prodId int64, isSubscription bool) (string, string, int64, error) {
	// TODO: Make string queries more efficient by not re-generating each time
	sql := `
	SELECT pa.paymentAccountId AS accountPaymentId,
       rp.oneOffId,
       pr.fee AS productFee
	FROM repo_products rp
	JOIN products pr ON rp.product_id = pr.id
	JOIN repotable rt ON rp.repo_id = rt.id
	JOIN paymentAccounts pa ON rt.user_id = pa.userId
	WHERE rp.repo_id = $2
	AND rp.product_id = $1
	AND NOT EXISTS (
		SELECT 1
		FROM deactivation d
		WHERE d.account_id = pa.userId
	);`

	if isSubscription {
		sql = `
		SELECT pa.paymentAccountId AS accountPaymentId,
			rp.recurringid,
			pr.fee AS productFee
		FROM repo_products rp
		JOIN products pr ON rp.product_id = pr.id
		JOIN repotable rt ON rp.repo_id = rt.id
		JOIN paymentAccounts pa ON rt.user_id = pa.userId
		WHERE rp.repo_id = $2
		AND rp.product_id = $1
		AND NOT EXISTS (
			SELECT 1
			FROM deactivation d
			WHERE d.account_id = pa.userId
		);`
	}

	result, err := p.conn.Query(context.Background(), sql, prodId, repoId)

	if err != nil {
		return "", "", 0, err
	}
	defer result.Close()

	if !result.Next() {
		return "", "", 0, fmt.Errorf("unable to get row, may be deactived")
	}

	anySlice, err := result.Values()
	if err != nil {
		return "", "", 0, err
	}

	if len(anySlice) != 3 {
		return "", "", 0, fmt.Errorf("invalid row structure returned in GetPriceId")
	}

	paymentAccountId, ok := anySlice[0].(string)
	if !ok {
		return "", "", 0, fmt.Errorf("invalid row structure returned, on paymentId column in GetAccountIdAndPriceId")
	}

	priceId, ok := anySlice[1].(string)
	if !ok {
		return "", "", 0, fmt.Errorf("invalid row structure returned, on price id column in GetAccountIdAndPriceId")
	}

	fee, ok := anySlice[2].(int64)
	if !ok {
		return "", "", 0, fmt.Errorf("invalid row structure returned, on fee column in GetAccountIdAndPriceId")
	}

	return paymentAccountId, priceId, fee, nil
}

func (p *postgresManager) AddToMailingList(email string) error {
	_, err := p.conn.Exec(context.Background(), "INSERT into emails values ($1, $2);", email, false)
	return err
}

func (p *postgresManager) AddUserAccount(id int64) error {
	_, err := p.conn.Exec(context.Background(), `
	INSERT INTO accounts
	VALUES ($1, $2)
	ON CONFLICT (id)
	DO NOTHING;`, id, true)

	return err
}

func (p *postgresManager) MarkAccountAsRevoked(id int64) error {
	_, err := p.conn.Exec(context.Background(), `SELECT addRevokedAccount($1);`, id)
	return err
}

func (p *postgresManager) IsAccountPendingRevoke(id int64) (bool, error) {
	result, err := p.conn.Query(context.Background(), `
	SELECT EXISTS (
		SELECT 1
		FROM deactivation
		WHERE account_id = $1
	) AS value_exists;`, id)

	if err != nil {
		return false, err
	}
	defer result.Close()

	if !result.Next() {
		// If there is no record then it means user is not revoked
		return false, nil
	}

	anySlice, err := result.Values()
	if err != nil {
		return false, err
	}

	valueExists, ok := anySlice[0].(bool)
	if !ok {
		return false, fmt.Errorf("invalid row structure returned, on value_exists column in IsAccountPendingRevoke")
	}

	return valueExists, nil
}

func (p *postgresManager) IsRepoOwnedByRevokePendingUser(id int64) (bool, error) {
	result, err := p.conn.Query(context.Background(), `
	SELECT
       CASE
           WHEN d.account_id IS NOT NULL THEN TRUE
           ELSE FALSE
       END AS is_deactivated
	FROM repotable r
	LEFT JOIN deactivation d ON r.user_id = d.account_id
	WHERE r.id = $1;`, id)

	if err != nil {
		return false, err
	}
	defer result.Close()

	if !result.Next() {
		// No row would mean that there is no row in deactivation
		return false, nil
	}

	anySlice, err := result.Values()
	if err != nil {
		return false, err
	}

	isDeactivated, ok := anySlice[0].(bool)
	if !ok {
		return false, fmt.Errorf("invalid row structure returned, on isDeactivated column in IsRepoOwnedByRevokePendingUser")
	}

	return isDeactivated, nil

}
