import { User } from "./user.type";

export type RegisterPayload = {
  email: string;
  username: string;
  password: string;
  phone: string;
  roles: Array<number | string>;
  companyName?: string;
  location?: string;
  provinceId?: number;
  districtId?: number;
  inviteToken?: string;
};

export type RegisterResponse =
  | {
      success: true;
      data: User;
    }
  | {
      success: false;
      message?: string;
      errors?: Record<string, string>;
    };
