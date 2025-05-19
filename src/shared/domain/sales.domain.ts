import { AppDomain } from './app.domain';

export namespace SalesDomain {
  export enum ItemType {
    PRODUCT = 'PRODUCT',
    SERVICE = 'SERVICE',
  }

  interface PriceObject {
    priceWeb: number;
    priceStore: number;
    priceTmk: number;
  }

  export const WORKORDERS_STATUS = {
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    AWAITING_PAYMENT: 'AWAITING_PAYMENT',
    ABORTED: 'ABORTED',
    HISTORICAL: 'HISTORICAL',
  };

  export const BUDGET_STATUS = {
    CREATING: 'CREATING',
    SENT: 'SENT',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED',
    APPROVED: 'APPROVED',
  };

  export const APPOINTMENT_STATUS = {
    SCHEDULED: 'SCHEDULED',
    CONFIRMED_LEON: 'CONFIRMED_LEON',
    CONFIRMED_CLIENT: 'CONFIRMED_CLIENT',
    CANCELLED: 'CANCELLED',
    RESCHEDULED: 'RESCHEDULED',
    EXPIRED: 'EXPIRED',
    COMPLETED: 'COMPLETED',
  };

  export const WORKORDERS_ITEMS_STATUS = {
    PENDING: 'PENDING',
    ASSIGNED: 'ASSIGNED',
    COMPLETED: 'COMPLETED',
    IN_PROGRESS: 'IN_PROGRESS',
    PAUSED: 'PAUSED',
  };

  export const SERVICE_ITEM_STATUS = {
    OK: 'OK',
    PREVENTIVE: 'PREV',
    REPAIR: 'CORR',
    PENDING: 'PEND',
  };

  export const SEARCH_CRITERIA = {
    SEARCH_BY_MEASURE: 'MEASURE',
    SEARCH_BY_VEHICLE: 'VEHICLE',
  };

  export function getPriceForChannel(priceObject: PriceObject, channel: string): number {
    let price = 0;
    switch (channel) {
      case AppDomain.Channels.WEB:
        price = priceObject.priceWeb;
        break;
      case AppDomain.Channels.STORE:
        price = priceObject.priceStore;
        break;
      case AppDomain.Channels.TMK:
        price = priceObject.priceTmk;
        break;
      default:
        price = priceObject.priceStore;
        break;
    }
    return Number(price);
  }
}
