export class CompanyBusinessDto {
  id: string;
  name: string;
  constructor(data: any) {
    this.id = data.id;
    this.name = data.company_business;
  }
}
