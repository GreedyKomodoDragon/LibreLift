package main

import (
	"librelift/pkg/auth"
	"librelift/pkg/rest"
	"os"

	"github.com/joho/godotenv"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	zerolog.SetGlobalLevel(zerolog.InfoLevel)

	godotenv.Load()

	clientID := os.Getenv("GITHUB_CLIENT_ID")
	if len(clientID) == 0 {
		panic("missing GITHUB_CLIENT_ID")
	}

	clientSecret := os.Getenv("GITHUB_CLIENT_SECRET")
	if len(clientSecret) == 0 {
		panic("missing GITHUB_CLIENT_SECRET")
	}

	authManager := auth.NewAuthManager(clientID, clientSecret)
	app := rest.NewFiberHttpServer(authManager)

	log.Info().Int("port", 8080).Msg("listening on port")
	app.Listen("127.0.0.1:8080")
}
