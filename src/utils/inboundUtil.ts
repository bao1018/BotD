import { Activity, MessageFactory, TurnContext } from 'botbuilder';
import { RedisUtil } from './redisUtil'
import { SessionUtil } from './sessionUtil';
import { CustomizedDialog } from '../models/session';
const _ = require('lodash');


export class InboundUtil {

    public static async handleNewInputActivity(context: TurnContext) {
        const stopDialog = this.terminateDialog(context.activity);
        if(stopDialog) {
           context.sendActivity('Your user session is reset, pls start from beginning');
           return;
        } else {
            const dialogId = await this.setupCustomizedDialog(context);
            this.sendToWorker(dialogId);
        }
    }

    public static async handleNewMemberActivity(context: TurnContext) {
        const membersAdded = context.activity.membersAdded;
        const welcomeText = 'Hello and welcome!';
        const optionText = `Type below options to go through the demo:\n\n
        1: User Feedback Demo (AdaptiveCard)\n
        2: User Register Demo (Dialog flow)\n
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
        const copyActivity: Activity = _.cloneDeep(context.activity);
        const dialog: CustomizedDialog = {
            conRef: conversationReference,
            userSession: null
        }
        const dialogInRedis: CustomizedDialog = await RedisUtil.get(dialogId);
        if (dialogInRedis) {
            // update dialog
            console.log('found dialog');
            dialog.userSession = SessionUtil.updateSession(copyActivity, dialogInRedis.userSession)
            RedisUtil.set(dialogId, dialog, 60 * 60);
        } else { // new dialog
            console.log('new dialog');
            dialog.userSession = SessionUtil.newSession(copyActivity)
            RedisUtil.set(dialogId, dialog, 60 * 60);
        }
        return dialogId;
    }

    private static sendToWorker(dialogId: string) {
        RedisUtil.publish("inbound", dialogId);
    }

    private static terminateDialog(activity: Activity): boolean{
        const stop_words = [':q'];
        if(activity.text && (stop_words.indexOf(activity.text) > -1)) {
            RedisUtil.delete(`dialog-${activity.recipient.id}`);
            return true;
        } else {
            return false;
        }

    }
}