import axios from "axios";

export type Document = {
    id: number;
	name: string;
	description: string;
}


export async function SearchProjects(query: string): Promise<Document[]> {
    if (query.length === 0) {
        return []
    }

    const results = await axios.get(`http://127.0.0.1:8080/api/v1/search/projects?query=${encodeURIComponent(query)}`, {
      withCredentials: true,
    });

  return results.data.results as Document[]; 
}