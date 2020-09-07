import { DialogState, InitiatorType, Session, MessageType } from '../models/session'
import { BaseService } from './baseService'
import { createMachine } from 'xstate';
const endMessage = "thanks for your select, see you next time.";
export class StatemMchineService extends BaseService {
    
    stateMachineDefinition: any = {
        id: 'select_drink',
        initial: 'not_select',
        states: {
            not_select: { on: { "alcholic": 'select_alcoholic', "no alcholic": 'select_no_alcoholic' }, message: "what do you want to drink? alcholic or no alcholic", endState: false },
            select_alcoholic: { on: { wine: 'select_wine', beer: 'select_beer' }, message: "what do you want to drink? wine or beer", endState: false },
            select_no_alcoholic: { on: { tea: 'select_tea', softdrink: 'select_softdrink' }, message: "what do you want to drink? tea or softdrink", endState: false },
            select_wine: { message: endMessage, endState: true },
            select_beer: { message: endMessage, endState: true },
            select_tea: { message: endMessage, endState: true },
            select_softdrink: { message: endMessage, endState: true },
        }
    };
    selectDrinkMachine: any = createMachine(this.stateMachineDefinition);

    public async process(session: Session): Promise<void> {

        if (session.state === DialogState.NO_STATE) {
            session.service = "StatemMchineService";
            session.state = DialogState.IN_DIALOG;
            session.flowState = this.stateMachineDefinition.initial;
            session.output.type = MessageType.text;
            session.output.value = this.stateMachineDefinition.states.not_select.message;
            super.addHistory(session, InitiatorType.bot, session.output.type, session.output.value)
        } else {
            const currentState = session.flowState;
            const nextState = this.selectDrinkMachine.transition(currentState, session.input.value).value;
            console.log(nextState);
            if (nextState === currentState) {
                session.output.type = MessageType.text;
                session.output.value = "invalid input, try again";

            } else {
                const msg = this.stateMachineDefinition.states[nextState].message;
                const lastState = this.stateMachineDefinition.states[nextState].endState;
                if (lastState) { // complete flow
                    console.log('last conversaton, close dialgo')
                    session.service = "";
                    session.state = DialogState.NO_STATE;
                    session.flowState = "";
                    session.output.type = MessageType.text;
                    session.output.value = endMessage;
                    console.log(session.output);
                    super.cleanHistory(session);
                } else {
                    session.flowState = nextState;
                    session.output.type = MessageType.text;
                    session.output.value = msg;
                    super.addHistory(session, InitiatorType.bot, session.output.type, session.output.value)
                }
            }


        }

    }


}