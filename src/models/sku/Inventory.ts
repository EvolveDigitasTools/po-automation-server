import {
    Model, Table, Column, AutoIncrement, PrimaryKey, DataType, ForeignKey, BelongsTo
} from 'sequelize-typescript';
import SKU from './SKU';

@Table({
    tableName: 'inventory'
})
export default class Inventory extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column({
        type: DataType.INTEGER
    })
    id!: number;

    @ForeignKey(() => SKU)
    @Column({ type: DataType.INTEGER })
    skuId!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    quantity!: number;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    expiry!: Date;

    @BelongsTo(() => SKU)
    sku?: SKU;
}
