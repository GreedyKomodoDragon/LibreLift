package rest

import (
	"encoding/json"
	"librelift/pkg/auth"
	"librelift/pkg/payments"
	"librelift/pkg/products"
	"librelift/pkg/projects"
	"librelift/pkg/search"
	"os"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/rs/zerolog/log"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/webhook"
)

func addV1(app *fiber.App, authManager auth.AuthManager, projectManager projects.ProjectManager,
	productManager products.ProductsManager, searchManager search.SearchManager, paymentManager payments.PaymentsManager) {

	router := app.Group("/api/v1")

	addAuth(router, authManager)
	addProject(router, projectManager, searchManager)
	addProducts(router, productManager, authManager)
	addSearch(router, searchManager)
	addPayments(router, productManager, paymentManager)
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

		_, ok, err := authManager.IsValidAccessToken(bearerToken)
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

func addProject(router fiber.Router, projectManager projects.ProjectManager, searchManager search.SearchManager) {
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

	projectRouter.Get("/repos/:id", func(c *fiber.Ctx) error {
		id, err := strconv.ParseInt(c.Params("id"), 10, 64)
		if err != nil {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		token := c.Cookies("librelift-token")

		project, err := projectManager.GetProjectMetaData(id, token)
		if err != nil {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		return c.Status(fiber.StatusOK).JSON(*project)
	})

	projectRouter.Post("/repos/:id", func(c *fiber.Ctx) error {
		token := c.Cookies("librelift-token")
		id, err := strconv.ParseInt(c.Params("id"), 10, 64)
		if err != nil {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		repo, err := projectManager.GetProjectMetaData(id, token)
		if err != nil {
			// TODO: Return code based on error
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "failed to get project information",
			})
		}

		if err := projectManager.AddingRepo(id, token); err != nil {
			// TODO: Return code based on error
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "failed to add repo to librelift",
			})
		}

		if _, err := searchManager.CreateSearchDocument(id, *repo.Name, *repo.Description); err != nil {
			// TODO: Move to another service that can handle re-tries
			log.Error().Int64("repoID", id).Msg("failed to create search index")
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "failed to create search index",
			})
		}

		return c.SendStatus(fiber.StatusAccepted)
	})
}

func addProducts(router fiber.Router, productManager products.ProductsManager, authManager auth.AuthManager) {
	projectRouter := router.Group("/products")

	projectRouter.Get("/", func(c *fiber.Ctx) error {
		products, err := productManager.GetAllProducts()
		if err != nil {
			log.Error().Err(err).Msg("failed to get all products")
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"products": products,
		})
	})

	projectRouter.Get("/repo/:id", func(c *fiber.Ctx) error {
		id, err := strconv.ParseInt(c.Params("id"), 10, 64)
		if err != nil {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		products, err := productManager.GetRepoProducts(id)
		if err != nil {
			log.Error().Int64("repoId", id).Err(err).Msg("failed to get all products")
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"products": products,
		})
	})

	projectRouter.Get("/repo/:id/added", func(c *fiber.Ctx) error {
		id, err := strconv.ParseInt(c.Params("id"), 10, 64)
		if err != nil {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		products, err := productManager.GetReposOptions(id)
		if err != nil {
			log.Error().Err(err).Msg("failed to get all products")
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"products": products,
		})
	})

	projectRouter.Post("/repo/:id/:pid", func(c *fiber.Ctx) error {
		pid, err := strconv.ParseInt(c.Params("pid"), 10, 64)
		if err != nil {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		id, err := strconv.ParseInt(c.Params("id"), 10, 64)
		if err != nil {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		token := c.Cookies("librelift-token")
		ok, err := authManager.IsRepoOwner(token, id)
		if err != nil {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"message": "must be owner",
			})
		}

		name, price, err := productManager.GetProductNameAndPrice(pid)
		if err != nil {
			log.Err(err).Int64("productId", pid).Msg("find to get price from product")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "could not find product",
			})
		}

		if err := productManager.AddProductToRepo(name, pid, id, price); err != nil {
			log.Error().Int64("repoId", id).Int64("productId", pid).Err(err).Msg("failed to add product")
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		return c.SendStatus(fiber.StatusOK)
	})

	projectRouter.Get("/purchases", func(c *fiber.Ctx) error {
		idRef := c.Locals("userId")
		if idRef == nil {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		userId, ok := idRef.(int64)
		if !ok {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		products, err := productManager.GetUserPurchases(userId)
		if err != nil {
			log.Error().Err(err).Msg("failed to get all products")
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"products": products,
		})
	})
}

func addSearch(router fiber.Router, searchManager search.SearchManager) {
	searchRouter := router.Group("/search")

	searchRouter.Get("/projects", func(c *fiber.Ctx) error {
		query := c.Query("query")
		if query == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "missing query parameter: 'query'",
			})
		}

		documents, err := searchManager.Search(query)
		if err != nil {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"results": documents,
		})
	})
}

