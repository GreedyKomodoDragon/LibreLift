import axios from "axios";

export type Repo = {
  id: number;
  name: string;
  description: string;
  added: boolean;
  stars: number | null;
  license: string | null;
  isOpenSource: boolean;
};

export type RepoMetaData = {
  name: string;
  description: string | null;
};

export async function GetRepos(
  pageNumber: number,
  search: string
): Promise<Repo[]> {
  const results = await axios.get(
    `http://127.0.0.1:8080/api/v1/project/repos?page=${encodeURIComponent(
      pageNumber
    )}&search=${encodeURIComponent(search)}`,
    {
      withCredentials: true,
    }
  );

  return results.data.projects as Repo[];
}

export async function GetRepoMetaData(id: number): Promise<RepoMetaData> {
  const results = await axios.get(
    `http://127.0.0.1:8080/api/v1/project/repos/${id}`,
    {
      withCredentials: true,
    }
  );

  return results.data as RepoMetaData;
}
