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
	CreateProductForRepo(repoid int64, productId int64, productPrice int64) (string, error)
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

func (s *stripeManager) CreateProductForRepo(repoid int64, productId int64, productPrice int64) (string, error) {
	params := &stripe.ProductParams{Name: stripe.String(fmt.Sprintf("%v-%v", repoid, productId))}
	result, err := product.New(params)
	if err != nil {
		return "", err
	}

	priceParams := &stripe.PriceParams{
		Product:    stripe.String(result.ID),
		UnitAmount: stripe.Int64(productPrice),
		Currency:   stripe.String(string(stripe.CurrencyUSD)),
	}

	priceResult, err := price.New(priceParams)
	if err != nil {
		return "", err
	}

	return priceResult.ID, nil
}
