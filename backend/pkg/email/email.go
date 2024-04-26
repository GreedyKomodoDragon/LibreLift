package email

import (
	"librelift/pkg/db"
	"net/mail"
)

type EmailManager interface {
	AddEmailToMailingList(email string) error
}

type emailManager struct {
	dbManager db.DBManager
}

func NewEmailManager(dbManager db.DBManager) EmailManager {
	return &emailManager{
		dbManager: dbManager,
	}
}

func (e *emailManager) AddEmailToMailingList(email string) error {
	if _, err := mail.ParseAddress(email); err != nil {
		return err
	}

	return e.dbManager.AddToMailingList(email)
}
