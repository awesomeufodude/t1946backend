import { Exclude } from 'class-transformer';

export class UserDto {
  id: string;
  rut: string;
  name: string;
  lastname: string;
  @Exclude()
  passwordHash: string;
  email: string;
  jobRole: string;
  role: {
    id: string;
    name: string;
  };
  stores?: UserStore[];
  avatarPath?: string;
  phoneZone: number;
  phoneNumber: number;
  @Exclude()
  active: boolean;
  @Exclude()
  createdAt: Date;
  @Exclude()
  updatedAt: Date;
  groupedPermissions?: Record<string, string[]>;
}

interface UserStore {
  id: string;
  name: string;
}
