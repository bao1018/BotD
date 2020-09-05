import { MessageFactory, TurnContext } from 'botbuilder';
const redis = require("redis");
const inboundPublisher = redis.createClient();

export class InboundUtil {

    public static handleNewInputActivity(context: TurnContext) {
        this.setConversationRef(context);
        this.sendToWorker(context);
    }

    public static async handleNewMemberActivity(context: TurnContext) {
        const membersAdded = context.activity.membersAdded;
        const welcomeText = 'Hello and welcome!';
        for (const member of membersAdded) {
            if (member.id !== context.activity.recipient.id) {
                await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
            }
        }

    }

    private static setConversationRef(context) {
        const conversationReference = TurnContext.getConversationReference(context.activity);
        inboundPublisher.set(`conversationRef-${context.activity.recipient.id}`, JSON.stringify(conversationReference));
    }

    private static sendToWorker(context) {
        inboundPublisher.publish("inbound", JSON.stringify({
            id: context.activity.recipient.id,
            input: context.activity.text,
            output: ''
        }));
    }

}