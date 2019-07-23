/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, forwardRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { fromEvent, merge, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { waitUntilMonacoReady, loadMonaco } from './code-editor.utils';
/** @type {?} */
const noop = () => {
    // empty method
};
const ɵ0 = noop;
// counter for ids to allow for multiple editors on one page
/** @type {?} */
let uniqueCounter = 0;
export class TdCodeEditorComponent {
    /**
     * Set if using Electron mode when object is created
     * @param {?} zone
     * @param {?} _changeDetectorRef
     * @param {?} _elementRef
     */
    constructor(zone, _changeDetectorRef, _elementRef) {
        this.zone = zone;
        this._changeDetectorRef = _changeDetectorRef;
        this._elementRef = _elementRef;
        this._destroy = new Subject();
        this._widthSubject = new Subject();
        this._heightSubject = new Subject();
        this._editorStyle = 'width:100%;height:100%;border:1px solid grey;';
        this._appPath = '';
        this._isElectronApp = false;
        this._value = '';
        this._theme = 'vs';
        this._language = 'javascript';
        this._subject = new Subject();
        this._editorInnerContainer = 'editorInnerContainer' + uniqueCounter++;
        this._editorNodeModuleDirOverride = '';
        this._componentInitialized = false;
        this._fromEditor = false;
        this._editorOptions = {};
        this._isFullScreen = false;
        this.initialContentChange = true;
        /**
         * editorInitialized: function($event)
         * Event emitted when editor is first initialized
         */
        this.onEditorInitialized = new EventEmitter();
        /**
         * editorConfigurationChanged: function($event)
         * Event emitted when editor's configuration changes
         */
        this.onEditorConfigurationChanged = new EventEmitter();
        /**
         * editorLanguageChanged: function($event)
         * Event emitted when editor's Language changes
         */
        this.onEditorLanguageChanged = new EventEmitter();
        /**
         * editorValueChange: function($event)
         * Event emitted any time something changes the editor value
         */
        this.onEditorValueChange = new EventEmitter();
        /**
         * The change event notifies you about a change happening in an input field.
         * Since the component is not a native Angular component have to specifiy the event emitter ourself
         */
        this.onChange = new EventEmitter();
        /* tslint:disable-next-line */
        this.propagateChange = (_) => { };
        this.onTouched = () => noop;
        // since accessing the window object need this check so serverside rendering doesn't fail
        if (typeof document === 'object' && !!document) {
            /* tslint:disable-next-line */
            this._isElectronApp = (((/** @type {?} */ (window)))['process']) ? true : false;
            if (this._isElectronApp) {
                this._appPath = electron.remote.app.getAppPath().split('\\').join('/');
            }
        }
    }
    /**
     * automaticLayout?: boolean
     * @deprecated in favor of our own resize implementation.
     * @param {?} automaticLayout
     * @return {?}
     */
    set automaticLayout(automaticLayout) {
        // tslint:disable-next-line
        console.warn('[automaticLayout] has been deprecated in favor of our own resize implementation and will be removed on 3.0.0');
    }
    /**
     * value?: string
     * Value in the Editor after async getEditorContent was called
     * @param {?} value
     * @return {?}
     */
    set value(value) {
        // Clear any timeout that might overwrite this value set in the future
        if (this._setValueTimeout) {
            clearTimeout(this._setValueTimeout);
        }
        this._value = value;
        if (this._componentInitialized) {
            if (this._webview) {
                if (this._webview.send !== undefined) {
                    // don't want to keep sending content if event came from IPC, infinite loop
                    if (!this._fromEditor) {
                        this._webview.send('setEditorContent', value);
                    }
                    this.onEditorValueChange.emit(undefined);
                    this.propagateChange(this._value);
                    this.onChange.emit(undefined);
                    this._fromEditor = false;
                }
                else {
                    // Editor is not loaded yet, try again in half a second
                    this._setValueTimeout = setTimeout(() => {
                        this.value = value;
                    }, 500);
                }
            }
            else {
                if (this._editor && this._editor.setValue) {
                    // don't want to keep sending content if event came from the editor, infinite loop
                    if (!this._fromEditor) {
                        this._editor.setValue(value);
                    }
                    this.onEditorValueChange.emit(undefined);
                    this.propagateChange(this._value);
                    this.onChange.emit(undefined);
                    this._fromEditor = false;
                    this.zone.run(() => this._value = value);
                }
                else {
                    // Editor is not loaded yet, try again in half a second
                    this._setValueTimeout = setTimeout(() => {
                        this.value = value;
                    }, 500);
                }
            }
        }
        else {
            this._setValueTimeout = setTimeout(() => {
                this.value = value;
            }, 500);
        }
    }
    /**
     * @return {?}
     */
    get value() {
        return this._value;
    }
    /**
     * Implemented as part of ControlValueAccessor.
     * @param {?} value
     * @return {?}
     */
    writeValue(value) {
        // do not write if null or undefined
        // tslint:disable-next-line
        if (value != undefined) {
            this.value = value;
        }
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    registerOnChange(fn) {
        this.propagateChange = fn;
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    /**
     * getEditorContent?: function
     * Returns the content within the editor
     * @return {?}
     */
    getValue() {
        if (this._componentInitialized) {
            if (this._webview) {
                this._webview.send('getEditorContent');
                return this._subject.asObservable();
            }
            else if (this._editor) {
                this._value = this._editor.getValue();
                setTimeout(() => {
                    this._subject.next(this._value);
                    this._subject.complete();
                    this._subject = new Subject();
                    this.onEditorValueChange.emit(undefined);
                });
                return this._subject.asObservable();
            }
        }
    }
    /**
     * language?: string
     * language used in editor
     * @param {?} language
     * @return {?}
     */
    set language(language) {
        this._language = language;
        if (this._componentInitialized) {
            if (this._webview) {
                this._webview.send('setLanguage', language);
            }
            else if (this._editor) {
                /** @type {?} */
                let currentValue = this._editor.getValue();
                this._editor.dispose();
                /** @type {?} */
                let myDiv = this._editorContainer.nativeElement;
                this._editor = monaco.editor.create(myDiv, Object.assign({
                    value: currentValue,
                    language: language,
                    theme: this._theme,
                }, this.editorOptions));
                this._editor.getModel().onDidChangeContent((e) => {
                    this._fromEditor = true;
                    this.writeValue(this._editor.getValue());
                });
                this.onEditorConfigurationChanged.emit(undefined);
                this.onEditorLanguageChanged.emit(undefined);
            }
        }
    }
    /**
     * @return {?}
     */
    get language() {
        return this._language;
    }
    /**
     * registerLanguage?: function
     * Registers a custom Language within the editor
     * @param {?} language
     * @return {?}
     */
    registerLanguage(language) {
        if (this._componentInitialized) {
            if (this._webview) {
                this._webview.send('registerLanguage', language);
            }
            else if (this._editor) {
                /** @type {?} */
                let currentValue = this._editor.getValue();
                this._editor.dispose();
                for (let i = 0; i < language.completionItemProvider.length; i++) {
                    /** @type {?} */
                    let provider = language.completionItemProvider[i];
                    /* tslint:disable-next-line */
                    provider.kind = eval(provider.kind);
                }
                for (let i = 0; i < language.monarchTokensProvider.length; i++) {
                    /** @type {?} */
                    let monarchTokens = language.monarchTokensProvider[i];
                    /* tslint:disable-next-line */
                    monarchTokens[0] = eval(monarchTokens[0]);
                }
                monaco.languages.register({ id: language.id });
                monaco.languages.setMonarchTokensProvider(language.id, {
                    tokenizer: {
                        root: language.monarchTokensProvider,
                    },
                });
                // Define a new theme that constains only rules that match this language
                monaco.editor.defineTheme(language.customTheme.id, language.customTheme.theme);
                this._theme = language.customTheme.id;
                monaco.languages.registerCompletionItemProvider(language.id, {
                    provideCompletionItems: () => {
                        return language.completionItemProvider;
                    },
                });
                /** @type {?} */
                let css = document.createElement('style');
                css.type = 'text/css';
                css.innerHTML = language.monarchTokensProviderCSS;
                document.body.appendChild(css);
                this.onEditorConfigurationChanged.emit(undefined);
            }
        }
    }
    /**
     * style?: string
     * css style of the editor on the page
     * @param {?} editorStyle
     * @return {?}
     */
    set editorStyle(editorStyle) {
        this._editorStyle = editorStyle;
        if (this._componentInitialized) {
            if (this._webview) {
                this._webview.send('setEditorStyle', { language: this._language, theme: this._theme, style: editorStyle });
            }
            else if (this._editor) {
                /** @type {?} */
                let containerDiv = this._editorContainer.nativeElement;
                containerDiv.setAttribute('style', editorStyle);
                /** @type {?} */
                let currentValue = this._editor.getValue();
                this._editor.dispose();
                /** @type {?} */
                let myDiv = this._editorContainer.nativeElement;
                this._editor = monaco.editor.create(myDiv, Object.assign({
                    value: currentValue,
                    language: this._language,
                    theme: this._theme,
                }, this.editorOptions));
                this._editor.getModel().onDidChangeContent((e) => {
                    this._fromEditor = true;
                    this.writeValue(this._editor.getValue());
                });
            }
        }
    }
    /**
     * @return {?}
     */
    get editorStyle() {
        return this._editorStyle;
    }
    /**
     * theme?: string
     * Theme to be applied to editor
     * @param {?} theme
     * @return {?}
     */
    set theme(theme) {
        this._theme = theme;
        if (this._componentInitialized) {
            if (this._webview) {
                this._webview.send('setEditorOptions', { 'theme': theme });
            }
            else if (this._editor) {
                this._editor.updateOptions({ 'theme': theme });
                this.onEditorConfigurationChanged.emit(undefined);
            }
        }
    }
    /**
     * @return {?}
     */
    get theme() {
        return this._theme;
    }
    /**
     * fullScreenKeyBinding?: number
     * See here for key bindings https://microsoft.github.io/monaco-editor/api/enums/monaco.keycode.html
     * Sets the KeyCode for shortcutting to Fullscreen mode
     * @param {?} keycode
     * @return {?}
     */
    set fullScreenKeyBinding(keycode) {
        this._keycode = keycode;
    }
    /**
     * @return {?}
     */
    get fullScreenKeyBinding() {
        return this._keycode;
    }
    /**
     * editorOptions?: Object
     * Options used on editor instantiation. Available options listed here:
     * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditoroptions.html
     * @param {?} editorOptions
     * @return {?}
     */
    set editorOptions(editorOptions) {
        this._editorOptions = editorOptions;
        if (this._componentInitialized) {
            if (this._webview) {
                this._webview.send('setEditorOptions', editorOptions);
            }
            else if (this._editor) {
                this._editor.updateOptions(editorOptions);
                this.onEditorConfigurationChanged.emit(undefined);
            }
        }
    }
    /**
     * @return {?}
     */
    get editorOptions() {
        return this._editorOptions;
    }
    /**
     * layout method that calls layout method of editor and instructs the editor to remeasure its container
     * @return {?}
     */
    layout() {
        if (this._componentInitialized) {
            if (this._webview) {
                this._webview.send('layout');
            }
            else if (this._editor) {
                this._editor.layout();
            }
        }
    }
    /**
     * Returns if in Electron mode or not
     * @return {?}
     */
    get isElectronApp() {
        return this._isElectronApp;
    }
    /**
     * Returns if in Full Screen Mode or not
     * @return {?}
     */
    get isFullScreen() {
        return this._isFullScreen;
    }
    /**
     * setEditorNodeModuleDirOverride function that overrides where to look
     * for the editor node_module. Used in tests for Electron or anywhere that the
     * node_modules are not in the expected location.
     * @param {?} dirOverride
     * @return {?}
     */
    setEditorNodeModuleDirOverride(dirOverride) {
        this._editorNodeModuleDirOverride = dirOverride;
        this._appPath = dirOverride;
    }
    /**
     * ngOnInit only used for Electron version of editor
     * This is where the webview is created to sandbox away the editor
     * @return {?}
     */
    ngOnInit() {
        /** @type {?} */
        let editorHTML = '';
        if (this._isElectronApp) {
            editorHTML = `<!DOCTYPE html>
            <html style="height:100%">
            <head>
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <meta http-equiv="Content-Type" content="text/html;charset=utf-8" >
                <link rel="stylesheet" data-name="vs/editor/editor.main"
                    href="file://${this._editorNodeModuleDirOverride}/assets/monaco/vs/editor/editor.main.css">
            </head>
            <body style="height:100%;width: 100%;margin: 0;padding: 0;overflow: hidden;">
            <div id="${this._editorInnerContainer}" style="width:100%;height:100%;${this._editorStyle}"></div>
            <script>
                // Get the ipcRenderer of electron for communication
                const {ipcRenderer} = require('electron');
            </script>
            <script src="file://${this._editorNodeModuleDirOverride}/assets/monaco/vs/loader.js"></script>
            <script>
                var editor;
                var theme = '${this._theme}';
                var value = '${this._value}';

                require.config({
                    baseUrl: '${this._appPath}/assets/monaco'
                });
                self.module = undefined;
                self.process.browser = true;

                require(['vs/editor/editor.main'], function() {
                    editor = monaco.editor.create(document.getElementById('${this._editorInnerContainer}'), Object.assign({
                        value: value,
                        language: '${this.language}',
                        theme: '${this._theme}',
                    }, ${JSON.stringify(this.editorOptions)}));
                    editor.getModel().onDidChangeContent( (e)=> {
                        ipcRenderer.sendToHost("onEditorContentChange", editor.getValue());
                    });
                    editor.addAction({
                      // An unique identifier of the contributed action.
                      id: 'fullScreen',
                      // A label of the action that will be presented to the user.
                      label: 'Full Screen',
                      // An optional array of keybindings for the action.
                      contextMenuGroupId: 'navigation',
                      keybindings: [${this._keycode}],
                      contextMenuOrder: 1.5,
                      // Method that will be executed when the action is triggered.
                      // @param editor The editor instance is passed in as a convinience
                      run: function(ed) {
                        var editorDiv = document.getElementById('${this._editorInnerContainer}');
                        editorDiv.webkitRequestFullscreen();
                      }
                    });
                    editor.addAction({
                      // An unique identifier of the contributed action.
                      id: 'exitfullScreen',
                      // A label of the action that will be presented to the user.
                      label: 'Exit Full Screen',
                      // An optional array of keybindings for the action.
                      contextMenuGroupId: 'navigation',
                      keybindings: [9],
                      contextMenuOrder: 1.5,
                      // Method that will be executed when the action is triggered.
                      // @param editor The editor instance is passed in as a convinience
                      run: function(ed) {
                        var editorDiv = document.getElementById('${this._editorInnerContainer}');
                        document.webkitExitFullscreen();
                      }
                    });
                    ipcRenderer.sendToHost("onEditorInitialized", this._editor);
                });

                // return back the value in the editor to the mainview
                ipcRenderer.on('getEditorContent', function(){
                    ipcRenderer.sendToHost("editorContent", editor.getValue());
                });

                // set the value of the editor from what was sent from the mainview
                ipcRenderer.on('setEditorContent', function(event, data){
                    value = data;
                    editor.setValue(data);
                });

                // set the style of the editor container div
                ipcRenderer.on('setEditorStyle', function(event, data){
                    var editorDiv = document.getElementById('${this._editorInnerContainer}');
                    editorDiv.style = data.style;
                    var currentValue = editor.getValue();
                    editor.dispose();
                    editor = monaco.editor.create(document.getElementById('${this._editorInnerContainer}'), Object.assign({
                        value: currentValue,
                        language: data.language,
                        theme: data.theme,
                    }, ${JSON.stringify(this.editorOptions)}));
                });

                // set the options of the editor from what was sent from the mainview
                ipcRenderer.on('setEditorOptions', function(event, data){
                    editor.updateOptions(data);
                    ipcRenderer.sendToHost("onEditorConfigurationChanged", '');
                });

                // set the language of the editor from what was sent from the mainview
                ipcRenderer.on('setLanguage', function(event, data){
                    var currentValue = editor.getValue();
                    editor.dispose();
                    editor = monaco.editor.create(document.getElementById('${this._editorInnerContainer}'), Object.assign({
                        value: currentValue,
                        language: data,
                        theme: theme,
                    }, ${JSON.stringify(this.editorOptions)}));
                    ipcRenderer.sendToHost("onEditorConfigurationChanged", '');
                    ipcRenderer.sendToHost("onEditorLanguageChanged", '');
                });

                // register a new language with editor
                ipcRenderer.on('registerLanguage', function(event, data){
                    var currentValue = editor.getValue();
                    editor.dispose();

                    for (var i = 0; i < data.completionItemProvider.length; i++) {
                        var provider = data.completionItemProvider[i];
                        provider.kind = eval(provider.kind);
                    }
                    for (var i = 0; i < data.monarchTokensProvider.length; i++) {
                        var monarchTokens = data.monarchTokensProvider[i];
                        monarchTokens[0] = eval(monarchTokens[0]);
                    }
                    monaco.languages.register({ id: data.id });

                    monaco.languages.setMonarchTokensProvider(data.id, {
                        tokenizer: {
                            root: data.monarchTokensProvider
                        }
                    });

                    // Define a new theme that constains only rules that match this language
                    monaco.editor.defineTheme(data.customTheme.id, data.customTheme.theme);
                    theme = data.customTheme.id;

                    monaco.languages.registerCompletionItemProvider(data.id, {
                        provideCompletionItems: () => {
                            return data.completionItemProvider
                        }
                    });

                    var css = document.createElement("style");
                    css.type = "text/css";
                    css.innerHTML = data.monarchTokensProviderCSS;
                    document.body.appendChild(css);

                    ipcRenderer.sendToHost("onEditorConfigurationChanged", '');
                });

                // Instruct the editor to remeasure its container
                ipcRenderer.on('layout', function(){
                    editor.layout();
                });

                // Instruct the editor go to full screen mode
                ipcRenderer.on('showFullScreenEditor', function() {
                  var editorDiv = document.getElementById('${this._editorInnerContainer}');
                  editorDiv.webkitRequestFullscreen();
                });

                // Instruct the editor exit full screen mode
                ipcRenderer.on('exitFullScreenEditor', function() {
                  var editorDiv = document.getElementById('${this._editorInnerContainer}');
                  editorDiv.webkitExitFullscreen();
                });

                ipcRenderer.on('dispose', function(){
                  editor.dispose();
                });

                // need to manually resize the editor any time the window size
                // changes. See: https://github.com/Microsoft/monaco-editor/issues/28
                window.addEventListener("resize", function resizeEditor() {
                    editor.layout();
                });
            </script>
            </body>
            </html>`;
            // dynamically create the Electron Webview Element
            // this will sandbox the monaco code into its own DOM and its own
            // javascript instance. Need to do this to avoid problems with monaco
            // using AMD Requires and Electron using Node Requires
            // see https://github.com/Microsoft/monaco-editor/issues/90
            this._webview = document.createElement('webview');
            this._webview.setAttribute('nodeintegration', 'true');
            this._webview.setAttribute('disablewebsecurity', 'true');
            // take the html content for the webview and base64 encode it and use as the src tag
            this._webview.setAttribute('src', 'data:text/html;base64,' + window.btoa(editorHTML));
            this._webview.setAttribute('style', 'display:inline-flex; width:100%; height:100%');
            //  this._webview.addEventListener('dom-ready', () => {
            //     this._webview.openDevTools();
            //  });
            // Process the data from the webview
            this._webview.addEventListener('ipc-message', (event) => {
                if (event.channel === 'editorContent') {
                    this._fromEditor = true;
                    this.writeValue(event.args[0]);
                    this._subject.next(this._value);
                    this._subject.complete();
                    this._subject = new Subject();
                }
                else if (event.channel === 'onEditorContentChange') {
                    this._fromEditor = true;
                    this.writeValue(event.args[0]);
                    if (this.initialContentChange) {
                        this.initialContentChange = false;
                        this.layout();
                    }
                }
                else if (event.channel === 'onEditorInitialized') {
                    this._componentInitialized = true;
                    this._editorProxy = this.wrapEditorCalls(this._editor);
                    this.onEditorInitialized.emit(this._editorProxy);
                }
                else if (event.channel === 'onEditorConfigurationChanged') {
                    this.onEditorConfigurationChanged.emit(undefined);
                }
                else if (event.channel === 'onEditorLanguageChanged') {
                    this.onEditorLanguageChanged.emit(undefined);
                }
            });
            // append the webview to the DOM
            this._editorContainer.nativeElement.appendChild(this._webview);
        }
    }
    /**
     * ngAfterViewInit only used for browser version of editor
     * This is where the AMD Loader scripts are added to the browser and the editor scripts are "required"
     * @return {?}
     */
    ngAfterViewInit() {
        if (!this._isElectronApp) {
            loadMonaco();
            waitUntilMonacoReady().pipe(takeUntil(this._destroy)).subscribe(() => {
                this.initMonaco();
            });
        }
        merge(fromEvent(window, 'resize').pipe(debounceTime(100)), this._widthSubject.asObservable().pipe(distinctUntilChanged()), this._heightSubject.asObservable().pipe(distinctUntilChanged())).pipe(takeUntil(this._destroy), debounceTime(100)).subscribe(() => {
            this.layout();
            this._changeDetectorRef.markForCheck();
        });
        timer(500, 250).pipe(takeUntil(this._destroy)).subscribe(() => {
            if (this._elementRef && this._elementRef.nativeElement) {
                this._widthSubject.next(((/** @type {?} */ (this._elementRef.nativeElement))).getBoundingClientRect().width);
                this._heightSubject.next(((/** @type {?} */ (this._elementRef.nativeElement))).getBoundingClientRect().height);
            }
        });
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this._changeDetectorRef.detach();
        if (this._webview) {
            this._webview.send('dispose');
        }
        else if (this._editor) {
            this._editor.dispose();
        }
        this._destroy.next(true);
        this._destroy.unsubscribe();
    }
    /**
     * showFullScreenEditor request for full screen of Code Editor based on its browser type.
     * @return {?}
     */
    showFullScreenEditor() {
        if (this._componentInitialized) {
            if (this._webview) {
                this._webview.send('showFullScreenEditor');
            }
            else {
                /** @type {?} */
                const codeEditorElement = (/** @type {?} */ (this._editorContainer.nativeElement));
                /** @type {?} */
                const fullScreenMap = {
                    // Chrome
                    'requestFullscreen': () => codeEditorElement.requestFullscreen(),
                    // Safari
                    'webkitRequestFullscreen': () => ((/** @type {?} */ (codeEditorElement))).webkitRequestFullscreen(),
                    // IE
                    'msRequestFullscreen': () => ((/** @type {?} */ (codeEditorElement))).msRequestFullscreen(),
                    // Firefox
                    'mozRequestFullScreen': () => ((/** @type {?} */ (codeEditorElement))).mozRequestFullScreen(),
                };
                for (const handler of Object.keys(fullScreenMap)) {
                    if (codeEditorElement[handler]) {
                        fullScreenMap[handler]();
                    }
                }
            }
        }
        this._isFullScreen = true;
    }
    /**
     * exitFullScreenEditor request to exit full screen of Code Editor based on its browser type.
     * @return {?}
     */
    exitFullScreenEditor() {
        if (this._componentInitialized) {
            if (this._webview) {
                this._webview.send('exitFullScreenEditor');
            }
            else {
                /** @type {?} */
                const exitFullScreenMap = {
                    // Chrome
                    'exitFullscreen': () => document.exitFullscreen(),
                    // Safari
                    'webkitExitFullscreen': () => ((/** @type {?} */ (document))).webkitExitFullscreen(),
                    // Firefox
                    'mozCancelFullScreen': () => ((/** @type {?} */ (document))).mozCancelFullScreen(),
                    // IE
                    'msExitFullscreen': () => ((/** @type {?} */ (document))).msExitFullscreen(),
                };
                for (const handler of Object.keys(exitFullScreenMap)) {
                    if (document[handler]) {
                        exitFullScreenMap[handler]();
                    }
                }
            }
        }
        this._isFullScreen = false;
    }
    /**
     * addFullScreenModeCommand used to add the fullscreen option to the context menu
     * @return {?}
     */
    addFullScreenModeCommand() {
        this._editor.addAction({
            // An unique identifier of the contributed action.
            id: 'fullScreen',
            // A label of the action that will be presented to the user.
            label: 'Full Screen',
            // An optional array of keybindings for the action.
            contextMenuGroupId: 'navigation',
            keybindings: this._keycode,
            contextMenuOrder: 1.5,
            // Method that will be executed when the action is triggered.
            // @param editor The editor instance is passed in as a convinience
            run: (ed) => {
                this.showFullScreenEditor();
            },
        });
    }
    /**
     * wrapEditorCalls used to proxy all the calls to the monaco editor
     * For calls for Electron use this to call the editor inside the webview
     * @param {?} obj
     * @return {?}
     */
    wrapEditorCalls(obj) {
        /** @type {?} */
        let that = this;
        /** @type {?} */
        let handler = {
            /**
             * @param {?} target
             * @param {?} propKey
             * @param {?} receiver
             * @return {?}
             */
            get(target, propKey, receiver) {
                return (...args) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    if (that._componentInitialized) {
                        if (that._webview) {
                            /** @type {?} */
                            const executeJavaScript = (code) => new Promise((resolve) => {
                                that._webview.executeJavaScript(code, resolve);
                            });
                            /** @type {?} */
                            let result = yield executeJavaScript('editor.' + propKey + '(' + args + ')');
                            return result;
                        }
                        else {
                            /** @type {?} */
                            const origMethod = target[propKey];
                            /** @type {?} */
                            let result = yield origMethod.apply(that._editor, args);
                            // since running javascript code manually need to force Angular to detect changes
                            setTimeout(() => {
                                that.zone.run(() => {
                                    // tslint:disable-next-line
                                    if (!that._changeDetectorRef['destroyed']) {
                                        that._changeDetectorRef.detectChanges();
                                    }
                                });
                            });
                            return result;
                        }
                    }
                });
            },
        };
        return new Proxy(obj, handler);
    }
    /**
     * initMonaco method creates the monaco editor into the \@ViewChild('editorContainer')
     * and emit the onEditorInitialized event.  This is only used in the browser version.
     * @return {?}
     */
    initMonaco() {
        /** @type {?} */
        let containerDiv = this._editorContainer.nativeElement;
        containerDiv.id = this._editorInnerContainer;
        this._editor = monaco.editor.create(containerDiv, Object.assign({
            value: this._value,
            language: this.language,
            theme: this._theme,
        }, this.editorOptions));
        setTimeout(() => {
            this._editorProxy = this.wrapEditorCalls(this._editor);
            this._componentInitialized = true;
            this.onEditorInitialized.emit(this._editorProxy);
        });
        this._editor.getModel().onDidChangeContent((e) => {
            this._fromEditor = true;
            this.writeValue(this._editor.getValue());
            if (this.initialContentChange) {
                this.initialContentChange = false;
                this.layout();
            }
        });
        this.addFullScreenModeCommand();
    }
}
TdCodeEditorComponent.decorators = [
    { type: Component, args: [{
                selector: 'td-code-editor',
                template: "<div class=\"editorContainer\" #editorContainer></div>\n",
                providers: [{
                        provide: NG_VALUE_ACCESSOR,
                        useExisting: forwardRef(() => TdCodeEditorComponent),
                        multi: true,
                    }],
                styles: [":host{display:block;position:relative}:host .editorContainer{position:absolute;top:0;bottom:0;left:0;right:0}::ng-deep .monaco-aria-container{display:none}"]
            }] }
];
/** @nocollapse */
TdCodeEditorComponent.ctorParameters = () => [
    { type: NgZone },
    { type: ChangeDetectorRef },
    { type: ElementRef }
];
TdCodeEditorComponent.propDecorators = {
    _editorContainer: [{ type: ViewChild, args: ['editorContainer',] }],
    automaticLayout: [{ type: Input, args: ['automaticLayout',] }],
    onEditorInitialized: [{ type: Output, args: ['editorInitialized',] }],
    onEditorConfigurationChanged: [{ type: Output, args: ['editorConfigurationChanged',] }],
    onEditorLanguageChanged: [{ type: Output, args: ['editorLanguageChanged',] }],
    onEditorValueChange: [{ type: Output, args: ['editorValueChange',] }],
    onChange: [{ type: Output, args: ['change',] }],
    value: [{ type: Input, args: ['value',] }],
    language: [{ type: Input, args: ['language',] }],
    editorStyle: [{ type: Input, args: ['editorStyle',] }],
    theme: [{ type: Input, args: ['theme',] }],
    fullScreenKeyBinding: [{ type: Input, args: ['fullScreenKeyBinding',] }],
    editorOptions: [{ type: Input, args: ['editorOptions',] }]
};
if (false) {
    /** @type {?} */
    TdCodeEditorComponent.prototype._destroy;
    /** @type {?} */
    TdCodeEditorComponent.prototype._widthSubject;
    /** @type {?} */
    TdCodeEditorComponent.prototype._heightSubject;
    /** @type {?} */
    TdCodeEditorComponent.prototype._editorStyle;
    /** @type {?} */
    TdCodeEditorComponent.prototype._appPath;
    /** @type {?} */
    TdCodeEditorComponent.prototype._isElectronApp;
    /** @type {?} */
    TdCodeEditorComponent.prototype._webview;
    /** @type {?} */
    TdCodeEditorComponent.prototype._value;
    /** @type {?} */
    TdCodeEditorComponent.prototype._theme;
    /** @type {?} */
    TdCodeEditorComponent.prototype._language;
    /** @type {?} */
    TdCodeEditorComponent.prototype._subject;
    /** @type {?} */
    TdCodeEditorComponent.prototype._editorInnerContainer;
    /** @type {?} */
    TdCodeEditorComponent.prototype._editorNodeModuleDirOverride;
    /** @type {?} */
    TdCodeEditorComponent.prototype._editor;
    /** @type {?} */
    TdCodeEditorComponent.prototype._editorProxy;
    /** @type {?} */
    TdCodeEditorComponent.prototype._componentInitialized;
    /** @type {?} */
    TdCodeEditorComponent.prototype._fromEditor;
    /** @type {?} */
    TdCodeEditorComponent.prototype._editorOptions;
    /** @type {?} */
    TdCodeEditorComponent.prototype._isFullScreen;
    /** @type {?} */
    TdCodeEditorComponent.prototype._keycode;
    /** @type {?} */
    TdCodeEditorComponent.prototype._setValueTimeout;
    /** @type {?} */
    TdCodeEditorComponent.prototype.initialContentChange;
    /** @type {?} */
    TdCodeEditorComponent.prototype._editorContainer;
    /**
     * editorInitialized: function($event)
     * Event emitted when editor is first initialized
     * @type {?}
     */
    TdCodeEditorComponent.prototype.onEditorInitialized;
    /**
     * editorConfigurationChanged: function($event)
     * Event emitted when editor's configuration changes
     * @type {?}
     */
    TdCodeEditorComponent.prototype.onEditorConfigurationChanged;
    /**
     * editorLanguageChanged: function($event)
     * Event emitted when editor's Language changes
     * @type {?}
     */
    TdCodeEditorComponent.prototype.onEditorLanguageChanged;
    /**
     * editorValueChange: function($event)
     * Event emitted any time something changes the editor value
     * @type {?}
     */
    TdCodeEditorComponent.prototype.onEditorValueChange;
    /**
     * The change event notifies you about a change happening in an input field.
     * Since the component is not a native Angular component have to specifiy the event emitter ourself
     * @type {?}
     */
    TdCodeEditorComponent.prototype.onChange;
    /** @type {?} */
    TdCodeEditorComponent.prototype.propagateChange;
    /** @type {?} */
    TdCodeEditorComponent.prototype.onTouched;
    /** @type {?} */
    TdCodeEditorComponent.prototype.zone;
    /** @type {?} */
    TdCodeEditorComponent.prototype._changeDetectorRef;
    /** @type {?} */
    TdCodeEditorComponent.prototype._elementRef;
}
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS1lZGl0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGNvdmFsZW50L2NvZGUtZWRpdG9yLyIsInNvdXJjZXMiOlsiY29kZS1lZGl0b3IuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFDN0MsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixFQUFhLE1BQU0sZUFBZSxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxpQkFBaUIsRUFBd0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6RSxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvQyxPQUFPLEVBQUUsWUFBWSxFQUFFLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRS9FLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxVQUFVLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7TUFFakUsSUFBSSxHQUFRLEdBQUcsRUFBRTtJQUNyQixlQUFlO0FBQ2pCLENBQUM7Ozs7SUFHRyxhQUFhLEdBQVcsQ0FBQztBQWU3QixNQUFNLE9BQU8scUJBQXFCOzs7Ozs7O0lBMEVoQyxZQUNVLElBQVksRUFDWixrQkFBcUMsRUFDckMsV0FBdUI7UUFGdkIsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBbUI7UUFDckMsZ0JBQVcsR0FBWCxXQUFXLENBQVk7UUEzRXpCLGFBQVEsR0FBcUIsSUFBSSxPQUFPLEVBQVcsQ0FBQztRQUNwRCxrQkFBYSxHQUFvQixJQUFJLE9BQU8sRUFBVSxDQUFDO1FBQ3ZELG1CQUFjLEdBQW9CLElBQUksT0FBTyxFQUFVLENBQUM7UUFFeEQsaUJBQVks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Qzs7SUFDN0MsNENBQStCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCxcbiAgVmlld0NoaWxkLCBFbGVtZW50UmVmLCBmb3J3YXJkUmVmLCBOZ1pvbmUsIENoYW5nZURldGVjdG9yUmVmLCBPbkRlc3Ryb3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5HX1ZBTFVFX0FDQ0VTU09SLCBDb250cm9sVmFsdWVBY2Nlc3NvciB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGZyb21FdmVudCwgbWVyZ2UsIHRpbWVyIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBkZWJvdW5jZVRpbWUsIGRpc3RpbmN0VW50aWxDaGFuZ2VkLCB0YWtlVW50aWwgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IHdhaXRVbnRpbE1vbmFjb1JlYWR5LCBsb2FkTW9uYWNvIH0gZnJvbSAnLi9jb2RlLWVkaXRvci51dGlscyc7XG5cbmNvbnN0IG5vb3A6IGFueSA9ICgpID0+IHtcbiAgLy8gZW1wdHkgbWV0aG9kXG59O1xuXG4vLyBjb3VudGVyIGZvciBpZHMgdG8gYWxsb3cgZm9yIG11bHRpcGxlIGVkaXRvcnMgb24gb25lIHBhZ2VcbmxldCB1bmlxdWVDb3VudGVyOiBudW1iZXIgPSAwO1xuLy8gZGVjbGFyZSBhbGwgdGhlIGJ1aWx0IGluIGVsZWN0cm9uIG9iamVjdHNcbmRlY2xhcmUgY29uc3QgZWxlY3Ryb246IGFueTtcbmRlY2xhcmUgY29uc3QgbW9uYWNvOiBhbnk7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3RkLWNvZGUtZWRpdG9yJyxcbiAgdGVtcGxhdGVVcmw6ICcuL2NvZGUtZWRpdG9yLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbICcuL2NvZGUtZWRpdG9yLmNvbXBvbmVudC5zY3NzJyBdLFxuICBwcm92aWRlcnM6IFt7XG4gICAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG4gICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gVGRDb2RlRWRpdG9yQ29tcG9uZW50KSxcbiAgICBtdWx0aTogdHJ1ZSxcbiAgfV0sXG59KVxuZXhwb3J0IGNsYXNzIFRkQ29kZUVkaXRvckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCwgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE9uRGVzdHJveSB7XG5cbiAgcHJpdmF0ZSBfZGVzdHJveTogU3ViamVjdDxib29sZWFuPiA9IG5ldyBTdWJqZWN0PGJvb2xlYW4+KCk7XG4gIHByaXZhdGUgX3dpZHRoU3ViamVjdDogU3ViamVjdDxudW1iZXI+ID0gbmV3IFN1YmplY3Q8bnVtYmVyPigpO1xuICBwcml2YXRlIF9oZWlnaHRTdWJqZWN0OiBTdWJqZWN0PG51bWJlcj4gPSBuZXcgU3ViamVjdDxudW1iZXI+KCk7XG5cbiAgcHJpdmF0ZSBfZWRpdG9yU3R5bGU6IHN0cmluZyA9ICd3aWR0aDoxMDAlO2hlaWdodDoxMDAlO2JvcmRlcjoxcHggc29saWQgZ3JleTsnO1xuICBwcml2YXRlIF9hcHBQYXRoOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSBfaXNFbGVjdHJvbkFwcDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF93ZWJ2aWV3OiBhbnk7XG4gIHByaXZhdGUgX3ZhbHVlOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSBfdGhlbWU6IHN0cmluZyA9ICd2cyc7XG4gIHByaXZhdGUgX2xhbmd1YWdlOiBzdHJpbmcgPSAnamF2YXNjcmlwdCc7XG4gIHByaXZhdGUgX3N1YmplY3Q6IFN1YmplY3Q8c3RyaW5nPiA9IG5ldyBTdWJqZWN0KCk7XG4gIHByaXZhdGUgX2VkaXRvcklubmVyQ29udGFpbmVyOiBzdHJpbmcgPSAnZWRpdG9ySW5uZXJDb250YWluZXInICsgdW5pcXVlQ291bnRlcisrO1xuICBwcml2YXRlIF9lZGl0b3JOb2RlTW9kdWxlRGlyT3ZlcnJpZGU6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlIF9lZGl0b3I6IGFueTtcbiAgcHJpdmF0ZSBfZWRpdG9yUHJveHk6IGFueTtcbiAgcHJpdmF0ZSBfY29tcG9uZW50SW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfZnJvbUVkaXRvcjogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9lZGl0b3JPcHRpb25zOiBhbnkgPSB7fTtcbiAgcHJpdmF0ZSBfaXNGdWxsU2NyZWVuOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX2tleWNvZGU6IGFueTtcbiAgcHJpdmF0ZSBfc2V0VmFsdWVUaW1lb3V0OiBhbnk7XG4gIHByaXZhdGUgaW5pdGlhbENvbnRlbnRDaGFuZ2U6IGJvb2xlYW4gPSB0cnVlO1xuXG4gIEBWaWV3Q2hpbGQoJ2VkaXRvckNvbnRhaW5lcicpIF9lZGl0b3JDb250YWluZXI6IEVsZW1lbnRSZWY7XG5cbiAgLyoqXG4gICAqIGF1dG9tYXRpY0xheW91dD86IGJvb2xlYW5cbiAgICogQGRlcHJlY2F0ZWQgaW4gZmF2b3Igb2Ygb3VyIG93biByZXNpemUgaW1wbGVtZW50YXRpb24uXG4gICAqL1xuICBASW5wdXQoJ2F1dG9tYXRpY0xheW91dCcpXG4gIHNldCBhdXRvbWF0aWNMYXlvdXQoYXV0b21hdGljTGF5b3V0OiBib29sZWFuKSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lXG4gICAgY29uc29sZS53YXJuKCdbYXV0b21hdGljTGF5b3V0XSBoYXMgYmVlbiBkZXByZWNhdGVkIGluIGZhdm9yIG9mIG91ciBvd24gcmVzaXplIGltcGxlbWVudGF0aW9uIGFuZCB3aWxsIGJlIHJlbW92ZWQgb24gMy4wLjAnKTtcbiAgfVxuXG4gLyoqXG4gICogZWRpdG9ySW5pdGlhbGl6ZWQ6IGZ1bmN0aW9uKCRldmVudClcbiAgKiBFdmVudCBlbWl0dGVkIHdoZW4gZWRpdG9yIGlzIGZpcnN0IGluaXRpYWxpemVkXG4gICovXG4gIEBPdXRwdXQoJ2VkaXRvckluaXRpYWxpemVkJykgb25FZGl0b3JJbml0aWFsaXplZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gLyoqXG4gICogZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQ6IGZ1bmN0aW9uKCRldmVudClcbiAgKiBFdmVudCBlbWl0dGVkIHdoZW4gZWRpdG9yJ3MgY29uZmlndXJhdGlvbiBjaGFuZ2VzXG4gICovXG4gIEBPdXRwdXQoJ2VkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkJykgb25FZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gLyoqXG4gICogZWRpdG9yTGFuZ3VhZ2VDaGFuZ2VkOiBmdW5jdGlvbigkZXZlbnQpXG4gICogRXZlbnQgZW1pdHRlZCB3aGVuIGVkaXRvcidzIExhbmd1YWdlIGNoYW5nZXNcbiAgKi9cbiAgQE91dHB1dCgnZWRpdG9yTGFuZ3VhZ2VDaGFuZ2VkJykgb25FZGl0b3JMYW5ndWFnZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuIC8qKlxuICAqIGVkaXRvclZhbHVlQ2hhbmdlOiBmdW5jdGlvbigkZXZlbnQpXG4gICogRXZlbnQgZW1pdHRlZCBhbnkgdGltZSBzb21ldGhpbmcgY2hhbmdlcyB0aGUgZWRpdG9yIHZhbHVlXG4gICovXG4gIEBPdXRwdXQoJ2VkaXRvclZhbHVlQ2hhbmdlJykgb25FZGl0b3JWYWx1ZUNoYW5nZTogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBUaGUgY2hhbmdlIGV2ZW50IG5vdGlmaWVzIHlvdSBhYm91dCBhIGNoYW5nZSBoYXBwZW5pbmcgaW4gYW4gaW5wdXQgZmllbGQuXG4gICAqIFNpbmNlIHRoZSBjb21wb25lbnQgaXMgbm90IGEgbmF0aXZlIEFuZ3VsYXIgY29tcG9uZW50IGhhdmUgdG8gc3BlY2lmaXkgdGhlIGV2ZW50IGVtaXR0ZXIgb3Vyc2VsZlxuICAgKi9cbiAgQE91dHB1dCgnY2hhbmdlJykgb25DaGFuZ2U6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAgLyogdHNsaW50OmRpc2FibGUtbmV4dC1saW5lICovXG4gIHByb3BhZ2F0ZUNoYW5nZSA9IChfOiBhbnkpID0+IHt9O1xuICBvblRvdWNoZWQgPSAoKSA9PiBub29wO1xuXG4gIC8qKlxuICAgKiBTZXQgaWYgdXNpbmcgRWxlY3Ryb24gbW9kZSB3aGVuIG9iamVjdCBpcyBjcmVhdGVkXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHpvbmU6IE5nWm9uZSxcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgKSB7XG4gICAgLy8gc2luY2UgYWNjZXNzaW5nIHRoZSB3aW5kb3cgb2JqZWN0IG5lZWQgdGhpcyBjaGVjayBzbyBzZXJ2ZXJzaWRlIHJlbmRlcmluZyBkb2Vzbid0IGZhaWxcbiAgICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAnb2JqZWN0JyAmJiAhIWRvY3VtZW50KSB7XG4gICAgICAgIC8qIHRzbGludDpkaXNhYmxlLW5leHQtbGluZSAqL1xuICAgICAgICB0aGlzLl9pc0VsZWN0cm9uQXBwID0gKCg8YW55PndpbmRvdylbJ3Byb2Nlc3MnXSkgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLl9pc0VsZWN0cm9uQXBwKSB7XG4gICAgICAgICAgICB0aGlzLl9hcHBQYXRoID0gZWxlY3Ryb24ucmVtb3RlLmFwcC5nZXRBcHBQYXRoKCkuc3BsaXQoJ1xcXFwnKS5qb2luKCcvJyk7XG4gICAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogdmFsdWU/OiBzdHJpbmdcbiAgICogVmFsdWUgaW4gdGhlIEVkaXRvciBhZnRlciBhc3luYyBnZXRFZGl0b3JDb250ZW50IHdhcyBjYWxsZWRcbiAgICovXG4gIEBJbnB1dCgndmFsdWUnKVxuICBzZXQgdmFsdWUodmFsdWU6IHN0cmluZykge1xuICAgIC8vIENsZWFyIGFueSB0aW1lb3V0IHRoYXQgbWlnaHQgb3ZlcndyaXRlIHRoaXMgdmFsdWUgc2V0IGluIHRoZSBmdXR1cmVcbiAgICBpZiAodGhpcy5fc2V0VmFsdWVUaW1lb3V0KSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9zZXRWYWx1ZVRpbWVvdXQpO1xuICAgIH1cbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3dlYnZpZXcuc2VuZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gZG9uJ3Qgd2FudCB0byBrZWVwIHNlbmRpbmcgY29udGVudCBpZiBldmVudCBjYW1lIGZyb20gSVBDLCBpbmZpbml0ZSBsb29wXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9mcm9tRWRpdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnc2V0RWRpdG9yQ29udGVudCcsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5vbkVkaXRvclZhbHVlQ2hhbmdlLmVtaXQodW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BhZ2F0ZUNoYW5nZSh0aGlzLl92YWx1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkNoYW5nZS5lbWl0KHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZnJvbUVkaXRvciA9IGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBFZGl0b3IgaXMgbm90IGxvYWRlZCB5ZXQsIHRyeSBhZ2FpbiBpbiBoYWxmIGEgc2Vjb25kXG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0VmFsdWVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2VkaXRvciAmJiB0aGlzLl9lZGl0b3Iuc2V0VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAvLyBkb24ndCB3YW50IHRvIGtlZXAgc2VuZGluZyBjb250ZW50IGlmIGV2ZW50IGNhbWUgZnJvbSB0aGUgZWRpdG9yLCBpbmZpbml0ZSBsb29wXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9mcm9tRWRpdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2VkaXRvci5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMub25FZGl0b3JWYWx1ZUNoYW5nZS5lbWl0KHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wYWdhdGVDaGFuZ2UodGhpcy5fdmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoaXMub25DaGFuZ2UuZW1pdCh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLnpvbmUucnVuKCgpID0+IHRoaXMuX3ZhbHVlID0gdmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gRWRpdG9yIGlzIG5vdCBsb2FkZWQgeWV0LCB0cnkgYWdhaW4gaW4gaGFsZiBhIHNlY29uZFxuICAgICAgICAgICAgICB0aGlzLl9zZXRWYWx1ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zZXRWYWx1ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfSwgNTAwKTtcbiAgICB9XG4gIH1cblxuICBnZXQgdmFsdWUoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICAgKi9cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgLy8gZG8gbm90IHdyaXRlIGlmIG51bGwgb3IgdW5kZWZpbmVkXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lXG4gICAgaWYgKCB2YWx1ZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogYW55KTogdm9pZCB7XG4gICAgdGhpcy5wcm9wYWdhdGVDaGFuZ2UgPSBmbjtcbiAgfVxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogYW55KTogdm9pZCB7XG4gICAgdGhpcy5vblRvdWNoZWQgPSBmbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXRFZGl0b3JDb250ZW50PzogZnVuY3Rpb25cbiAgICogUmV0dXJucyB0aGUgY29udGVudCB3aXRoaW4gdGhlIGVkaXRvclxuICAgKi9cbiAgZ2V0VmFsdWUoKTogT2JzZXJ2YWJsZTxzdHJpbmc+IHtcbiAgICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdnZXRFZGl0b3JDb250ZW50Jyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgICAgIHRoaXMuX3ZhbHVlID0gdGhpcy5fZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdWJqZWN0Lm5leHQodGhpcy5fdmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3N1YmplY3QuY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uRWRpdG9yVmFsdWVDaGFuZ2UuZW1pdCh1bmRlZmluZWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIGxhbmd1YWdlPzogc3RyaW5nXG4gICAqIGxhbmd1YWdlIHVzZWQgaW4gZWRpdG9yXG4gICAqL1xuICBASW5wdXQoJ2xhbmd1YWdlJylcbiAgc2V0IGxhbmd1YWdlKGxhbmd1YWdlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9sYW5ndWFnZSA9IGxhbmd1YWdlO1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdzZXRMYW5ndWFnZScsIGxhbmd1YWdlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgICAgIGxldCBjdXJyZW50VmFsdWU6IHN0cmluZyA9IHRoaXMuX2VkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgdGhpcy5fZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIGxldCBteURpdjogSFRNTERpdkVsZW1lbnQgPSB0aGlzLl9lZGl0b3JDb250YWluZXIubmF0aXZlRWxlbWVudDtcbiAgICAgICAgICAgIHRoaXMuX2VkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKG15RGl2LCBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICAgIGxhbmd1YWdlOiBsYW5ndWFnZSxcbiAgICAgICAgICAgICAgICB0aGVtZTogdGhpcy5fdGhlbWUsXG4gICAgICAgICAgICB9LCB0aGlzLmVkaXRvck9wdGlvbnMpKTtcbiAgICAgICAgICAgIHRoaXMuX2VkaXRvci5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlQ29udGVudCggKGU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMud3JpdGVWYWx1ZSh0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMub25FZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZC5lbWl0KHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB0aGlzLm9uRWRpdG9yTGFuZ3VhZ2VDaGFuZ2VkLmVtaXQodW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXQgbGFuZ3VhZ2UoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fbGFuZ3VhZ2U7XG4gIH1cblxuICAvKipcbiAgICogcmVnaXN0ZXJMYW5ndWFnZT86IGZ1bmN0aW9uXG4gICAqIFJlZ2lzdGVycyBhIGN1c3RvbSBMYW5ndWFnZSB3aXRoaW4gdGhlIGVkaXRvclxuICAgKi9cbiAgcmVnaXN0ZXJMYW5ndWFnZShsYW5ndWFnZTogYW55KTogdm9pZCB7XG4gICAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgncmVnaXN0ZXJMYW5ndWFnZScsIGxhbmd1YWdlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgICAgIGxldCBjdXJyZW50VmFsdWU6IHN0cmluZyA9IHRoaXMuX2VkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgdGhpcy5fZWRpdG9yLmRpc3Bvc2UoKTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGxhbmd1YWdlLmNvbXBsZXRpb25JdGVtUHJvdmlkZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgcHJvdmlkZXI6IGFueSA9IGxhbmd1YWdlLmNvbXBsZXRpb25JdGVtUHJvdmlkZXJbaV07XG4gICAgICAgICAgICAgICAgLyogdHNsaW50OmRpc2FibGUtbmV4dC1saW5lICovXG4gICAgICAgICAgICAgICAgcHJvdmlkZXIua2luZCA9IGV2YWwocHJvdmlkZXIua2luZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgbGFuZ3VhZ2UubW9uYXJjaFRva2Vuc1Byb3ZpZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG1vbmFyY2hUb2tlbnM6IGFueSA9IGxhbmd1YWdlLm1vbmFyY2hUb2tlbnNQcm92aWRlcltpXTtcbiAgICAgICAgICAgICAgICAvKiB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmUgKi9cbiAgICAgICAgICAgICAgICBtb25hcmNoVG9rZW5zWzBdID0gZXZhbChtb25hcmNoVG9rZW5zWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1vbmFjby5sYW5ndWFnZXMucmVnaXN0ZXIoeyBpZDogbGFuZ3VhZ2UuaWQgfSk7XG5cbiAgICAgICAgICAgIG1vbmFjby5sYW5ndWFnZXMuc2V0TW9uYXJjaFRva2Vuc1Byb3ZpZGVyKGxhbmd1YWdlLmlkLCB7XG4gICAgICAgICAgICAgICAgdG9rZW5pemVyOiB7XG4gICAgICAgICAgICAgICAgICAgIHJvb3Q6IGxhbmd1YWdlLm1vbmFyY2hUb2tlbnNQcm92aWRlcixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIERlZmluZSBhIG5ldyB0aGVtZSB0aGF0IGNvbnN0YWlucyBvbmx5IHJ1bGVzIHRoYXQgbWF0Y2ggdGhpcyBsYW5ndWFnZVxuICAgICAgICAgICAgbW9uYWNvLmVkaXRvci5kZWZpbmVUaGVtZShsYW5ndWFnZS5jdXN0b21UaGVtZS5pZCwgbGFuZ3VhZ2UuY3VzdG9tVGhlbWUudGhlbWUpO1xuICAgICAgICAgICAgdGhpcy5fdGhlbWUgPSBsYW5ndWFnZS5jdXN0b21UaGVtZS5pZDtcblxuICAgICAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5yZWdpc3RlckNvbXBsZXRpb25JdGVtUHJvdmlkZXIobGFuZ3VhZ2UuaWQsIHtcbiAgICAgICAgICAgICAgICBwcm92aWRlQ29tcGxldGlvbkl0ZW1zOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYW5ndWFnZS5jb21wbGV0aW9uSXRlbVByb3ZpZGVyO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGV0IGNzczogSFRNTFN0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgICAgICBjc3MudHlwZSA9ICd0ZXh0L2Nzcyc7XG4gICAgICAgICAgICBjc3MuaW5uZXJIVE1MID0gbGFuZ3VhZ2UubW9uYXJjaFRva2Vuc1Byb3ZpZGVyQ1NTO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjc3MpO1xuICAgICAgICAgICAgdGhpcy5vbkVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkLmVtaXQodW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHN0eWxlPzogc3RyaW5nXG4gICAqIGNzcyBzdHlsZSBvZiB0aGUgZWRpdG9yIG9uIHRoZSBwYWdlXG4gICAqL1xuICBASW5wdXQoJ2VkaXRvclN0eWxlJylcbiAgc2V0IGVkaXRvclN0eWxlKGVkaXRvclN0eWxlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9lZGl0b3JTdHlsZSA9IGVkaXRvclN0eWxlO1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdzZXRFZGl0b3JTdHlsZScsIHtsYW5ndWFnZTogdGhpcy5fbGFuZ3VhZ2UsIHRoZW1lOiB0aGlzLl90aGVtZSwgc3R5bGU6IGVkaXRvclN0eWxlfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICAgICAgICBsZXQgY29udGFpbmVyRGl2OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50O1xuICAgICAgICAgICAgY29udGFpbmVyRGl2LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBlZGl0b3JTdHlsZSk7XG4gICAgICAgICAgICBsZXQgY3VycmVudFZhbHVlOiBzdHJpbmcgPSB0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgIHRoaXMuX2VkaXRvci5kaXNwb3NlKCk7XG4gICAgICAgICAgICBsZXQgbXlEaXY6IEhUTUxEaXZFbGVtZW50ID0gdGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgICAgICB0aGlzLl9lZGl0b3IgPSBtb25hY28uZWRpdG9yLmNyZWF0ZShteURpdiwgT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICAgICAgdmFsdWU6IGN1cnJlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICBsYW5ndWFnZTogdGhpcy5fbGFuZ3VhZ2UsXG4gICAgICAgICAgICAgICAgdGhlbWU6IHRoaXMuX3RoZW1lLFxuICAgICAgICAgICAgfSwgdGhpcy5lZGl0b3JPcHRpb25zKSk7XG4gICAgICAgICAgICB0aGlzLl9lZGl0b3IuZ2V0TW9kZWwoKS5vbkRpZENoYW5nZUNvbnRlbnQoIChlOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9mcm9tRWRpdG9yID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLndyaXRlVmFsdWUodGhpcy5fZWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0IGVkaXRvclN0eWxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRvclN0eWxlO1xuICB9XG5cbiAgLyoqXG4gICAqIHRoZW1lPzogc3RyaW5nXG4gICAqIFRoZW1lIHRvIGJlIGFwcGxpZWQgdG8gZWRpdG9yXG4gICAqL1xuICBASW5wdXQoJ3RoZW1lJylcbiAgc2V0IHRoZW1lKHRoZW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLl90aGVtZSA9IHRoZW1lO1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdzZXRFZGl0b3JPcHRpb25zJywgeyd0aGVtZSc6IHRoZW1lfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICAgICAgICB0aGlzLl9lZGl0b3IudXBkYXRlT3B0aW9ucyh7J3RoZW1lJzogdGhlbWV9KTtcbiAgICAgICAgICAgIHRoaXMub25FZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZC5lbWl0KHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0IHRoZW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3RoZW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIGZ1bGxTY3JlZW5LZXlCaW5kaW5nPzogbnVtYmVyXG4gICAqIFNlZSBoZXJlIGZvciBrZXkgYmluZGluZ3MgaHR0cHM6Ly9taWNyb3NvZnQuZ2l0aHViLmlvL21vbmFjby1lZGl0b3IvYXBpL2VudW1zL21vbmFjby5rZXljb2RlLmh0bWxcbiAgICogU2V0cyB0aGUgS2V5Q29kZSBmb3Igc2hvcnRjdXR0aW5nIHRvIEZ1bGxzY3JlZW4gbW9kZVxuICAgKi9cbiAgQElucHV0KCdmdWxsU2NyZWVuS2V5QmluZGluZycpXG4gIHNldCBmdWxsU2NyZWVuS2V5QmluZGluZyhrZXljb2RlOiBudW1iZXJbXSkge1xuICAgIHRoaXMuX2tleWNvZGUgPSBrZXljb2RlO1xuICB9XG4gIGdldCBmdWxsU2NyZWVuS2V5QmluZGluZygpOiBudW1iZXJbXSB7XG4gICAgcmV0dXJuIHRoaXMuX2tleWNvZGU7XG4gIH1cblxuICAvKipcbiAgICogZWRpdG9yT3B0aW9ucz86IE9iamVjdFxuICAgKiBPcHRpb25zIHVzZWQgb24gZWRpdG9yIGluc3RhbnRpYXRpb24uIEF2YWlsYWJsZSBvcHRpb25zIGxpc3RlZCBoZXJlOlxuICAgKiBodHRwczovL21pY3Jvc29mdC5naXRodWIuaW8vbW9uYWNvLWVkaXRvci9hcGkvaW50ZXJmYWNlcy9tb25hY28uZWRpdG9yLmllZGl0b3JvcHRpb25zLmh0bWxcbiAgICovXG4gIEBJbnB1dCgnZWRpdG9yT3B0aW9ucycpXG4gIHNldCBlZGl0b3JPcHRpb25zKGVkaXRvck9wdGlvbnM6IGFueSkge1xuICAgICAgdGhpcy5fZWRpdG9yT3B0aW9ucyA9IGVkaXRvck9wdGlvbnM7XG4gICAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3NldEVkaXRvck9wdGlvbnMnLCBlZGl0b3JPcHRpb25zKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgICB0aGlzLl9lZGl0b3IudXBkYXRlT3B0aW9ucyhlZGl0b3JPcHRpb25zKTtcbiAgICAgICAgICB0aGlzLm9uRWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCh1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gIH1cbiAgZ2V0IGVkaXRvck9wdGlvbnMoKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdG9yT3B0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBsYXlvdXQgbWV0aG9kIHRoYXQgY2FsbHMgbGF5b3V0IG1ldGhvZCBvZiBlZGl0b3IgYW5kIGluc3RydWN0cyB0aGUgZWRpdG9yIHRvIHJlbWVhc3VyZSBpdHMgY29udGFpbmVyXG4gICAqL1xuICAgbGF5b3V0KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdsYXlvdXQnKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgICAgIHRoaXMuX2VkaXRvci5sYXlvdXQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGlmIGluIEVsZWN0cm9uIG1vZGUgb3Igbm90XG4gICAqL1xuICBnZXQgaXNFbGVjdHJvbkFwcCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNFbGVjdHJvbkFwcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGlmIGluIEZ1bGwgU2NyZWVuIE1vZGUgb3Igbm90XG4gICAqL1xuICBnZXQgaXNGdWxsU2NyZWVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc0Z1bGxTY3JlZW47XG4gIH1cblxuLyoqXG4gKiBzZXRFZGl0b3JOb2RlTW9kdWxlRGlyT3ZlcnJpZGUgZnVuY3Rpb24gdGhhdCBvdmVycmlkZXMgd2hlcmUgdG8gbG9va1xuICogZm9yIHRoZSBlZGl0b3Igbm9kZV9tb2R1bGUuIFVzZWQgaW4gdGVzdHMgZm9yIEVsZWN0cm9uIG9yIGFueXdoZXJlIHRoYXQgdGhlXG4gKiBub2RlX21vZHVsZXMgYXJlIG5vdCBpbiB0aGUgZXhwZWN0ZWQgbG9jYXRpb24uXG4gKi9cbiAgc2V0RWRpdG9yTm9kZU1vZHVsZURpck92ZXJyaWRlKGRpck92ZXJyaWRlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgIHRoaXMuX2VkaXRvck5vZGVNb2R1bGVEaXJPdmVycmlkZSA9IGRpck92ZXJyaWRlO1xuICAgICAgdGhpcy5fYXBwUGF0aCA9IGRpck92ZXJyaWRlO1xuICB9XG5cbiAgLyoqXG4gICAqIG5nT25Jbml0IG9ubHkgdXNlZCBmb3IgRWxlY3Ryb24gdmVyc2lvbiBvZiBlZGl0b3JcbiAgICogVGhpcyBpcyB3aGVyZSB0aGUgd2VidmlldyBpcyBjcmVhdGVkIHRvIHNhbmRib3ggYXdheSB0aGUgZWRpdG9yXG4gICAqL1xuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICBsZXQgZWRpdG9ySFRNTDogc3RyaW5nID0gJyc7XG4gICAgaWYgKHRoaXMuX2lzRWxlY3Ryb25BcHApIHtcbiAgICAgICAgZWRpdG9ySFRNTCA9IGA8IURPQ1RZUEUgaHRtbD5cbiAgICAgICAgICAgIDxodG1sIHN0eWxlPVwiaGVpZ2h0OjEwMCVcIj5cbiAgICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgICAgIDxtZXRhIGh0dHAtZXF1aXY9XCJYLVVBLUNvbXBhdGlibGVcIiBjb250ZW50PVwiSUU9ZWRnZVwiIC8+XG4gICAgICAgICAgICAgICAgPG1ldGEgaHR0cC1lcXVpdj1cIkNvbnRlbnQtVHlwZVwiIGNvbnRlbnQ9XCJ0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOFwiID5cbiAgICAgICAgICAgICAgICA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgZGF0YS1uYW1lPVwidnMvZWRpdG9yL2VkaXRvci5tYWluXCJcbiAgICAgICAgICAgICAgICAgICAgaHJlZj1cImZpbGU6Ly8ke3RoaXMuX2VkaXRvck5vZGVNb2R1bGVEaXJPdmVycmlkZX0vYXNzZXRzL21vbmFjby92cy9lZGl0b3IvZWRpdG9yLm1haW4uY3NzXCI+XG4gICAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgICA8Ym9keSBzdHlsZT1cImhlaWdodDoxMDAlO3dpZHRoOiAxMDAlO21hcmdpbjogMDtwYWRkaW5nOiAwO292ZXJmbG93OiBoaWRkZW47XCI+XG4gICAgICAgICAgICA8ZGl2IGlkPVwiJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn1cIiBzdHlsZT1cIndpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7JHt0aGlzLl9lZGl0b3JTdHlsZX1cIj48L2Rpdj5cbiAgICAgICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBpcGNSZW5kZXJlciBvZiBlbGVjdHJvbiBmb3IgY29tbXVuaWNhdGlvblxuICAgICAgICAgICAgICAgIGNvbnN0IHtpcGNSZW5kZXJlcn0gPSByZXF1aXJlKCdlbGVjdHJvbicpO1xuICAgICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgICAgICA8c2NyaXB0IHNyYz1cImZpbGU6Ly8ke3RoaXMuX2VkaXRvck5vZGVNb2R1bGVEaXJPdmVycmlkZX0vYXNzZXRzL21vbmFjby92cy9sb2FkZXIuanNcIj48L3NjcmlwdD5cbiAgICAgICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICAgICAgICAgdmFyIGVkaXRvcjtcbiAgICAgICAgICAgICAgICB2YXIgdGhlbWUgPSAnJHt0aGlzLl90aGVtZX0nO1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9ICcke3RoaXMuX3ZhbHVlfSc7XG5cbiAgICAgICAgICAgICAgICByZXF1aXJlLmNvbmZpZyh7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VVcmw6ICcke3RoaXMuX2FwcFBhdGh9L2Fzc2V0cy9tb25hY28nXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2VsZi5tb2R1bGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgc2VsZi5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgcmVxdWlyZShbJ3ZzL2VkaXRvci9lZGl0b3IubWFpbiddLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yID0gbW9uYWNvLmVkaXRvci5jcmVhdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7dGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJ9JyksIE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFuZ3VhZ2U6ICcke3RoaXMubGFuZ3VhZ2V9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAnJHt0aGlzLl90aGVtZX0nLFxuICAgICAgICAgICAgICAgICAgICB9LCAke0pTT04uc3RyaW5naWZ5KHRoaXMuZWRpdG9yT3B0aW9ucyl9KSk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlQ29udGVudCggKGUpPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIuc2VuZFRvSG9zdChcIm9uRWRpdG9yQ29udGVudENoYW5nZVwiLCBlZGl0b3IuZ2V0VmFsdWUoKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IuYWRkQWN0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBBbiB1bmlxdWUgaWRlbnRpZmllciBvZiB0aGUgY29udHJpYnV0ZWQgYWN0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZnVsbFNjcmVlbicsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gQSBsYWJlbCBvZiB0aGUgYWN0aW9uIHRoYXQgd2lsbCBiZSBwcmVzZW50ZWQgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdGdWxsIFNjcmVlbicsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gQW4gb3B0aW9uYWwgYXJyYXkgb2Yga2V5YmluZGluZ3MgZm9yIHRoZSBhY3Rpb24uXG4gICAgICAgICAgICAgICAgICAgICAgY29udGV4dE1lbnVHcm91cElkOiAnbmF2aWdhdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAga2V5YmluZGluZ3M6IFske3RoaXMuX2tleWNvZGV9XSxcbiAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0TWVudU9yZGVyOiAxLjUsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gTWV0aG9kIHRoYXQgd2lsbCBiZSBleGVjdXRlZCB3aGVuIHRoZSBhY3Rpb24gaXMgdHJpZ2dlcmVkLlxuICAgICAgICAgICAgICAgICAgICAgIC8vIEBwYXJhbSBlZGl0b3IgVGhlIGVkaXRvciBpbnN0YW5jZSBpcyBwYXNzZWQgaW4gYXMgYSBjb252aW5pZW5jZVxuICAgICAgICAgICAgICAgICAgICAgIHJ1bjogZnVuY3Rpb24oZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlZGl0b3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRvckRpdi53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbigpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5hZGRBY3Rpb24oe1xuICAgICAgICAgICAgICAgICAgICAgIC8vIEFuIHVuaXF1ZSBpZGVudGlmaWVyIG9mIHRoZSBjb250cmlidXRlZCBhY3Rpb24uXG4gICAgICAgICAgICAgICAgICAgICAgaWQ6ICdleGl0ZnVsbFNjcmVlbicsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gQSBsYWJlbCBvZiB0aGUgYWN0aW9uIHRoYXQgd2lsbCBiZSBwcmVzZW50ZWQgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFeGl0IEZ1bGwgU2NyZWVuJyxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBBbiBvcHRpb25hbCBhcnJheSBvZiBrZXliaW5kaW5ncyBmb3IgdGhlIGFjdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0TWVudUdyb3VwSWQ6ICduYXZpZ2F0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgICBrZXliaW5kaW5nczogWzldLFxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHRNZW51T3JkZXI6IDEuNSxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBNZXRob2QgdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGFjdGlvbiBpcyB0cmlnZ2VyZWQuXG4gICAgICAgICAgICAgICAgICAgICAgLy8gQHBhcmFtIGVkaXRvciBUaGUgZWRpdG9yIGluc3RhbmNlIGlzIHBhc3NlZCBpbiBhcyBhIGNvbnZpbmllbmNlXG4gICAgICAgICAgICAgICAgICAgICAgcnVuOiBmdW5jdGlvbihlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVkaXRvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke3RoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyfScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQud2Via2l0RXhpdEZ1bGxzY3JlZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwib25FZGl0b3JJbml0aWFsaXplZFwiLCB0aGlzLl9lZGl0b3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIGJhY2sgdGhlIHZhbHVlIGluIHRoZSBlZGl0b3IgdG8gdGhlIG1haW52aWV3XG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ2dldEVkaXRvckNvbnRlbnQnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwiZWRpdG9yQ29udGVudFwiLCBlZGl0b3IuZ2V0VmFsdWUoKSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIHZhbHVlIG9mIHRoZSBlZGl0b3IgZnJvbSB3aGF0IHdhcyBzZW50IGZyb20gdGhlIG1haW52aWV3XG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ3NldEVkaXRvckNvbnRlbnQnLCBmdW5jdGlvbihldmVudCwgZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLnNldFZhbHVlKGRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBzdHlsZSBvZiB0aGUgZWRpdG9yIGNvbnRhaW5lciBkaXZcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignc2V0RWRpdG9yU3R5bGUnLCBmdW5jdGlvbihldmVudCwgZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlZGl0b3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn0nKTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yRGl2LnN0eWxlID0gZGF0YS5zdHlsZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IgPSBtb25hY28uZWRpdG9yLmNyZWF0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn0nKSwgT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFuZ3VhZ2U6IGRhdGEubGFuZ3VhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogZGF0YS50aGVtZSxcbiAgICAgICAgICAgICAgICAgICAgfSwgJHtKU09OLnN0cmluZ2lmeSh0aGlzLmVkaXRvck9wdGlvbnMpfSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBvcHRpb25zIG9mIHRoZSBlZGl0b3IgZnJvbSB3aGF0IHdhcyBzZW50IGZyb20gdGhlIG1haW52aWV3XG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ3NldEVkaXRvck9wdGlvbnMnLCBmdW5jdGlvbihldmVudCwgZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci51cGRhdGVPcHRpb25zKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwib25FZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZFwiLCAnJyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIGxhbmd1YWdlIG9mIHRoZSBlZGl0b3IgZnJvbSB3aGF0IHdhcyBzZW50IGZyb20gdGhlIG1haW52aWV3XG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ3NldExhbmd1YWdlJywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpe1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudFZhbHVlID0gZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke3RoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyfScpLCBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYW5ndWFnZTogZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiB0aGVtZSxcbiAgICAgICAgICAgICAgICAgICAgfSwgJHtKU09OLnN0cmluZ2lmeSh0aGlzLmVkaXRvck9wdGlvbnMpfSkpO1xuICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwib25FZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZFwiLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJvbkVkaXRvckxhbmd1YWdlQ2hhbmdlZFwiLCAnJyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZWdpc3RlciBhIG5ldyBsYW5ndWFnZSB3aXRoIGVkaXRvclxuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdyZWdpc3Rlckxhbmd1YWdlJywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpe1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudFZhbHVlID0gZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5kaXNwb3NlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmNvbXBsZXRpb25JdGVtUHJvdmlkZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcm92aWRlciA9IGRhdGEuY29tcGxldGlvbkl0ZW1Qcm92aWRlcltpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyLmtpbmQgPSBldmFsKHByb3ZpZGVyLmtpbmQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5tb25hcmNoVG9rZW5zUHJvdmlkZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtb25hcmNoVG9rZW5zID0gZGF0YS5tb25hcmNoVG9rZW5zUHJvdmlkZXJbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBtb25hcmNoVG9rZW5zWzBdID0gZXZhbChtb25hcmNoVG9rZW5zWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBtb25hY28ubGFuZ3VhZ2VzLnJlZ2lzdGVyKHsgaWQ6IGRhdGEuaWQgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5zZXRNb25hcmNoVG9rZW5zUHJvdmlkZXIoZGF0YS5pZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5pemVyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdDogZGF0YS5tb25hcmNoVG9rZW5zUHJvdmlkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gRGVmaW5lIGEgbmV3IHRoZW1lIHRoYXQgY29uc3RhaW5zIG9ubHkgcnVsZXMgdGhhdCBtYXRjaCB0aGlzIGxhbmd1YWdlXG4gICAgICAgICAgICAgICAgICAgIG1vbmFjby5lZGl0b3IuZGVmaW5lVGhlbWUoZGF0YS5jdXN0b21UaGVtZS5pZCwgZGF0YS5jdXN0b21UaGVtZS50aGVtZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoZW1lID0gZGF0YS5jdXN0b21UaGVtZS5pZDtcblxuICAgICAgICAgICAgICAgICAgICBtb25hY28ubGFuZ3VhZ2VzLnJlZ2lzdGVyQ29tcGxldGlvbkl0ZW1Qcm92aWRlcihkYXRhLmlkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlQ29tcGxldGlvbkl0ZW1zOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEuY29tcGxldGlvbkl0ZW1Qcm92aWRlclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgY3NzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICAgICAgICAgICAgICAgICAgICBjc3MudHlwZSA9IFwidGV4dC9jc3NcIjtcbiAgICAgICAgICAgICAgICAgICAgY3NzLmlubmVySFRNTCA9IGRhdGEubW9uYXJjaFRva2Vuc1Byb3ZpZGVyQ1NTO1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNzcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIuc2VuZFRvSG9zdChcIm9uRWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWRcIiwgJycpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gSW5zdHJ1Y3QgdGhlIGVkaXRvciB0byByZW1lYXN1cmUgaXRzIGNvbnRhaW5lclxuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdsYXlvdXQnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IubGF5b3V0KCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJbnN0cnVjdCB0aGUgZWRpdG9yIGdvIHRvIGZ1bGwgc2NyZWVuIG1vZGVcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignc2hvd0Z1bGxTY3JlZW5FZGl0b3InLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBlZGl0b3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn0nKTtcbiAgICAgICAgICAgICAgICAgIGVkaXRvckRpdi53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gSW5zdHJ1Y3QgdGhlIGVkaXRvciBleGl0IGZ1bGwgc2NyZWVuIG1vZGVcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignZXhpdEZ1bGxTY3JlZW5FZGl0b3InLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBlZGl0b3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn0nKTtcbiAgICAgICAgICAgICAgICAgIGVkaXRvckRpdi53ZWJraXRFeGl0RnVsbHNjcmVlbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ2Rpc3Bvc2UnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIG5lZWQgdG8gbWFudWFsbHkgcmVzaXplIHRoZSBlZGl0b3IgYW55IHRpbWUgdGhlIHdpbmRvdyBzaXplXG4gICAgICAgICAgICAgICAgLy8gY2hhbmdlcy4gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L21vbmFjby1lZGl0b3IvaXNzdWVzLzI4XG4gICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZnVuY3Rpb24gcmVzaXplRWRpdG9yKCkge1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IubGF5b3V0KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgICAgIDwvaHRtbD5gO1xuXG4gICAgICAgIC8vIGR5bmFtaWNhbGx5IGNyZWF0ZSB0aGUgRWxlY3Ryb24gV2VidmlldyBFbGVtZW50XG4gICAgICAgIC8vIHRoaXMgd2lsbCBzYW5kYm94IHRoZSBtb25hY28gY29kZSBpbnRvIGl0cyBvd24gRE9NIGFuZCBpdHMgb3duXG4gICAgICAgIC8vIGphdmFzY3JpcHQgaW5zdGFuY2UuIE5lZWQgdG8gZG8gdGhpcyB0byBhdm9pZCBwcm9ibGVtcyB3aXRoIG1vbmFjb1xuICAgICAgICAvLyB1c2luZyBBTUQgUmVxdWlyZXMgYW5kIEVsZWN0cm9uIHVzaW5nIE5vZGUgUmVxdWlyZXNcbiAgICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvbW9uYWNvLWVkaXRvci9pc3N1ZXMvOTBcbiAgICAgICAgdGhpcy5fd2VidmlldyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3dlYnZpZXcnKTtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZXRBdHRyaWJ1dGUoJ25vZGVpbnRlZ3JhdGlvbicsICd0cnVlJyk7XG4gICAgICAgIHRoaXMuX3dlYnZpZXcuc2V0QXR0cmlidXRlKCdkaXNhYmxld2Vic2VjdXJpdHknLCAndHJ1ZScpO1xuICAgICAgICAvLyB0YWtlIHRoZSBodG1sIGNvbnRlbnQgZm9yIHRoZSB3ZWJ2aWV3IGFuZCBiYXNlNjQgZW5jb2RlIGl0IGFuZCB1c2UgYXMgdGhlIHNyYyB0YWdcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZXRBdHRyaWJ1dGUoJ3NyYycsICdkYXRhOnRleHQvaHRtbDtiYXNlNjQsJyArIHdpbmRvdy5idG9hKGVkaXRvckhUTUwpKTtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ2Rpc3BsYXk6aW5saW5lLWZsZXg7IHdpZHRoOjEwMCU7IGhlaWdodDoxMDAlJyk7XG4gICAgICAgIC8vICB0aGlzLl93ZWJ2aWV3LmFkZEV2ZW50TGlzdGVuZXIoJ2RvbS1yZWFkeScsICgpID0+IHtcbiAgICAgICAgLy8gICAgIHRoaXMuX3dlYnZpZXcub3BlbkRldlRvb2xzKCk7XG4gICAgICAgIC8vICB9KTtcblxuICAgICAgICAvLyBQcm9jZXNzIHRoZSBkYXRhIGZyb20gdGhlIHdlYnZpZXdcbiAgICAgICAgdGhpcy5fd2Vidmlldy5hZGRFdmVudExpc3RlbmVyKCdpcGMtbWVzc2FnZScsIChldmVudDogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuY2hhbm5lbCA9PT0gJ2VkaXRvckNvbnRlbnQnKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSB0cnVlO1xuICAgICAgICAgICAgICB0aGlzLndyaXRlVmFsdWUoZXZlbnQuYXJnc1swXSk7XG4gICAgICAgICAgICAgIHRoaXMuX3N1YmplY3QubmV4dCh0aGlzLl92YWx1ZSk7XG4gICAgICAgICAgICAgIHRoaXMuX3N1YmplY3QuY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgdGhpcy5fc3ViamVjdCA9IG5ldyBTdWJqZWN0KCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmNoYW5uZWwgPT09ICdvbkVkaXRvckNvbnRlbnRDaGFuZ2UnKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSB0cnVlO1xuICAgICAgICAgICAgICB0aGlzLndyaXRlVmFsdWUoZXZlbnQuYXJnc1swXSk7XG4gICAgICAgICAgICAgIGlmICh0aGlzLmluaXRpYWxDb250ZW50Q2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsQ29udGVudENoYW5nZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMubGF5b3V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmNoYW5uZWwgPT09ICdvbkVkaXRvckluaXRpYWxpemVkJykge1xuICAgICAgICAgICAgICB0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgICAgIHRoaXMuX2VkaXRvclByb3h5ID0gdGhpcy53cmFwRWRpdG9yQ2FsbHModGhpcy5fZWRpdG9yKTtcbiAgICAgICAgICAgICAgdGhpcy5vbkVkaXRvckluaXRpYWxpemVkLmVtaXQodGhpcy5fZWRpdG9yUHJveHkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5jaGFubmVsID09PSAnb25FZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZCcpIHtcbiAgICAgICAgICAgICAgdGhpcy5vbkVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkLmVtaXQodW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY2hhbm5lbCA9PT0gJ29uRWRpdG9yTGFuZ3VhZ2VDaGFuZ2VkJykge1xuICAgICAgICAgICAgICB0aGlzLm9uRWRpdG9yTGFuZ3VhZ2VDaGFuZ2VkLmVtaXQodW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gYXBwZW5kIHRoZSB3ZWJ2aWV3IHRvIHRoZSBET01cbiAgICAgICAgdGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fd2Vidmlldyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIG5nQWZ0ZXJWaWV3SW5pdCBvbmx5IHVzZWQgZm9yIGJyb3dzZXIgdmVyc2lvbiBvZiBlZGl0b3JcbiAgICogVGhpcyBpcyB3aGVyZSB0aGUgQU1EIExvYWRlciBzY3JpcHRzIGFyZSBhZGRlZCB0byB0aGUgYnJvd3NlciBhbmQgdGhlIGVkaXRvciBzY3JpcHRzIGFyZSBcInJlcXVpcmVkXCJcbiAgICovXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2lzRWxlY3Ryb25BcHApIHtcbiAgICAgIGxvYWRNb25hY28oKTtcbiAgICAgIHdhaXRVbnRpbE1vbmFjb1JlYWR5KCkucGlwZShcbiAgICAgICAgdGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3kpLFxuICAgICAgKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICB0aGlzLmluaXRNb25hY28oKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBtZXJnZShcbiAgICAgIGZyb21FdmVudCh3aW5kb3csICdyZXNpemUnKS5waXBlKFxuICAgICAgICBkZWJvdW5jZVRpbWUoMTAwKSxcbiAgICAgICksXG4gICAgICB0aGlzLl93aWR0aFN1YmplY3QuYXNPYnNlcnZhYmxlKCkucGlwZShcbiAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgICksXG4gICAgICB0aGlzLl9oZWlnaHRTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpLnBpcGUoXG4gICAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICApLFxuICAgICkucGlwZShcbiAgICAgIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95KSxcbiAgICAgIGRlYm91bmNlVGltZSgxMDApLFxuICAgICkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMubGF5b3V0KCk7XG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICB9KTtcbiAgICB0aW1lcig1MDAsIDI1MCkucGlwZShcbiAgICAgIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95KSxcbiAgICApLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fZWxlbWVudFJlZiAmJiB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5fd2lkdGhTdWJqZWN0Lm5leHQoKDxIVE1MRWxlbWVudD50aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoKTtcbiAgICAgICAgdGhpcy5faGVpZ2h0U3ViamVjdC5uZXh0KCg8SFRNTEVsZW1lbnQ+dGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYuZGV0YWNoKCk7XG4gICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnZGlzcG9zZScpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICB0aGlzLl9lZGl0b3IuZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9kZXN0cm95Lm5leHQodHJ1ZSk7XG4gICAgdGhpcy5fZGVzdHJveS51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAvKipcbiAgKiBzaG93RnVsbFNjcmVlbkVkaXRvciByZXF1ZXN0IGZvciBmdWxsIHNjcmVlbiBvZiBDb2RlIEVkaXRvciBiYXNlZCBvbiBpdHMgYnJvd3NlciB0eXBlLlxuICAqL1xuICBwdWJsaWMgc2hvd0Z1bGxTY3JlZW5FZGl0b3IoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3Nob3dGdWxsU2NyZWVuRWRpdG9yJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBjb2RlRWRpdG9yRWxlbWVudDogSFRNTERpdkVsZW1lbnQgPSB0aGlzLl9lZGl0b3JDb250YWluZXIubmF0aXZlRWxlbWVudCBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICAgICAgY29uc3QgZnVsbFNjcmVlbk1hcDogT2JqZWN0ID0ge1xuICAgICAgICAgIC8vIENocm9tZVxuICAgICAgICAgICdyZXF1ZXN0RnVsbHNjcmVlbic6ICgpID0+IGNvZGVFZGl0b3JFbGVtZW50LnJlcXVlc3RGdWxsc2NyZWVuKCksXG4gICAgICAgICAgLy8gU2FmYXJpXG4gICAgICAgICAgJ3dlYmtpdFJlcXVlc3RGdWxsc2NyZWVuJzogKCkgPT4gKDxhbnk+Y29kZUVkaXRvckVsZW1lbnQpLndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKCksXG4gICAgICAgICAgLy8gSUVcbiAgICAgICAgICAnbXNSZXF1ZXN0RnVsbHNjcmVlbic6ICgpID0+ICg8YW55PmNvZGVFZGl0b3JFbGVtZW50KS5tc1JlcXVlc3RGdWxsc2NyZWVuKCksXG4gICAgICAgICAgLy8gRmlyZWZveFxuICAgICAgICAgICdtb3pSZXF1ZXN0RnVsbFNjcmVlbic6ICgpID0+ICg8YW55PmNvZGVFZGl0b3JFbGVtZW50KS5tb3pSZXF1ZXN0RnVsbFNjcmVlbigpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGZvciAoY29uc3QgaGFuZGxlciBvZiBPYmplY3Qua2V5cyhmdWxsU2NyZWVuTWFwKSkge1xuICAgICAgICAgIGlmIChjb2RlRWRpdG9yRWxlbWVudFtoYW5kbGVyXSkge1xuICAgICAgICAgICAgICBmdWxsU2NyZWVuTWFwW2hhbmRsZXJdKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2lzRnVsbFNjcmVlbiA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogZXhpdEZ1bGxTY3JlZW5FZGl0b3IgcmVxdWVzdCB0byBleGl0IGZ1bGwgc2NyZWVuIG9mIENvZGUgRWRpdG9yIGJhc2VkIG9uIGl0cyBicm93c2VyIHR5cGUuXG4gICAqL1xuICBwdWJsaWMgZXhpdEZ1bGxTY3JlZW5FZGl0b3IoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2V4aXRGdWxsU2NyZWVuRWRpdG9yJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBleGl0RnVsbFNjcmVlbk1hcDogb2JqZWN0ID0ge1xuICAgICAgICAgIC8vIENocm9tZVxuICAgICAgICAgICdleGl0RnVsbHNjcmVlbic6ICgpID0+IGRvY3VtZW50LmV4aXRGdWxsc2NyZWVuKCksXG4gICAgICAgICAgLy8gU2FmYXJpXG4gICAgICAgICAgJ3dlYmtpdEV4aXRGdWxsc2NyZWVuJzogKCkgPT4gKDxhbnk+ZG9jdW1lbnQpLndlYmtpdEV4aXRGdWxsc2NyZWVuKCksXG4gICAgICAgICAgLy8gRmlyZWZveFxuICAgICAgICAgICdtb3pDYW5jZWxGdWxsU2NyZWVuJzogKCkgPT4gKDxhbnk+ZG9jdW1lbnQpLm1vekNhbmNlbEZ1bGxTY3JlZW4oKSxcbiAgICAgICAgICAvLyBJRVxuICAgICAgICAgICdtc0V4aXRGdWxsc2NyZWVuJzogKCkgPT4gKDxhbnk+ZG9jdW1lbnQpLm1zRXhpdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgfTtcblxuICAgICAgICBmb3IgKGNvbnN0IGhhbmRsZXIgb2YgT2JqZWN0LmtleXMoZXhpdEZ1bGxTY3JlZW5NYXApKSB7XG4gICAgICAgICAgaWYgKGRvY3VtZW50W2hhbmRsZXJdKSB7XG4gICAgICAgICAgICAgIGV4aXRGdWxsU2NyZWVuTWFwW2hhbmRsZXJdKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2lzRnVsbFNjcmVlbiA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIGFkZEZ1bGxTY3JlZW5Nb2RlQ29tbWFuZCB1c2VkIHRvIGFkZCB0aGUgZnVsbHNjcmVlbiBvcHRpb24gdG8gdGhlIGNvbnRleHQgbWVudVxuICAgKi9cbiAgcHJpdmF0ZSBhZGRGdWxsU2NyZWVuTW9kZUNvbW1hbmQoKTogdm9pZCB7XG4gICAgdGhpcy5fZWRpdG9yLmFkZEFjdGlvbih7XG4gICAgICAvLyBBbiB1bmlxdWUgaWRlbnRpZmllciBvZiB0aGUgY29udHJpYnV0ZWQgYWN0aW9uLlxuICAgICAgaWQ6ICdmdWxsU2NyZWVuJyxcbiAgICAgIC8vIEEgbGFiZWwgb2YgdGhlIGFjdGlvbiB0aGF0IHdpbGwgYmUgcHJlc2VudGVkIHRvIHRoZSB1c2VyLlxuICAgICAgbGFiZWw6ICdGdWxsIFNjcmVlbicsXG4gICAgICAvLyBBbiBvcHRpb25hbCBhcnJheSBvZiBrZXliaW5kaW5ncyBmb3IgdGhlIGFjdGlvbi5cbiAgICAgIGNvbnRleHRNZW51R3JvdXBJZDogJ25hdmlnYXRpb24nLFxuICAgICAga2V5YmluZGluZ3M6IHRoaXMuX2tleWNvZGUsXG4gICAgICBjb250ZXh0TWVudU9yZGVyOiAxLjUsXG4gICAgICAvLyBNZXRob2QgdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGFjdGlvbiBpcyB0cmlnZ2VyZWQuXG4gICAgICAvLyBAcGFyYW0gZWRpdG9yIFRoZSBlZGl0b3IgaW5zdGFuY2UgaXMgcGFzc2VkIGluIGFzIGEgY29udmluaWVuY2VcbiAgICAgIHJ1bjogKGVkOiBhbnkpID0+IHtcbiAgICAgICAgdGhpcy5zaG93RnVsbFNjcmVlbkVkaXRvcigpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiB3cmFwRWRpdG9yQ2FsbHMgdXNlZCB0byBwcm94eSBhbGwgdGhlIGNhbGxzIHRvIHRoZSBtb25hY28gZWRpdG9yXG4gICAqIEZvciBjYWxscyBmb3IgRWxlY3Ryb24gdXNlIHRoaXMgdG8gY2FsbCB0aGUgZWRpdG9yIGluc2lkZSB0aGUgd2Vidmlld1xuICAgKi9cbiAgcHJpdmF0ZSB3cmFwRWRpdG9yQ2FsbHMob2JqOiBhbnkpOiBhbnkge1xuICAgIGxldCB0aGF0OiBhbnkgPSB0aGlzO1xuICAgIGxldCBoYW5kbGVyOiBhbnkgPSB7XG4gICAgICBnZXQodGFyZ2V0OiBhbnksIHByb3BLZXk6IGFueSwgcmVjZWl2ZXI6IGFueSk6IGFueSB7XG4gICAgICAgIHJldHVybiBhc3luYyAoLi4uYXJnczogYW55KTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgICAgICAgICBpZiAodGhhdC5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIGlmICh0aGF0Ll93ZWJ2aWV3KSB7XG4gICAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGVKYXZhU2NyaXB0OiBGdW5jdGlvbiA9IChjb2RlOiBzdHJpbmcpID0+XG4gICAgICAgICAgICAgICAgbmV3IFByb21pc2UoKHJlc29sdmU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgdGhhdC5fd2Vidmlldy5leGVjdXRlSmF2YVNjcmlwdChjb2RlLCByZXNvbHZlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgbGV0IHJlc3VsdDogYW55ID0gYXdhaXQgZXhlY3V0ZUphdmFTY3JpcHQoJ2VkaXRvci4nICsgcHJvcEtleSArICcoJyArIGFyZ3MgKyAnKScpO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc3Qgb3JpZ01ldGhvZDogYW55ID0gdGFyZ2V0W3Byb3BLZXldO1xuICAgICAgICAgICAgICBsZXQgcmVzdWx0OiBhbnkgPSBhd2FpdCBvcmlnTWV0aG9kLmFwcGx5KHRoYXQuX2VkaXRvciwgYXJncyk7XG4gICAgICAgICAgICAgIC8vIHNpbmNlIHJ1bm5pbmcgamF2YXNjcmlwdCBjb2RlIG1hbnVhbGx5IG5lZWQgdG8gZm9yY2UgQW5ndWxhciB0byBkZXRlY3QgY2hhbmdlc1xuICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGF0LnpvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhhdC5fY2hhbmdlRGV0ZWN0b3JSZWZbJ2Rlc3Ryb3llZCddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Ll9jaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICB9O1xuICAgIHJldHVybiBuZXcgUHJveHkob2JqLCBoYW5kbGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBpbml0TW9uYWNvIG1ldGhvZCBjcmVhdGVzIHRoZSBtb25hY28gZWRpdG9yIGludG8gdGhlIEBWaWV3Q2hpbGQoJ2VkaXRvckNvbnRhaW5lcicpXG4gICAqIGFuZCBlbWl0IHRoZSBvbkVkaXRvckluaXRpYWxpemVkIGV2ZW50LiAgVGhpcyBpcyBvbmx5IHVzZWQgaW4gdGhlIGJyb3dzZXIgdmVyc2lvbi5cbiAgICovXG4gIHByaXZhdGUgaW5pdE1vbmFjbygpOiB2b2lkIHtcbiAgICBsZXQgY29udGFpbmVyRGl2OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50O1xuICAgIGNvbnRhaW5lckRpdi5pZCA9IHRoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyO1xuICAgIHRoaXMuX2VkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKGNvbnRhaW5lckRpdiwgT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIHZhbHVlOiB0aGlzLl92YWx1ZSxcbiAgICAgICAgbGFuZ3VhZ2U6IHRoaXMubGFuZ3VhZ2UsXG4gICAgICAgIHRoZW1lOiB0aGlzLl90aGVtZSxcbiAgICB9LCB0aGlzLmVkaXRvck9wdGlvbnMpKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5fZWRpdG9yUHJveHkgPSB0aGlzLndyYXBFZGl0b3JDYWxscyh0aGlzLl9lZGl0b3IpO1xuICAgICAgICB0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIHRoaXMub25FZGl0b3JJbml0aWFsaXplZC5lbWl0KHRoaXMuX2VkaXRvclByb3h5KTtcbiAgICB9KTtcbiAgICB0aGlzLl9lZGl0b3IuZ2V0TW9kZWwoKS5vbkRpZENoYW5nZUNvbnRlbnQoIChlOiBhbnkpID0+IHtcbiAgICAgICAgdGhpcy5fZnJvbUVkaXRvciA9IHRydWU7XG4gICAgICAgIHRoaXMud3JpdGVWYWx1ZSh0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKSk7XG4gICAgICAgIGlmICh0aGlzLmluaXRpYWxDb250ZW50Q2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLmluaXRpYWxDb250ZW50Q2hhbmdlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmxheW91dCgpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5hZGRGdWxsU2NyZWVuTW9kZUNvbW1hbmQoKTtcbiAgfVxuXG59XG4iXX0=