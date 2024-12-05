import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { IMaterialService } from './interface/IMaterialService.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { Like, Not, Repository } from 'typeorm';
import { LoggerService } from 'src/logger/logger.service';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { Order } from '../orders/entities/order.entity';
import { IUser } from '../auths/types/IUser.interface';
import { OrdersService } from '../orders/orders.service';
import { MaterialType } from './types/material-type.enum';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateTransactionDTO } from '../transactions/dto/create-transaction.dto';
import { TransactionPurpose } from '../transactions/types/transaction-purpose.enum';
import { BuyMaterialDTO } from './dto/buy-material.dto';
import { MaterialStatus } from './types/material-status.enum';
import { BookingMaterial } from './entities/booking-material.entity';
import { RentMaterialDto } from './dto/rent-material.dto';
import { BookingsService } from '../bookings/bookings.service';
import { BookingLand } from '../bookings/entities/bookingLand.entity';
import { BookingStatus } from '../bookings/types/booking-status.enum';
import { BookingMaterialDetail } from './entities/booking-material-detail.entity';
import { BookingMaterialStatus } from './types/booking-material-status.enum';
import { UserRole } from '../users/types/user-role.enum';
import { Transaction } from '../transactions/entities/transaction.entity';
import { UpdateBookingMaterialDTO } from './dto/update-booking.material.dto';
import { getTimeByPlusDays } from 'src/utils/time.utl';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/types/notification-type.enum';
import { NotificationTitleEnum } from '../notifications/types/notification-title.enum';
import { NotificationContentEnum } from '../notifications/types/notification-content.enum';

@Injectable()
export class MaterialsService implements IMaterialService {
  private readonly logger = new Logger(MaterialsService.name);
  constructor(
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,

    @InjectRepository(BookingMaterial)
    private readonly bookingMaterialRepo: Repository<BookingMaterial>,

    @InjectRepository(BookingMaterialDetail)
    private readonly bookingMaterialDetailRepo: Repository<BookingMaterialDetail>,

    @Inject(forwardRef(() => OrdersService))
    private readonly orderService: OrdersService,

    private readonly loggerService: LoggerService,

    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionService: TransactionsService,

    @Inject(forwardRef(() => BookingsService))
    private readonly bookingLandService: BookingsService,

    private readonly notificationService: NotificationsService,
  ) {}

