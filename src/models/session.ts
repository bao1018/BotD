import { ConversationReference } from "botbuilder";

export interface CustomizedDialog {
    conRef: Partial<ConversationReference>;
    userSession: Session;
}


export interface Session {
    id: string;
    state?: string;
    email?: string;
    username?: string;
    input: {
        type: MessageType
        value: string
    };
    output: {
        type: MessageType
        value: string
    };
    flow?: any;
    eventHistory?: Event[];
}

export interface Event {
    initiator: InitiatorType; // bot or user
    type: MessageType; // card or plantext
    value: string; // card name or user input
    timestamp: Date
}

export enum MessageType {
    card,
    text
}


export enum InitiatorType {
    bot,
    user
}
