import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import {
    BaseLanguageClient, CloseAction, ErrorAction,
    createMonacoServices, createConnection,
} from 'monaco-languageclient';
import * as ReconnectingWebSocket from 'reconnecting-websocket';

export function Initialize(editor: any, languageId: string): void {
    let url: string = 'ws://localhost:4389/sampleServer';

    // The Monaco services are the framework that allows the editor to
    // delegate to the language servers for hover events, etc.
    let services: any = createMonacoServices(editor);

    const socketOptions: any = {
        maxReconnectionDelay: 10000,
        minReconnectionDelay: 1000,
        reconnectionDelayGrowFactor: 1.3,
        connectionTimeout: 10000,
        maxRetries: Infinity,
        debug: false,
    };
    console.log('Creating websocket');
    let webSocket: any = new ReconnectingWebSocket(url, undefined, socketOptions);

    // Listen for connect event. Once connected, create the language client
    listen({
        webSocket,
        onConnection: connection => {
            console.log('Websocket connected');

            // Define the language client
            let languageClient: any = new BaseLanguageClient({
                name: 'Teradata Language Client',
                clientOptions: {
                    // Specify one or more language ids for which this language server pertains
                    documentSelector: [languageId],
                    initializationOptions: { 'languageId' : languageId },
                    // Disable the default error handler
                    errorHandler: {
                        error: () => ErrorAction.Continue,
                        closed: () => CloseAction.DoNotRestart,
                    },
                },
                services,
                // Create a Monaco language client connection from the JSON RPC connection on demand
                connectionProvider: {
                    get: (errorHandler, closeHandler) => {
                        console.log('Getting connection');
                        return Promise.resolve(createConnection(connection, errorHandler, closeHandler));
                    },
                },
            });
            // Start the language client
            let disposable: any = languageClient.start();
            connection.onClose(() => disposable.dispose());
        },
    });
}
