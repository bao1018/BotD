import { Event, InitiatorType, Session, MessageType } from '../models/session'
import { Activity } from 'botbuilder';
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


    public static newSession(activity: Activity): Session {
        const session: Session = {
            id: activity.recipient.id,
            input: { type: MessageType.text, value: activity.text },
            output: {
                type: MessageType.text,
                value: ''
            },
            flow: null,
            eventHistory: []
        };
        this.addHistory(session, InitiatorType.user, MessageType.text, activity.text);
        return session;
    }

    public static updateSession(activity: Activity, session: Session): Session {
        session.input.type = MessageType.text;
        session.input.value = activity.text;
        this.addHistory(session, InitiatorType.user, MessageType.text, activity.text);
        return session;
    }
}

