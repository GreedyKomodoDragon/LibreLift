package products

import "librelift/pkg/db"

type ProductsManager interface {
	GetAllProducts() ([]db.Product, error)
	GetRepoProducts(repoId int64) ([]db.RepoProduct, error)
	AddProductToRepo(productId, repoId int64) error
	GetReposOptions(id int64) ([]db.RepoOption, error)
}

type productsManager struct {
	dbManager db.DBManager
}

func NewProductManager(dbManager db.DBManager) ProductsManager {
	return &productsManager{
		dbManager: dbManager,
	}
}

func (p *productsManager) GetAllProducts() ([]db.Product, error) {
	return p.dbManager.GetAllProducts()
}

func (p *productsManager) GetRepoProducts(repoId int64) ([]db.RepoProduct, error) {
	// Could be Inefficient if 1000's of products?
	return p.dbManager.GetAllProductsForRepo(repoId)
}

func (p *productsManager) AddProductToRepo(productId, repoId int64) error {
	return p.dbManager.AddProductToRepo(productId, repoId)
}

func (p *productsManager) GetReposOptions(id int64) ([]db.RepoOption, error) {
	return p.dbManager.GetRepoOptions(id)
}
