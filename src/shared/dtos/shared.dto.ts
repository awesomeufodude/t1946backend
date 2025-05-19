export class SuccessResponseDto<T> {
  constructor(data: T) {
    this.message = 'OK';
    this.data = data;
  }

  message: string;
  data: T;
}

export class SuccessDeleteReponseDto {
  constructor() {
    this.message = 'OK';
  }

  message: string;
}
