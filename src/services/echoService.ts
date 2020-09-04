
export class EchoService {
    public async process(msg: any): Promise<void> {
        msg.output = `Echo: ${msg.input}`;
    }
}