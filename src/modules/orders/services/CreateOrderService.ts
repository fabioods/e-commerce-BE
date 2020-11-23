import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customerExists = await this.customersRepository.findById(customer_id);

    if (!customerExists)
      throw new AppError('There is no customer with this id');

    const existingProducts = await this.productsRepository.findAllById(
      products,
    );

    if (!existingProducts.length)
      throw new AppError('Could not find any products with the given ids');

    const existingProductsIds = existingProducts.map(p => p.id);
    const inexistingProducts = products.filter(
      p => !existingProductsIds.includes(p.id),
    );

    if (inexistingProducts.length)
      throw new AppError(
        `Could not find products with the given ids ${inexistingProducts} `,
      );

    const findProductsWithNonQuantityAvailable = products.filter(
      product =>
        existingProducts.filter(p => p.id === product.id)[0].quantity <
        product.quantity,
    );

    if (findProductsWithNonQuantityAvailable.length) {
      throw new AppError(
        `The quantity of products are not availabe ${findProductsWithNonQuantityAvailable}`,
      );
    }

    const serializedProducts = products.map(p => {
      return {
        product_id: p.id,
        quantity: p.quantity,
        price: existingProducts.filter(
          existingProduct => existingProduct.id === p.id,
        )[0].price,
      };
    });

    const order = await this.ordersRepository.create({
      customer: customerExists,
      products: serializedProducts,
    });

    const { order_products } = order;

    const orderedProducts = order_products.map(p => {
      return {
        id: p.product_id,
        quantity:
          existingProducts.filter(product => product.id === p.product_id)[0]
            .quantity - p.quantity,
      };
    });

    await this.productsRepository.updateQuantity(orderedProducts);

    return order;
  }
}

export default CreateOrderService;
