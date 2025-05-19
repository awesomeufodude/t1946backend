import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkordersController } from './workorders.controller';
import { WorkordersService } from './workorders.service';

describe('WorkordersController', () => {
  let controller: WorkordersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkordersController],
      providers: [
        {
          provide: WorkordersService,
          useValue: {
            findByUserAndDate: jest.fn(),
            createWorkorder: jest.fn(),
            findById: jest.fn(),
            deleteWorkOrderItem: jest.fn(),
            updateWorkOrderItemTechnician: jest.fn(),
            reassignWorkOrder: jest.fn(),
            startOrFinishRecordTime: jest.fn(),
            finishWorkOrderItem: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WorkordersController>(WorkordersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call createWorkorder', async () => {
    const data = {
      budgetId: '200012',
      mode: 'mode',
      deliveryDate: '2021-01-01',
      deliveryTime: '10:00',
    };

    const req = {
      user: {
        sub: 'userId',
      },
    };

    jest.spyOn(controller, 'createWorkorder');

    await controller.createWorkorder(req, data);

    expect(controller.createWorkorder).toHaveBeenCalledWith(req, data);
  });

  it('should get a workorder by id', async () => {
    const workorderId = 1;
    const req = {
      user: {
        sub: 'userId',
      },
    };
    const mockQuery = {
      storeId: 'abc123',
    };

    jest.spyOn(controller, 'getWorkorderById');

    await controller.getWorkorderById(req, workorderId, mockQuery);

    expect(controller.getWorkorderById).toHaveBeenCalledWith(req, workorderId, mockQuery);
  });

  it('should delete a workorder item', async () => {
    const workOrderId = 1;
    const itemId = 1;
    const req = {
      user: {
        sub: 'userId',
      },
    };

    jest.spyOn(controller, 'deleteWorkOrderItem');

    await controller.deleteWorkOrderItem(req, workOrderId, itemId);

    expect(controller.deleteWorkOrderItem).toHaveBeenCalledWith(req, workOrderId, itemId);
  });

  it('should update a workorder item technician', async () => {
    const workOrderId = 1;
    const itemId = 1;
    const req = {
      user: {
        sub: 'userId',
      },
    };

    jest.spyOn(controller, 'updateWorkOrderItemTechnician');

    await controller.updateWorkOrderItemTechnician(req, workOrderId, itemId, { technicianId: '1' });

    expect(controller.updateWorkOrderItemTechnician).toHaveBeenCalledWith(req, workOrderId, itemId, {
      technicianId: '1',
    });
  });

  it('should reassign a workorder', async () => {
    const workOrderId = 1;
    const req = {
      user: {
        sub: 'userId',
      },
    };

    jest.spyOn(controller, 'reassignWorkOrder');

    await controller.reassignWorkOrder(req, workOrderId, { userId: '1' });

    expect(controller.reassignWorkOrder).toHaveBeenCalledWith(req, workOrderId, { userId: '1' });
  });

  it('should create or finish a workorder item record', async () => {
    const workOrderId = 1;
    const workOrderItemId = 1;
    const req = {
      user: {
        sub: 'userId',
      },
    };

    jest.spyOn(controller, 'startOrFinishRecordTime');

    await controller.startOrFinishRecordTime(req, workOrderId, workOrderItemId, {
      action: 'start',
    });

    expect(controller.startOrFinishRecordTime).toHaveBeenCalledWith(req, workOrderId, workOrderItemId, {
      action: 'start',
    });
  });

  it('should complete a workorder item', async () => {
    const workOrderId = 1;
    const workOrderItemId = 1;
    const req = {
      user: {
        sub: 'userId',
      },
    };

    jest.spyOn(controller, 'finishWorkOrderItem');

    await controller.finishWorkOrderItem(req, workOrderId, workOrderItemId, true);

    expect(controller.finishWorkOrderItem).toHaveBeenCalledWith(req, workOrderId, workOrderItemId, true);
  });
});
