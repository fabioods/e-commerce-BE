import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export default class CreateOrderProduct1606051246560
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'order_product',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'product_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'order_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'price',
            type: 'double precision',
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'double precision',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'now()',
          },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'order_product',
      new TableForeignKey({
        name: 'Order_product_Produtct_FK',
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'order_product',
      new TableForeignKey({
        name: 'Order_product_Order_FK',
        columnNames: ['order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'order',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'order_product',
      'Order_product_Produtct_FK',
    );
    await queryRunner.dropForeignKey('order_product', 'Order_product_Order_FK');
    await queryRunner.dropTable('order_product');
  }
}
