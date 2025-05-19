import { SalesDomain } from 'src/shared/domain/sales.domain';

export class CreateWorkorderItemDto {
  workorder: number;
  itemType: 'PRODUCT' | 'SERVICE';
  itemId: string;
  unitPrice: number;
  unitDiscountedPrice?: number;
  discountApprovedBy?: string;
  quantity: number;
  promotionId?: number;
  total: number;
  itemComboId?: string;
  userAssigned?: string;
  itemStatus: string;
  businessLineId?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: any, workorderId: number) {
    this.workorder = workorderId;
    this.itemType = data.itemType;
    this.itemId = data.itemId;
    this.unitPrice = data.unitPrice;
    this.unitDiscountedPrice = data.unitDiscountedPrice || null;
    this.discountApprovedBy = data.discountApprovedBy || null;
    this.quantity = data.quantity;
    this.promotionId = data.promotion_id || null;
    this.total = data.unitPrice * data.quantity;
    this.itemComboId = data.itemComboId || null;
    this.businessLineId = data.businessLineId || null;
    this.userAssigned = null;
    this.itemStatus = SalesDomain.WORKORDERS_ITEMS_STATUS.PENDING;
    this.createdAt = data.created_at || new Date();
    this.updatedAt = data.updated_at || new Date();
  }
}
