import ky from "ky";
import type { BeforeRequestState, AfterResponseState } from "ky";
import { useAuthStore } from "../store/auth.store";

const BASE_URL = `${(process.env["EXPO_PUBLIC_API_URL"] ?? "http://localhost:3000").replace(/\/$/, "")}/`;

export const apiClient = ky.create({
  baseUrl: BASE_URL,
  timeout: 15000,
  hooks: {
    beforeRequest: [
      ({ request }: BeforeRequestState) => {
        const { idToken } = useAuthStore.getState();
        if (idToken) {
          request.headers.set("Authorization", `Bearer ${idToken}`);
        }
      },
    ],
    afterResponse: [
      async ({ request, options, response }: AfterResponseState) => {
        if (response.status === 401) {
          await useAuthStore.getState().refreshToken();
          const { idToken } = useAuthStore.getState();
          if (idToken) {
            request.headers.set("Authorization", `Bearer ${idToken}`);
          }
          return ky(request, options);
        }
        return response;
      },
    ],
  },
});
