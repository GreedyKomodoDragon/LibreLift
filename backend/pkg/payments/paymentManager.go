package payments

import (
	"fmt"

	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
	"github.com/stripe/stripe-go/v76/price"
	"github.com/stripe/stripe-go/v76/product"
)

type PaymentsManager interface {
	CreateCheckoutSession(priceId string) (string, error)
	GetSessionStatus(sessionId string) (string, string, error)
	CreateProductForRepo(repoid int64, productName string, productPrice int64) (string, string, error)
}

type stripeManager struct {
}

func NewStripeManager(key string) PaymentsManager {
	stripe.Key = key
	return &stripeManager{}
}

func (s *stripeManager) CreateCheckoutSession(priceId string) (string, error) {
	// TODO: Make this dynamic/env variable
	domain := "http://127.0.0.1:3000"

	params := &stripe.CheckoutSessionParams{
		UIMode:    stripe.String("embedded"),
		ReturnURL: stripe.String(domain + "/return?session_id={CHECKOUT_SESSION_ID}"),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(priceId),
				Quantity: stripe.Int64(1),
			},
		},
		Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
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
	params := &stripe.ProductParams{Name: stripe.String(fmt.Sprintf("%v - %s", repoid, productName))}
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
