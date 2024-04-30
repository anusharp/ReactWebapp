declare global {
  interface Window {
    configs: {
      serviceURL: string;
    };
  }
}

export const apiUrl = window?.configs?.serviceURL ? window.configs.serviceURL : "http://localhost:3000/api/reservations";
