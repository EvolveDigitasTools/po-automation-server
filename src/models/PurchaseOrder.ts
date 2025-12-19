import { Model, Table, HasMany, AllowNull, AutoIncrement, PrimaryKey, Column, DataType, ForeignKey, BelongsTo, Unique, Default, HasOne } from 'sequelize-typescript';
import AttachmentMapping from './attachment/AttachmentMapping';
import PurchaseOrderRecord from './PurchaseOrderRecord';
import VendorProfile from './vendor/VendorProfile';
import Invoice from './Invoice';

@Table({
    tableName: 'purchase_order',
    timestamps: true,
})
export default class PurchaseOrder extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column({
        type: DataType.INTEGER
    })
    id!: number;

    @AllowNull(false)
    @Unique
    @Column({
        type: DataType.STRING
    })
    poCode!: string

    @AllowNull(false)
    @Default('Fresh')
    @Column({
        type: DataType.ENUM('Fresh', 'LSL')
    })
    poType!: 'Fresh' | 'LSL';    

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    estimatedDeliveryDate!: string
    
    @Default(false)
    @AllowNull(false)
    @Column({
        type: DataType.BOOLEAN
    })
    isVerified!: boolean

    @AllowNull(false)
    @Column({
        type: DataType.STRING
    })
    verificationLevel!: string

    @HasOne(() => AttachmentMapping, {
        foreignKey: 'entityId',
        scope: { attachmentType: 'poAttachment' }
    })
    poAttachment!: AttachmentMapping;

    @AllowNull(false)
    @Column({
        type: DataType.STRING
    })
    createdBy!: string
    
    @Default(false)
    @Column({
        type: DataType.BOOLEAN
    })
    closed!: boolean

    @HasMany(() => Invoice)
    invoices!: Invoice[];

    @HasMany(() => PurchaseOrderRecord)
    records?: PurchaseOrderRecord[];

    @ForeignKey(() => VendorProfile)
    @Column({
        type: DataType.INTEGER
    })
    vendorProfileId!: number;

    @BelongsTo(() => VendorProfile)
    vendorProfile?: VendorProfile;
}
