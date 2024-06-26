package main

import (
	"context"
	"librelift/pkg/auth"
	"librelift/pkg/db"
	"librelift/pkg/email"
	"librelift/pkg/payments"
	"librelift/pkg/products"
	"librelift/pkg/projects"
	"librelift/pkg/rest"
	"librelift/pkg/search"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

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

	valkeyAddress := os.Getenv("VALKEY_ADDRESS")
	if len(stripeKey) == 0 {
		panic("missing VALKEY_ADDRESS")
	}

	if os.Getenv("STRIPE_WEBHOOK_KEY") == "" {
		panic("missing STRIPE_WEBHOOK_KEY")
	}

	rawOpenSourceLiences := os.Getenv("OPENSOURCE_LICENSE")
	if rawOpenSourceLiences == "" {
		panic("missing OPENSOURCE_LICENSE")
	}

	openSourcLiences := strings.Split(rawOpenSourceLiences, ",")

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

	// TODO: Make this dynamic
	refreshURL := "http://127.0.0.1:8080/api/v1/payments/account/onboard/refresh"
	returnURL := "http://127.0.0.1:3000/profile/payments/success"

	paymentManager := payments.NewStripeManager(stripeKey, refreshURL, returnURL, pg)
	searchManager := search.NewElasticsearchManager(es, 5)

	githubCache, err := auth.NewValKeyGithubCache(valkeyAddress)
	if err != nil {
		log.Error().Err(err).Msg("could not connect to cache")
	}

	authManager := auth.NewAuthManager(clientID, clientSecret, pg, githubCache)

	projectManager := projects.NewProjectManager(pg, &openSourcLiences)
	productManager := products.NewProductManager(pg, paymentManager)
	emailManager := email.NewEmailManager(pg)

	app := rest.NewFiberHttpServer(authManager, projectManager, productManager, searchManager, paymentManager, emailManager)

	// Create a channel to listen for OS signals
	quit := make(chan os.Signal, 1)

	// syscall.SIGTERM is for kubernetes
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	// Run Fiber server in a separate goroutine
	go func() {
		log.Info().Int("port", 8080).Msg("listening on port")

		if err := app.Listen("127.0.0.1:8080"); err != nil {
			log.Error().Err(err).Msg("Error starting server")
		}
	}()

	// Wait for OS signal to gracefully shutdown the server
	<-quit
	log.Info().Msg("Shutting down server...")

	// Set a deadline for shutdown
	ctx, cancelShutdown := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancelShutdown()

	// Shutdown the server gracefully
	if err := app.ShutdownWithContext(ctx); err != nil {
		log.Error().Err(err).Msg("Error shutting down server")
	}
	log.Info().Msg("Server gracefully stopped")
}
