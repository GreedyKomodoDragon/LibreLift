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

export async function getRepoProducts(
  repoId: string,
  term: string,
  option: string,
  page: number
): Promise<RepoProduct[]> {
  let url = `http://127.0.0.1:8080/api/v1/products/repo/${repoId}?option=${encodeURIComponent(
    option
  )}&page=${encodeURIComponent(page)}`;

  if (term.length > 0) {
    url += `&term=${encodeURIComponent(term)}`;
  }

  const result = await axios.get(url, {
    withCredentials: true,
  });

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

export type Purchases = {
  id: number;
  repoId: number;
  isOneOff: boolean;
  unixTS: number;
  prodName: string;
  price: number;
  url: string;
  status: string;
};

export async function GetPurchases(): Promise<Purchases[]> {
  const results = await axios.get(
    `http://127.0.0.1:8080/api/v1/products/purchases`,
    {
      withCredentials: true,
    }
  );

  return results.data.products;
}

export async function CancelSubscription(id: number) {
  await axios.delete(
    `http://127.0.0.1:8080/api/v1/payments/subscription/${id}`,
    {
      withCredentials: true,
    }
  );
}

export async function RenableSubscription(id: number) {
  await axios.put(
    `http://127.0.0.1:8080/api/v1/payments/subscription/${id}/enable`,
    {},
    {
      withCredentials: true,
    }
  );
}

export async function RequestRefund(id: number) {
  await axios.post(
    `http://127.0.0.1:8080/api/v1/payments/oneoff/${id}/refund`,
    {},
    {
      withCredentials: true,
    }
  );
}
