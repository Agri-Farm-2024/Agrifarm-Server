export class LoginResponseDTO {
  user: {
    id: string;
    email: string;
    full_name: string;
    created_at: Date;
    updated_at: Date;
  };
  token: {
    access_token: string;
    token_type: string;
  };
}
