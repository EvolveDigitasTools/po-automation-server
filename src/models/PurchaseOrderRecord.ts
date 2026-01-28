import { Model, Table, Column, DataType, ForeignKey, AllowNull, AutoIncrement, PrimaryKey, BelongsTo } from 'sequelize-typescript';
import SKU from './sku/SKU';
import PurchaseOrder from './PurchaseOrder';
import PurchaseOrderGRN from "./PurchaseOrderGRN";

@Table({
    tableName: 'purchase_order_record',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false
})
export default class PurchaseOrderRecord extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column({
        type: DataType.INTEGER
    })
    id!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    expectedQty!: number;

    @AllowNull(true)
    @Column({
    type: DataType.DECIMAL(10, 2),
    })
    mrp!: number | null;
    
    @AllowNull(false)
    @Column({ type: DataType.DECIMAL(10, 2) })
    unitCost!: number;
  
    @AllowNull(false)
    @Column({ type: DataType.DECIMAL(5, 2) })
    gst!: number;

    @Column({ type: DataType.INTEGER })
    receivedQty!: number;

    @Column({ type: DataType.INTEGER })
    damaged!: number;

    @ForeignKey(() => SKU)
    @Column({
        type: DataType.INTEGER
    })
    skuId!: number;

    @ForeignKey(() => PurchaseOrder)
    @Column({
        type: DataType.INTEGER
    })
    purchaseOrderId!: number;

    @BelongsTo(() => SKU)
    sku!: SKU

    @BelongsTo(() => PurchaseOrder)
    purchaseOrder!: PurchaseOrder;

    @ForeignKey(() => PurchaseOrderGRN)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    grnId!: number | null;

    @BelongsTo(() => PurchaseOrderGRN)
    grn?: PurchaseOrderGRN;

    @Column({
    type: DataType.DECIMAL(5,2),
    allowNull: true,
    })
    shelfLifePercent!: number | null;

}
