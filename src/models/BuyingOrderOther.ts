import { Model, Table, Column, DataType, ForeignKey, HasOne, AutoIncrement, PrimaryKey, AllowNull } from 'sequelize-typescript';
import File from './File';
import BuyingOrder from './PurchaseOrder';

@Table
export default class BuyingOrderOther extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column({
    type: DataType.INTEGER
  })
  id!: number;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  otherKey!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  otherValue!: string;

  @HasOne(() => File)
  otherAtt!: File;

  @ForeignKey(() => BuyingOrder)
  @Column({
    type: DataType.INTEGER,
  })
  buyingOrderId!: number;
}
