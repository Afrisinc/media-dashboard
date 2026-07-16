export interface LoginEventResponse {
  id: string;
  type: "login_event" | "login_failure";
  userId: string;
  email: string;
  name: string;
  phone: string;
  status: "success" | "failed";
  ip: string;
  reason: string | null;
  createdAt: string;
}
