package rest

import (
	"librelift/pkg/auth"
	"librelift/pkg/products"
	"librelift/pkg/projects"
	"librelift/pkg/search"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func NewFiberHttpServer(authManager auth.AuthManager, projectManager projects.ProjectManager, productManager products.ProductsManager, searchManager search.SearchManager) *fiber.App {
	app := fiber.New(fiber.Config{
		DisableStartupMessage: true,
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://127.0.0.1:3000",
		AllowCredentials: true,
		AllowMethods:     "GET,POST,HEAD,PUT,DELETE,PATCH",
	}))

	app.Use(func(c *fiber.Ctx) error {
		if strings.HasSuffix(c.Path(), "/login") {
			return c.Next()
		}

		token := c.Cookies("librelift-token")
		if len(token) == 0 {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "unauthenticated, missing token",
			})
		}

		ok, err := authManager.IsValidAccessToken(token)
		if err != nil {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "unauthenticated, missing token",
			})
		}

		c.Locals("librelift-token", token)

		return c.Next()
	})

	addV1(app, authManager, projectManager, productManager, searchManager)

	return app
}
