import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import PurchaseOrder from "./PurchaseOrder";

@Table({
  tableName: "purchase_order_grn",
  timestamps: false,
})
export default class PurchaseOrderGRN extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @ForeignKey(() => PurchaseOrder)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  purchaseOrderId!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  invoiceNumber!: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  invoiceDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  receivedAt!: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  createdBy!: string;

  @BelongsTo(() => PurchaseOrder)
  purchaseOrder!: PurchaseOrder;
}
