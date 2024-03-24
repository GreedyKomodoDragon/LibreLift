package rest

import (
	"librelift/pkg/auth"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func addV1(app *fiber.App, authManager auth.AuthManager) {

	router := app.Group("/api/v1")

	addAuth(router, authManager)
}

type LoginReq struct {
	Code string `json:"code"`
}

func addAuth(router fiber.Router, authManager auth.AuthManager) {
	authRouter := router.Group("/auth")

	authRouter.Get("/login", func(c *fiber.Ctx) error {
		// Get the Authorization header from the request
		authHeader := c.Get("Authorization")

		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		bearerToken := authHeader[len("Bearer "):]

		ok, err := authManager.IsValidAccessToken(bearerToken)
		if err != nil {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "unauthenticated, missing token",
			})
		}

		return c.SendStatus(fiber.StatusOK)
	})

	authRouter.Post("/login", func(c *fiber.Ctx) error {
		var req LoginReq
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": err.Error(),
			})
		}

		// Exchange the authorization code for an access token
		token, err := authManager.GetAccessToken(req.Code)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": err.Error(),
			})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"token": token,
		})
	})

	authRouter.Get("/avatar", func(c *fiber.Ctx) error {
		token := c.Cookies("librelift-token")
		if len(token) == 0 {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "unauthenticated, missing token",
			})
		}

		url, err := authManager.GetImageURL(token)
		if err != nil {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		if len(url) == 0 {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"avatar": url,
		})
	})
}
