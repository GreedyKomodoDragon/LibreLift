package payments

import (
	"fmt"
	"librelift/pkg/db"
	"strings"

	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
	"github.com/stripe/stripe-go/v76/price"
	"github.com/stripe/stripe-go/v76/product"
	"github.com/stripe/stripe-go/v76/subscription"
)

type PaymentsManager interface {
	CreateCheckoutSession(priceId string, subcription bool, metadata map[string]string) (string, error)
	GetSessionStatus(sessionId string) (status string, email string, err error)
	CreateProductForRepo(repoid int64, productName string, productPrice int64) (string, string, error)
	CancelSubscription(payId string) error
	UpdateSubScriptionToPending(id string) error
	EnableSubscription(id string) error
}

type stripeManager struct {
	dbManager db.DBManager
}

func NewStripeManager(key string, db db.DBManager) PaymentsManager {
	stripe.Key = key
	return &stripeManager{
		dbManager: db,
	}
}

func (s *stripeManager) CreateCheckoutSession(priceId string, subcription bool, metadata map[string]string) (string, error) {
	// TODO: Make this dynamic/env variable
	domain := "http://127.0.0.1:3000"

	mode := stripe.String(string(stripe.CheckoutSessionModePayment))
	if subcription {
		mode = stripe.String(string(stripe.CheckoutSessionModeSubscription))
	}

	params := &stripe.CheckoutSessionParams{
		UIMode:    stripe.String("embedded"),
		ReturnURL: stripe.String(domain + "/return?session_id={CHECKOUT_SESSION_ID}"),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(priceId),
				Quantity: stripe.Int64(1),
			},
		},
		Mode:     mode,
		Metadata: metadata,
	}

	sess, err := session.New(params)
	if err != nil {
		return "", err
	}

	return sess.ClientSecret, nil
}

func (s *stripeManager) GetSessionStatus(sessionId string) (string, string, error) {
	sess, err := session.Get(sessionId, nil)
	if err != nil {
		return "", "", err
	}

	return string(sess.Status), string(sess.CustomerDetails.Email), nil
}

func (s *stripeManager) CreateProductForRepo(repoid int64, productName string, productPrice int64) (string, string, error) {
	params := &stripe.ProductParams{
		Name: stripe.String(fmt.Sprintf("%v - %s", repoid, productName)),
	}
	result, err := product.New(params)
	if err != nil {
		return "", "", err
	}

	oneOff, err := s.createProductPrice(&result.ID, &productPrice)
	if err != nil {
		return "", "", err
	}

	recurring, err := s.createMonthlyProductPrice(&result.ID, &productPrice)
	if err != nil {
		return "", "", err
	}

	return oneOff, recurring, nil
}

func (s *stripeManager) createProductPrice(productId *string, productPrice *int64) (string, error) {
	priceParams := &stripe.PriceParams{
		Product:    productId,
		UnitAmount: productPrice,
		Currency:   stripe.String(string(stripe.CurrencyUSD)),
	}

	priceResult, err := price.New(priceParams)
	if err != nil {
		return "", err
	}

	return priceResult.ID, nil
}

func (s *stripeManager) createMonthlyProductPrice(productId *string, productPrice *int64) (string, error) {
	priceParams := &stripe.PriceParams{
		Product:    productId,
		UnitAmount: productPrice,
		Currency:   stripe.String(string(stripe.CurrencyUSD)),
		Recurring: &stripe.PriceRecurringParams{
			Interval: stripe.String(string(stripe.PriceRecurringIntervalMonth)),
		},
	}

	priceResult, err := price.New(priceParams)
	if err != nil {
		return "", err
	}

	return priceResult.ID, nil
}

func (s *stripeManager) CancelSubscription(payId string) error {
	if !strings.HasPrefix(payId, "sub_") {
		return fmt.Errorf("purchase is not a subscription")
	}

	if err := s.dbManager.EndSubscription(payId); err != nil {
		return err
	}

	return nil
}

func (s *stripeManager) UpdateSubScriptionToPending(payId string) error {
	if !strings.HasPrefix(payId, "sub_") {
		return fmt.Errorf("purchase is not a subscription")
	}

	params := &stripe.SubscriptionParams{CancelAtPeriodEnd: stripe.Bool(true)}
	if _, err := subscription.Update(payId, params); err != nil {
		return err
	}

	return s.dbManager.UpdateSubScriptionToPending(payId)
}

func (s *stripeManager) EnableSubscription(payId string) error {
	if !strings.HasPrefix(payId, "sub_") {
		return fmt.Errorf("purchase is not a subscription")
	}

	params := &stripe.SubscriptionParams{CancelAtPeriodEnd: stripe.Bool(false)}
	if _, err := subscription.Update(payId, params); err != nil {
		return err
	}

	return s.dbManager.EnableSubscription(payId)
}
