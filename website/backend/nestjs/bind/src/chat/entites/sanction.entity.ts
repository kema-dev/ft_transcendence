import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn, 
  JoinColumn,
} from "typeorm";
import { ChannelEntity } from "./channel.entity";
import { UserEntity } from "../../users/user.entity";
import TimestampEntites from '../../utils/timestamp.enties';


@Entity('sanction')
export class SanctionEntity extends TimestampEntites {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    type: string;

    @ManyToOne(() => UserEntity, user => user.sanctions, {
      onDelete: 'CASCADE',
      nullable: true
    })
    @JoinColumn()
    user: UserEntity;

    @ManyToOne(() => ChannelEntity, channel => channel.sanctions, {
      onDelete: 'CASCADE',
      nullable: true
    })
    @JoinColumn()
    chan: ChannelEntity;

    @Column()
    end: Date;
}