import { MessageFactory, TurnContext } from 'botbuilder';
const redis = require("redis");
const inboundPublisher = redis.createClient();
import { SessionUtil } from './sessionUtil';

export class InboundUtil {

    public static handleNewInputActivity(context: TurnContext) {
        this.setConversationRef(context);
        this.sendToWorker(context);
    }

    public static async handleNewMemberActivity(context: TurnContext) {
        const membersAdded = context.activity.membersAdded;
        const welcomeText = 'Hello and welcome!';
        const optionText = `Type below options to go through the demo:\n\n
        A: Adaptive Card Demo\n
        B: Flow Demo\n
        Others: Echo Message Demo
        `;
        for (const member of membersAdded) {
            if (member.id !== context.activity.recipient.id) {
                await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                await context.sendActivity(MessageFactory.text(optionText, optionText));
            }
        }

    }

    private static setConversationRef(context) {
        const conversationReference = TurnContext.getConversationReference(context.activity);
        inboundPublisher.set(`conversationRef-${context.activity.recipient.id}`, JSON.stringify(conversationReference));
    }

    private static sendToWorker(context) {
        const session = SessionUtil.newSession(context);
        inboundPublisher.publish("inbound", JSON.stringify(session));
    }
}