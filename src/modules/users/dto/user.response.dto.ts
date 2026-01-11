export class UserResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone?: string;
  roleId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  role?: {
    id: number;
    name: string;
    code: string;
    description: string;
  };
}
