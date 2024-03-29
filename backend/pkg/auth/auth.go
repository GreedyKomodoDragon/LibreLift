package auth

import (
	"context"
	"net/http"

	"github.com/google/go-github/v60/github"
	"golang.org/x/oauth2"
)

type AuthManager interface {
	GetAccessToken(code string) (string, error)
	IsValidAccessToken(token string) (bool, error)
	GetImageURL(token string) (string, error)
	IsRepoOwner(token string, repoId int64) (bool, error)
}

type authManager struct {
	config   oauth2.Config
	clientID string
}

func NewAuthManager(clientID, clientSecret string) AuthManager {
	config := oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Scopes:       []string{"repo"},
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://github.com/login/oauth/authorize",
			TokenURL: "https://github.com/login/oauth/access_token",
		},
	}

	return &authManager{
		config:   config,
		clientID: clientID,
	}
}

func (a *authManager) GetAccessToken(code string) (string, error) {
	token, err := a.config.Exchange(context.Background(), code)
	if err != nil {
		return "", err
	}

	return token.AccessToken, nil
}

func (a *authManager) IsValidAccessToken(token string) (bool, error) {
	httpClient := oauth2.NewClient(context.Background(), oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token},
	))

	client := github.NewClient(httpClient)
	_, resp, err := client.Users.Get(context.Background(), "")
	if err != nil {
		if resp.StatusCode == http.StatusUnauthorized {
			return false, nil
		}

		return false, err
	}

	return true, nil
}

func (a *authManager) GetImageURL(token string) (string, error) {
	httpClient := oauth2.NewClient(context.Background(), oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token},
	))

	client := github.NewClient(httpClient)
	user, resp, err := client.Users.Get(context.Background(), "")
	if err != nil {
		if resp.StatusCode == http.StatusUnauthorized {
			return "", nil
		}

		return "", err
	}

	return *user.AvatarURL, nil
}

func (a *authManager) IsRepoOwner(token string, repoId int64) (bool, error) {
	httpClient := oauth2.NewClient(context.Background(), oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token},
	))

	client := github.NewClient(httpClient)

	repo, _, err := client.Repositories.GetByID(context.Background(), repoId)
	if err != nil {
		return false, err
	}

	user, _, err := client.Users.Get(context.Background(), "")
	if err != nil {
		return false, err
	}

	return *repo.Owner.ID == *user.ID, nil
}
