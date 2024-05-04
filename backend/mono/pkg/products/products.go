package products

import (
	"fmt"
	"librelift/pkg/db"
	"librelift/pkg/payments"
	"strconv"
	"strings"
)

type ProductsManager interface {
	GetAllProducts() ([]db.Product, error)
	GetRepoProducts(repoId int64, term, option string, page int64) ([]db.Product, error)
	GetProductNameAndPrice(productId int64) (string, int64, error)
	AddProductToRepo(productName string, userId, productId, repoId, price int64) error
	GetReposOptions(id int64) ([]db.RepoOption, error)
	GetPriceId(repoId, prodId int64, isSubscription bool) (string, error)
	AddPurchase(metadata map[string]string, purchaseTime int64, paymentId string) error
	GetUserPurchases(userId int64) ([]db.ProductPurchase, error)
	// TODO: Refactor this into Payment Manager
	GetPaymentId(id int64) (string, error)
	GetAccountIdFeeAndPriceId(repoId, prodId int64, isSubscription bool) (string, string, int64, error)
}

type productsManager struct {
	dbManager      db.DBManager
	paymentManager payments.PaymentsManager
}

func NewProductManager(dbManager db.DBManager, paymentManager payments.PaymentsManager) ProductsManager {
	return &productsManager{
		dbManager:      dbManager,
		paymentManager: paymentManager,
	}
}

func (p *productsManager) GetAllProducts() ([]db.Product, error) {
	return p.dbManager.GetAllProducts()
}

func (p *productsManager) GetRepoProducts(repoId int64, term, option string, page int64) ([]db.Product, error) {
	return p.dbManager.GetAllProductsForRepo(repoId, term, option, page)
}

func (p *productsManager) AddProductToRepo(productName string, userId, productId, repoId, price int64) error {
	oneOffId, recurringId, err := p.paymentManager.CreateProductForRepo(userId, repoId, productName, price)
	if err != nil {
		return err
	}

	return p.dbManager.AddProductToRepo(productId, repoId, oneOffId, recurringId)
}

func (p *productsManager) GetReposOptions(id int64) ([]db.RepoOption, error) {
	return p.dbManager.GetRepoOptions(id)
}

func (p *productsManager) GetProductNameAndPrice(prodId int64) (string, int64, error) {
	return p.dbManager.GetProductNameAndPrice(prodId)
}

func (p *productsManager) GetPriceId(repoId, prodId int64, isSubscription bool) (string, error) {
	return p.dbManager.GetPriceId(repoId, prodId, isSubscription)
}

func (p *productsManager) AddPurchase(metadata map[string]string, purchaseTime int64, paymentId string) error {
	idStr, ok := metadata["id"]
	if !ok {
		return fmt.Errorf("failed to get attribute: %s", "id")
	}

	userId, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return fmt.Errorf("failed to parse %s", "userId")
	}

	productIdStr, ok := metadata["productId"]
	if !ok {
		return fmt.Errorf("failed to get attribute: %s", "productId")
	}

	productId, err := strconv.ParseInt(productIdStr, 10, 64)
	if err != nil {
		return fmt.Errorf("failed to parse %s", "productId")
	}

	repoIdStr, ok := metadata["repoId"]
	if !ok {
		return fmt.Errorf("failed to get attribute: %s", "productId")
	}

	repoId, err := strconv.ParseInt(repoIdStr, 10, 64)
	if err != nil {
		return fmt.Errorf("failed to parse %s", "repoId")
	}

	subStr, ok := metadata["subscription"]
	if !ok {
		return fmt.Errorf("failed to get attribute: %s", "productId")
	}

	sub, err := strconv.ParseBool(subStr)
	if err != nil {
		return fmt.Errorf("failed to parse %s", "subscription")
	}

	return p.dbManager.AddPurchase(userId, repoId, productId, purchaseTime, sub, paymentId)
}

func (p *productsManager) GetUserPurchases(userId int64) ([]db.ProductPurchase, error) {
	return p.dbManager.GetUserPurchases(userId)
}

func (p *productsManager) GetPaymentId(id int64) (string, error) {
	payId, err := p.dbManager.GetPaymentId(id)
	if err != nil {
		return "", err
	}

	if !strings.HasPrefix(payId, "sub_") {
		return "", fmt.Errorf("purchase is not a subscription")
	}

	return payId, nil
}

func (p *productsManager) GetAccountIdFeeAndPriceId(repoId, prodId int64, isSubscription bool) (string, string, int64, error) {
	return p.dbManager.GetAccountIdFeeAndPriceId(repoId, prodId, isSubscription)
}
