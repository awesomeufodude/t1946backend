import { appConstants } from 'src/config/app.constants';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { SeederOptions } from 'typeorm-extension';
import InitSeeder from '../seeds/init.seeder';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentStatus } from '../entities/appointment-status.entity';
import { AppointmentTimeslot } from '../entities/appointment-timeslot.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditEventType } from '../entities/audit-event-type.entity';
import { Brand } from '../entities/brand.entity';
import { Budget } from '../entities/budget.entity';
import { BudgetGroup } from '../entities/budget-group.entity';
import { BudgetItem } from '../entities/budget-item.entity';
import { BudgetStatus } from '../entities/budget-status.entity';
import { BusinessLine } from '../entities/business-line.entity';
import { CatalogVehicle } from '../entities/catalog-vehicle.entity';
import { CatalogVehicleBrand } from '../entities/catalog-vehicle-brand.entity';
import { CatalogVehicleModel } from '../entities/catalog-vehicle-model.entity';
import { CatalogVehicleVersion } from '../entities/catalog-vehicle-version.entity';
import { Combo } from '../entities/combo.entity';
import { ComboItem } from '../entities/combo-item.entity';
import { ComboItemPrice } from '../entities/combo-item-price.entity';
import { ConsultationChannel } from '../entities/consultation-channel.entity';
import { CompanyBusiness } from '../entities/company-business.entity';
import { Customer } from '../entities/customer.entity';
import { CustomerOption } from '../entities/customer-option.entity';
import { CustomerPeople } from '../entities/customer-people.entity';
import { CustomerCategory } from '../entities/customer-category.entity';
import { CustomerCompany } from '../entities/customer-company.entity';
import { Lead } from '../entities/lead.entity';
import { PasscodeCredential } from '../entities/passcode-credential.entity';
import { Permission } from '../entities/permission.entity';
import { Product } from '../entities/product.entity';
import { ProductTire } from '../entities/product-tire.entity';
import { ProductStock } from '../entities/product-stock.entity';
import { ProductPrice } from '../entities/product-price.entity';
import { Role } from '../entities/role.entity';
import { Service } from '../entities/service.entity';
import { ServicePrice } from '../entities/service-price.entity';
import { Store } from '../entities/store.entity';
import { SystemParameter } from '../entities/system-parameter.entity';
import { User } from '../entities/user.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { Currency } from '../entities/currency.entity';
import { Workorder } from '../entities/workorder.entity';
import { WorkorderStatus } from '../entities/workorder-status.entity';
import { LaborTime } from '../entities/labor-time.entity';
import { Note } from '../entities/note.entity';
import { WorkorderItem } from '../entities/workorder-items.entity';
import { WorkorderItemStatus } from '../entities/workorder-item-statuses.entity';
import { WorkorderItemRecord } from '../entities/workorder-item-records.entity';
import { VehiclesCustomer } from '../entities/vehicle-customer.entity';
import { ServiceItems } from '../entities/service-items ';
import { ServiceItemsStatuses } from '../entities/service-items-statuses';
import { BudgetServicesItems } from '../entities/budget-services-items ';
import { WorkorderServicesItems } from '../entities/workorder-services-items';
import { SearchCriteria } from '../entities/search-criteria';
import { SearchHistory } from '../entities/search-history';
import { Channel } from '../entities/channel.entity';
import { Module } from '../entities/module.entity';
import { Module1744063139071 } from '../migrations/1744063139071-Module';
import { Permission1744063508468 } from '../migrations/1744063508468-Permission';
import { Role1744117377484 } from '../migrations/1744117377484-Role';
import { BusinessLine1744124591020 } from '../migrations/1744124591020-BusinessLine';
import { Product1744124607340 } from '../migrations/1744124607340-Product';
import { Store1744124621207 } from '../migrations/1744124621207-Store';
import { User1744124624973 } from '../migrations/1744124624973-User';
import { ProductStock1744124973516 } from '../migrations/1744124973516-ProductStock';
import { PasscodeCredential1744125891649 } from '../migrations/1744125891649-PasscodeCredential';
import { CatalogVehicle1744125280382 } from '../migrations/1744125280382-CatalogVehicle';
import { CatalogVehicleBrand1744125279353 } from '../migrations/1744125279353-CatalogVehicleBrand';
import { CatalogVehicleModel1744125279866 } from '../migrations/1744125279866-CatalogVehicleModel';
import { CatalogVehicleVersion1744125280381 } from '../migrations/1744125280381-CatalogVehicleVersion';
import { AppointmentStatus1744130169519 } from '../migrations/1744130169519-AppointmentStatus';
import { AppointmentTimeslot1744130170004 } from '../migrations/1744130170004-AppointmentTimeslot';
import { AuditLog1744130170527 } from '../migrations/1744130170527-AuditLog';
import { AuditEventType1744130170526 } from '../migrations/1744130170526-AuditEventType';
import { SystemParameter1744130181159 } from '../migrations/1744130181159-SystemParameter';
import { Service1744130180803 } from '../migrations/1744130180803-Service';
import { ServicePrice1744130180804 } from '../migrations/1744130180804-ServicePrice';
import { Combo1744130180805 } from '../migrations/1744130180805-Combo';
import { ComboItem1744130180806 } from '../migrations/1744130180806-ComboItem';
import { ComboItemPrice1744130180807 } from '../migrations/1744130180807-ComboItemPrice';
import { ConsultationChannel1744130176017 } from '../migrations/1744130176017-ConsultationChannel';
import { CompanyBusiness1744130176509 } from '../migrations/1744130176509-CompanyBusiness';
import { Customer1744130176989 } from '../migrations/1744130176989-Customer';
import { CustomerCategory1744130177488 } from '../migrations/1744130177488-CustomerCategory';
import { CustomerOption1744130177487 } from '../migrations/1744130177487-CustomerOption';
import { CustomerPeople1744130178016 } from '../migrations/1744130178016-CustomerPeople';
import { CustomerCompany1744130179017 } from '../migrations/1744130179017-CustomerCompany';
import { Lead1744130179496 } from '../migrations/1744130179496-Lead';
import { ServiceItems1744130186512 } from '../migrations/1744130186512-ServiceItems';
import { ServiceItemsStatuses1744130186986 } from '../migrations/1744130186986-ServiceItemsStatuses';
import { Brand1744130171662 } from '../migrations/1744130171662-Brand';
import { Budget1744130179499 } from '../migrations/1744130179499-Budget';
import { BudgetGroup1744130179498 } from '../migrations/1744130179498-BudgetGroup';
import { BudgetItem1744130179500 } from '../migrations/1744130179500-BudgetItem';
import { BudgetServicesItems1744130187472 } from '../migrations/1744130187472-BudgetServicesItems';
import { Appointment1744130179501 } from '../migrations/1744130179501-Appointment';
import { Vehicle1744125280383 } from '../migrations/1744125280383-Vehicle';
import { Channel1744130171660 } from '../migrations/1744130171660-Channel';
import { BudgetStatus1744130179497 } from '../migrations/1744130179497-BudgetStatus';
import { Currency1744130182219 } from '../migrations/1744130182219-Currency';
import { SearchCriteria1744130188450 } from '../migrations/1744130188450-SearchCriteria';
import { ProductTire1744130180115 } from '../migrations/1744130180115-ProductTire';
import { ProductPrice1744130180769 } from '../migrations/1744130180769-ProductPrice';
import { LaborTime1744130183657 } from '../migrations/1744130183657-LaborTime';
import { Workorder1744130182694 } from '../migrations/1744130182694-Workorder';
import { SearchHistory1744130188932 } from '../migrations/1744130188932-SearchHistory';
import { Note1744130184135 } from '../migrations/1744130184135-Note';
import { WorkorderItem1744130184605 } from '../migrations/1744130184605-WorkorderItem';
import { WorkorderItemRecord1744130185560 } from '../migrations/1744130185560-WorkorderItemRecord';
import { VehiclesCustomer1744130186043 } from '../migrations/1744130186043-VehiclesCustomer';
import { WorkorderServicesItems1744130187953 } from '../migrations/1744130187953-WorkorderServicesItems';
import { WorkorderStatus1744130182693 } from '../migrations/1744130182693-WorkorderStatus';
import { WorkorderItemStatus1744130184604 } from '../migrations/1744130184604-WorkorderItemStatus';
import { MakeCustomerCompanyCustomerIdNullable1744296385385 } from '../migrations/1744296385385-MakeCustomerCompanyCustomerIdNullable';
import { AddServiceItemToNotes1744299412496 } from '../migrations/1744299412496-AddServiceItemToNotes';
import { NoteFile1744317020912 } from '../migrations/1744317020912-NoteFile';
import { NoteFile } from '../entities/note-file.entity';
import { AddImageFieldToService1745870282790 } from '../migrations/1745870282790-AddImageFieldToService';
import { AddPersonToCustomerTypeEnum1745876920612 } from '../migrations/1745876920612-AddPersonToCustomerTypeEnum';

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  database: appConstants.DB_DATABASE_NAME,
  host: appConstants.DB_HOST,
  port: appConstants.DB_PORT,
  username: appConstants.DB_USERNAME,
  password: appConstants.DB_PASSWORD,
  synchronize: false,
  logging: false || appConstants.DB_LOGGING === 'true',
  namingStrategy: new SnakeNamingStrategy(),
  entities: [
    Appointment,
    AppointmentStatus,
    AppointmentTimeslot,
    AuditLog,
    AuditEventType,
    Brand,
    Budget,
    BudgetGroup,
    BudgetItem,
    BudgetStatus,
    BusinessLine,
    CatalogVehicle,
    CatalogVehicleBrand,
    CatalogVehicleModel,
    CatalogVehicleVersion,
    Channel,
    Combo,
    ComboItem,
    ComboItemPrice,
    ConsultationChannel,
    CompanyBusiness,
    Customer,
    CustomerOption,
    CustomerPeople,
    CustomerCategory,
    CustomerCompany,
    Lead,
    Module,
    PasscodeCredential,
    Permission,
    Product,
    ProductTire,
    ProductStock,
    ProductPrice,
    Role,
    Service,
    ServicePrice,
    Store,
    SystemParameter,
    User,
    Vehicle,
    Currency,
    Workorder,
    WorkorderStatus,
    LaborTime,
    Note,
    WorkorderItem,
    WorkorderItemStatus,
    WorkorderItemRecord,
    VehiclesCustomer,
    ServiceItems,
    ServiceItemsStatuses,
    BudgetServicesItems,
    WorkorderServicesItems,
    SearchCriteria,
    SearchHistory,
    NoteFile,
  ],
  migrationsTableName: 'migrations',
  migrations: [
    Module1744063139071,
    Permission1744063508468,
    Role1744117377484,
    BusinessLine1744124591020,
    Product1744124607340,
    Store1744124621207,
    User1744124624973,
    ProductStock1744124973516,
    PasscodeCredential1744125891649,
    CatalogVehicleBrand1744125279353,
    CatalogVehicleModel1744125279866,
    CatalogVehicleVersion1744125280381,
    CatalogVehicle1744125280382,
    AppointmentStatus1744130169519,
    AppointmentTimeslot1744130170004,
    AuditEventType1744130170526,
    AuditLog1744130170527,
    SystemParameter1744130181159,
    Service1744130180803,
    ServicePrice1744130180804,
    Combo1744130180805,
    ComboItem1744130180806,
    ComboItemPrice1744130180807,
    Channel1744130171660,
    ConsultationChannel1744130176017,
    CompanyBusiness1744130176509,
    Customer1744130176989,
    CustomerOption1744130177487,
    CustomerCategory1744130177488,
    CustomerPeople1744130178016,
    CustomerCompany1744130179017,
    Lead1744130179496,
    Vehicle1744125280383,
    ServiceItems1744130186512,
    ServiceItemsStatuses1744130186986,
    Brand1744130171662,
    BudgetStatus1744130179497,
    BudgetGroup1744130179498,
    Budget1744130179499,
    BudgetItem1744130179500,
    BudgetServicesItems1744130187472,
    Appointment1744130179501,
    Currency1744130182219,
    WorkorderStatus1744130182693,
    WorkorderItemStatus1744130184604,
    SearchCriteria1744130188450,
    ProductTire1744130180115,
    ProductPrice1744130180769,
    LaborTime1744130183657,
    Workorder1744130182694,
    SearchHistory1744130188932,
    Note1744130184135,
    WorkorderItem1744130184605,
    WorkorderItemRecord1744130185560,
    VehiclesCustomer1744130186043,
    WorkorderServicesItems1744130187953,
    MakeCustomerCompanyCustomerIdNullable1744296385385,
    AddServiceItemToNotes1744299412496,
    NoteFile1744317020912,
    AddImageFieldToService1745870282790,
    AddPersonToCustomerTypeEnum1745876920612,
  ],
  seeds: [InitSeeder],
  seedTracking: false,
};

export default new DataSource(options);
