import { 
Entity, 
Column, 
PrimaryGeneratedColumn, 
CreateDateColumn, 
UpdateDateColumn, 
ManyToOne, 
JoinColumn, 
BeforeInsert, 
BeforeUpdate, 
DeleteDateColumn, 
} from 'typeorm'; 
import { Exclude } from 'class-transformer'; 
import * as bcrypt from 'bcrypt'; 
import { Role } from './role.entity'; 
import { UserStatus } from '../../../common/enums/user-status.enum'; 
/** 
* User Entity 
* Core authentication and user management 
*/ 
@Entity('users') 
export class User { 
@PrimaryGeneratedColumn('uuid') 
id: string; 
@Column({ unique: true, length: 255 }) 
email: string; 
@Column({ unique: true, length: 100, nullable: true }) 
username: string; 
@Column({ name: 'password_hash', length: 255 }) 
@Exclude() // Never return password in API responses 
passwordHash: string; 
@ManyToOne(() => Role, (role) => role.users, { eager: true }) 
@JoinColumn({ name: 'role_id' }) 
role: Role; 
@Column({ 
type: 'enum', 
enum: UserStatus, 
default: UserStatus.ACTIVE, 
}) 
status: UserStatus; 
@Column({ name: 'is_verified', default: false }) 
isVerified: boolean; 
@Column({ name: 'last_login_at', type: 'timestamp', nullable: true }) 
lastLoginAt: Date; 
@Column({ name: 'password_changed_at', type: 'timestamp', nullable: true }) 
passwordChangedAt: Date; 
@Column({ name: 'failed_login_attempts', default: 0 }) 
failedLoginAttempts: number; 
@Column({ name: 'locked_until', type: 'timestamp', nullable: true }) 
lockedUntil: Date; 
@CreateDateColumn({ name: 'created_at' }) 
createdAt: Date; 
@UpdateDateColumn({ name: 'updated_at' }) 
updatedAt: Date; 
@DeleteDateColumn({ name: 'deleted_at' }) 
  deletedAt: Date; 
 
  /** 
   * Hash password before inserting or updating 
   */ 
  @BeforeInsert() 
  @BeforeUpdate() 
  async hashPassword() { 
    // Only hash if password is new or changed (not already hashed) 
    if (this.passwordHash && !this.passwordHash.startsWith('$2')) { 
      this.passwordHash = await bcrypt.hash(this.passwordHash, 10); 
    } 
  } 
 
  /** 
   * Compare provided password with stored hash 
   * @param password - Plain text password 
   * @returns Promise<boolean> 
   */ 
  async validatePassword(password: string): Promise<boolean> { 
    return bcrypt.compare(password, this.passwordHash); 
  } 
 
  /** 
   * Check if account is locked 
   * @returns boolean 
   */ 
  isAccountLocked(): boolean { 
    if (!this.lockedUntil) return false; 
    return this.lockedUntil > new Date(); 
  } 
 
  /** 
   * Get remaining lock time in minutes 
   * @returns number 
   */ 
  getRemainingLockTime(): number { 
    if (!this.isAccountLocked()) return 0; 
    return Math.ceil((this.lockedUntil.getTime() - Date.now()) / 60000); 
  } 
} 