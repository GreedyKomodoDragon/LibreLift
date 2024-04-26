package projects

import (
	"context"
	"fmt"
	"librelift/pkg/db"

	"github.com/google/go-github/v60/github"
	"golang.org/x/oauth2"
)

type ProjectManager interface {
	GetProjectsMetaData(string, int) ([]ProjectMetaData, error)
	GetProjectMetaDataUsingSearch(string, string, int) ([]ProjectMetaData, error)
	AddingRepo(id int64, token string) error
	GetProjectMetaData(id int64, token string) (*BasicRepoMetaData, error)
	IsOpenSource(license string) bool
}

type projectManager struct {
	repoDB            db.DBManager
	openSourceLiences *[]string
}

type BasicRepoMetaData struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
}

type ProjectMetaData struct {
	ID           *int64  `json:"id"`
	Name         *string `json:"name"`
	Description  *string `json:"description"`
	Added        bool    `json:"added"`
	Stars        *int    `json:"stars"`
	License      *string `json:"license"`
	IsOpenSource bool    `json:"isOpenSource"`
}

func NewProjectManager(repoDB db.DBManager, openSourceLiences *[]string) ProjectManager {
	return &projectManager{
		repoDB:            repoDB,
		openSourceLiences: openSourceLiences,
	}
}

func (p *projectManager) GetProjectsMetaData(token string, page int) ([]ProjectMetaData, error) {
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
	opt := &github.RepositoryListByUserOptions{
		Type: "public",
		ListOptions: github.ListOptions{
			Page:    page,
			PerPage: 10,
		}}

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

	projects := make([]ProjectMetaData, len(repos))

	// Initialize pointers
	repoIndex, userRepoIndex := 0, 0

	for userRepoIndex < len(userRepos) {
		repo := repos[repoIndex]

		for userRepoIndex < len(userRepos) && *repo.ID > userRepos[userRepoIndex] {
			userRepoIndex++
		}

		if userRepoIndex >= len(userRepos) {
			break
		}

		// Compare repo ID with userRepo ID
		added := *repo.ID == userRepos[userRepoIndex]
		if added {
			// Move userRepoIndex to the next element
			userRepoIndex++
		}

		license := ""
		openSource := false
		if repo.License != nil && repo.License.Name != nil {
			license = *repo.License.Name
			openSource = p.IsOpenSource(*repo.License.Name)
		}

		projects[repoIndex] = ProjectMetaData{
			ID:           repo.ID,
			Name:         repo.FullName,
			Description:  repo.Description,
			Added:        added,
			Stars:        repo.StargazersCount,
			License:      &license,
			IsOpenSource: openSource,
		}

		// Move repoIndex to the next element
		repoIndex++

		if repoIndex >= len(repos) {
			break
		}
	}

	// If there are remaining repos, mark them as not added
	for i := repoIndex; i < len(repos); i++ {
		license := ""
		openSource := false
		if repos[i].License != nil && repos[i].License.Name != nil {
			license = *repos[i].License.Name
			openSource = p.IsOpenSource(*repos[i].License.Name)
		}

		projects[i] = ProjectMetaData{
			ID:           repos[i].ID,
			Name:         repos[i].FullName,
			Description:  repos[i].Description,
			Added:        false,
			Stars:        repos[i].StargazersCount,
			License:      &license,
			IsOpenSource: openSource,
		}
	}

	return projects, nil
}

func (p *projectManager) GetProjectMetaDataUsingSearch(token string, term string, page int) ([]ProjectMetaData, error) {
	httpClient := oauth2.NewClient(context.Background(), oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token},
	))

	client := github.NewClient(httpClient)
	user, _, err := client.Users.Get(context.Background(), "")
	if err != nil {
		return nil, err
	}

	// Define the search query
	query := fmt.Sprintf("user:%s %s", *user.Login, term)

	opts := &github.SearchOptions{
		ListOptions: github.ListOptions{
			PerPage: 10,
			Page:    page,
		},
	}

	repos, _, err := client.Search.Repositories(context.Background(), query, opts)
	if err != nil {
		return nil, err
	}

	// Exit early as no repos
	if len(repos.Repositories) == 0 {
		return []ProjectMetaData{}, nil
	}

	userRepos, err := p.repoDB.GetUsersRepos(*user.ID)
	if err != nil {
		return nil, err
	}

	projects := make([]ProjectMetaData, len(repos.Repositories))

	// Initialize pointers
	repoIndex, userRepoIndex := 0, 0

	for userRepoIndex < len(userRepos) {
		repo := repos.Repositories[repoIndex]

		for userRepoIndex < len(userRepos) && *repo.ID > userRepos[userRepoIndex] {
			userRepoIndex++
		}

		if userRepoIndex >= len(userRepos) {
			break
		}

		// Compare repo ID with userRepo ID
		added := *repo.ID == userRepos[userRepoIndex]
		if added {
			// Move userRepoIndex to the next element
			userRepoIndex++
		}

		license := ""
		openSource := false
		if repo.License != nil && repo.License.Name != nil {
			license = *repo.License.Name
			openSource = p.IsOpenSource(*repo.License.Name)
		}

		projects[repoIndex] = ProjectMetaData{
			ID:           repo.ID,
			Name:         repo.FullName,
			Description:  repo.Description,
			Added:        added,
			Stars:        repo.StargazersCount,
			License:      &license,
			IsOpenSource: openSource,
		}

		// Move repoIndex to the next element
		repoIndex++

		if repoIndex >= len(repos.Repositories) {
			break
		}
	}

	// If there are remaining repos, mark them as not added
	for i := repoIndex; i < len(repos.Repositories); i++ {
		license := ""
		openSource := false
		if repos.Repositories[i].License != nil && repos.Repositories[i].License.Name != nil {
			license = *repos.Repositories[i].License.Name
			openSource = p.IsOpenSource(*repos.Repositories[i].License.Name)
		}

		projects[i] = ProjectMetaData{
			ID:           repos.Repositories[i].ID,
			Name:         repos.Repositories[i].FullName,
			Description:  repos.Repositories[i].Description,
			Added:        false,
			Stars:        repos.Repositories[i].StargazersCount,
			License:      &license,
			IsOpenSource: openSource,
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

func (p *projectManager) GetProjectMetaData(id int64, token string) (*BasicRepoMetaData, error) {
	httpClient := oauth2.NewClient(context.Background(), oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token},
	))

	client := github.NewClient(httpClient)

	repo, _, err := client.Repositories.GetByID(context.Background(), id)
	if err != nil {
		return nil, fmt.Errorf("Error fetching repository: %v", id)
	}

	repoMeta := &BasicRepoMetaData{
		Name:        repo.FullName,
		Description: repo.Description,
	}

	if repoMeta.Description == nil {
		empty := ""
		repoMeta.Description = &empty
	}

	return repoMeta, nil
}

func (p *projectManager) IsOpenSource(license string) bool {
	for i := 0; i < len(*p.openSourceLiences); i++ {
		if (*p.openSourceLiences)[i] == license {
			return true
		}
	}

	return false
}
