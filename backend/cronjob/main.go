package main

import (
	"librelift-revoked/pkg/db"
	"librelift-revoked/pkg/payments"
	"librelift-revoked/pkg/search"
	"os"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/joho/godotenv"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	zerolog.SetGlobalLevel(zerolog.InfoLevel)

	godotenv.Load()

	stripeKey := os.Getenv("STRIPE_KEY")
	if len(stripeKey) == 0 {
		panic("missing STRIPE_KEY")
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

	es, err := elasticsearch.NewClient(cfg)
	if err != nil {
		log.Fatal().Err(err).Msg("Error creating elastic client")
	}

	searchManager := search.NewSearchManager(es)

	pg, err := db.NewDBManager("postgres://myuser:mypassword@localhost:5432/mydatabase")
	if err != nil {
		panic(err)
	}

	paymentManager, err := payments.NewPaymentManager(&stripeKey)
	if err != nil {
		panic(err)
	}

	userSubs, err := pg.MarkAndGetExpiredSubscriptions()
	if err != nil {
		panic(err)
	}

	fullyDeletedUsers := []int64{}
	for _, user := range userSubs {
		deletedFully := true
		// TODO: make this use goroutines as very async in nature
		for _, s := range user.Subs {
			if err := paymentManager.MarkSubscriptionForDeletion(s); err != nil {
				log.Error().Err(err).Str("subId", *s).Msg("failed to tell stripe to cancel subscription")
				deletedFully = false
			}
		}

		if deletedFully {
			fullyDeletedUsers = append(fullyDeletedUsers, user.User)
		} else {
			log.Error().Err(err).Int64("user", user.User).Msg("user was not able to be fully deleted")
		}
	}

	repoIds, err := pg.DeleteCompletedUsersAndGetRepos(fullyDeletedUsers)
	if err != nil {
		log.Error().Err(err).Msg("unable to delete all completed users")
	}

	if err := searchManager.DropIndexes(repoIds); err != nil {
		log.Error().Err(err).Msg("unable to delete all completed users")
	}

}
