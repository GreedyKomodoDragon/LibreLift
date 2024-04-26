import axios from "axios";

export async function addEmailToWaitingList(email: string) {
  await axios.post(
    `http://127.0.0.1:8080/api/v1/email/mailing`,
    {
      email: email,
    },
    {
      withCredentials: true,
    }
  );
}
