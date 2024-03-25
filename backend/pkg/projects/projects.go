package projects

import (
	"context"

	"github.com/google/go-github/v60/github"
	"golang.org/x/oauth2"
)

type ProjectManager interface {
	GetProjectsMetaData(string) ([]ProjectMetaData, error)
}

type projectManager struct {
}

type ProjectMetaData struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	Added       bool    `json:"added"`
}

func NewProjectManager() ProjectManager {
	return &projectManager{}
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
			Name:        repo.FullName,
			Description: repo.Description,
			Added:       false,
		}
	}

	return projects, nil
}
