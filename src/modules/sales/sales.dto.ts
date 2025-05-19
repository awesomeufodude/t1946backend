export class SalesDto {
  id: number | string;
  type: string;
  vehicle?: {
    id: string;
    plate: string;
    plateCountry: string;
    brand: {
      id: string | null;
      name: string | null;
      imgUrl: string | null;
    };
  } | null;
  createdAt: Date;

  constructor(data: any) {
    this.id = data.id;
    this.type = data.type;

    if (data.vehicle) {
      const brand = data.vehicle?.vehicleCatalog?.brand;

      this.vehicle = {
        id: data.vehicle.id,
        plate: data.vehicle.plate,
        plateCountry: data.vehicle.plateCountry,
        brand: {
          id: data.vehicle.vehicleCatalog?.id ?? null,
          name: brand?.name ?? null,
          imgUrl: brand?.imgUrl ?? null,
        },
      };
    } else {
      this.vehicle = null;
    }

    this.createdAt = new Date(data.createdAt);
  }
}
