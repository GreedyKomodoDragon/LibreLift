package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/valkey-io/valkey-go"
	"github.com/valkey-io/valkey-go/valkeycompat"
)

type GitHubCacheManager interface {
	GetAvatar(ctx context.Context, name string) (string, error)
	SetAvatar(ctx context.Context, name, value string) error
}

type valKeyCache struct {
	client valkeycompat.Cmdable
}

func NewValKeyGithubCache(address string) (GitHubCacheManager, error) {
	client, err := valkey.NewClient(valkey.ClientOption{InitAddress: []string{address}})
	if err != nil {
		return nil, err
	}

	compact := valkeycompat.NewAdapter(client)
	if err := compact.Ping(context.Background()).Err(); err != nil {
		return nil, err
	}

	return &valKeyCache{
		client: compact,
	}, nil
}

func (c *valKeyCache) GetAvatar(ctx context.Context, name string) (string, error) {

	res := c.client.Get(ctx, fmt.Sprintf("avatar-%s", name))
	if res.Err() != nil {
		return "", res.Err()
	}

	return res.Result()

}

func (c *valKeyCache) SetAvatar(ctx context.Context, name string, value string) error {
	return c.client.Set(ctx, fmt.Sprintf("avatar-%s", name), value, time.Duration(time.Hour)).Err()
}
