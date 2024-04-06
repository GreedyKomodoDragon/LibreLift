import axios from "axios";

type Product = {
  id: number;
  name: string;
  url: string;
  price: number;
};

export type RepoProduct = {
  id: number;
  name: string;
  url: string;
  price: number;
  isAdded: boolean;
};

export async function getAllProducts(): Promise<Product[]> {
  const result = await axios.get("http://127.0.0.1:8080/api/v1/products", {
    withCredentials: true,
  });

  return result.data.products;
}

export async function getRepoProducts(repoId: string): Promise<RepoProduct[]> {
  const result = await axios.get(
    `http://127.0.0.1:8080/api/v1/products/repo/${repoId}`,
    {
      withCredentials: true,
    }
  );

  return result.data.products;
}

export async function getRepoOptions(repoId: string): Promise<RepoProduct[]> {
  const result = await axios.get(
    `http://127.0.0.1:8080/api/v1/products/repo/${repoId}/added`,
    {
      withCredentials: true,
    }
  );

  return result.data.products;
}

export async function addProductToRepo(productId: number, repoId: number) {
  await axios.post(
    `http://127.0.0.1:8080/api/v1/products/repo/${repoId}/${productId}`,
    {},
    {
      withCredentials: true,
    }
  );
}
