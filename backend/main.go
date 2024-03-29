package main

import (
	"librelift/pkg/auth"
	"librelift/pkg/db"
	"librelift/pkg/products"
	"librelift/pkg/projects"
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

	pg, err := db.NewDBManager("postgres://myuser:mypassword@localhost:5432/mydatabase")
	if err != nil {
		panic(err)
	}
	defer pg.Close()

	projectManager := projects.NewProjectManager(pg)
	productManager := products.NewProductManager(pg)
	app := rest.NewFiberHttpServer(authManager, projectManager, productManager)

	log.Info().Int("port", 8080).Msg("listening on port")
	app.Listen("127.0.0.1:8080")
}
