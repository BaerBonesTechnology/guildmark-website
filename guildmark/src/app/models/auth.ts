// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface LoginResponse {
  access_token: string;
  user: {
    id:         string;
    email:      string;
    full_name:  string;
    role:       "admin" | "member" | "viewer";
    company_id: string;
    company:    string;
  };
}

export interface SignupRequest {
  email:        string;
  password:     string;
  full_name:    string;
  company_name: string;
  company_size: string;
  industry:     string;
}

export interface EmailPayload {
  to:       string;
  subject:  string;
  body:     string;
}
