import { ParameterType } from 'src/infrastructure/database/entities/system-parameter.entity';
import { UserDto } from 'src/modules/admin/users/users.dto';

export namespace AppDomain {
  export enum Channels {
    WEB = 'WEB',
    TMK = 'TMK',
    STORE = 'STORE',
  }

  export enum BUSINESS_LINES {
    TIRE = 1,
    BATTERY = 2,
  }

  export enum CUSTOMER_TYPES {
    CUSTOMER = 'customer',
    LEAD = 'lead',
    COMPANY = 'company',
  }

  export enum RECORD_TIME_TYPES {
    START = 'start',
    FINISHI = 'finish',
    PAUSE = 'pause',
  }

  export enum Roles {
    ADMIN = 'Administrador',
    JEFE_DE_SERVICIO = 'Jefe de Servicio',
    MAESTRO = 'Maestro',
    MAESTRO_ALINEADOR = 'Maestro Alineador',
  }

  export const TECHNICIANS = [Roles.MAESTRO, Roles.MAESTRO_ALINEADOR];

  export const SCHEDULING_BLOCK_STATUS = {
    AVAILABLE: 'AVAILABLE',
    SCHEDULED: 'SCHEDULED',
  };

  export enum Currencies {
    CLP = 152,
  }

  export enum Modules {
    ADMINISTRATION = 'ADMINISTRATION',
    OPERATIONAL = 'OPERATIONAL',
    REPORTS = 'REPORTS',
  }

  export enum Permissions {
    VIEW_SECTION_ADMINISTRATION = 'VIEW_SECTION_ADMINISTRATION',
    LIST_USERS = 'LIST_USERS',
    ACCESS_MODULE_OPERATIONAL = 'ACCESS_MODULE_OPERATIONAL',
    VIEW_SECTION_SALES = 'VIEW_SECTION_SALES',
    VIEW_SECTION_HOME = 'VIEW_SECTION_HOME',
    VIEW_SECTION_REPORT_CENTRALIZATION = 'VIEW_SECTION_REPORT_CENTRALIZATION',
    VIEW_TABLE_CONVERSATIONS = 'VIEW_TABLE_CONVERSATIONS',
    VIEW_TABLE_BUDGETS = 'VIEW_TABLE_BUDGETS',
    VIEW_TABLE_APPOINTMENTS = 'VIEW_TABLE_APPOINTMENTS',
    VIEW_TABLE_WORKORDERS = 'VIEW_TABLE_WORKORDERS',
    VIEW_TABLE_REASSIGNED_WORKORDERS = 'VIEW_TABLE_REASSIGNED_WORKORDERS',
    UPDATE_APPOINTMENT_STATUS = 'UPDATE_APPOINTMENT_STATUS',
    CREATE_BUDGETS = 'CREATE_BUDGETS',
    UPDATE_BUDGET_ITEM = 'UPDATE_BUDGET_ITEM',
    DELETE_BUDGET_ITEM = 'DELETE_BUDGET_ITEM',
    CHANGE_BUDGET_ITEM = 'CHANGE_BUDGET_ITEM',
    CREATE_NOTE = 'CREATE_NOTE',
    CREATE_APPOINTMENT = 'CREATE_APPOINTMENT',
    UPDATE_APPOINTMENT = 'UPDATE_APPOINTMENT',
    SENT_BUDGET = 'SENT_BUDGET',
    DELETE_WORKORDER_ITEM = 'DELETE_WORKORDER_ITEM',
    UPDATE_WORKORDER_ITEM = 'UPDATE_WORKORDER_ITEM',
    REASSIGN_WORK_ORDER = 'REASSIGN_WORK_ORDER',
    VIEW_ASSIGNED_WORKORDERS = 'VIEW_ASSIGNED_WORKORDERS',
    SEARCH_GENERAL = 'SEARCH_GENERAL',
    EDIT_SUB_HEADER = 'EDIT_SUB_HEADER',
    UPDATE_CURRENT_STORE = 'UPDATE_CURRENT_STORE',
    ACCESS_MODULE_REPORTS = 'ACCESS_MODULE_REPORTS',
    DELETE_BUDGET = 'DELETE_BUDGET',
    VIEW_MENU = 'VIEW_MENU',
    VIEW_SECURITY_REVIEW = 'VIEW_SECURITY_REVIEW',
    DELETE_FILE_NOTE = 'DELETE_FILE_NOTE',
    ADD_FILE_TO_NOTE = 'ADD_FILE_TO_NOTE',
  }

  export enum Scopes {
    TOUCH = 'TOUCH',
    SYSTEM = 'SYSTEM',
  }

  export enum PriceFields {
    STORE = 'price_store',
    WEB = 'price_web',
    TMK = 'price_tmk',
  }

  export const SYSTEM_PARAMETERS = {
    CONVERSATION_EXPIRATION_TIME: {
      name: 'conversation_expiration_time',
      type: ParameterType.NUMERIC,
    },
    BUDGET_EXPIRATION_TIME: {
      name: 'budget_expiration_time',
      type: ParameterType.NUMERIC,
    },
  };

  export interface TokenPayload {
    sub: string;
    role: string;
    scope: string;
  }
  export interface Session {
    accessToken: string;
    user: UserDto;
  }
}
