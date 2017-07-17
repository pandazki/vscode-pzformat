'use strict';
// The module 'vscode' contains the VS Code extensibility API Import the module
// and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {
    window,
    commands,
    Disposable,
    ExtensionContext,
    StatusBarAlignment,
    StatusBarItem,
    TextDocument
} from 'vscode';
import * as ncp from 'copy-paste';
import {vsprintf} from 'sprintf-js';

// this method is called when your extension is activated your extension is
// activated the very first time the command is executed
export function activate(context : vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors
    // (console.error) This line of code will only be executed once when your
    // extension is activated
    console.log('Congratulations, your extension "pzformat" is now active!');

    // The command has been defined in the package.json file Now provide the
    // implementation of the command with  registerCommand The commandId parameter
    // must match the command field in package.json
    let disposable = vscode
        .commands
        .registerCommand('extension.pzformat', () => {
            // The code you place here will be executed every time your command is executed
            try {

                let defaultSep = /[,，;]/g
                let editor = window.activeTextEditor;
                let doc = editor.document;
                let selections = editor.selections;

                let formatStr = ncp.paste();
                let workspaceEdit = new vscode.WorkspaceEdit();

                for (let selection of selections) {
                    if (selection.isEmpty) {
                        continue;
                    }
                    let lines = doc
                        .getText(selection)
                        .match(/[^\r\n]+/g);
                    let sep = defaultSep;
                    let result = '';
                    for (let line of lines) {
                        let s = extractSeparator(line);
                        if (s) {
                            sep = s;
                            continue;
                        }

                        let args = line
                            .split(sep)
                            .filter(Boolean);

                        if (args.length == 0) {
                            continue;
                        }
                        result += vsprintf(formatStr, args) + '\r\n';
                    }
                    let uri = vscode.window.activeTextEditor.document.uri;
                    workspaceEdit.replace(uri, selection, result);
                }
                vscode
                    .workspace
                    .applyEdit(workspaceEdit);
            } catch (error) {
                vscode
                    .window
                    .showErrorMessage(error.message);
            }

            // Display a message box to the user
            // vscode.window.showInformationMessage('Format selected text by clipboard
            // format string.');
        });

    context
        .subscriptions
        .push(disposable);
}

function extractSeparator(str : string) {
    if (str.startsWith('@sep=')) {
        return new RegExp('[' + str.slice(5) + ']', 'g');
    }
    return null;
}

// this method is called when your extension is deactivated
export function deactivate() {}