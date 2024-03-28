package projects

import (
	"context"
	"fmt"
	"librelift/pkg/db"
	"sort"

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

	// TODO: Efficency improvements
	// - Fetch Both all and Current at the same time
	// - Might be worth storing all repos in the database to avoid doing two fetches -> How to maintain its up to date?
	// - Cache results from Github to avoid longer waits -> decrease github throttling librelift
	// - Could get client to fetch their own repos and then match the ids up -> client heavy though
	opt := &github.RepositoryListByUserOptions{Type: "public"}
	repos, _, err := client.Repositories.ListByUser(context.Background(), user.GetLogin(), opt)
	if err != nil {
		return nil, err
	}

	// Exit early as no repos
	if len(repos) == 0 {
		return []ProjectMetaData{}, nil
	}

	userRepos, err := p.repoDB.GetUsersRepos(*user.ID)
	if err != nil {
		return nil, err
	}
	sort.Slice(repos, func(i, j int) bool {
		return *repos[i].ID < *repos[j].ID
	})

	projects := make([]ProjectMetaData, len(repos))

	// Initialize pointers
	repoIndex, userRepoIndex := 0, 0

	for i := 0; i < len(repos); i++ {
		repo := repos[repoIndex]
		userRepo := userRepos[userRepoIndex]

		// Compare repo ID with userRepo ID
		added := false
		if *repo.ID == userRepo {
			added = true
			// Move userRepoIndex to the next element
			userRepoIndex++
		}

		projects[i] = ProjectMetaData{
			ID:          repo.ID,
			Name:        repo.FullName,
			Description: repo.Description,
			Added:       added,
		}

		// Move repoIndex to the next element
		repoIndex++

		// Check if we reached the end of userRepos
		if userRepoIndex >= len(userRepos) {
			break
		}
	}

	// If there are remaining repos, mark them as not added
	for i := repoIndex; i < len(repos); i++ {
		projects[i] = ProjectMetaData{
			ID:          repos[i].ID,
			Name:        repos[i].FullName,
			Description: repos[i].Description,
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