type CreateSessionRequestBody struct {
	RepoId         int64 `json:"repoId"`
	ProductId      int64 `json:"productId"`
	IsSubscription bool  `json:"isSubscription"`
}

func addPayments(router fiber.Router, productManager products.ProductsManager, paymentManager payments.PaymentsManager) {
	paymentRouter := router.Group("/payments")

	paymentRouter.Post("/create/session", func(c *fiber.Ctx) error {
		var body CreateSessionRequestBody
		if err := c.BodyParser(&body); err != nil {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		priceId, err := productManager.GetPriceId(body.RepoId, body.ProductId, body.IsSubscription)
		if err != nil {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		userId, ok := c.Locals("userId").(int64)
		if !ok {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		clientSecret, err := paymentManager.CreateCheckoutSession(priceId, body.IsSubscription, map[string]string{
			"id":           strconv.FormatInt(userId, 10),
			"subscription": strconv.FormatBool(body.IsSubscription),
			"repoId":       strconv.FormatInt(body.RepoId, 10),
			"productId":    strconv.FormatInt(body.ProductId, 10),
		})

		if err != nil {
			log.Error().Str("priceId", priceId).Err(err).Msg("failed to create checkout session")
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"clientSecret": clientSecret,
		})
	})

	paymentRouter.Get("/session/status", func(c *fiber.Ctx) error {
		sessionId := c.Query("session_id")

		status, email, err := paymentManager.GetSessionStatus(sessionId)
		if err != nil {
			log.Error().Str("sessionId", sessionId).Err(err).Msg("failed to get payment session")
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status": status,
			"email":  email,
		})
	})

	paymentRouter.Post("/webhook", func(c *fiber.Ctx) error {
		event := stripe.Event{}
		if err := c.BodyParser(&event); err != nil {
			log.Error().Err(err).Msg("body is invalid")
			return c.SendStatus(fiber.StatusBadRequest)
		}

		endpointSecret := os.Getenv("STRIPE_WEBHOOK_KEY")

		event, err := webhook.ConstructEvent(c.Body(), c.GetReqHeaders()["Stripe-Signature"][0], endpointSecret)
		if err != nil {
			log.Error().Err(err).Msg("Invalid Event Sent to webhook")
			return c.SendStatus(fiber.StatusForbidden)
		}

		switch event.Type {
		case "checkout.session.completed":
			var checkoutSession stripe.CheckoutSession
			if err := json.Unmarshal(event.Data.Raw, &checkoutSession); err != nil {
				log.Error().Str("eventType", "checkout.session.completed").Err(err).Msg("Invalid Event unmarshalling")
				return c.SendStatus(fiber.StatusInternalServerError)
			}

			prodId := ""
			if checkoutSession.Subscription != nil {
				prodId = checkoutSession.Subscription.ID
			} else {
				prodId = checkoutSession.PaymentIntent.ID
			}

			if err := productManager.AddPurchase(checkoutSession.Metadata, event.Created, prodId); err != nil {
				log.Error().Str("eventType", "checkout.session.completed").Err(err).Msg("failed to add product update")
				return c.SendStatus(fiber.StatusInternalServerError)
			}

		case "customer.subscription.deleted":
			var subscriptionDeleted stripe.Subscription
			if err := json.Unmarshal(event.Data.Raw, &subscriptionDeleted); err != nil {
				log.Error().Str("eventType", "customer.subscription.deleted").Err(err).Msg("Invalid Event unmarshalling")
				return c.SendStatus(fiber.StatusInternalServerError)
			}

			if err := paymentManager.CancelSubscription(subscriptionDeleted.ID); err != nil {
				log.Error().Str("eventType", "checkout.session.completed").Err(err).Msg("failed to add product update")
				return c.SendStatus(fiber.StatusInternalServerError)
			}

		default:
			log.Error().Str("eventType", string(event.Type)).Err(err).Msg("unhandled event type")
		}

		return c.SendStatus(fiber.StatusOK)
	})

	paymentRouter.Delete("/subscription/:id", func(c *fiber.Ctx) error {
		id, err := strconv.ParseInt(c.Params("id"), 10, 64)
		if err != nil {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		payId, err := productManager.GetPaymentId(id)
		if err != nil {
			log.Error().Int64("productID", id).Err(err).Msg("failed to cancel subscription")
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		if err := paymentManager.UpdateSubScriptionToPending(payId); err != nil {
			log.Error().Int64("productID", id).Str("paymentId", payId).Err(err).Msg("failed to cancel subscription")
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		return c.SendStatus(fiber.StatusOK)
	})
}
