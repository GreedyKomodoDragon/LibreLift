import axios from "axios";

export type Repo = {
  full_name: string;
  description: string;
};

export async function GetRepos(username: string): Promise<Repo[]> {
  const results = await axios.get(
    `https://api.github.com/users/${username}/repos`
  );
  return results.data as Repo[];
}
