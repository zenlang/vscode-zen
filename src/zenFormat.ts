import * as vscode from 'vscode';
import { Range, StatusBarItem, TextEdit, OutputChannel, EndOfLine } from 'vscode';
import { execCmd } from './zenUtil';

export class ZenFormatProvider implements vscode.DocumentFormattingEditProvider {
    private _channel: OutputChannel;

    constructor(logChannel: OutputChannel) {
        this._channel = logChannel;
    }

    provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options?: vscode.FormattingOptions,
        token?: vscode.CancellationToken,
    ): Thenable<TextEdit[]> {
        const logger = this._channel;
        return zenFormat(document)
            .then(({ stdout }) => {
                logger.clear();
                const lastLineId = document.lineCount - 1;
                const wholeDocument = new vscode.Range(
                    0,
                    0,
                    lastLineId,
                    document.lineAt(lastLineId).text.length,
                );
                return [TextEdit.replace(wholeDocument, stdout), TextEdit.setEndOfLine(EndOfLine.LF)];
            })
            .catch((reason) => {
                let config = vscode.workspace.getConfiguration('zen');

                logger.clear();
                logger.appendLine(reason.toString().replace('<stdin>', document.fileName));
                if (config.get<boolean>("revealOutputChannelOnFormattingError")) {
                    logger.show(true)
                }
                return null;
            });
    }
}

// Same as full document formatter for now
export class ZenRangeFormatProvider implements vscode.DocumentRangeFormattingEditProvider {
    private _channel: OutputChannel;
    constructor(logChannel: OutputChannel) {
        this._channel = logChannel;
    }

    provideDocumentRangeFormattingEdits(
        document: vscode.TextDocument,
        range: vscode.Range,
        options?: vscode.FormattingOptions,
        token?: vscode.CancellationToken,
    ): Thenable<TextEdit[]> {
        const logger = this._channel;
        return zenFormat(document)
            .then(({ stdout }) => {
                logger.clear();
                const lastLineId = document.lineCount - 1;
                const wholeDocument = new vscode.Range(
                    0,
                    0,
                    lastLineId,
                    document.lineAt(lastLineId).text.length,
                );
                return [TextEdit.replace(wholeDocument, stdout), TextEdit.setEndOfLine(EndOfLine.LF)];
            })
            .catch((reason) => {
                const config = vscode.workspace.getConfiguration('zen');

                logger.clear();
                logger.appendLine(reason.toString().replace('<stdin>', document.fileName));
                if (config.get<boolean>("revealOutputChannelOnFormattingError")) {
                    logger.show(true)
                }
                return null;
            });
    }
}

function zenFormat(document: vscode.TextDocument) {
    const config = vscode.workspace.getConfiguration('zizeng');
    const zenPath = config.get<string>('zenPath') || 'zen';

    const options = {
        cmdArguments: ['fmt', '--stdin'],
        notFoundText: 'Could not find zen. Please add zen to your PATH or specify a custom path to the zen binary in your settings.',
    };
    const format = execCmd(zenPath, options);

    format.stdin.write(document.getText());
    format.stdin.end();

    return format;
}
