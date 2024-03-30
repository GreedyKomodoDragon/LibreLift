import axios from "axios";

export type Repo = {
  id: number;
  name: string;
  description: string;
  added: boolean;
};

export type RepoMetaData = {
  name: string;
  description: string | null;
};

export async function GetRepos(): Promise<Repo[]> {
  const results = await axios.get("http://127.0.0.1:8080/api/v1/project/repos", {
      withCredentials: true,
    });

  return results.data.projects as Repo[];
}


export async function GetRepoMetaData(id: number): Promise<RepoMetaData> {
  const results = await axios.get(`http://127.0.0.1:8080/api/v1/project/repos/${id}`, {
      withCredentials: true,
    });

  return results.data as RepoMetaData;
}
