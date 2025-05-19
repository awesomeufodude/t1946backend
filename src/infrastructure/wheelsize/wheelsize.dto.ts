export class BrandDTO {
  id: string;
  name: string;
  logo: string;
  codeWs: string;
  imgUrl: string;

  constructor(brand: { slug: string; name: string; logo: string; codeWs: string }) {
    this.id = brand.name.toLowerCase();
    this.name = brand.name;
    this.codeWs = brand.slug;
    this.imgUrl = brand.logo;
  }
}

export class ModelDTO {
  id: string;
  name: string;
  codeWs: string;

  constructor(model: { slug: string; name: string; codeWs: string }) {
    this.id = model.slug;
    this.name = model.name;
    this.codeWs = model.slug;
  }
}

export class YearDTO {
  id: number;

  constructor(year: { slug: number }) {
    this.id = year.slug;
  }
}

export class VersionDTO {
  id: string;
  name: string;
  codeWs: string;
  imgUrl: string;

  constructor(version: { slug: string; name: string; codeWs: string; generation: any }) {
    this.id = version.slug;
    this.name = version.name;
    this.codeWs = version.slug;
    this.imgUrl = version.generation?.bodies?.length ? version.generation.bodies[0].image : '';
  }
}
