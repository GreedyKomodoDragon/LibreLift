package cronjob

import (
	"librelift-revoked/pkg/db"
	"librelift-revoked/pkg/payments"
	"os"

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

	if err := pg.DeleteCompletedUsers(fullyDeletedUsers); err != nil {
		log.Error().Err(err).Msg("unable to delete all completed users")
	}
}
