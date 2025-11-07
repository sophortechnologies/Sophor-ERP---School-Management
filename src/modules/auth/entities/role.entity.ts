import { 
Entity, 
Column, 
PrimaryGeneratedColumn, 
CreateDateColumn, 
UpdateDateColumn, 
OneToMany, 
} from 'typeorm'; 
import { User } from './user.entity'; 
/** 
* Role Entity 
* Defines user roles and their permissions for RBAC 
*/ 
@Entity('roles') 
export class Role { 
@PrimaryGeneratedColumn('uuid') 
id: string; 
@Column({ unique: true, length: 50 }) 
name: string; // SUPER_ADMIN, ADMIN, TEACHER, STUDENT, etc. 
@Column({ name: 'display_name', length: 100 }) 
displayName: string; 
@Column({ type: 'text', nullable: true }) 
description: string; 
@Column({ type: 'jsonb', default: '[]' }) 
permissions: string[]; // Array of permission strings 
@Column({ name: 'is_active', default: true }) 
isActive: boolean; 
@OneToMany(() => User, (user) => user.role) 
users: User[]; 
@CreateDateColumn({ name: 'created_at' }) 
createdAt: Date; 
@UpdateDateColumn({ name: 'updated_at' }) 
updatedAt: Date; 
}