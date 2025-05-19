import { Budget } from 'src/infrastructure/database/entities/budget.entity';
import { Channel } from 'src/infrastructure/database/entities/channel.entity';
import { ConsultationChannel } from 'src/infrastructure/database/entities/consultation-channel.entity';
import { Customer } from 'src/infrastructure/database/entities/customer.entity';
import { Workorder } from 'src/infrastructure/database/entities/workorder.entity';
import { SalesDomain } from 'src/shared/domain/sales.domain';
import { CoreDtos } from 'src/shared/dtos/core.dto';

export class ResponseWorkorderDto {
  id: number;
  createdBy: CoreDtos.UserDto;
  channel: Channel;
  customer: Customer;
  vehicle: CoreDtos.VehicleDto;
  budget: Budget;
  consultationChannel: ConsultationChannel;
  deliveryTime: Date;
  deliveryMode: string;
  reassigned: boolean;
  reassignedTo: CoreDtos.UserDto | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  subTotal: number;
  total: number;
  odometer: number;
  workOrderItems: WorkOrderItemDto[];
  workOrderItemRecords: any[];

  constructor(workorder: Workorder) {
    this.id = workorder.id;
    this.createdBy = new CoreDtos.UserDto(workorder.createdBy);
    this.channel = workorder.channel;
    this.customer = workorder.customer;
    this.vehicle = new CoreDtos.VehicleDto(workorder.vehicle);
    this.budget = workorder.budget;
    this.consultationChannel = workorder.consultationChannel;
    this.deliveryTime = workorder.deliveryTime;
    this.deliveryMode = workorder.deliveryMode;
    this.reassigned = workorder.reassigned;
    this.reassignedTo = workorder.reassignedTo
      ? {
          id: workorder.reassignedTo?.id,
          rut: workorder.reassignedTo?.rut,
          name: workorder.reassignedTo?.name,
          lastname: workorder.reassignedTo?.lastname,
        }
      : null;
    this.subTotal = workorder.subTotal;
    this.total = workorder.total;
    this.odometer = workorder.odometer;
    this.workOrderItems = workorder.workOrderItems.map((item) => new WorkOrderItemDto(item));
    this.workOrderItemRecords = workorder.workorderItemRecords;
    this.status = workorder.status.code;
    this.createdAt = workorder.createdAt;
    this.updatedAt = workorder.updatedAt;
  }
}

class WorkOrderItemDto {
  id: number;
  itemType: string;
  itemTypeId: string;
  itemId: string;
  userAssigned: CoreDtos.UserDto | null;
  unitDiscountedPrice: number;
  discountApprovedBy: string;
  quantity: number;
  unitPrice: number;
  total: number;
  itemComboId: string;
  sortOrder?: number;
  businessLine?: {
    id: number;
    description: string;
  };
  data: CoreDtos.ItemDataDto | null;
  status: string;
  workOrderItemRecords: any[];
  workorderServicesItems?: any[];
  createdAt: Date;
  updatedAt: Date;

  constructor(workOrderItem: any) {
    this.id = workOrderItem.id;
    this.itemType = workOrderItem.itemType;
    this.itemTypeId = workOrderItem.itemTypeId;
    this.itemId = workOrderItem.itemId;
    this.quantity = workOrderItem.quantity;
    this.unitPrice = workOrderItem.unitPrice;
    this.itemComboId = workOrderItem.itemComboId;
    this.sortOrder = workOrderItem.data?.sortOrder;
    if (workOrderItem.itemType === SalesDomain.ItemType.PRODUCT && workOrderItem.data) {
      const { businessLine } = workOrderItem.data;
      if (businessLine) {
        this.businessLine = new BusinessLineDto(businessLine);
      }
    }
    this.discountApprovedBy = workOrderItem.discountApprovedBy;
    this.total = workOrderItem.total;
    this.unitDiscountedPrice = workOrderItem.unitDiscountedPrice;
    this.status = workOrderItem.itemStatus.code;
    this.data = workOrderItem.data ? new CoreDtos.ItemDataDto(workOrderItem.data, workOrderItem.itemType) : null;
    this.userAssigned = workOrderItem.userAssigned
      ? {
          id: workOrderItem.userAssigned.id,
          rut: workOrderItem.userAssigned.rut,
          name: workOrderItem.userAssigned.name,
          lastname: workOrderItem.userAssigned.lastname,
        }
      : null;
    this.workOrderItemRecords = workOrderItem.workorderItemRecords;
    this.workorderServicesItems = (workOrderItem.workorderServicesItems ?? []).map(
      (item) => new WorkOrderItemService(item),
    );

    this.createdAt = workOrderItem.createdAt;
    this.updatedAt = workOrderItem.updatedAt;
  }
}

export class WorkOrderItemService {
  id: number;
  statusCode: string;
  statusDescription: string;
  assignedUser: CoreDtos.UserDto;
  serviceItem: {
    id: number;
    name: string;
    description: string;
    image: string;
    serviceCode: string;
    order: number;
    code: string;
  };
  constructor(item: any) {
    console.log(item);
    this.id = item.id;
    this.statusCode = item.status.code;
    this.statusDescription = item.status.description;
    this.assignedUser = new CoreDtos.UserDto(item.assignedUser || {});
    this.serviceItem = {
      id: item.serviceItem.id,
      name: item.serviceItem.name,
      description: item.serviceItem.description,
      image: item.serviceItem.image,
      serviceCode: item.serviceItem.serviceCode,
      order: item.serviceItem.order,
      code: item.serviceItem.code,
    };
  }
}

export class BusinessLineDto {
  id: number;
  name: string;
  description: string;

  constructor(businessLine: any) {
    this.id = businessLine.id;
    this.description = businessLine.description;
    this.name = businessLine.name;
  }
}
