// src/types/express.d.ts
import { User } from '../../modules/users/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User; // or whatever your user type is
    }
  }
}
