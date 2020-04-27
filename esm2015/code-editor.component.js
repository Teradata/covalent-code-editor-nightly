/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { __awaiter } from "tslib";
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, forwardRef, NgZone, ChangeDetectorRef, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { fromEvent, merge, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { waitUntilMonacoReady, loadMonaco } from './code-editor.utils';
/** @type {?} */
const noop = (/**
 * @return {?}
 */
() => {
    // empty method
});
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
        this._registeredLanguagesStyles = [];
        /**
         * editorInitialized: function($event)
         * Event emitted when editor is first initialized
         */
        this.editorInitialized = new EventEmitter();
        /**
         * editorConfigurationChanged: function($event)
         * Event emitted when editor's configuration changes
         */
        this.editorConfigurationChanged = new EventEmitter();
        /**
         * editorLanguageChanged: function($event)
         * Event emitted when editor's Language changes
         */
        this.editorLanguageChanged = new EventEmitter();
        /**
         * editorValueChange: function($event)
         * Event emitted any time something changes the editor value
         */
        this.editorValueChange = new EventEmitter();
        /**
         * The change event notifies you about a change happening in an input field.
         * Since the component is not a native Angular component have to specifiy the event emitter ourself
         */
        this.change = new EventEmitter();
        /* tslint:disable-next-line */
        this.propagateChange = (/**
         * @param {?} _
         * @return {?}
         */
        (_) => { });
        this.onTouched = (/**
         * @return {?}
         */
        () => noop);
        // since accessing the window object need this check so serverside rendering doesn't fail
        if (typeof document === 'object' && !!document) {
            /* tslint:disable-next-line */
            this._isElectronApp = ((/** @type {?} */ (window)))['process'] ? true : false;
            if (this._isElectronApp) {
                this._appPath = electron.remote.app.getAppPath().split('\\').join('/');
            }
        }
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
                    this.editorValueChange.emit();
                    this.propagateChange(this._value);
                    this.change.emit();
                    this._fromEditor = false;
                }
                else {
                    // Editor is not loaded yet, try again in half a second
                    this._setValueTimeout = setTimeout((/**
                     * @return {?}
                     */
                    () => {
                        this.value = value;
                    }), 500);
                }
            }
            else {
                if (this._editor && this._editor.setValue) {
                    // don't want to keep sending content if event came from the editor, infinite loop
                    if (!this._fromEditor) {
                        this._editor.setValue(value);
                    }
                    this.editorValueChange.emit();
                    this.propagateChange(this._value);
                    this.change.emit();
                    this._fromEditor = false;
                    this.zone.run((/**
                     * @return {?}
                     */
                    () => (this._value = value)));
                }
                else {
                    // Editor is not loaded yet, try again in half a second
                    this._setValueTimeout = setTimeout((/**
                     * @return {?}
                     */
                    () => {
                        this.value = value;
                    }), 500);
                }
            }
        }
        else {
            this._setValueTimeout = setTimeout((/**
             * @return {?}
             */
            () => {
                this.value = value;
            }), 500);
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
                setTimeout((/**
                 * @return {?}
                 */
                () => {
                    this._subject.next(this._value);
                    this._subject.complete();
                    this._subject = new Subject();
                    this.editorValueChange.emit();
                }));
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
                const currentValue = this._editor.getValue();
                this._editor.dispose();
                /** @type {?} */
                const myDiv = this._editorContainer.nativeElement;
                this._editor = monaco.editor.create(myDiv, Object.assign({
                    value: currentValue,
                    language,
                    theme: this._theme,
                }, this.editorOptions));
                this._editor.getModel().onDidChangeContent((/**
                 * @param {?} e
                 * @return {?}
                 */
                (e) => {
                    this._fromEditor = true;
                    this.writeValue(this._editor.getValue());
                }));
                this.editorConfigurationChanged.emit();
                this.editorLanguageChanged.emit();
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
                this._editor.dispose();
                for (const provider of language.completionItemProvider) {
                    /* tslint:disable-next-line */
                    provider.kind = eval(provider.kind);
                }
                for (const monarchTokens of language.monarchTokensProvider) {
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
                    provideCompletionItems: (/**
                     * @return {?}
                     */
                    () => {
                        return language.completionItemProvider;
                    }),
                });
                /** @type {?} */
                const css = document.createElement('style');
                css.type = 'text/css';
                css.innerHTML = language.monarchTokensProviderCSS;
                document.body.appendChild(css);
                this.editorConfigurationChanged.emit();
                this._registeredLanguagesStyles = [...this._registeredLanguagesStyles, css];
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
                const containerDiv = this._editorContainer.nativeElement;
                containerDiv.setAttribute('style', editorStyle);
                /** @type {?} */
                const currentValue = this._editor.getValue();
                this._editor.dispose();
                /** @type {?} */
                const myDiv = this._editorContainer.nativeElement;
                this._editor = monaco.editor.create(myDiv, Object.assign({
                    value: currentValue,
                    language: this._language,
                    theme: this._theme,
                }, this.editorOptions));
                this._editor.getModel().onDidChangeContent((/**
                 * @param {?} e
                 * @return {?}
                 */
                (e) => {
                    this._fromEditor = true;
                    this.writeValue(this._editor.getValue());
                }));
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
                this._webview.send('setEditorOptions', { theme });
            }
            else if (this._editor) {
                this._editor.updateOptions({ theme });
                this.editorConfigurationChanged.emit();
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
     * editorOptions?: object
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
                this.editorConfigurationChanged.emit();
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
                var registeredLanguagesStyles = [];

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
                    ipcRenderer.sendToHost("editorInitialized", this._editor);
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
                    ipcRenderer.sendToHost("editorConfigurationChanged", '');
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
                    ipcRenderer.sendToHost("editorConfigurationChanged", '');
                    ipcRenderer.sendToHost("editorLanguageChanged", '');
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
                    registeredLanguagesStyles = [...registeredLanguagesStyles, css];


                    ipcRenderer.sendToHost("editorConfigurationChanged", '');
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
                  registeredLanguagesStyles.forEach((style) => style.remove());
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
            // to debug:
            //  this._webview.addEventListener('dom-ready', () => {
            //     this._webview.openDevTools();
            //  });
            // Process the data from the webview
            this._webview.addEventListener('ipc-message', (/**
             * @param {?} event
             * @return {?}
             */
            (event) => {
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
                else if (event.channel === 'editorInitialized') {
                    this._componentInitialized = true;
                    this._editorProxy = this.wrapEditorCalls(this._editor);
                    this.editorInitialized.emit(this._editorProxy);
                }
                else if (event.channel === 'editorConfigurationChanged') {
                    this.editorConfigurationChanged.emit();
                }
                else if (event.channel === 'editorLanguageChanged') {
                    this.editorLanguageChanged.emit();
                }
            }));
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
            waitUntilMonacoReady()
                .pipe(takeUntil(this._destroy))
                .subscribe((/**
             * @return {?}
             */
            () => {
                this.initMonaco();
            }));
        }
        merge(fromEvent(window, 'resize').pipe(debounceTime(100)), this._widthSubject.asObservable().pipe(distinctUntilChanged()), this._heightSubject.asObservable().pipe(distinctUntilChanged()))
            .pipe(takeUntil(this._destroy), debounceTime(100))
            .subscribe((/**
         * @return {?}
         */
        () => {
            this.layout();
            this._changeDetectorRef.markForCheck();
        }));
        timer(500, 250)
            .pipe(takeUntil(this._destroy))
            .subscribe((/**
         * @return {?}
         */
        () => {
            if (this._elementRef && this._elementRef.nativeElement) {
                this._widthSubject.next(((/** @type {?} */ (this._elementRef.nativeElement))).getBoundingClientRect().width);
                this._heightSubject.next(((/** @type {?} */ (this._elementRef.nativeElement))).getBoundingClientRect().height);
            }
        }));
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this._changeDetectorRef.detach();
        this._registeredLanguagesStyles.forEach((/**
         * @param {?} style
         * @return {?}
         */
        (style) => style.remove()));
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
                    requestFullscreen: (/**
                     * @return {?}
                     */
                    () => codeEditorElement.requestFullscreen()),
                    // Safari
                    webkitRequestFullscreen: (/**
                     * @return {?}
                     */
                    () => ((/** @type {?} */ (codeEditorElement))).webkitRequestFullscreen()),
                    // IE
                    msRequestFullscreen: (/**
                     * @return {?}
                     */
                    () => ((/** @type {?} */ (codeEditorElement))).msRequestFullscreen()),
                    // Firefox
                    mozRequestFullScreen: (/**
                     * @return {?}
                     */
                    () => ((/** @type {?} */ (codeEditorElement))).mozRequestFullScreen()),
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
                    exitFullscreen: (/**
                     * @return {?}
                     */
                    () => document.exitFullscreen()),
                    // Safari
                    webkitExitFullscreen: (/**
                     * @return {?}
                     */
                    () => ((/** @type {?} */ (document))).webkitExitFullscreen()),
                    // Firefox
                    mozCancelFullScreen: (/**
                     * @return {?}
                     */
                    () => ((/** @type {?} */ (document))).mozCancelFullScreen()),
                    // IE
                    msExitFullscreen: (/**
                     * @return {?}
                     */
                    () => ((/** @type {?} */ (document))).msExitFullscreen()),
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
     * @private
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
            run: (/**
             * @param {?} ed
             * @return {?}
             */
            (ed) => {
                this.showFullScreenEditor();
            }),
        });
    }
    /**
     * wrapEditorCalls used to proxy all the calls to the monaco editor
     * For calls for Electron use this to call the editor inside the webview
     * @private
     * @param {?} obj
     * @return {?}
     */
    wrapEditorCalls(obj) {
        /** @type {?} */
        const that = this;
        /** @type {?} */
        const handler = {
            /**
             * @param {?} target
             * @param {?} propKey
             * @param {?} receiver
             * @return {?}
             */
            get(target, propKey, receiver) {
                return (/**
                 * @param {...?} args
                 * @return {?}
                 */
                (...args) => __awaiter(this, void 0, void 0, function* () {
                    if (that._componentInitialized) {
                        if (that._webview) {
                            /** @type {?} */
                            const executeJavaScript = (/**
                             * @param {?} code
                             * @return {?}
                             */
                            (code) => new Promise((/**
                             * @param {?} resolve
                             * @return {?}
                             */
                            (resolve) => {
                                that._webview.executeJavaScript(code, resolve);
                            })));
                            return executeJavaScript('editor.' + propKey + '(' + args + ')');
                        }
                        else {
                            /** @type {?} */
                            const origMethod = target[propKey];
                            /** @type {?} */
                            const result = yield origMethod.apply(that._editor, args);
                            // since running javascript code manually need to force Angular to detect changes
                            setTimeout((/**
                             * @return {?}
                             */
                            () => {
                                that.zone.run((/**
                                 * @return {?}
                                 */
                                () => {
                                    // tslint:disable-next-line
                                    if (!that._changeDetectorRef['destroyed']) {
                                        that._changeDetectorRef.detectChanges();
                                    }
                                }));
                            }));
                            return result;
                        }
                    }
                }));
            },
        };
        return new Proxy(obj, handler);
    }
    /**
     * initMonaco method creates the monaco editor into the \@ViewChild('editorContainer')
     * and emit the editorInitialized event.  This is only used in the browser version.
     * @private
     * @return {?}
     */
    initMonaco() {
        /** @type {?} */
        const containerDiv = this._editorContainer.nativeElement;
        containerDiv.id = this._editorInnerContainer;
        this._editor = monaco.editor.create(containerDiv, Object.assign({
            value: this._value,
            language: this.language,
            theme: this._theme,
        }, this.editorOptions));
        setTimeout((/**
         * @return {?}
         */
        () => {
            this._editorProxy = this.wrapEditorCalls(this._editor);
            this._componentInitialized = true;
            this.editorInitialized.emit(this._editorProxy);
        }));
        this._editor.getModel().onDidChangeContent((/**
         * @param {?} e
         * @return {?}
         */
        (e) => {
            this._fromEditor = true;
            this.writeValue(this._editor.getValue());
            if (this.initialContentChange) {
                this.initialContentChange = false;
                this.layout();
            }
        }));
        this.addFullScreenModeCommand();
    }
}
TdCodeEditorComponent.decorators = [
    { type: Component, args: [{
                selector: 'td-code-editor',
                template: "<div class=\"editorContainer\" #editorContainer></div>\n",
                providers: [
                    {
                        provide: NG_VALUE_ACCESSOR,
                        useExisting: forwardRef((/**
                         * @return {?}
                         */
                        () => TdCodeEditorComponent)),
                        multi: true,
                    },
                ],
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
    _editorContainer: [{ type: ViewChild, args: ['editorContainer', { static: true },] }],
    editorInitialized: [{ type: Output }],
    editorConfigurationChanged: [{ type: Output }],
    editorLanguageChanged: [{ type: Output }],
    editorValueChange: [{ type: Output }],
    change: [{ type: Output }],
    value: [{ type: Input, args: ['value',] }],
    language: [{ type: Input, args: ['language',] }],
    editorStyle: [{ type: Input, args: ['editorStyle',] }],
    theme: [{ type: Input, args: ['theme',] }],
    fullScreenKeyBinding: [{ type: Input, args: ['fullScreenKeyBinding',] }],
    editorOptions: [{ type: Input, args: ['editorOptions',] }]
};
if (false) {
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._destroy;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._widthSubject;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._heightSubject;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._editorStyle;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._appPath;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._isElectronApp;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._webview;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._value;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._theme;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._language;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._subject;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._editorInnerContainer;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._editorNodeModuleDirOverride;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._editor;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._editorProxy;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._componentInitialized;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._fromEditor;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._editorOptions;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._isFullScreen;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._keycode;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._setValueTimeout;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype.initialContentChange;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._registeredLanguagesStyles;
    /** @type {?} */
    TdCodeEditorComponent.prototype._editorContainer;
    /**
     * editorInitialized: function($event)
     * Event emitted when editor is first initialized
     * @type {?}
     */
    TdCodeEditorComponent.prototype.editorInitialized;
    /**
     * editorConfigurationChanged: function($event)
     * Event emitted when editor's configuration changes
     * @type {?}
     */
    TdCodeEditorComponent.prototype.editorConfigurationChanged;
    /**
     * editorLanguageChanged: function($event)
     * Event emitted when editor's Language changes
     * @type {?}
     */
    TdCodeEditorComponent.prototype.editorLanguageChanged;
    /**
     * editorValueChange: function($event)
     * Event emitted any time something changes the editor value
     * @type {?}
     */
    TdCodeEditorComponent.prototype.editorValueChange;
    /**
     * The change event notifies you about a change happening in an input field.
     * Since the component is not a native Angular component have to specifiy the event emitter ourself
     * @type {?}
     */
    TdCodeEditorComponent.prototype.change;
    /** @type {?} */
    TdCodeEditorComponent.prototype.propagateChange;
    /** @type {?} */
    TdCodeEditorComponent.prototype.onTouched;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype.zone;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._changeDetectorRef;
    /**
     * @type {?}
     * @private
     */
    TdCodeEditorComponent.prototype._elementRef;
}
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS1lZGl0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGNvdmFsZW50L2NvZGUtZWRpdG9yLyIsInNvdXJjZXMiOlsiY29kZS1lZGl0b3IuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFlBQVksRUFHWixTQUFTLEVBQ1QsVUFBVSxFQUNWLFVBQVUsRUFDVixNQUFNLEVBQ04saUJBQWlCLEdBRWxCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxpQkFBaUIsRUFBd0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6RSxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvQyxPQUFPLEVBQUUsWUFBWSxFQUFFLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRS9FLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxVQUFVLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7TUFFakUsSUFBSTs7O0FBQVEsR0FBRyxFQUFFO0lBQ3JCLGVBQWU7QUFDakIsQ0FBQyxDQUFBOzs7O0lBR0csYUFBYSxHQUFXLENBQUM7QUFpQjdCLE1BQU0sT0FBTyxxQkFBcUI7Ozs7Ozs7SUErRGhDLFlBQW9CLElBQVksRUFBVSxrQkFBcUMsRUFBVSxXQUF1QjtRQUE1RixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVUsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFZO1FBOUR4RyxhQUFRLEdBQXFCLElBQUksT0FBTyxFQUFXLENBQUM7UUFDcEQsa0JBQWEsR0FBb0IsSUFBSSxPQUFPLEVBQVUsQ0FBQztRQUN2RCxtQkFBYyxHQUFvQixJQUFJLE9BQU8sRUFBVSxDQUFDO1FBRXhE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aUJBQWlCLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO2dDQU03QyxNQUFNO3lDQU1OLE1BQU07b0NBTU4sTUFBTTtnQ0FNTixNQUFNO3FCQU1OLE1BQU07b0JBdUJOLEtBQUssU0FBQyxPQUFPO3VCQWdHYixLQUFLLFNBQUMsVUFBVTswQkFxRmhCLEtBQUssU0FBQyxhQUFhO29CQXNDbkIsS0FBSyxTQUFDLE9BQU87bUNBcUJiLEtBQUssU0FBQyxzQkFBc0I7NEJBYTVCLEtBQUssU0FBQyxlQUFlOzs7Ozs7O0lBMVV0Qix5Q0FBNEQ7Ozs7O0lBQzVELDhDQUErRDs7Ozs7SUFDL0QsK0NBQWdFOzs7OztJQUVoRSw2Q0FBK0U7Ozs7O0lBQy9FLHlDQUE4Qjs7Ozs7SUFDOUIsK0NBQXdDOzs7OztJQUN4Qyx5Q0FBc0I7Ozs7O0lBQ3RCLHVDQUE0Qjs7Ozs7SUFDNUIsdUNBQThCOzs7OztJQUM5QiwwQ0FBeUM7Ozs7O0lBQ3pDLHlDQUFrRDs7Ozs7SUFDbEQsc0RBQWlGOzs7OztJQUNqRiw2REFBa0Q7Ozs7O0lBQ2xELHdDQUFxQjs7Ozs7SUFDckIsNkNBQTBCOzs7OztJQUMxQixzREFBK0M7Ozs7O0lBQy9DLDRDQUFxQzs7Ozs7SUFDckMsK0NBQWlDOzs7OztJQUNqQyw4Q0FBdUM7Ozs7O0lBQ3ZDLHlDQUFzQjs7Ozs7SUFDdEIsaURBQThCOzs7OztJQUM5QixxREFBNkM7Ozs7O0lBQzdDLDJEQUE0RDs7SUFDNUQsaURBQTZFOzs7Ozs7SUFNN0Usa0RBQTJFOzs7Ozs7SUFNM0UsMkRBQW9GOzs7Ozs7SUFNcEYsc0RBQStFOzs7Ozs7SUFNL0Usa0RBQTJFOzs7Ozs7SUFNM0UsdUNBQWdFOztJQUVoRSxnREFBaUM7O0lBQ2pDLDBDQUF1Qjs7Ozs7SUFLWCxxQ0FBb0I7Ozs7O0lBQUUsbURBQTZDOzs7OztJQUFFLDRDQUErQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBvbmVudCxcbiAgSW5wdXQsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyLFxuICBPbkluaXQsXG4gIEFmdGVyVmlld0luaXQsXG4gIFZpZXdDaGlsZCxcbiAgRWxlbWVudFJlZixcbiAgZm9yd2FyZFJlZixcbiAgTmdab25lLFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgT25EZXN0cm95LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5HX1ZBTFVFX0FDQ0VTU09SLCBDb250cm9sVmFsdWVBY2Nlc3NvciB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGZyb21FdmVudCwgbWVyZ2UsIHRpbWVyIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBkZWJvdW5jZVRpbWUsIGRpc3RpbmN0VW50aWxDaGFuZ2VkLCB0YWtlVW50aWwgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IHdhaXRVbnRpbE1vbmFjb1JlYWR5LCBsb2FkTW9uYWNvIH0gZnJvbSAnLi9jb2RlLWVkaXRvci51dGlscyc7XG5cbmNvbnN0IG5vb3A6IGFueSA9ICgpID0+IHtcbiAgLy8gZW1wdHkgbWV0aG9kXG59O1xuXG4vLyBjb3VudGVyIGZvciBpZHMgdG8gYWxsb3cgZm9yIG11bHRpcGxlIGVkaXRvcnMgb24gb25lIHBhZ2VcbmxldCB1bmlxdWVDb3VudGVyOiBudW1iZXIgPSAwO1xuLy8gZGVjbGFyZSBhbGwgdGhlIGJ1aWx0IGluIGVsZWN0cm9uIG9iamVjdHNcbmRlY2xhcmUgY29uc3QgZWxlY3Ryb246IGFueTtcbmRlY2xhcmUgY29uc3QgbW9uYWNvOiBhbnk7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3RkLWNvZGUtZWRpdG9yJyxcbiAgdGVtcGxhdGVVcmw6ICcuL2NvZGUtZWRpdG9yLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vY29kZS1lZGl0b3IuY29tcG9uZW50LnNjc3MnXSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG4gICAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBUZENvZGVFZGl0b3JDb21wb25lbnQpLFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgVGRDb2RlRWRpdG9yQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBBZnRlclZpZXdJbml0LCBDb250cm9sVmFsdWVBY2Nlc3NvciwgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBfZGVzdHJveTogU3ViamVjdDxib29sZWFuPiA9IG5ldyBTdWJqZWN0PGJvb2xlYW4+KCk7XG4gIHByaXZhdGUgX3dpZHRoU3ViamVjdDogU3ViamVjdDxudW1iZXI+ID0gbmV3IFN1YmplY3Q8bnVtYmVyPigpO1xuICBwcml2YXRlIF9oZWlnaHRTdWJqZWN0OiBTdWJqZWN0PG51bWJlcj4gPSBuZXcgU3ViamVjdDxudW1iZXI+KCk7XG5cbiAgcHJpdmF0ZSBfZWRpdG9yU3R5bGU6IHN0cmluZyA9ICd3aWR0aDoxMDAlO2hlaWdodDoxMDAlO2JvcmRlcjoxcHggc29saWQgZ3JleTsnO1xuICBwcml2YXRlIF9hcHBQYXRoOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSBfaXNFbGVjdHJvbkFwcDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF93ZWJ2aWV3OiBhbnk7XG4gIHByaXZhdGUgX3ZhbHVlOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSBfdGhlbWU6IHN0cmluZyA9ICd2cyc7XG4gIHByaXZhdGUgX2xhbmd1YWdlOiBzdHJpbmcgPSAnamF2YXNjcmlwdCc7XG4gIHByaXZhdGUgX3N1YmplY3Q6IFN1YmplY3Q8c3RyaW5nPiA9IG5ldyBTdWJqZWN0KCk7XG4gIHByaXZhdGUgX2VkaXRvcklubmVyQ29udGFpbmVyOiBzdHJpbmcgPSAnZWRpdG9ySW5uZXJDb250YWluZXInICsgdW5pcXVlQ291bnRlcisrO1xuICBwcml2YXRlIF9lZGl0b3JOb2RlTW9kdWxlRGlyT3ZlcnJpZGU6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlIF9lZGl0b3I6IGFueTtcbiAgcHJpdmF0ZSBfZWRpdG9yUHJveHk6IGFueTtcbiAgcHJpdmF0ZSBfY29tcG9uZW50SW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfZnJvbUVkaXRvcjogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9lZGl0b3JPcHRpb25zOiBhbnkgPSB7fTtcbiAgcHJpdmF0ZSBfaXNGdWxsU2NyZWVuOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX2tleWNvZGU6IGFueTtcbiAgcHJpdmF0ZSBfc2V0VmFsdWVUaW1lb3V0OiBhbnk7XG4gIHByaXZhdGUgaW5pdGlhbENvbnRlbnRDaGFuZ2U6IGJvb2xlYW4gPSB0cnVlO1xuICBwcml2YXRlIF9yZWdpc3RlcmVkTGFuZ3VhZ2VzU3R5bGVzOiBIVE1MU3R5bGVFbGVtZW50W10gPSBbXTtcbiAgQFZpZXdDaGlsZCgnZWRpdG9yQ29udGFpbmVyJywgeyBzdGF0aWM6IHRydWUgfSkgX2VkaXRvckNvbnRhaW5lcjogRWxlbWVudFJlZjtcblxuICAvKipcbiAgICogZWRpdG9ySW5pdGlhbGl6ZWQ6IGZ1bmN0aW9uKCRldmVudClcbiAgICogRXZlbnQgZW1pdHRlZCB3aGVuIGVkaXRvciBpcyBmaXJzdCBpbml0aWFsaXplZFxuICAgKi9cbiAgQE91dHB1dCgpIGVkaXRvckluaXRpYWxpemVkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIGVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkOiBmdW5jdGlvbigkZXZlbnQpXG4gICAqIEV2ZW50IGVtaXR0ZWQgd2hlbiBlZGl0b3IncyBjb25maWd1cmF0aW9uIGNoYW5nZXNcbiAgICovXG4gIEBPdXRwdXQoKSBlZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBlZGl0b3JMYW5ndWFnZUNoYW5nZWQ6IGZ1bmN0aW9uKCRldmVudClcbiAgICogRXZlbnQgZW1pdHRlZCB3aGVuIGVkaXRvcidzIExhbmd1YWdlIGNoYW5nZXNcbiAgICovXG4gIEBPdXRwdXQoKSBlZGl0b3JMYW5ndWFnZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAvKipcbiAgICogZWRpdG9yVmFsdWVDaGFuZ2U6IGZ1bmN0aW9uKCRldmVudClcbiAgICogRXZlbnQgZW1pdHRlZCBhbnkgdGltZSBzb21ldGhpbmcgY2hhbmdlcyB0aGUgZWRpdG9yIHZhbHVlXG4gICAqL1xuICBAT3V0cHV0KCkgZWRpdG9yVmFsdWVDaGFuZ2U6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAvKipcbiAgICogVGhlIGNoYW5nZSBldmVudCBub3RpZmllcyB5b3UgYWJvdXQgYSBjaGFuZ2UgaGFwcGVuaW5nIGluIGFuIGlucHV0IGZpZWxkLlxuICAgKiBTaW5jZSB0aGUgY29tcG9uZW50IGlzIG5vdCBhIG5hdGl2ZSBBbmd1bGFyIGNvbXBvbmVudCBoYXZlIHRvIHNwZWNpZml5IHRoZSBldmVudCBlbWl0dGVyIG91cnNlbGZcbiAgICovXG4gIEBPdXRwdXQoKSBjaGFuZ2U6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAgLyogdHNsaW50OmRpc2FibGUtbmV4dC1saW5lICovXG4gIHByb3BhZ2F0ZUNoYW5nZSA9IChfOiBhbnkpID0+IHt9O1xuICBvblRvdWNoZWQgPSAoKSA9PiBub29wO1xuXG4gIC8qKlxuICAgKiBTZXQgaWYgdXNpbmcgRWxlY3Ryb24gbW9kZSB3aGVuIG9iamVjdCBpcyBjcmVhdGVkXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHpvbmU6IE5nWm9uZSwgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLCBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7XG4gICAgLy8gc2luY2UgYWNjZXNzaW5nIHRoZSB3aW5kb3cgb2JqZWN0IG5lZWQgdGhpcyBjaGVjayBzbyBzZXJ2ZXJzaWRlIHJlbmRlcmluZyBkb2Vzbid0IGZhaWxcbiAgICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAnb2JqZWN0JyAmJiAhIWRvY3VtZW50KSB7XG4gICAgICAvKiB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmUgKi9cbiAgICAgIHRoaXMuX2lzRWxlY3Ryb25BcHAgPSAoPGFueT53aW5kb3cpWydwcm9jZXNzJ10gPyB0cnVlIDogZmFsc2U7XG4gICAgICBpZiAodGhpcy5faXNFbGVjdHJvbkFwcCkge1xuICAgICAgICB0aGlzLl9hcHBQYXRoID0gZWxlY3Ryb24ucmVtb3RlLmFwcC5nZXRBcHBQYXRoKCkuc3BsaXQoJ1xcXFwnKS5qb2luKCcvJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHZhbHVlPzogc3RyaW5nXG4gICAqIFZhbHVlIGluIHRoZSBFZGl0b3IgYWZ0ZXIgYXN5bmMgZ2V0RWRpdG9yQ29udGVudCB3YXMgY2FsbGVkXG4gICAqL1xuICBASW5wdXQoJ3ZhbHVlJylcbiAgc2V0IHZhbHVlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAvLyBDbGVhciBhbnkgdGltZW91dCB0aGF0IG1pZ2h0IG92ZXJ3cml0ZSB0aGlzIHZhbHVlIHNldCBpbiB0aGUgZnV0dXJlXG4gICAgaWYgKHRoaXMuX3NldFZhbHVlVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3NldFZhbHVlVGltZW91dCk7XG4gICAgfVxuICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICBpZiAodGhpcy5fd2Vidmlldy5zZW5kICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBkb24ndCB3YW50IHRvIGtlZXAgc2VuZGluZyBjb250ZW50IGlmIGV2ZW50IGNhbWUgZnJvbSBJUEMsIGluZmluaXRlIGxvb3BcbiAgICAgICAgICBpZiAoIXRoaXMuX2Zyb21FZGl0b3IpIHtcbiAgICAgICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnc2V0RWRpdG9yQ29udGVudCcsIHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5lZGl0b3JWYWx1ZUNoYW5nZS5lbWl0KCk7XG4gICAgICAgICAgdGhpcy5wcm9wYWdhdGVDaGFuZ2UodGhpcy5fdmFsdWUpO1xuICAgICAgICAgIHRoaXMuY2hhbmdlLmVtaXQoKTtcbiAgICAgICAgICB0aGlzLl9mcm9tRWRpdG9yID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gRWRpdG9yIGlzIG5vdCBsb2FkZWQgeWV0LCB0cnkgYWdhaW4gaW4gaGFsZiBhIHNlY29uZFxuICAgICAgICAgIHRoaXMuX3NldFZhbHVlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLl9lZGl0b3IgJiYgdGhpcy5fZWRpdG9yLnNldFZhbHVlKSB7XG4gICAgICAgICAgLy8gZG9uJ3Qgd2FudCB0byBrZWVwIHNlbmRpbmcgY29udGVudCBpZiBldmVudCBjYW1lIGZyb20gdGhlIGVkaXRvciwgaW5maW5pdGUgbG9vcFxuICAgICAgICAgIGlmICghdGhpcy5fZnJvbUVkaXRvcikge1xuICAgICAgICAgICAgdGhpcy5fZWRpdG9yLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5lZGl0b3JWYWx1ZUNoYW5nZS5lbWl0KCk7XG4gICAgICAgICAgdGhpcy5wcm9wYWdhdGVDaGFuZ2UodGhpcy5fdmFsdWUpO1xuICAgICAgICAgIHRoaXMuY2hhbmdlLmVtaXQoKTtcbiAgICAgICAgICB0aGlzLl9mcm9tRWRpdG9yID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy56b25lLnJ1bigoKSA9PiAodGhpcy5fdmFsdWUgPSB2YWx1ZSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEVkaXRvciBpcyBub3QgbG9hZGVkIHlldCwgdHJ5IGFnYWluIGluIGhhbGYgYSBzZWNvbmRcbiAgICAgICAgICB0aGlzLl9zZXRWYWx1ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICB9LCA1MDApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3NldFZhbHVlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICB9LCA1MDApO1xuICAgIH1cbiAgfVxuXG4gIGdldCB2YWx1ZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICAgKi9cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgLy8gZG8gbm90IHdyaXRlIGlmIG51bGwgb3IgdW5kZWZpbmVkXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lXG4gICAgaWYgKHZhbHVlICE9IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BhZ2F0ZUNoYW5nZSA9IGZuO1xuICB9XG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLm9uVG91Y2hlZCA9IGZuO1xuICB9XG5cbiAgLyoqXG4gICAqIGdldEVkaXRvckNvbnRlbnQ/OiBmdW5jdGlvblxuICAgKiBSZXR1cm5zIHRoZSBjb250ZW50IHdpdGhpbiB0aGUgZWRpdG9yXG4gICAqL1xuICBnZXRWYWx1ZSgpOiBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdnZXRFZGl0b3JDb250ZW50Jyk7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgdGhpcy5fdmFsdWUgPSB0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fc3ViamVjdC5uZXh0KHRoaXMuX3ZhbHVlKTtcbiAgICAgICAgICB0aGlzLl9zdWJqZWN0LmNvbXBsZXRlKCk7XG4gICAgICAgICAgdGhpcy5fc3ViamVjdCA9IG5ldyBTdWJqZWN0KCk7XG4gICAgICAgICAgdGhpcy5lZGl0b3JWYWx1ZUNoYW5nZS5lbWl0KCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcy5fc3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogbGFuZ3VhZ2U/OiBzdHJpbmdcbiAgICogbGFuZ3VhZ2UgdXNlZCBpbiBlZGl0b3JcbiAgICovXG4gIEBJbnB1dCgnbGFuZ3VhZ2UnKVxuICBzZXQgbGFuZ3VhZ2UobGFuZ3VhZ2U6IHN0cmluZykge1xuICAgIHRoaXMuX2xhbmd1YWdlID0gbGFuZ3VhZ2U7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3NldExhbmd1YWdlJywgbGFuZ3VhZ2UpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgY29uc3QgY3VycmVudFZhbHVlOiBzdHJpbmcgPSB0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgdGhpcy5fZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICAgICAgY29uc3QgbXlEaXY6IEhUTUxEaXZFbGVtZW50ID0gdGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMuX2VkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKFxuICAgICAgICAgIG15RGl2LFxuICAgICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgIGxhbmd1YWdlLFxuICAgICAgICAgICAgICB0aGVtZTogdGhpcy5fdGhlbWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGhpcy5lZGl0b3JPcHRpb25zLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuX2VkaXRvci5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlQ29udGVudCgoZTogYW55KSA9PiB7XG4gICAgICAgICAgdGhpcy5fZnJvbUVkaXRvciA9IHRydWU7XG4gICAgICAgICAgdGhpcy53cml0ZVZhbHVlKHRoaXMuX2VkaXRvci5nZXRWYWx1ZSgpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCgpO1xuICAgICAgICB0aGlzLmVkaXRvckxhbmd1YWdlQ2hhbmdlZC5lbWl0KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGdldCBsYW5ndWFnZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9sYW5ndWFnZTtcbiAgfVxuXG4gIC8qKlxuICAgKiByZWdpc3Rlckxhbmd1YWdlPzogZnVuY3Rpb25cbiAgICogUmVnaXN0ZXJzIGEgY3VzdG9tIExhbmd1YWdlIHdpdGhpbiB0aGUgZWRpdG9yXG4gICAqL1xuICByZWdpc3Rlckxhbmd1YWdlKGxhbmd1YWdlOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgncmVnaXN0ZXJMYW5ndWFnZScsIGxhbmd1YWdlKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICAgIHRoaXMuX2VkaXRvci5kaXNwb3NlKCk7XG5cbiAgICAgICAgZm9yIChjb25zdCBwcm92aWRlciBvZiBsYW5ndWFnZS5jb21wbGV0aW9uSXRlbVByb3ZpZGVyKSB7XG4gICAgICAgICAgLyogdHNsaW50OmRpc2FibGUtbmV4dC1saW5lICovXG4gICAgICAgICAgcHJvdmlkZXIua2luZCA9IGV2YWwocHJvdmlkZXIua2luZCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBtb25hcmNoVG9rZW5zIG9mIGxhbmd1YWdlLm1vbmFyY2hUb2tlbnNQcm92aWRlcikge1xuICAgICAgICAgIC8qIHRzbGludDpkaXNhYmxlLW5leHQtbGluZSAqL1xuICAgICAgICAgIG1vbmFyY2hUb2tlbnNbMF0gPSBldmFsKG1vbmFyY2hUb2tlbnNbMF0pO1xuICAgICAgICB9XG4gICAgICAgIG1vbmFjby5sYW5ndWFnZXMucmVnaXN0ZXIoeyBpZDogbGFuZ3VhZ2UuaWQgfSk7XG5cbiAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5zZXRNb25hcmNoVG9rZW5zUHJvdmlkZXIobGFuZ3VhZ2UuaWQsIHtcbiAgICAgICAgICB0b2tlbml6ZXI6IHtcbiAgICAgICAgICAgIHJvb3Q6IGxhbmd1YWdlLm1vbmFyY2hUb2tlbnNQcm92aWRlcixcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBEZWZpbmUgYSBuZXcgdGhlbWUgdGhhdCBjb25zdGFpbnMgb25seSBydWxlcyB0aGF0IG1hdGNoIHRoaXMgbGFuZ3VhZ2VcbiAgICAgICAgbW9uYWNvLmVkaXRvci5kZWZpbmVUaGVtZShsYW5ndWFnZS5jdXN0b21UaGVtZS5pZCwgbGFuZ3VhZ2UuY3VzdG9tVGhlbWUudGhlbWUpO1xuICAgICAgICB0aGlzLl90aGVtZSA9IGxhbmd1YWdlLmN1c3RvbVRoZW1lLmlkO1xuXG4gICAgICAgIG1vbmFjby5sYW5ndWFnZXMucmVnaXN0ZXJDb21wbGV0aW9uSXRlbVByb3ZpZGVyKGxhbmd1YWdlLmlkLCB7XG4gICAgICAgICAgcHJvdmlkZUNvbXBsZXRpb25JdGVtczogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGxhbmd1YWdlLmNvbXBsZXRpb25JdGVtUHJvdmlkZXI7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgY3NzOiBIVE1MU3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgY3NzLnR5cGUgPSAndGV4dC9jc3MnO1xuICAgICAgICBjc3MuaW5uZXJIVE1MID0gbGFuZ3VhZ2UubW9uYXJjaFRva2Vuc1Byb3ZpZGVyQ1NTO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNzcyk7XG4gICAgICAgIHRoaXMuZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCgpO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcmVkTGFuZ3VhZ2VzU3R5bGVzID0gWy4uLnRoaXMuX3JlZ2lzdGVyZWRMYW5ndWFnZXNTdHlsZXMsIGNzc107XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHN0eWxlPzogc3RyaW5nXG4gICAqIGNzcyBzdHlsZSBvZiB0aGUgZWRpdG9yIG9uIHRoZSBwYWdlXG4gICAqL1xuICBASW5wdXQoJ2VkaXRvclN0eWxlJylcbiAgc2V0IGVkaXRvclN0eWxlKGVkaXRvclN0eWxlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9lZGl0b3JTdHlsZSA9IGVkaXRvclN0eWxlO1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdzZXRFZGl0b3JTdHlsZScsIHsgbGFuZ3VhZ2U6IHRoaXMuX2xhbmd1YWdlLCB0aGVtZTogdGhpcy5fdGhlbWUsIHN0eWxlOiBlZGl0b3JTdHlsZSB9KTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lckRpdjogSFRNTERpdkVsZW1lbnQgPSB0aGlzLl9lZGl0b3JDb250YWluZXIubmF0aXZlRWxlbWVudDtcbiAgICAgICAgY29udGFpbmVyRGl2LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBlZGl0b3JTdHlsZSk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZTogc3RyaW5nID0gdGhpcy5fZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgIHRoaXMuX2VkaXRvci5kaXNwb3NlKCk7XG4gICAgICAgIGNvbnN0IG15RGl2OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50O1xuICAgICAgICB0aGlzLl9lZGl0b3IgPSBtb25hY28uZWRpdG9yLmNyZWF0ZShcbiAgICAgICAgICBteURpdixcbiAgICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB2YWx1ZTogY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICBsYW5ndWFnZTogdGhpcy5fbGFuZ3VhZ2UsXG4gICAgICAgICAgICAgIHRoZW1lOiB0aGlzLl90aGVtZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0aGlzLmVkaXRvck9wdGlvbnMsXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fZWRpdG9yLmdldE1vZGVsKCkub25EaWRDaGFuZ2VDb250ZW50KChlOiBhbnkpID0+IHtcbiAgICAgICAgICB0aGlzLl9mcm9tRWRpdG9yID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLndyaXRlVmFsdWUodGhpcy5fZWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0IGVkaXRvclN0eWxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRvclN0eWxlO1xuICB9XG5cbiAgLyoqXG4gICAqIHRoZW1lPzogc3RyaW5nXG4gICAqIFRoZW1lIHRvIGJlIGFwcGxpZWQgdG8gZWRpdG9yXG4gICAqL1xuICBASW5wdXQoJ3RoZW1lJylcbiAgc2V0IHRoZW1lKHRoZW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLl90aGVtZSA9IHRoZW1lO1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdzZXRFZGl0b3JPcHRpb25zJywgeyB0aGVtZSB9KTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICAgIHRoaXMuX2VkaXRvci51cGRhdGVPcHRpb25zKHsgdGhlbWUgfSk7XG4gICAgICAgIHRoaXMuZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXQgdGhlbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fdGhlbWU7XG4gIH1cblxuICAvKipcbiAgICogZnVsbFNjcmVlbktleUJpbmRpbmc/OiBudW1iZXJcbiAgICogU2VlIGhlcmUgZm9yIGtleSBiaW5kaW5ncyBodHRwczovL21pY3Jvc29mdC5naXRodWIuaW8vbW9uYWNvLWVkaXRvci9hcGkvZW51bXMvbW9uYWNvLmtleWNvZGUuaHRtbFxuICAgKiBTZXRzIHRoZSBLZXlDb2RlIGZvciBzaG9ydGN1dHRpbmcgdG8gRnVsbHNjcmVlbiBtb2RlXG4gICAqL1xuICBASW5wdXQoJ2Z1bGxTY3JlZW5LZXlCaW5kaW5nJylcbiAgc2V0IGZ1bGxTY3JlZW5LZXlCaW5kaW5nKGtleWNvZGU6IG51bWJlcltdKSB7XG4gICAgdGhpcy5fa2V5Y29kZSA9IGtleWNvZGU7XG4gIH1cbiAgZ2V0IGZ1bGxTY3JlZW5LZXlCaW5kaW5nKCk6IG51bWJlcltdIHtcbiAgICByZXR1cm4gdGhpcy5fa2V5Y29kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBlZGl0b3JPcHRpb25zPzogb2JqZWN0XG4gICAqIE9wdGlvbnMgdXNlZCBvbiBlZGl0b3IgaW5zdGFudGlhdGlvbi4gQXZhaWxhYmxlIG9wdGlvbnMgbGlzdGVkIGhlcmU6XG4gICAqIGh0dHBzOi8vbWljcm9zb2Z0LmdpdGh1Yi5pby9tb25hY28tZWRpdG9yL2FwaS9pbnRlcmZhY2VzL21vbmFjby5lZGl0b3IuaWVkaXRvcm9wdGlvbnMuaHRtbFxuICAgKi9cbiAgQElucHV0KCdlZGl0b3JPcHRpb25zJylcbiAgc2V0IGVkaXRvck9wdGlvbnMoZWRpdG9yT3B0aW9uczogYW55KSB7XG4gICAgdGhpcy5fZWRpdG9yT3B0aW9ucyA9IGVkaXRvck9wdGlvbnM7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3NldEVkaXRvck9wdGlvbnMnLCBlZGl0b3JPcHRpb25zKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICAgIHRoaXMuX2VkaXRvci51cGRhdGVPcHRpb25zKGVkaXRvck9wdGlvbnMpO1xuICAgICAgICB0aGlzLmVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkLmVtaXQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0IGVkaXRvck9wdGlvbnMoKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdG9yT3B0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBsYXlvdXQgbWV0aG9kIHRoYXQgY2FsbHMgbGF5b3V0IG1ldGhvZCBvZiBlZGl0b3IgYW5kIGluc3RydWN0cyB0aGUgZWRpdG9yIHRvIHJlbWVhc3VyZSBpdHMgY29udGFpbmVyXG4gICAqL1xuICBsYXlvdXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2xheW91dCcpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgdGhpcy5fZWRpdG9yLmxheW91dCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGlmIGluIEVsZWN0cm9uIG1vZGUgb3Igbm90XG4gICAqL1xuICBnZXQgaXNFbGVjdHJvbkFwcCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNFbGVjdHJvbkFwcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGlmIGluIEZ1bGwgU2NyZWVuIE1vZGUgb3Igbm90XG4gICAqL1xuICBnZXQgaXNGdWxsU2NyZWVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc0Z1bGxTY3JlZW47XG4gIH1cblxuICAvKipcbiAgICogc2V0RWRpdG9yTm9kZU1vZHVsZURpck92ZXJyaWRlIGZ1bmN0aW9uIHRoYXQgb3ZlcnJpZGVzIHdoZXJlIHRvIGxvb2tcbiAgICogZm9yIHRoZSBlZGl0b3Igbm9kZV9tb2R1bGUuIFVzZWQgaW4gdGVzdHMgZm9yIEVsZWN0cm9uIG9yIGFueXdoZXJlIHRoYXQgdGhlXG4gICAqIG5vZGVfbW9kdWxlcyBhcmUgbm90IGluIHRoZSBleHBlY3RlZCBsb2NhdGlvbi5cbiAgICovXG4gIHNldEVkaXRvck5vZGVNb2R1bGVEaXJPdmVycmlkZShkaXJPdmVycmlkZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZWRpdG9yTm9kZU1vZHVsZURpck92ZXJyaWRlID0gZGlyT3ZlcnJpZGU7XG4gICAgdGhpcy5fYXBwUGF0aCA9IGRpck92ZXJyaWRlO1xuICB9XG5cbiAgLyoqXG4gICAqIG5nT25Jbml0IG9ubHkgdXNlZCBmb3IgRWxlY3Ryb24gdmVyc2lvbiBvZiBlZGl0b3JcbiAgICogVGhpcyBpcyB3aGVyZSB0aGUgd2VidmlldyBpcyBjcmVhdGVkIHRvIHNhbmRib3ggYXdheSB0aGUgZWRpdG9yXG4gICAqL1xuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICBsZXQgZWRpdG9ySFRNTDogc3RyaW5nID0gJyc7XG4gICAgaWYgKHRoaXMuX2lzRWxlY3Ryb25BcHApIHtcbiAgICAgIGVkaXRvckhUTUwgPSBgPCFET0NUWVBFIGh0bWw+XG4gICAgICAgICAgICA8aHRtbCBzdHlsZT1cImhlaWdodDoxMDAlXCI+XG4gICAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICAgICAgICA8bWV0YSBodHRwLWVxdWl2PVwiWC1VQS1Db21wYXRpYmxlXCIgY29udGVudD1cIklFPWVkZ2VcIiAvPlxuICAgICAgICAgICAgICAgIDxtZXRhIGh0dHAtZXF1aXY9XCJDb250ZW50LVR5cGVcIiBjb250ZW50PVwidGV4dC9odG1sO2NoYXJzZXQ9dXRmLThcIiA+XG4gICAgICAgICAgICAgICAgPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGRhdGEtbmFtZT1cInZzL2VkaXRvci9lZGl0b3IubWFpblwiXG4gICAgICAgICAgICAgICAgICAgIGhyZWY9XCJmaWxlOi8vJHt0aGlzLl9lZGl0b3JOb2RlTW9kdWxlRGlyT3ZlcnJpZGV9L2Fzc2V0cy9tb25hY28vdnMvZWRpdG9yL2VkaXRvci5tYWluLmNzc1wiPlxuICAgICAgICAgICAgPC9oZWFkPlxuICAgICAgICAgICAgPGJvZHkgc3R5bGU9XCJoZWlnaHQ6MTAwJTt3aWR0aDogMTAwJTttYXJnaW46IDA7cGFkZGluZzogMDtvdmVyZmxvdzogaGlkZGVuO1wiPlxuICAgICAgICAgICAgPGRpdiBpZD1cIiR7dGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJ9XCIgc3R5bGU9XCJ3aWR0aDoxMDAlO2hlaWdodDoxMDAlOyR7dGhpcy5fZWRpdG9yU3R5bGV9XCI+PC9kaXY+XG4gICAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgaXBjUmVuZGVyZXIgb2YgZWxlY3Ryb24gZm9yIGNvbW11bmljYXRpb25cbiAgICAgICAgICAgICAgICBjb25zdCB7aXBjUmVuZGVyZXJ9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKTtcbiAgICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgICAgPHNjcmlwdCBzcmM9XCJmaWxlOi8vJHt0aGlzLl9lZGl0b3JOb2RlTW9kdWxlRGlyT3ZlcnJpZGV9L2Fzc2V0cy9tb25hY28vdnMvbG9hZGVyLmpzXCI+PC9zY3JpcHQ+XG4gICAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgICAgIHZhciBlZGl0b3I7XG4gICAgICAgICAgICAgICAgdmFyIHRoZW1lID0gJyR7dGhpcy5fdGhlbWV9JztcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSAnJHt0aGlzLl92YWx1ZX0nO1xuICAgICAgICAgICAgICAgIHZhciByZWdpc3RlcmVkTGFuZ3VhZ2VzU3R5bGVzID0gW107XG5cbiAgICAgICAgICAgICAgICByZXF1aXJlLmNvbmZpZyh7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VVcmw6ICcke3RoaXMuX2FwcFBhdGh9L2Fzc2V0cy9tb25hY28nXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2VsZi5tb2R1bGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgc2VsZi5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgcmVxdWlyZShbJ3ZzL2VkaXRvci9lZGl0b3IubWFpbiddLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yID0gbW9uYWNvLmVkaXRvci5jcmVhdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJcbiAgICAgICAgICAgICAgICAgICAgfScpLCBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhbmd1YWdlOiAnJHt0aGlzLmxhbmd1YWdlfScsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJyR7dGhpcy5fdGhlbWV9JyxcbiAgICAgICAgICAgICAgICAgICAgfSwgJHtKU09OLnN0cmluZ2lmeSh0aGlzLmVkaXRvck9wdGlvbnMpfSkpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IuZ2V0TW9kZWwoKS5vbkRpZENoYW5nZUNvbnRlbnQoIChlKT0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJvbkVkaXRvckNvbnRlbnRDaGFuZ2VcIiwgZWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmFkZEFjdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gQW4gdW5pcXVlIGlkZW50aWZpZXIgb2YgdGhlIGNvbnRyaWJ1dGVkIGFjdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgICBpZDogJ2Z1bGxTY3JlZW4nLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIEEgbGFiZWwgb2YgdGhlIGFjdGlvbiB0aGF0IHdpbGwgYmUgcHJlc2VudGVkIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRnVsbCBTY3JlZW4nLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIEFuIG9wdGlvbmFsIGFycmF5IG9mIGtleWJpbmRpbmdzIGZvciB0aGUgYWN0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHRNZW51R3JvdXBJZDogJ25hdmlnYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICAgIGtleWJpbmRpbmdzOiBbJHt0aGlzLl9rZXljb2RlfV0sXG4gICAgICAgICAgICAgICAgICAgICAgY29udGV4dE1lbnVPcmRlcjogMS41LFxuICAgICAgICAgICAgICAgICAgICAgIC8vIE1ldGhvZCB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgd2hlbiB0aGUgYWN0aW9uIGlzIHRyaWdnZXJlZC5cbiAgICAgICAgICAgICAgICAgICAgICAvLyBAcGFyYW0gZWRpdG9yIFRoZSBlZGl0b3IgaW5zdGFuY2UgaXMgcGFzc2VkIGluIGFzIGEgY29udmluaWVuY2VcbiAgICAgICAgICAgICAgICAgICAgICBydW46IGZ1bmN0aW9uKGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWRpdG9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7dGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJ9Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0b3JEaXYud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IuYWRkQWN0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBBbiB1bmlxdWUgaWRlbnRpZmllciBvZiB0aGUgY29udHJpYnV0ZWQgYWN0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZXhpdGZ1bGxTY3JlZW4nLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIEEgbGFiZWwgb2YgdGhlIGFjdGlvbiB0aGF0IHdpbGwgYmUgcHJlc2VudGVkIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRXhpdCBGdWxsIFNjcmVlbicsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gQW4gb3B0aW9uYWwgYXJyYXkgb2Yga2V5YmluZGluZ3MgZm9yIHRoZSBhY3Rpb24uXG4gICAgICAgICAgICAgICAgICAgICAgY29udGV4dE1lbnVHcm91cElkOiAnbmF2aWdhdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAga2V5YmluZGluZ3M6IFs5XSxcbiAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0TWVudU9yZGVyOiAxLjUsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gTWV0aG9kIHRoYXQgd2lsbCBiZSBleGVjdXRlZCB3aGVuIHRoZSBhY3Rpb24gaXMgdHJpZ2dlcmVkLlxuICAgICAgICAgICAgICAgICAgICAgIC8vIEBwYXJhbSBlZGl0b3IgVGhlIGVkaXRvciBpbnN0YW5jZSBpcyBwYXNzZWQgaW4gYXMgYSBjb252aW5pZW5jZVxuICAgICAgICAgICAgICAgICAgICAgIHJ1bjogZnVuY3Rpb24oZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlZGl0b3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LndlYmtpdEV4aXRGdWxsc2NyZWVuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIuc2VuZFRvSG9zdChcImVkaXRvckluaXRpYWxpemVkXCIsIHRoaXMuX2VkaXRvcik7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gYmFjayB0aGUgdmFsdWUgaW4gdGhlIGVkaXRvciB0byB0aGUgbWFpbnZpZXdcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignZ2V0RWRpdG9yQ29udGVudCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJlZGl0b3JDb250ZW50XCIsIGVkaXRvci5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgdmFsdWUgb2YgdGhlIGVkaXRvciBmcm9tIHdoYXQgd2FzIHNlbnQgZnJvbSB0aGUgbWFpbnZpZXdcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignc2V0RWRpdG9yQ29udGVudCcsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBkYXRhO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3Iuc2V0VmFsdWUoZGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIHN0eWxlIG9mIHRoZSBlZGl0b3IgY29udGFpbmVyIGRpdlxuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdzZXRFZGl0b3JTdHlsZScsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVkaXRvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke3RoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyfScpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3JEaXYuc3R5bGUgPSBkYXRhLnN0eWxlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudFZhbHVlID0gZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyXG4gICAgICAgICAgICAgICAgICAgIH0nKSwgT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFuZ3VhZ2U6IGRhdGEubGFuZ3VhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogZGF0YS50aGVtZSxcbiAgICAgICAgICAgICAgICAgICAgfSwgJHtKU09OLnN0cmluZ2lmeSh0aGlzLmVkaXRvck9wdGlvbnMpfSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBvcHRpb25zIG9mIHRoZSBlZGl0b3IgZnJvbSB3aGF0IHdhcyBzZW50IGZyb20gdGhlIG1haW52aWV3XG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ3NldEVkaXRvck9wdGlvbnMnLCBmdW5jdGlvbihldmVudCwgZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci51cGRhdGVPcHRpb25zKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwiZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWRcIiwgJycpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBsYW5ndWFnZSBvZiB0aGUgZWRpdG9yIGZyb20gd2hhdCB3YXMgc2VudCBmcm9tIHRoZSBtYWludmlld1xuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdzZXRMYW5ndWFnZScsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IgPSBtb25hY28uZWRpdG9yLmNyZWF0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHtcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lclxuICAgICAgICAgICAgICAgICAgICB9JyksIE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGN1cnJlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhbmd1YWdlOiBkYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgICAgICAgICB9LCAke0pTT04uc3RyaW5naWZ5KHRoaXMuZWRpdG9yT3B0aW9ucyl9KSk7XG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJlZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZFwiLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJlZGl0b3JMYW5ndWFnZUNoYW5nZWRcIiwgJycpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gcmVnaXN0ZXIgYSBuZXcgbGFuZ3VhZ2Ugd2l0aCBlZGl0b3JcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbigncmVnaXN0ZXJMYW5ndWFnZScsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IuZGlzcG9zZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5jb21wbGV0aW9uSXRlbVByb3ZpZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvdmlkZXIgPSBkYXRhLmNvbXBsZXRpb25JdGVtUHJvdmlkZXJbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlci5raW5kID0gZXZhbChwcm92aWRlci5raW5kKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubW9uYXJjaFRva2Vuc1Byb3ZpZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbW9uYXJjaFRva2VucyA9IGRhdGEubW9uYXJjaFRva2Vuc1Byb3ZpZGVyW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9uYXJjaFRva2Vuc1swXSA9IGV2YWwobW9uYXJjaFRva2Vuc1swXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5yZWdpc3Rlcih7IGlkOiBkYXRhLmlkIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIG1vbmFjby5sYW5ndWFnZXMuc2V0TW9uYXJjaFRva2Vuc1Byb3ZpZGVyKGRhdGEuaWQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuaXplcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3Q6IGRhdGEubW9uYXJjaFRva2Vuc1Byb3ZpZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIERlZmluZSBhIG5ldyB0aGVtZSB0aGF0IGNvbnN0YWlucyBvbmx5IHJ1bGVzIHRoYXQgbWF0Y2ggdGhpcyBsYW5ndWFnZVxuICAgICAgICAgICAgICAgICAgICBtb25hY28uZWRpdG9yLmRlZmluZVRoZW1lKGRhdGEuY3VzdG9tVGhlbWUuaWQsIGRhdGEuY3VzdG9tVGhlbWUudGhlbWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGVtZSA9IGRhdGEuY3VzdG9tVGhlbWUuaWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5yZWdpc3RlckNvbXBsZXRpb25JdGVtUHJvdmlkZXIoZGF0YS5pZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZUNvbXBsZXRpb25JdGVtczogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLmNvbXBsZXRpb25JdGVtUHJvdmlkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGNzcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgY3NzLnR5cGUgPSBcInRleHQvY3NzXCI7XG4gICAgICAgICAgICAgICAgICAgIGNzcy5pbm5lckhUTUwgPSBkYXRhLm1vbmFyY2hUb2tlbnNQcm92aWRlckNTUztcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjc3MpO1xuICAgICAgICAgICAgICAgICAgICByZWdpc3RlcmVkTGFuZ3VhZ2VzU3R5bGVzID0gWy4uLnJlZ2lzdGVyZWRMYW5ndWFnZXNTdHlsZXMsIGNzc107XG5cblxuICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwiZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWRcIiwgJycpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gSW5zdHJ1Y3QgdGhlIGVkaXRvciB0byByZW1lYXN1cmUgaXRzIGNvbnRhaW5lclxuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdsYXlvdXQnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IubGF5b3V0KCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJbnN0cnVjdCB0aGUgZWRpdG9yIGdvIHRvIGZ1bGwgc2NyZWVuIG1vZGVcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignc2hvd0Z1bGxTY3JlZW5FZGl0b3InLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBlZGl0b3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn0nKTtcbiAgICAgICAgICAgICAgICAgIGVkaXRvckRpdi53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gSW5zdHJ1Y3QgdGhlIGVkaXRvciBleGl0IGZ1bGwgc2NyZWVuIG1vZGVcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignZXhpdEZ1bGxTY3JlZW5FZGl0b3InLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBlZGl0b3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn0nKTtcbiAgICAgICAgICAgICAgICAgIGVkaXRvckRpdi53ZWJraXRFeGl0RnVsbHNjcmVlbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ2Rpc3Bvc2UnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICAgIHJlZ2lzdGVyZWRMYW5ndWFnZXNTdHlsZXMuZm9yRWFjaCgoc3R5bGUpID0+IHN0eWxlLnJlbW92ZSgpKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIG5lZWQgdG8gbWFudWFsbHkgcmVzaXplIHRoZSBlZGl0b3IgYW55IHRpbWUgdGhlIHdpbmRvdyBzaXplXG4gICAgICAgICAgICAgICAgLy8gY2hhbmdlcy4gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L21vbmFjby1lZGl0b3IvaXNzdWVzLzI4XG4gICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZnVuY3Rpb24gcmVzaXplRWRpdG9yKCkge1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IubGF5b3V0KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgICAgIDwvaHRtbD5gO1xuXG4gICAgICAvLyBkeW5hbWljYWxseSBjcmVhdGUgdGhlIEVsZWN0cm9uIFdlYnZpZXcgRWxlbWVudFxuICAgICAgLy8gdGhpcyB3aWxsIHNhbmRib3ggdGhlIG1vbmFjbyBjb2RlIGludG8gaXRzIG93biBET00gYW5kIGl0cyBvd25cbiAgICAgIC8vIGphdmFzY3JpcHQgaW5zdGFuY2UuIE5lZWQgdG8gZG8gdGhpcyB0byBhdm9pZCBwcm9ibGVtcyB3aXRoIG1vbmFjb1xuICAgICAgLy8gdXNpbmcgQU1EIFJlcXVpcmVzIGFuZCBFbGVjdHJvbiB1c2luZyBOb2RlIFJlcXVpcmVzXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9tb25hY28tZWRpdG9yL2lzc3Vlcy85MFxuICAgICAgdGhpcy5fd2VidmlldyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3dlYnZpZXcnKTtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2V0QXR0cmlidXRlKCdub2RlaW50ZWdyYXRpb24nLCAndHJ1ZScpO1xuICAgICAgdGhpcy5fd2Vidmlldy5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGV3ZWJzZWN1cml0eScsICd0cnVlJyk7XG4gICAgICAvLyB0YWtlIHRoZSBodG1sIGNvbnRlbnQgZm9yIHRoZSB3ZWJ2aWV3IGFuZCBiYXNlNjQgZW5jb2RlIGl0IGFuZCB1c2UgYXMgdGhlIHNyYyB0YWdcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2V0QXR0cmlidXRlKCdzcmMnLCAnZGF0YTp0ZXh0L2h0bWw7YmFzZTY0LCcgKyB3aW5kb3cuYnRvYShlZGl0b3JIVE1MKSk7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnZGlzcGxheTppbmxpbmUtZmxleDsgd2lkdGg6MTAwJTsgaGVpZ2h0OjEwMCUnKTtcbiAgICAgIC8vIHRvIGRlYnVnOlxuICAgICAgLy8gIHRoaXMuX3dlYnZpZXcuYWRkRXZlbnRMaXN0ZW5lcignZG9tLXJlYWR5JywgKCkgPT4ge1xuICAgICAgLy8gICAgIHRoaXMuX3dlYnZpZXcub3BlbkRldlRvb2xzKCk7XG4gICAgICAvLyAgfSk7XG5cbiAgICAgIC8vIFByb2Nlc3MgdGhlIGRhdGEgZnJvbSB0aGUgd2Vidmlld1xuICAgICAgdGhpcy5fd2Vidmlldy5hZGRFdmVudExpc3RlbmVyKCdpcGMtbWVzc2FnZScsIChldmVudDogYW55KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5jaGFubmVsID09PSAnZWRpdG9yQ29udGVudCcpIHtcbiAgICAgICAgICB0aGlzLl9mcm9tRWRpdG9yID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLndyaXRlVmFsdWUoZXZlbnQuYXJnc1swXSk7XG4gICAgICAgICAgdGhpcy5fc3ViamVjdC5uZXh0KHRoaXMuX3ZhbHVlKTtcbiAgICAgICAgICB0aGlzLl9zdWJqZWN0LmNvbXBsZXRlKCk7XG4gICAgICAgICAgdGhpcy5fc3ViamVjdCA9IG5ldyBTdWJqZWN0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY2hhbm5lbCA9PT0gJ29uRWRpdG9yQ29udGVudENoYW5nZScpIHtcbiAgICAgICAgICB0aGlzLl9mcm9tRWRpdG9yID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLndyaXRlVmFsdWUoZXZlbnQuYXJnc1swXSk7XG4gICAgICAgICAgaWYgKHRoaXMuaW5pdGlhbENvbnRlbnRDaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbENvbnRlbnRDaGFuZ2UgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubGF5b3V0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmNoYW5uZWwgPT09ICdlZGl0b3JJbml0aWFsaXplZCcpIHtcbiAgICAgICAgICB0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgdGhpcy5fZWRpdG9yUHJveHkgPSB0aGlzLndyYXBFZGl0b3JDYWxscyh0aGlzLl9lZGl0b3IpO1xuICAgICAgICAgIHRoaXMuZWRpdG9ySW5pdGlhbGl6ZWQuZW1pdCh0aGlzLl9lZGl0b3JQcm94eSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY2hhbm5lbCA9PT0gJ2VkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkJykge1xuICAgICAgICAgIHRoaXMuZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmNoYW5uZWwgPT09ICdlZGl0b3JMYW5ndWFnZUNoYW5nZWQnKSB7XG4gICAgICAgICAgdGhpcy5lZGl0b3JMYW5ndWFnZUNoYW5nZWQuZW1pdCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gYXBwZW5kIHRoZSB3ZWJ2aWV3IHRvIHRoZSBET01cbiAgICAgIHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX3dlYnZpZXcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBuZ0FmdGVyVmlld0luaXQgb25seSB1c2VkIGZvciBicm93c2VyIHZlcnNpb24gb2YgZWRpdG9yXG4gICAqIFRoaXMgaXMgd2hlcmUgdGhlIEFNRCBMb2FkZXIgc2NyaXB0cyBhcmUgYWRkZWQgdG8gdGhlIGJyb3dzZXIgYW5kIHRoZSBlZGl0b3Igc2NyaXB0cyBhcmUgXCJyZXF1aXJlZFwiXG4gICAqL1xuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9pc0VsZWN0cm9uQXBwKSB7XG4gICAgICBsb2FkTW9uYWNvKCk7XG4gICAgICB3YWl0VW50aWxNb25hY29SZWFkeSgpXG4gICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95KSlcbiAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5pbml0TW9uYWNvKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtZXJnZShcbiAgICAgIGZyb21FdmVudCh3aW5kb3csICdyZXNpemUnKS5waXBlKGRlYm91bmNlVGltZSgxMDApKSxcbiAgICAgIHRoaXMuX3dpZHRoU3ViamVjdC5hc09ic2VydmFibGUoKS5waXBlKGRpc3RpbmN0VW50aWxDaGFuZ2VkKCkpLFxuICAgICAgdGhpcy5faGVpZ2h0U3ViamVjdC5hc09ic2VydmFibGUoKS5waXBlKGRpc3RpbmN0VW50aWxDaGFuZ2VkKCkpLFxuICAgIClcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95KSwgZGVib3VuY2VUaW1lKDEwMCkpXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgdGhpcy5sYXlvdXQoKTtcbiAgICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgICB9KTtcbiAgICB0aW1lcig1MDAsIDI1MClcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95KSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fZWxlbWVudFJlZiAmJiB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpIHtcbiAgICAgICAgICB0aGlzLl93aWR0aFN1YmplY3QubmV4dCgoPEhUTUxFbGVtZW50PnRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgpO1xuICAgICAgICAgIHRoaXMuX2hlaWdodFN1YmplY3QubmV4dCgoPEhUTUxFbGVtZW50PnRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5kZXRhY2goKTtcbiAgICB0aGlzLl9yZWdpc3RlcmVkTGFuZ3VhZ2VzU3R5bGVzLmZvckVhY2goKHN0eWxlOiBIVE1MU3R5bGVFbGVtZW50KSA9PiBzdHlsZS5yZW1vdmUoKSk7XG4gICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnZGlzcG9zZScpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICB0aGlzLl9lZGl0b3IuZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9kZXN0cm95Lm5leHQodHJ1ZSk7XG4gICAgdGhpcy5fZGVzdHJveS51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIHNob3dGdWxsU2NyZWVuRWRpdG9yIHJlcXVlc3QgZm9yIGZ1bGwgc2NyZWVuIG9mIENvZGUgRWRpdG9yIGJhc2VkIG9uIGl0cyBicm93c2VyIHR5cGUuXG4gICAqL1xuICBwdWJsaWMgc2hvd0Z1bGxTY3JlZW5FZGl0b3IoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3Nob3dGdWxsU2NyZWVuRWRpdG9yJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBjb2RlRWRpdG9yRWxlbWVudDogSFRNTERpdkVsZW1lbnQgPSB0aGlzLl9lZGl0b3JDb250YWluZXIubmF0aXZlRWxlbWVudCBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICAgICAgY29uc3QgZnVsbFNjcmVlbk1hcDogb2JqZWN0ID0ge1xuICAgICAgICAgIC8vIENocm9tZVxuICAgICAgICAgIHJlcXVlc3RGdWxsc2NyZWVuOiAoKSA9PiBjb2RlRWRpdG9yRWxlbWVudC5yZXF1ZXN0RnVsbHNjcmVlbigpLFxuICAgICAgICAgIC8vIFNhZmFyaVxuICAgICAgICAgIHdlYmtpdFJlcXVlc3RGdWxsc2NyZWVuOiAoKSA9PiAoPGFueT5jb2RlRWRpdG9yRWxlbWVudCkud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgICAvLyBJRVxuICAgICAgICAgIG1zUmVxdWVzdEZ1bGxzY3JlZW46ICgpID0+ICg8YW55PmNvZGVFZGl0b3JFbGVtZW50KS5tc1JlcXVlc3RGdWxsc2NyZWVuKCksXG4gICAgICAgICAgLy8gRmlyZWZveFxuICAgICAgICAgIG1velJlcXVlc3RGdWxsU2NyZWVuOiAoKSA9PiAoPGFueT5jb2RlRWRpdG9yRWxlbWVudCkubW96UmVxdWVzdEZ1bGxTY3JlZW4oKSxcbiAgICAgICAgfTtcblxuICAgICAgICBmb3IgKGNvbnN0IGhhbmRsZXIgb2YgT2JqZWN0LmtleXMoZnVsbFNjcmVlbk1hcCkpIHtcbiAgICAgICAgICBpZiAoY29kZUVkaXRvckVsZW1lbnRbaGFuZGxlcl0pIHtcbiAgICAgICAgICAgIGZ1bGxTY3JlZW5NYXBbaGFuZGxlcl0oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5faXNGdWxsU2NyZWVuID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBleGl0RnVsbFNjcmVlbkVkaXRvciByZXF1ZXN0IHRvIGV4aXQgZnVsbCBzY3JlZW4gb2YgQ29kZSBFZGl0b3IgYmFzZWQgb24gaXRzIGJyb3dzZXIgdHlwZS5cbiAgICovXG4gIHB1YmxpYyBleGl0RnVsbFNjcmVlbkVkaXRvcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnZXhpdEZ1bGxTY3JlZW5FZGl0b3InKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGV4aXRGdWxsU2NyZWVuTWFwOiBvYmplY3QgPSB7XG4gICAgICAgICAgLy8gQ2hyb21lXG4gICAgICAgICAgZXhpdEZ1bGxzY3JlZW46ICgpID0+IGRvY3VtZW50LmV4aXRGdWxsc2NyZWVuKCksXG4gICAgICAgICAgLy8gU2FmYXJpXG4gICAgICAgICAgd2Via2l0RXhpdEZ1bGxzY3JlZW46ICgpID0+ICg8YW55PmRvY3VtZW50KS53ZWJraXRFeGl0RnVsbHNjcmVlbigpLFxuICAgICAgICAgIC8vIEZpcmVmb3hcbiAgICAgICAgICBtb3pDYW5jZWxGdWxsU2NyZWVuOiAoKSA9PiAoPGFueT5kb2N1bWVudCkubW96Q2FuY2VsRnVsbFNjcmVlbigpLFxuICAgICAgICAgIC8vIElFXG4gICAgICAgICAgbXNFeGl0RnVsbHNjcmVlbjogKCkgPT4gKDxhbnk+ZG9jdW1lbnQpLm1zRXhpdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgfTtcblxuICAgICAgICBmb3IgKGNvbnN0IGhhbmRsZXIgb2YgT2JqZWN0LmtleXMoZXhpdEZ1bGxTY3JlZW5NYXApKSB7XG4gICAgICAgICAgaWYgKGRvY3VtZW50W2hhbmRsZXJdKSB7XG4gICAgICAgICAgICBleGl0RnVsbFNjcmVlbk1hcFtoYW5kbGVyXSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9pc0Z1bGxTY3JlZW4gPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBhZGRGdWxsU2NyZWVuTW9kZUNvbW1hbmQgdXNlZCB0byBhZGQgdGhlIGZ1bGxzY3JlZW4gb3B0aW9uIHRvIHRoZSBjb250ZXh0IG1lbnVcbiAgICovXG4gIHByaXZhdGUgYWRkRnVsbFNjcmVlbk1vZGVDb21tYW5kKCk6IHZvaWQge1xuICAgIHRoaXMuX2VkaXRvci5hZGRBY3Rpb24oe1xuICAgICAgLy8gQW4gdW5pcXVlIGlkZW50aWZpZXIgb2YgdGhlIGNvbnRyaWJ1dGVkIGFjdGlvbi5cbiAgICAgIGlkOiAnZnVsbFNjcmVlbicsXG4gICAgICAvLyBBIGxhYmVsIG9mIHRoZSBhY3Rpb24gdGhhdCB3aWxsIGJlIHByZXNlbnRlZCB0byB0aGUgdXNlci5cbiAgICAgIGxhYmVsOiAnRnVsbCBTY3JlZW4nLFxuICAgICAgLy8gQW4gb3B0aW9uYWwgYXJyYXkgb2Yga2V5YmluZGluZ3MgZm9yIHRoZSBhY3Rpb24uXG4gICAgICBjb250ZXh0TWVudUdyb3VwSWQ6ICduYXZpZ2F0aW9uJyxcbiAgICAgIGtleWJpbmRpbmdzOiB0aGlzLl9rZXljb2RlLFxuICAgICAgY29udGV4dE1lbnVPcmRlcjogMS41LFxuICAgICAgLy8gTWV0aG9kIHRoYXQgd2lsbCBiZSBleGVjdXRlZCB3aGVuIHRoZSBhY3Rpb24gaXMgdHJpZ2dlcmVkLlxuICAgICAgLy8gQHBhcmFtIGVkaXRvciBUaGUgZWRpdG9yIGluc3RhbmNlIGlzIHBhc3NlZCBpbiBhcyBhIGNvbnZpbmllbmNlXG4gICAgICBydW46IChlZDogYW55KSA9PiB7XG4gICAgICAgIHRoaXMuc2hvd0Z1bGxTY3JlZW5FZGl0b3IoKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogd3JhcEVkaXRvckNhbGxzIHVzZWQgdG8gcHJveHkgYWxsIHRoZSBjYWxscyB0byB0aGUgbW9uYWNvIGVkaXRvclxuICAgKiBGb3IgY2FsbHMgZm9yIEVsZWN0cm9uIHVzZSB0aGlzIHRvIGNhbGwgdGhlIGVkaXRvciBpbnNpZGUgdGhlIHdlYnZpZXdcbiAgICovXG4gIHByaXZhdGUgd3JhcEVkaXRvckNhbGxzKG9iajogYW55KTogYW55IHtcbiAgICBjb25zdCB0aGF0OiBhbnkgPSB0aGlzO1xuICAgIGNvbnN0IGhhbmRsZXI6IGFueSA9IHtcbiAgICAgIGdldCh0YXJnZXQ6IGFueSwgcHJvcEtleTogYW55LCByZWNlaXZlcjogYW55KTogYW55IHtcbiAgICAgICAgcmV0dXJuIGFzeW5jICguLi5hcmdzOiBhbnkpOiBQcm9taXNlPGFueT4gPT4ge1xuICAgICAgICAgIGlmICh0aGF0Ll9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgaWYgKHRoYXQuX3dlYnZpZXcpIHtcbiAgICAgICAgICAgICAgY29uc3QgZXhlY3V0ZUphdmFTY3JpcHQ6IChjb2RlOiBzdHJpbmcpID0+IFByb21pc2U8YW55PiA9IChjb2RlOiBzdHJpbmcpID0+XG4gICAgICAgICAgICAgICAgbmV3IFByb21pc2UoKHJlc29sdmU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgdGhhdC5fd2Vidmlldy5leGVjdXRlSmF2YVNjcmlwdChjb2RlLCByZXNvbHZlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuIGV4ZWN1dGVKYXZhU2NyaXB0KCdlZGl0b3IuJyArIHByb3BLZXkgKyAnKCcgKyBhcmdzICsgJyknKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnN0IG9yaWdNZXRob2Q6IGFueSA9IHRhcmdldFtwcm9wS2V5XTtcbiAgICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBhbnkgPSBhd2FpdCBvcmlnTWV0aG9kLmFwcGx5KHRoYXQuX2VkaXRvciwgYXJncyk7XG4gICAgICAgICAgICAgIC8vIHNpbmNlIHJ1bm5pbmcgamF2YXNjcmlwdCBjb2RlIG1hbnVhbGx5IG5lZWQgdG8gZm9yY2UgQW5ndWxhciB0byBkZXRlY3QgY2hhbmdlc1xuICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGF0LnpvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZVxuICAgICAgICAgICAgICAgICAgaWYgKCF0aGF0Ll9jaGFuZ2VEZXRlY3RvclJlZlsnZGVzdHJveWVkJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5fY2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgIH07XG4gICAgcmV0dXJuIG5ldyBQcm94eShvYmosIGhhbmRsZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIGluaXRNb25hY28gbWV0aG9kIGNyZWF0ZXMgdGhlIG1vbmFjbyBlZGl0b3IgaW50byB0aGUgQFZpZXdDaGlsZCgnZWRpdG9yQ29udGFpbmVyJylcbiAgICogYW5kIGVtaXQgdGhlIGVkaXRvckluaXRpYWxpemVkIGV2ZW50LiAgVGhpcyBpcyBvbmx5IHVzZWQgaW4gdGhlIGJyb3dzZXIgdmVyc2lvbi5cbiAgICovXG4gIHByaXZhdGUgaW5pdE1vbmFjbygpOiB2b2lkIHtcbiAgICBjb25zdCBjb250YWluZXJEaXY6IEhUTUxEaXZFbGVtZW50ID0gdGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQ7XG4gICAgY29udGFpbmVyRGl2LmlkID0gdGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXI7XG4gICAgdGhpcy5fZWRpdG9yID0gbW9uYWNvLmVkaXRvci5jcmVhdGUoXG4gICAgICBjb250YWluZXJEaXYsXG4gICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICB7XG4gICAgICAgICAgdmFsdWU6IHRoaXMuX3ZhbHVlLFxuICAgICAgICAgIGxhbmd1YWdlOiB0aGlzLmxhbmd1YWdlLFxuICAgICAgICAgIHRoZW1lOiB0aGlzLl90aGVtZSxcbiAgICAgICAgfSxcbiAgICAgICAgdGhpcy5lZGl0b3JPcHRpb25zLFxuICAgICAgKSxcbiAgICApO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fZWRpdG9yUHJveHkgPSB0aGlzLndyYXBFZGl0b3JDYWxscyh0aGlzLl9lZGl0b3IpO1xuICAgICAgdGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgdGhpcy5lZGl0b3JJbml0aWFsaXplZC5lbWl0KHRoaXMuX2VkaXRvclByb3h5KTtcbiAgICB9KTtcbiAgICB0aGlzLl9lZGl0b3IuZ2V0TW9kZWwoKS5vbkRpZENoYW5nZUNvbnRlbnQoKGU6IGFueSkgPT4ge1xuICAgICAgdGhpcy5fZnJvbUVkaXRvciA9IHRydWU7XG4gICAgICB0aGlzLndyaXRlVmFsdWUodGhpcy5fZWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICAgaWYgKHRoaXMuaW5pdGlhbENvbnRlbnRDaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5pbml0aWFsQ29udGVudENoYW5nZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmxheW91dCgpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuYWRkRnVsbFNjcmVlbk1vZGVDb21tYW5kKCk7XG4gIH1cbn1cbiJdfQ==