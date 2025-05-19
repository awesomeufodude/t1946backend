import { Test, TestingModule } from '@nestjs/testing';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import { SearchController } from './search.controller';
import { ResponseSearchDto } from './search.dto';
import { SearchService } from './search.service';

const mockSearchService = {
  searchCustomersAndVehicles: jest.fn(),
};

describe('SearchController', () => {
  let controller: SearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SearchService, useValue: mockSearchService }],
    }).compile();

    controller = module.get<SearchController>(SearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a SuccessResponseDto with correct data', async () => {
    const mockResponseData = new ResponseSearchDto([], [], [], []);
    const mockKeywords = 'John';

    mockSearchService.searchCustomersAndVehicles.mockResolvedValue(mockResponseData);

    const result = await controller.searchCustomerAndVehicles(
      { query: { keywords: mockKeywords } },
      { keywords: mockKeywords },
    );

    expect(result).toBeInstanceOf(SuccessResponseDto);
    expect(result.data).toEqual(mockResponseData);
    expect(mockSearchService.searchCustomersAndVehicles).toHaveBeenCalledWith(mockKeywords);
  });
});
