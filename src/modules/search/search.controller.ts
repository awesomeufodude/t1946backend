import { Controller, Get, Query, Request, ValidationPipe } from '@nestjs/common';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import { GetSearchResultsDto } from './search.dto';
import { SearchService } from './search.service';

@Controller('search/v1')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async searchCustomerAndVehicles(@Request() req, @Query(new ValidationPipe()) query: GetSearchResultsDto) {
    const data = await this.searchService.searchCustomersAndVehicles(query.keywords);
    return new SuccessResponseDto(data);
  }
}
