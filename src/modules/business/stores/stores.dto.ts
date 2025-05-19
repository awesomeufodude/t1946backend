export class ResponseUsersDto {
  id: number;
  rut: string;
  name: string;
  lastname: string;

  constructor(technician: any) {
    this.id = technician.id;
    this.rut = technician.rut;
    this.name = technician.name;
    this.lastname = technician.lastname;
  }
}

export class SchedulingBlockDto {
  id: string;
  hour: string;
  duration: string;
  status: string;
}

export class SchedulingBlocksResponseDto {
  blocks: SchedulingBlockDto[];
}
