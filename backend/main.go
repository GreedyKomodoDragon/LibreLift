package main

import (
	"context"
	"librelift/pkg/auth"
	"librelift/pkg/db"
	"librelift/pkg/payments"
	"librelift/pkg/products"
	"librelift/pkg/projects"
	"librelift/pkg/rest"
	"librelift/pkg/search"
	"os"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/joho/godotenv"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	zerolog.SetGlobalLevel(zerolog.InfoLevel)

	godotenv.Load()

	// TODO: Tidy up this configuration setting
	clientID := os.Getenv("GITHUB_CLIENT_ID")
	if len(clientID) == 0 {
		panic("missing GITHUB_CLIENT_ID")
	}

	clientSecret := os.Getenv("GITHUB_CLIENT_SECRET")
	if len(clientSecret) == 0 {
		panic("missing GITHUB_CLIENT_SECRET")
	}

	elasticCAPath := os.Getenv("ELASTIC_CA")
	if len(elasticCAPath) == 0 {
		panic("missing ELASTIC_CA")
	}

	elasticUsername := os.Getenv("ELASTIC_USERNAME")
	if len(elasticUsername) == 0 {
		panic("missing ELASTIC_USERNAME")
	}

	elasticPassword := os.Getenv("ELASTIC_PASSWORD")
	if len(elasticPassword) == 0 {
		panic("missing ELASTIC_PASSWORD")
	}

	elasticAddress := os.Getenv("ELASTIC_ADDRESS")
	if len(elasticAddress) == 0 {
		panic("missing ELASTIC_ADDRESS")
	}

	stripeKey := os.Getenv("STRIPE_KEY")
	if len(stripeKey) == 0 {
		panic("missing STRIPE_KEY")
	}

	if os.Getenv("STRIPE_WEBHOOK_KEY") == "" {
		panic("missing STRIPE_WEBHOOK_KEY")
	}

	cert, err := os.ReadFile(elasticCAPath)
	if err != nil {
		log.Fatal().Err(err).Msg("Error getting ca certs")
	}

	cfg := elasticsearch.Config{
		Addresses: []string{
			elasticAddress,
		},
		Username: elasticUsername,
		Password: elasticPassword,
		CACert:   cert,
	}

	es, err := elasticsearch.NewTypedClient(cfg)
	if err != nil {
		log.Fatal().Err(err).Msg("Error creating elastic client")
	}

	if ok, err := es.Info().IsSuccess(context.Background()); err != nil || !ok {
		log.Fatal().Bool("ok", ok).Err(err).Msg("Error getting response from elastic client")
	}

	log.Info().Msg("elasticsearch was connected")

	pg, err := db.NewDBManager("postgres://myuser:mypassword@localhost:5432/mydatabase")
	if err != nil {
		panic(err)
	}

	paymentManager := payments.NewStripeManager(stripeKey, pg)
	searchManager := search.NewElasticsearchManager(es)
	authManager := auth.NewAuthManager(clientID, clientSecret)

	projectManager := projects.NewProjectManager(pg)
	productManager := products.NewProductManager(pg, paymentManager)
	app := rest.NewFiberHttpServer(authManager, projectManager, productManager, searchManager, paymentManager)

	log.Info().Int("port", 8080).Msg("listening on port")
	app.Listen("127.0.0.1:8080")
}
