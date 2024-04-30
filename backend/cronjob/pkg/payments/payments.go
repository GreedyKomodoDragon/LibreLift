package payments

import (
	"fmt"

	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/subscription"
)

type PaymentManager interface {
	MarkSubscriptionForDeletion(subId *string) error
}

type stripeManager struct {
}

func NewPaymentManager(key *string) (PaymentManager, error) {
	if key == nil {
		return nil, fmt.Errorf("passed in argument is nil")
	}

	stripe.Key = *key
	return &stripeManager{}, nil
}

func (s *stripeManager) MarkSubscriptionForDeletion(subId *string) error {
	if subId == nil {
		return fmt.Errorf("passed in argument is nil")
	}

	params := &stripe.SubscriptionParams{CancelAtPeriodEnd: stripe.Bool(true)}
	if _, err := subscription.Update(*subId, params); err != nil {
		return err
	}

	return nil
}
