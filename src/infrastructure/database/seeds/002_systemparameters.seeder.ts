import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { AuditEventType } from '../entities/audit-event-type.entity';
import { Channel } from '../entities/channel.entity';
import { ConsultationChannel } from '../entities/consultation-channel.entity';
import { SystemParameter } from '../entities/system-parameter.entity';
import { SecurityDomain } from 'src/shared/domain/security.domain';
import { AppDomain } from 'src/shared/domain/app.domain';

export class SystemParameterSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const auditEventRepository = dataSource.getRepository(AuditEventType);
    const channelRepository = dataSource.getRepository(Channel);
    const consultationChannelRepository = dataSource.getRepository(ConsultationChannel);
    const systemParameterRepository = dataSource.getRepository(SystemParameter);

    const auditEventTypes = await this.loadAuditEventType();
    await auditEventRepository.upsert(auditEventTypes, ['code']);

    // Load channels
    const channels = await this.loadChannels();
    await channelRepository.upsert(channels, ['code']);

    // Load consultation channels
    const consultationChannels = await this.loadConsultationChannels();
    await consultationChannelRepository.upsert(consultationChannels, ['id']);

    // Load system parameters
    const systemParameters = await this.loadSystemParemeters();
    await systemParameterRepository.upsert(systemParameters, ['parameterName']);
  }

  private async loadAuditEventType(): Promise<AuditEventType[]> {
    const auditEventTypes = [];

    const eventTypes = [
      {
        code: SecurityDomain.AUDIT_EVENT_CODES.LOGIN,
        description: 'Se registra cuando un usuario se autentica en el sistema.',
      },
      {
        code: SecurityDomain.AUDIT_EVENT_CODES.LIST_USERS,
        description: 'Se registra cuando se solicita la lista de usuarios del sistema.',
      },
    ];

    eventTypes.map((eventType) => {
      const auditEventType = new AuditEventType();
      auditEventType.code = eventType.code;
      auditEventType.description = eventType.description;
      auditEventTypes.push(auditEventType);
    });

    return auditEventTypes;
  }

  private async loadChannels(): Promise<Channel[]> {
    const channels = [];
    const channelsData = [
      { code: AppDomain.Channels.STORE, name: 'Local' },
      { code: AppDomain.Channels.WEB, name: 'Web' },
      { code: AppDomain.Channels.TMK, name: 'Telemarketing' },
    ];

    channelsData.map((data) => {
      const channel = new Channel();
      channel.code = data.code;
      channel.name = data.name;
      channels.push(channel);
    });

    return channels;
  }

  private async loadSystemParemeters(): Promise<SystemParameter[]> {
    const systemParameters = [];
    const parametersData = [
      {
        data: AppDomain.SYSTEM_PARAMETERS.CONVERSATION_EXPIRATION_TIME,
        value: '8',
      },
      {
        data: AppDomain.SYSTEM_PARAMETERS.BUDGET_EXPIRATION_TIME,
        value: '8',
      },
    ];

    parametersData.forEach((parameter) => {
      const newParameter = new SystemParameter();
      newParameter.parameterName = parameter.data.name;
      newParameter.parameterType = parameter.data.type;
      newParameter.parameterValue = parameter.value;
      systemParameters.push(newParameter);
    });
    return systemParameters;
  }

  private async loadConsultationChannels() {
    const consultationChannelDb = [];
    const consultationChannels = [
      { id: 'f9130d7b-23c3-464c-a565-071be0da31af', name: 'Correo' },
      { id: '4db7bdbf-4852-43c6-a3b8-1050d442ff95', name: 'Llamada' },
      { id: '1df7ef47-ef97-4b18-9fb9-3a2b91633b23', name: 'WhatsApp' },
    ];

    consultationChannels.map((data) => {
      const consultationChannelEntity = new ConsultationChannel();
      consultationChannelEntity.id = data.id;
      consultationChannelEntity.name = data.name;
      consultationChannelDb.push(consultationChannelEntity);
    });

    return consultationChannelDb;
  }
}
