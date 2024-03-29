package rest

import (
	"librelift/pkg/auth"
	"librelift/pkg/projects"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func addV1(app *fiber.App, authManager auth.AuthManager, projectManager projects.ProjectManager) {

	router := app.Group("/api/v1")

	addAuth(router, authManager)
	addProject(router, projectManager)
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

func addProject(router fiber.Router, projectManager projects.ProjectManager) {
	projectRouter := router.Group("/project")

	projectRouter.Get("/repos", func(c *fiber.Ctx) error {
		token := c.Cookies("librelift-token")
		projects, err := projectManager.GetProjectsMetaData(token)
		if err != nil {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"projects": projects,
		})
	})

	projectRouter.Post("/repos/:id", func(c *fiber.Ctx) error {
		token := c.Cookies("librelift-token")
		id, err := strconv.ParseInt(c.Params("id"), 10, 64)
		if err != nil {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		if err := projectManager.AddingRepo(id, token); err != nil {
			// TODO: Return code based on error
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": err.Error(),
			})
		}

		return c.SendStatus(fiber.StatusAccepted)
	})
}
