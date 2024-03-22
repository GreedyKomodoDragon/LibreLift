import axios from "axios";

export async function getToken(): Promise<string> {
    const config = await fetch('/config.json');
    const jsConfig = await config.json()

    return jsConfig["GITHUB_CLIENT_TOKEN"]
}


export async function login(code: string): Promise<string> {
  const result = await axios.post(
    "http://localhost:8080/api/v1/auth/login",
    {
      code: code,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  return result.data.token;
}

export async function isLoggedIn(): Promise<boolean> {
  const result = await axios.get("http://localhost:8080/api/v1/auth/login", {
    withCredentials: true,
  });

  return result.status === 200;
}
