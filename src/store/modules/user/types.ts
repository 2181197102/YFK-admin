export interface UserInfo {
  id: number;
  username: string;
  name: string;
  age: number;
  gender: string;
  role_code: string;
  role_name: string;
  group_name: string | null;
  enable?: boolean;
  created_time?: string;
}