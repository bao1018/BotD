import { InitiatorType, Session, MessageType } from '../models/session'
import { BaseService } from './baseService'

export class FlowService extends BaseService{
    public async process(session: Session): Promise<void> {
        session.output.type = MessageType.text
        session.output.value = `Flow: ${session.input.value}`;
        super.addHistory(session, InitiatorType.bot, session.output.type, session.output.value)
    }

}