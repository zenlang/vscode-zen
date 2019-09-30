'use strict';
import * as vscode from 'vscode';
import ZenCompilerProvider from './zenCompilerProvider';
import { ZenFormatProvider, ZenRangeFormatProvider } from './zenFormat';

const ZEN_MODE: vscode.DocumentFilter = { language: 'zen', scheme: 'file' };

export function activate(context: vscode.ExtensionContext) {
    let compiler = new ZenCompilerProvider();
    compiler.activate(context.subscriptions);
    vscode.languages.registerCodeActionsProvider('zen', compiler);

    const zenFormatStatusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
    );
    const logChannel = vscode.window.createOutputChannel('zen');
    context.subscriptions.push(logChannel);
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            ZEN_MODE,
            new ZenFormatProvider(logChannel),
        ),
    );

    context.subscriptions.push(
        vscode.languages.registerDocumentRangeFormattingEditProvider(
            ZEN_MODE,
            new ZenRangeFormatProvider(logChannel),
        ),
    );
}

export function deactivate() {
}
