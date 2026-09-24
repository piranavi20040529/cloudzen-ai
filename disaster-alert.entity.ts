import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('disaster_alerts')
export class DisasterAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  type: string; // 'Flood', 'Earthquake', 'Cyclone', 'Marine Hazard', 'Tsunami'

  @Column()
  typeIcon: string; // MaterialCommunityIcons name

  @Column()
  severity: string; // 'advisory' | 'watch' | 'warning' | 'emergency'

  @Column()
  severityLabel: string; // 'ADVISORY' | 'WATCH' | 'WARNING' | 'EMERGENCY'

  @Column()
  source: string;

  @Column()
  description: string;

  @Column()
  affectedArea: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column('simple-array', { default: '' })
  safetyBrief: string[];

  @Column({ type: 'jsonb', default: '[]' })
  emergencyContacts: { name: string; phone: string }[];

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ nullable: true })
  externalId: string; // GDACS/USGS event ID for deduplication

  @CreateDateColumn()
  createdAt: Date;
}
