import { Event, InitiatorType, Session, MessageType } from '../models/session'

export class SessionUtil {

    public static addHistory(session: Session, initiatorType: InitiatorType, messageType: MessageType, value: string) {
        const event: Event = {
            initiator: initiatorType,
            type: messageType,
            value: value,
            timestamp: new Date()
        }
        session.eventHistory.push(event);
    }


    public static newSession(context): Session {
        const session: Session = {
            id: context.activity.recipient.id,
            input: { type: MessageType.text, value: context.activity.text },
            output: {
                type: MessageType.text,
                value: ''
            },
            flow: null,
            eventHistory: []
        };
        this.addHistory(session, InitiatorType.user, MessageType.text, context.activity.tex);
        return session;
    }
}