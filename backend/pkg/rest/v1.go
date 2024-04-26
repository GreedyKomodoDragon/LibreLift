package rest

import (
	"encoding/json"
	"librelift/pkg/auth"
	"librelift/pkg/email"
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
	productManager products.ProductsManager, searchManager search.SearchManager, paymentManager payments.PaymentsManager,
	emailManager email.EmailManager) {

	router := app.Group("/api/v1")

	addAuth(router, authManager)
	addProject(router, projectManager, searchManager, paymentManager)
	addProducts(router, productManager, authManager, paymentManager)
	addSearch(router, searchManager)
	addPayments(router, productManager, paymentManager)
	addEmail(router, emailManager)
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

	authRouter.Post("/logout", func(c *fiber.Ctx) error {
		token := c.Cookies("librelift-token")
		if err := authManager.Logout(token); err != nil {
			log.Error().Err(err).Msg("failed to log out")
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		return c.SendStatus(fiber.StatusOK)
	})
}

func addProject(router fiber.Router, projectManager projects.ProjectManager, searchManager search.SearchManager, paymentManager payments.PaymentsManager) {
	projectRouter := router.Group("/project")

	projectRouter.Get("/repos", func(c *fiber.Ctx) error {
		token := c.Cookies("librelift-token")
		pageNum := c.Query("page")
		pageNumInt, err := strconv.ParseInt(pageNum, 10, 64)
		if err != nil {
			pageNumInt = 0
		}

		projects, err := projectManager.GetProjectsMetaData(token, int(pageNumInt))
		if err != nil {
			log.Error().Err(err).Msg("could not get projects")
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

		idRef := c.Locals("userId")
		if idRef == nil {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		userId, ok := idRef.(int64)
		if !ok {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		if _, ok, err := paymentManager.GetPaymentAccount(userId); err != nil || !ok {
			return c.SendStatus(fiber.StatusUnauthorized)
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

func addProducts(router fiber.Router, productManager products.ProductsManager, authManager auth.AuthManager, paymentManager payments.PaymentsManager) {
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

		idRef := c.Locals("userId")
		if idRef == nil {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		userId, ok := idRef.(int64)
		if !ok {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		token := c.Cookies("librelift-token")
		ok, err = authManager.IsRepoOwner(token, id)
		if err != nil {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"message": "must be owner",
			})
		}

		_, ok, err = paymentManager.GetPaymentAccount(id)
		if err != nil && err.Error() != "unable to get row" {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		if ok {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		name, price, err := productManager.GetProductNameAndPrice(pid)
		if err != nil {
			log.Err(err).Int64("productId", pid).Msg("find to get price from product")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "could not find product",
			})
		}

		if err := productManager.AddProductToRepo(name, userId, pid, id, price); err != nil {
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

type ActiveReponse struct {
	Active bool `json:"active"`
}

func addPayments(router fiber.Router, productManager products.ProductsManager, paymentManager payments.PaymentsManager) {
	paymentRouter := router.Group("/payments")

	paymentRouter.Post("/create/session", func(c *fiber.Ctx) error {
		var body CreateSessionRequestBody
		if err := c.BodyParser(&body); err != nil {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		accountId, priceId, fee, err := productManager.GetAccountIdFeeAndPriceId(body.RepoId, body.ProductId, body.IsSubscription)
		if err != nil {
			log.Error().Int64("repoId", body.RepoId).Int64("ProductId", body.ProductId).Bool("subscription", body.IsSubscription).Err(err).Msg("failed execute GetAccountIdFeeAndPriceId")
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		userId, ok := c.Locals("userId").(int64)
		if !ok {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		clientSecret, err := paymentManager.CreateCheckoutSession(priceId, body.IsSubscription, accountId, fee, map[string]string{
			"id":           strconv.FormatInt(userId, 10),
			"subscription": strconv.FormatBool(body.IsSubscription),
			"repoId":       strconv.FormatInt(body.RepoId, 10),
			"productId":    strconv.FormatInt(body.ProductId, 10),
			"accountId":    accountId,
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

		if event.Data == nil {
			log.Error().Msg("missing data in event")
			return c.SendStatus(fiber.StatusBadRequest)
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

		case "charge.refunded":
			var chargeRefunded stripe.Refund
			if err := json.Unmarshal(event.Data.Raw, &chargeRefunded); err != nil {
				log.Error().Str("eventType", "charge.refunded").Err(err).Msg("Invalid Event unmarshalling")
				return c.SendStatus(fiber.StatusInternalServerError)
			}

			if chargeRefunded.PaymentIntent == nil {
				log.Error().Str("eventType", "charge.refunded").Msg("unable to get payment intent id")
				return c.SendStatus(fiber.StatusBadRequest)
			}

			if err := paymentManager.UpdatePaymentToRefunded(chargeRefunded.PaymentIntent.ID); err != nil {
				log.Error().Str("eventType", "charge.refunded").Str("paymentIntent", chargeRefunded.PaymentIntent.ID).Err(err).Msg("failed to set product to refunded")
				return c.SendStatus(fiber.StatusInternalServerError)
			}

		case "account.updated":
			var accountUpdated stripe.Account
			if err := json.Unmarshal(event.Data.Raw, &accountUpdated); err != nil {
				log.Error().Str("eventType", "account.updated").Err(err).Msg("Invalid Event unmarshalling")
				return c.SendStatus(fiber.StatusInternalServerError)
			}

			if accountUpdated.PayoutsEnabled && accountUpdated.ChargesEnabled {
				if err := paymentManager.SetPaymentAccountToActive(accountUpdated.ID); err != nil {
					log.Error().Str("eventType", "account.updated").Err(err)
				}
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

	paymentRouter.Put("/subscription/:id/enable", func(c *fiber.Ctx) error {
		id, err := strconv.ParseInt(c.Params("id"), 10, 64)
		if err != nil {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		payId, err := productManager.GetPaymentId(id)
		if err != nil {
			log.Error().Int64("productID", id).Err(err).Msg("failed to cancel subscription")
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		if err := paymentManager.EnableSubscription(payId); err != nil {
			log.Error().Int64("productID", id).Str("paymentId", payId).Err(err).Msg("failed to re-enable subscription")
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		return c.SendStatus(fiber.StatusOK)
	})

	paymentRouter.Post("/oneoff/:id/refund", func(c *fiber.Ctx) error {
		id, err := strconv.ParseInt(c.Params("id"), 10, 64)
		if err != nil {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		payId, err := paymentManager.GetRefundablePaymentId(id)
		if err != nil {
			log.Error().Int64("productID", id).Err(err).Msg("failed to cancel subscription")
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		if err := paymentManager.RequestRefund(payId); err != nil {
			log.Error().Int64("productID", id).Str("paymentId", payId).Err(err).Msg("failed to re-enable subscription")
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		if err := paymentManager.SetPaymentToPending(id); err != nil {
			log.Error().Int64("productID", id).Err(err).Msg("failed to set payment to pending")
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		return c.SendStatus(fiber.StatusOK)
	})

	paymentRouter.Post("/account/onboard", func(c *fiber.Ctx) error {
		id, ok := c.Locals("userId").(int64)
		if !ok {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		account, ok, err := paymentManager.GetPaymentAccount(id)
		if err != nil && err.Error() != "unable to get row" {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		if ok {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		if err.Error() == "unable to get row" {
			_, err := paymentManager.OnBoardUser(id)
			if err != nil {
				log.Error().Int64("userId", id).Err(err).Msg("failed to create onboarding process")
				return c.SendStatus(fiber.StatusInternalServerError)
			}

			// TODO: Send an email for the url

			return c.SendStatus(fiber.StatusCreated)
		}

		_, err = paymentManager.OnBoardRefresh(account)
		if err != nil {
			log.Error().Int64("userId", id).Err(err).Msg("failed to refresh onboarding process")
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		// TODO: Send an email for the url

		return c.SendStatus(fiber.StatusCreated)
	})

	paymentRouter.Get("/account/active", func(c *fiber.Ctx) error {
		id, ok := c.Locals("userId").(int64)
		if !ok {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		_, ok, err := paymentManager.GetPaymentAccount(id)
		if err != nil && err.Error() != "unable to get row" {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		return c.Status(fiber.StatusOK).JSON(&ActiveReponse{
			Active: ok,
		})
	})
}

type AddEmailToMailingListReq struct {
	Email string `json:"email"`
}

func addEmail(router fiber.Router, emailManager email.EmailManager) {
	emailRouter := router.Group("/email")

	emailRouter.Post("/mailing", func(c *fiber.Ctx) error {
		var req AddEmailToMailingListReq
		if err := c.BodyParser(&req); err != nil {
			log.Error().Err(err).Msg("failed marshall request")
			return c.SendStatus(fiber.StatusBadRequest)
		}

		if err := emailManager.AddEmailToMailingList(req.Email); err != nil {
			log.Error().Err(err).Msg("failed to add to mailing list")
			//TODO: check if it is a bad email error
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		return c.SendStatus(fiber.StatusAccepted)
	})
}
