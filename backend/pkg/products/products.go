package products

import (
	"librelift/pkg/db"
	"librelift/pkg/payments"
)

type ProductsManager interface {
	GetAllProducts() ([]db.Product, error)
	GetRepoProducts(repoId int64) ([]db.RepoProduct, error)
	GetProductNameAndPrice(productId int64) (string, int64, error)
	AddProductToRepo(productName string, productId, repoId, price int64) error
	GetReposOptions(id int64) ([]db.RepoOption, error)
	GetPriceId(repoId, prodId int64) (string, error)
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

func (p *productsManager) GetRepoProducts(repoId int64) ([]db.RepoProduct, error) {
	return p.dbManager.GetAllProductsForRepo(repoId)
}

func (p *productsManager) AddProductToRepo(productName string, productId, repoId, price int64) error {
	oneOffId, recurringId, err := p.paymentManager.CreateProductForRepo(repoId, productName, price)
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

func (p *productsManager) GetPriceId(repoId, prodId int64) (string, error) {
	return p.dbManager.GetPriceId(repoId, prodId)
}
