import axios from "axios";

export async function AddRepoToLibrelift(repoID: number): Promise<boolean> {
  const result = await axios.post(
    `http://127.0.0.1:8080/api/v1/project/repos/${repoID}`,
    {},
    {
      withCredentials: true,
    }
  );

  return result.status === 202;
}
