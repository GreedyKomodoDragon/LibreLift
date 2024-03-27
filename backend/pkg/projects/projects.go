package projects

import (
	"context"
	"fmt"
	"librelift/pkg/db"

	"github.com/google/go-github/v60/github"
	"golang.org/x/oauth2"
)

type ProjectManager interface {
	GetProjectsMetaData(string) ([]ProjectMetaData, error)
	AddingRepo(id int64, token string) error
}

type projectManager struct {
	repoDB db.DBManager
}

type ProjectMetaData struct {
	ID          *int64  `json:"id"`
	Name        *string `json:"name"`
	Description *string `json:"description"`
	Added       bool    `json:"added"`
}

func NewProjectManager(repoDB db.DBManager) ProjectManager {
	return &projectManager{
		repoDB: repoDB,
	}
}

func (p *projectManager) GetProjectsMetaData(token string) ([]ProjectMetaData, error) {
	httpClient := oauth2.NewClient(context.Background(), oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token},
	))

	client := github.NewClient(httpClient)
	user, _, err := client.Users.Get(context.Background(), "")
	if err != nil {
		return nil, err
	}

	opt := &github.RepositoryListByUserOptions{Type: "public"}
	repos, _, err := client.Repositories.ListByUser(context.Background(), user.GetLogin(), opt)
	if err != nil {
		return nil, err
	}

	projects := make([]ProjectMetaData, len(repos))
	for i, repo := range repos {

		projects[i] = ProjectMetaData{
			ID:          repo.ID,
			Name:        repo.FullName,
			Description: repo.Description,
			Added:       false,
		}
	}

	return projects, nil
}

func (p *projectManager) AddingRepo(id int64, token string) error {
	httpClient := oauth2.NewClient(context.Background(), oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token},
	))

	client := github.NewClient(httpClient)

	repo, _, err := client.Repositories.GetByID(context.Background(), id)
	if err != nil {
		return fmt.Errorf("Error fetching repository: %v", id)
	}

	user, _, err := client.Users.Get(context.Background(), "")
	if err != nil {
		return err
	}

	if *user.ID != *repo.Owner.ID {
		return fmt.Errorf("User does not own repository with id: '%v'", id)
	}

	return p.repoDB.AddRepo(*repo.Owner.ID, *repo.ID)
}
