package auth

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"librelift/pkg/db"
	"net/http"

	"github.com/google/go-github/v60/github"
	"golang.org/x/oauth2"
)

type AuthManager interface {
	AddUserAccount(token string) error
	MarkAccountAsRevoked(token string) error
	GetAccessToken(code string) (string, error)
	IsValidAccessToken(token string) (int64, bool, error)
	GetImageURL(token string) (string, error)
	IsRepoOwner(token string, repoId int64) (bool, error)
	Logout(token string) error
}

type authManager struct {
	config    oauth2.Config
	clientID  string
	dbManager db.DBManager
}

func NewAuthManager(clientID, clientSecret string, dbManager db.DBManager) AuthManager {
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
		config:    config,
		clientID:  clientID,
		dbManager: dbManager,
	}
}

func (a *authManager) GetAccessToken(code string) (string, error) {
	token, err := a.config.Exchange(context.Background(), code)
	if err != nil {
		return "", err
	}

	return token.AccessToken, nil
}

func (a *authManager) IsValidAccessToken(token string) (int64, bool, error) {
	httpClient := oauth2.NewClient(context.Background(), oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token},
	))

	client := github.NewClient(httpClient)
	user, resp, err := client.Users.Get(context.Background(), "")
	if err != nil {
		if resp == nil {
			return 0, false, err
		}

		if resp.StatusCode == http.StatusUnauthorized {
			return 0, false, nil
		}

		return 0, false, err
	}

	return *user.ID, true, nil
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

func (a *authManager) Logout(token string) error {
	// Set API endpoint
	url := fmt.Sprintf("https://api.github.com/applications/%s/token", a.clientID)

	// Create HTTP client
	client := &http.Client{}

	// Create request
	req, err := http.NewRequest("DELETE", url, bytes.NewBuffer([]byte(fmt.Sprintf(`{"access_token":"%s"}`, token))))
	if err != nil {
		return err
	}

	// Concatenate username and password with a colon
	credentials := a.clientID + ":" + a.config.ClientSecret

	// Encode credentials to base64
	encodedCredentials := base64.StdEncoding.EncodeToString([]byte(credentials))

	// Set request headers
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("Authorization", "Basic "+encodedCredentials)
	req.Header.Set("X-GitHub-Api-Version", "2022-11-28")

	// Perform request
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// Print response status and body
	if resp.Status != "204 No Content" {
		buf := new(bytes.Buffer)
		buf.ReadFrom(resp.Body)
		return fmt.Errorf("failed to logout: %s", buf.String())
	}

	return nil
}

func (a *authManager) AddUserAccount(token string) error {
	httpClient := oauth2.NewClient(context.Background(), oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token},
	))

	client := github.NewClient(httpClient)

	user, _, err := client.Users.Get(context.Background(), "")
	if err != nil {
		return err
	}

	if user.Login == nil {
		return fmt.Errorf("missing username from github api")
	}

	return a.dbManager.AddUserAccount(*user.ID)
}

func (a *authManager) MarkAccountAsRevoked(token string) error {
	httpClient := oauth2.NewClient(context.Background(), oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token},
	))

	client := github.NewClient(httpClient)

	user, _, err := client.Users.Get(context.Background(), "")
	if err != nil {
		return err
	}

	if user.Login == nil {
		return fmt.Errorf("missing username from github api")
	}

	return a.dbManager.MarkAccountAsRevoked(*user.ID)
}
