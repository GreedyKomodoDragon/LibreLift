import axios from "axios";
import Cookies from "universal-cookie";

export async function getToken(): Promise<string> {
  const config = await fetch("/config.json");
  const jsConfig = await config.json();

  return jsConfig["GITHUB_CLIENT_TOKEN"];
}

export async function login(code: string): Promise<string> {
  const result = await axios.post(
    "http://127.0.0.1:8080/api/v1/auth/login",
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

export async function getAvatarURL(): Promise<string> {
  try {
    const result = await axios.get("http://127.0.0.1:8080/api/v1/auth/avatar", {
      withCredentials: true,
    });
    return result.data.avatar;
  } catch (error) {
    return "";
  }
}

export async function isLoggedIn(): Promise<boolean> {
  const result = await axios.get("http://127.0.0.1:8080/api/v1/auth/login", {
    withCredentials: true,
  });

  return result.status === 200;
}

export async function logout() {
  await axios.post(
    "http://127.0.0.1:8080/api/v1/auth/logout",
    {},
    {
      withCredentials: true,
    }
  );
}
