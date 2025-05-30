import { Model, Table, Column, DataType, ForeignKey, HasOne, AutoIncrement, PrimaryKey } from 'sequelize-typescript';
import File from './File';
import BuyingOrder from './PurchaseOrder';

@Table
export default class BOInvoices extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column({
    type: DataType.INTEGER
  })
  id!: number;

  @HasOne(() => File)
  invoiceAtt!: File;

  @ForeignKey(() => BuyingOrder)
  @Column({
    type: DataType.INTEGER,
  })
  buyingOrderId!: number;
}
