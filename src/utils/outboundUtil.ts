import { BotFrameworkAdapter, ConversationReference } from 'botbuilder';
const redis = require("redis");
import { Event, InitiatorType, Session, MessageType } from '../models/session'

const outboundSubscriber = redis.createClient();
const redisCli = redis.createClient();

export class OutboundUtil {

    public static async listen( adapter: BotFrameworkAdapter) {
        outboundSubscriber.on("subscribe", function (channel, count) {
            console.log('🔥 Subscribed to outbound broker')
        });
        
        outboundSubscriber.on("message", async (channel, message) => {
            const session: Session = JSON.parse(message);
            redisCli.get(`conversationRef-${session.id}`, async (err, res) => {
                const conversationReference: ConversationReference = JSON.parse(res);
                await adapter.continueConversation(conversationReference, async turnContext => {
                    await turnContext.sendActivity(session.output.value);
                });
            });
        
        });
        outboundSubscriber.subscribe("outbound");
    }

}