  async createMaterial(createMaterialDto: CreateMaterialDto) {
    try {
      //check material is exist
      const material = await this.materialRepo.findOne({
        where: {
          name: createMaterialDto.name,
        },
      });
      if (material) {
        throw new BadRequestException('Material name already exist');
      }
      // check type is buy
      if (createMaterialDto.type === MaterialType.buy) {
        if (!createMaterialDto.price_per_piece) {
          throw new BadRequestException('Price per piece is required');
        }
      }
      // check type is rent
      if (createMaterialDto.type === MaterialType.rent) {
        if (!createMaterialDto.price_of_rent) {
          throw new BadRequestException('Price of rent is required');
        }
        if (!createMaterialDto.deposit_per_piece) {
          throw new BadRequestException('Deposit per piece is required');
        }
      }
      //create new material
      const new_material = await this.materialRepo.save({
        ...createMaterialDto,
      });

      this.loggerService.log(
        `New material is created with ${new_material.name}`,
      );
      return new_material;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateMaterial(
    id: string,
    updateMaterialDto: UpdateMaterialDto,
  ): Promise<Material> {
    try {
      //check material is exist
      const material_exist = await this.materialRepo.findOne({
        where: {
          material_id: id,
        },
      });
      if (!material_exist) {
        throw new BadRequestException('material not found');
      }
      //check name of material is duplicate
      const material_name = await this.materialRepo.findOne({
        where: {
          name: Like(updateMaterialDto.name),
          material_id: Not(id),
        },
      });
      if (material_name) {
        throw new BadRequestException('Material name already exist');
      }

      if (updateMaterialDto.total_quantity === 0) {
        material_exist.status = MaterialStatus.out_of_stock;
      }

      if (material_exist.status === MaterialStatus.out_of_stock) {
        if (updateMaterialDto.total_quantity > 0) {
          material_exist.status = MaterialStatus.available;
        }
      }

      return await this.materialRepo.save({
        ...material_exist,
        ...updateMaterialDto,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // update quantiy material for request material
  async updateQuantityMaterial(
    material: string,
    quantity: number,
  ): Promise<any> {
    try {
      const material_exist = await this.materialRepo.findOne({
        where: {
          material_id: material,
        },
      });

      if (material_exist.total_quantity + quantity <= 0) {
        material_exist.status = MaterialStatus.out_of_stock;
      }

      if (material_exist.total_quantity + quantity > 0) {
        material_exist.status = MaterialStatus.available;
      }

      if (material_exist.type === MaterialType.rent) {
        material_exist.quantity_of_rented =
          material_exist.quantity_of_rented + quantity;
      }

      const update_material = await this.materialRepo.save({
        ...material_exist,
        total_quantity: material_exist.total_quantity + quantity,
      });
      return update_material;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //Get ALL materials
  async getMaterials(
    pagination: PaginationParams,
    type: MaterialType,
  ): Promise<any> {
    try {
      // filter condition
      const filter: any = {};
      if (type) {
        filter.type = type;
      }
      const [materials, total_count] = await Promise.all([
        this.materialRepo.find({
          where: filter,
          skip: (pagination.page_index - 1) * pagination.page_size,
          take: pagination.page_size,
        }),
        this.materialRepo.count({
          where: filter,
        }),
      ]);

      // get total page
      const total_page = Math.ceil(total_count / pagination.page_size);
      return {
        materials,
        pagination: {
          ...pagination,
          total_page,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // Buy material

  async buyMaterial(materials: BuyMaterialDTO[], user: IUser): Promise<any> {
    try {
      // check material is have enough quantity
      if (materials.length === 0) {
        throw new BadRequestException('Material is empty');
      }
      // Loop through each material in the array
      for (const material of materials) {
        const material_detail = await this.materialRepo.findOne({
          where: {
            material_id: material.material_id,
          },
        });
        // check exist material
        if (!material_detail) {
          throw new BadRequestException('Material not found');
        }
        // check type of material is buy
        if (material_detail.type !== MaterialType.buy) {
          throw new BadRequestException('Material is not for buy');
        }
        // check quantity of material
        if (material_detail.total_quantity < material.quantity) {
          throw new BadRequestException(
            `Not enough quantity for material ${material_detail.name}`,
          );
        }
      }
      // Create a new order for the transaction
      const newOrder: Order = await this.orderService.createOrder({
        landrenter_id: user.user_id,
      });
      // Caculate total_price for transaction
      let total_price = 0;
      // Loop through each material in the array
      for (const item of materials) {
        // Check if the material exists
        const material_detail = await this.materialRepo.findOne({
          where: {
            material_id: item.material_id,
          },
        });
        // Create order detail
        await this.orderService.createOrderDetail({
          material_id: item.material_id,
          order_id: newOrder.order_id,
          quantity: item.quantity,
          price_per_iteam: material_detail.price_per_piece,
        });
        // Update the quantity of the material
        await this.materialRepo.update(
          {
            material_id: item.material_id,
          },
          {
            total_quantity: material_detail.total_quantity - item.quantity,
          },
        );
        // Calculate the total price
        total_price += material_detail.price_per_piece * item.quantity;
      }
      // create transaction DTO and create transaction
      const transactionData: Partial<CreateTransactionDTO> = {
        order_id: newOrder.order_id,
        total_price: total_price,
        purpose: TransactionPurpose.order,
        user_id: user.user_id,
      };

      const transaction = await this.transactionService.createTransaction(
        transactionData as CreateTransactionDTO,
      );
      return transaction;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Update back quantity when cancel order
   * @function handleCancelOrder
   * @param material
   * @param quantity
   * @returns
   */

  async handleCancelOrder(material: string, quantity: number): Promise<void> {
    try {
      // update quantity material
      const materialEntity = await this.materialRepo.findOne({
        where: {
          material_id: material,
        },
      });
      if (!materialEntity) {
        throw new BadRequestException('Material not found');
      }
      await this.materialRepo.update(
        {
          material_id: material,
        },
        {
          total_quantity: materialEntity.total_quantity + quantity,
        },
      );
      this.loggerService.log(
        `Material ${materialEntity.name} is updated quantity when cancel order`,
      );
    } catch (error) {
      this.loggerService.error(error.message, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Booking material
   * @function bookingMaterial
   * @param materials
   * @param user
   */

  async bookingMaterial(data: RentMaterialDto, user: IUser): Promise<any> {
    try {
      // CHeck booking is exist
      const booking_land: BookingLand =
        await this.bookingLandService.getBookingDetail(data.booking_land_id);
      if (booking_land.status !== BookingStatus.completed) {
        throw new BadRequestException('Booking is not completed');
      }
      // check materials is empty
      if (data.materials.length === 0) {
        throw new BadRequestException('Material is empty');
      }
      // Loop through each material in the array
      for (const material of data.materials) {
        const material_detail = await this.materialRepo.findOne({
          where: {
            material_id: material.material_id,
          },
        });
        // check exist material
        if (!material_detail) {
          throw new BadRequestException('Material not found');
        }
        // check type of material is rent
        if (material_detail.type !== MaterialType.rent) {
          throw new BadRequestException('Material is not for rent');
        }
        // check quantity of material
        if (material_detail.total_quantity < material.quantity) {
          throw new BadRequestException(
            `Not enough quantity for material ${material_detail.name}`,
          );
        }
      }
      // Create a new booking material
      const new_booking_material: BookingMaterial =
        await this.bookingMaterialRepo.save({
          landrenter_id: user.user_id,
          time_start: new Date(),
          time_end: getTimeByPlusDays(new Date(), data.total_day),
          booking_land_id: data.booking_land_id,
          staff_id: booking_land.staff_id,
        });
      // Caculate total_price for transaction
      let total_price = 0;
      // Loop through each material in the array
      for (const item of data.materials) {
        // Check if the material exists
        const material_detail = await this.materialRepo.findOne({
          where: {
            material_id: item.material_id,
          },
        });
        // Create booking material detail
        await this.bookingMaterialDetailRepo.save({
          booking_material_id: new_booking_material.booking_material_id,
          material_id: item.material_id,
          quantity: item.quantity,
          price_deposit_per_item: material_detail.deposit_per_piece,
          price_per_piece_item: material_detail.price_of_rent,
        });
        // Update the quantity of the material
        await this.materialRepo.update(
          {
            material_id: item.material_id,
          },
          {
            total_quantity: material_detail.total_quantity - item.quantity,
            quantity_of_rented:
              material_detail.quantity_of_rented + item.quantity,
          },
        );
        // Calculate the total price
        total_price +=
          (material_detail.price_of_rent + material_detail.deposit_per_piece) *
          item.quantity;
      }
      // create transaction DTO and create transaction
      const transactionData: Partial<CreateTransactionDTO> = {
        booking_material_id: new_booking_material.booking_material_id,
        total_price: total_price * data.total_day,
        purpose: TransactionPurpose.booking_material,
        user_id: user.user_id,
      };
      // send noti to staff
      await this.notificationService.createNotification({
        title: NotificationTitleEnum.new_booking_material,
        content: NotificationContentEnum.new_booking_material(
          booking_land.land.name,
        ),
        user_id: booking_land.staff_id,
        component_id: new_booking_material.booking_material_id,
        type: NotificationType.booking_material,
      });

      const transaction = await this.transactionService.createTransaction(
        transactionData as CreateTransactionDTO,
      );
      return transaction;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * update booking material status
   * @function updateBookingMaterialStatus
   * @param booking_material_id
   */

  async updateBookingMaterialStatus(
    booking_material_id: string,
    data: UpdateBookingMaterialDTO,
    user: IUser,
  ): Promise<any> {
    try {
      // get booking material
      const booking_material = await this.bookingMaterialRepo.findOne({
        where: {
          booking_material_id,
        },
      });
      if (!booking_material) {
        throw new BadRequestException('Booking material not found');
      }
      // update to completed
      if (data.status === BookingMaterialStatus.completed) {
        // check pre condition to update status
        if (booking_material.status !== BookingMaterialStatus.pending_sign) {
          throw new BadRequestException('Booking material is not pending sign');
        }
        // check user is staff
        if (user.role !== UserRole.staff) {
          throw new BadRequestException('User is not staff');
        }
        // check data is valid
        if (!data.contract_image) {
          throw new BadRequestException('Contract image is required');
        }
        booking_material.status = BookingMaterialStatus.completed;
        booking_material.signed_at = new Date();
        booking_material.contract_image = data.contract_image;
        // Send noti to user
      }

      // update material
      await this.bookingMaterialRepo.save(booking_material);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * update booking material status
   * @function updateBookingMaterialStatus
   * @param booking_material_id
   */

  async handlePaymentBookingMaterial(transaction: Transaction): Promise<any> {
    try {
      // update booking material status
      const booking_material = await this.bookingMaterialRepo.findOne({
        where: {
          booking_material_id: transaction.booking_material_id,
        },
      });
      if (!booking_material) {
        throw new BadRequestException('Booking material not found');
      }
      // send noti to landrenter and staff
      await this.notificationService.createNotification({
        title: NotificationTitleEnum.booking_material_pending_sign,
        content: NotificationContentEnum.booking_material_pending_sign(
          booking_material.booking_land.land.name,
        ),
        user_id: booking_material.landrenter_id,
        component_id: booking_material.booking_material_id,
        type: NotificationType.booking_material,
      });
      // send noti to staff
      await this.notificationService.createNotification({
        title: NotificationTitleEnum.booking_material_pending_sign,
        content: NotificationContentEnum.booking_material_pending_sign(
          booking_material.booking_land.land.name,
        ),
        user_id: booking_material.staff_id,
        component_id: booking_material.booking_material_id,
        type: NotificationType.booking_material,
      });
      // update status
      booking_material.status = BookingMaterialStatus.pending_sign;
      return await this.bookingMaterialRepo.save({
        ...booking_material,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Get all booking material
   * @function getBookingMaterials
   * @param pagination
   * @param user
   */

  async getBookingMaterials(
    pagination: PaginationParams,
    status: BookingMaterialStatus,
    user: IUser,
  ): Promise<any> {
    try {
      // Filter condition
      const filter: any = {};
      // check role landrenter return by landrenter_id
      if (user.role === UserRole.land_renter) {
        filter.landrenter_id = user.user_id;
      }
      // check status
      if (status) {
        filter.status = status;
      }
      const [booking_materials, total_count] = await Promise.all([
        this.bookingMaterialRepo.find({
          where: filter,
          skip: (pagination.page_index - 1) * pagination.page_size,
          take: pagination.page_size,
          order: {
            updated_at: 'DESC',
          },
        }),
        this.bookingMaterialRepo.count({
          where: filter,
        }),
      ]);
      // get total page
      const total_page = Math.ceil(total_count / pagination.page_size);
      return {
        booking_materials,
        pagination: {
          ...pagination,
          total_page,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Cancel booking material call when transaction is expried
   * @function cancelBookingMaterial
   * @param booking_material_id
   */

  async cancelBookingMaterial(booking_material_id: string): Promise<any> {
    try {
      // get booking material
      const booking_material = await this.bookingMaterialRepo.findOne({
        where: {
          booking_material_id,
        },
        relations: {
          booking_material_detail: true,
          booking_land: {
            land: true,
          },
        },
      });
      // loop and delete booking material detail
      for (const item of booking_material.booking_material_detail) {
        await this.bookingMaterialDetailRepo.delete(
          item.booking_material_detail_id,
        );
      }
      // delete booking material
      await this.bookingMaterialRepo.delete(booking_material_id);
      // send noti to landrenter
      await this.notificationService.createNotification({
        title: NotificationTitleEnum.transaction_booking_material_expired,
        content: NotificationContentEnum.transaction_booking_material_expired(
          booking_material.booking_land.land.name,
        ),
        user_id: booking_material.landrenter_id,
        component_id: booking_material_id,
        type: NotificationType.booking_material,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
