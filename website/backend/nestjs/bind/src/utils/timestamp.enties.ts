import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';


export default class TimestampEntites {
	@CreateDateColumn({
		update: false
	})
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@DeleteDateColumn({
		update: false
	})
	deletedAt: Date;
}
