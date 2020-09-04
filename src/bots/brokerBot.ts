import { ActivityHandler, MessageFactory, TurnContext, ConversationReference, BotFrameworkAdapter } from 'botbuilder';
const redis = require("redis");
const inboundPublisher = redis.createClient();

export class BrokerBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            const conversationReference  = TurnContext.getConversationReference(context.activity);
            const rid: string = context.activity.recipient.id;
            inboundPublisher.set(`conversationRef-${rid}`, JSON.stringify(conversationReference));
            inboundPublisher.publish("inbound", JSON.stringify({
                id: rid,
                input: context.activity.text,
                output: ''
            }));
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Hello and welcome!';
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}
