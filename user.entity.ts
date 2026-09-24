import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: 'en' })
  language: string; // 'en' | 'si' | 'ta'

  @Column({ default: 'other' })
  userType: string; // 'student' | 'farmer' | 'hiker' | 'traveller' | 'fisherman' | 'other'

  @Column('simple-array', { default: '' })
  healthAlerts: string[]; // ['heatstroke', 'uv_exposure', 'asthma', 'dehydration']

  @Column({ default: false })
  voiceAlertsEnabled: boolean;

  @Column({ default: false })
  locationPermissionGranted: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lastLatitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lastLongitude: number;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  district: string;

  @Column({ nullable: true })
  province: string;

  @Column({ default: 'Sri Lanka' })
  country: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
