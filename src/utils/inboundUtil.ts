import { Activity, MessageFactory, TurnContext } from 'botbuilder';
import { RedisUtil } from './redisUtil'
import { SessionUtil } from './sessionUtil';
import { CustomizedDialog } from '../models/session';
const _ = require('lodash');


export class InboundUtil {

    public static async handleNewInputActivity(context: TurnContext) {
        const dialogId = await this.setupCustomizedDialog(context);
        this.sendToWorker(dialogId);
    }

    public static async handleNewMemberActivity(context: TurnContext) {
        const membersAdded = context.activity.membersAdded;
        const welcomeText = 'Hello and welcome!';
        const optionText = `Type below options to go through the demo:\n\n
        1: Adaptive Card Demo\n
        2: Flow Demo\n
        Others: Echo Message Demo
        `;
        for (const member of membersAdded) {
            if (member.id !== context.activity.recipient.id) {
                await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                await context.sendActivity(MessageFactory.text(optionText, optionText));
            }
        }

    }

    private static async setupCustomizedDialog(context: TurnContext): Promise<string> {
        const dialogId = `dialog-${context.activity.recipient.id}`
        const conversationReference = TurnContext.getConversationReference(context.activity);
        const copyActivity: Activity = _.cloneDeep(conversationReference);
        console.log('did:', dialogId);
        const dialog: CustomizedDialog = await RedisUtil.get(dialogId);
        if (dialog) {
            console.log('found dialog', dialog);
            // update dialog
            SessionUtil.updateSession(copyActivity, dialog.userSession)
            RedisUtil.set(dialogId, dialog, 60 * 60);
        } else { // new dialog
            console.log('new dialog');
            const dialog: CustomizedDialog = {
                conRef: conversationReference,
                userSession: SessionUtil.newSession(copyActivity)
            }
            RedisUtil.set(dialogId, dialog, 60 * 60);
        }
        return dialogId;
    }

    private static sendToWorker(dialogId: string) {
        RedisUtil.publish("inbound", dialogId);
    }
}