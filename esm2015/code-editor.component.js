/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
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
                this._appPath = electron.remote.app
                    .getAppPath()
                    .split('\\')
                    .join('/');
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
                (...args) => tslib_1.__awaiter(this, void 0, void 0, function* () {
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
    automaticLayout: [{ type: Input, args: ['automaticLayout',] }],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS1lZGl0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGNvdmFsZW50L2NvZGUtZWRpdG9yLyIsInNvdXJjZXMiOlsiY29kZS1lZGl0b3IuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFlBQVksRUFHWixTQUFTLEVBQ1QsVUFBVSxFQUNWLFVBQVUsRUFDVixNQUFNLEVBQ04saUJBQWlCLEdBRWxCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxpQkFBaUIsRUFBd0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6RSxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvQyxPQUFPLEVBQUUsWUFBWSxFQUFFLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRS9FLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxVQUFVLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7TUFFakUsSUFBSTs7O0FBQVEsR0FBRyxFQUFFO0lBQ3JCLGVBQWU7QUFDakIsQ0FBQyxDQUFBOzs7O0lBR0csYUFBYSxHQUFXLENBQUM7QUFpQjdCLE1BQU0sT0FBTyxxQkFBcUI7Ozs7Ozs7SUEyRWhDLFlBQW9CLElBQVksRUFBVSxrQkFBcUMsRUFBVSxXQUF1QjtRQUE1RixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVUsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFZO1FBMUV4RyxhQUFRLEdBQXFCLElBQUksT0FBTyxFQUFXLENBQUM7UUFDcEQsa0JBQWEsR0FBb0IsSUFBSSxPQUFPLEVBQVUsQ0FBQztRQUN2RCxtQkFBYyxHQUFvQixJQUFJLE9BQU8sRUFBVSxDQUFDO1FBRXhE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Qjs7Ozs7SUFBRSxtREFBNkM7Ozs7O0lBQUUsNENBQStCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9uZW50LFxuICBJbnB1dCxcbiAgT3V0cHV0LFxuICBFdmVudEVtaXR0ZXIsXG4gIE9uSW5pdCxcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgVmlld0NoaWxkLFxuICBFbGVtZW50UmVmLFxuICBmb3J3YXJkUmVmLFxuICBOZ1pvbmUsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBPbkRlc3Ryb3ksXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTkdfVkFMVUVfQUNDRVNTT1IsIENvbnRyb2xWYWx1ZUFjY2Vzc29yIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZnJvbUV2ZW50LCBtZXJnZSwgdGltZXIgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGRlYm91bmNlVGltZSwgZGlzdGluY3RVbnRpbENoYW5nZWQsIHRha2VVbnRpbCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgd2FpdFVudGlsTW9uYWNvUmVhZHksIGxvYWRNb25hY28gfSBmcm9tICcuL2NvZGUtZWRpdG9yLnV0aWxzJztcblxuY29uc3Qgbm9vcDogYW55ID0gKCkgPT4ge1xuICAvLyBlbXB0eSBtZXRob2Rcbn07XG5cbi8vIGNvdW50ZXIgZm9yIGlkcyB0byBhbGxvdyBmb3IgbXVsdGlwbGUgZWRpdG9ycyBvbiBvbmUgcGFnZVxubGV0IHVuaXF1ZUNvdW50ZXI6IG51bWJlciA9IDA7XG4vLyBkZWNsYXJlIGFsbCB0aGUgYnVpbHQgaW4gZWxlY3Ryb24gb2JqZWN0c1xuZGVjbGFyZSBjb25zdCBlbGVjdHJvbjogYW55O1xuZGVjbGFyZSBjb25zdCBtb25hY286IGFueTtcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAndGQtY29kZS1lZGl0b3InLFxuICB0ZW1wbGF0ZVVybDogJy4vY29kZS1lZGl0b3IuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9jb2RlLWVkaXRvci5jb21wb25lbnQuc2NzcyddLFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IFRkQ29kZUVkaXRvckNvbXBvbmVudCksXG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICB9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBUZENvZGVFZGl0b3JDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyVmlld0luaXQsIENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9kZXN0cm95OiBTdWJqZWN0PGJvb2xlYW4+ID0gbmV3IFN1YmplY3Q8Ym9vbGVhbj4oKTtcbiAgcHJpdmF0ZSBfd2lkdGhTdWJqZWN0OiBTdWJqZWN0PG51bWJlcj4gPSBuZXcgU3ViamVjdDxudW1iZXI+KCk7XG4gIHByaXZhdGUgX2hlaWdodFN1YmplY3Q6IFN1YmplY3Q8bnVtYmVyPiA9IG5ldyBTdWJqZWN0PG51bWJlcj4oKTtcblxuICBwcml2YXRlIF9lZGl0b3JTdHlsZTogc3RyaW5nID0gJ3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7Ym9yZGVyOjFweCBzb2xpZCBncmV5Oyc7XG4gIHByaXZhdGUgX2FwcFBhdGg6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlIF9pc0VsZWN0cm9uQXBwOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX3dlYnZpZXc6IGFueTtcbiAgcHJpdmF0ZSBfdmFsdWU6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlIF90aGVtZTogc3RyaW5nID0gJ3ZzJztcbiAgcHJpdmF0ZSBfbGFuZ3VhZ2U6IHN0cmluZyA9ICdqYXZhc2NyaXB0JztcbiAgcHJpdmF0ZSBfc3ViamVjdDogU3ViamVjdDxzdHJpbmc+ID0gbmV3IFN1YmplY3QoKTtcbiAgcHJpdmF0ZSBfZWRpdG9ySW5uZXJDb250YWluZXI6IHN0cmluZyA9ICdlZGl0b3JJbm5lckNvbnRhaW5lcicgKyB1bmlxdWVDb3VudGVyKys7XG4gIHByaXZhdGUgX2VkaXRvck5vZGVNb2R1bGVEaXJPdmVycmlkZTogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgX2VkaXRvcjogYW55O1xuICBwcml2YXRlIF9lZGl0b3JQcm94eTogYW55O1xuICBwcml2YXRlIF9jb21wb25lbnRJbml0aWFsaXplZDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9mcm9tRWRpdG9yOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX2VkaXRvck9wdGlvbnM6IGFueSA9IHt9O1xuICBwcml2YXRlIF9pc0Z1bGxTY3JlZW46IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfa2V5Y29kZTogYW55O1xuICBwcml2YXRlIF9zZXRWYWx1ZVRpbWVvdXQ6IGFueTtcbiAgcHJpdmF0ZSBpbml0aWFsQ29udGVudENoYW5nZTogYm9vbGVhbiA9IHRydWU7XG4gIHByaXZhdGUgX3JlZ2lzdGVyZWRMYW5ndWFnZXNTdHlsZXM6IEhUTUxTdHlsZUVsZW1lbnRbXSA9IFtdO1xuICBAVmlld0NoaWxkKCdlZGl0b3JDb250YWluZXInLCB7IHN0YXRpYzogdHJ1ZSB9KSBfZWRpdG9yQ29udGFpbmVyOiBFbGVtZW50UmVmO1xuXG4gIC8qKlxuICAgKiBhdXRvbWF0aWNMYXlvdXQ/OiBib29sZWFuXG4gICAqIEBkZXByZWNhdGVkIGluIGZhdm9yIG9mIG91ciBvd24gcmVzaXplIGltcGxlbWVudGF0aW9uLlxuICAgKi9cbiAgQElucHV0KCdhdXRvbWF0aWNMYXlvdXQnKVxuICBzZXQgYXV0b21hdGljTGF5b3V0KGF1dG9tYXRpY0xheW91dDogYm9vbGVhbikge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZVxuICAgIGNvbnNvbGUud2FybihcbiAgICAgICdbYXV0b21hdGljTGF5b3V0XSBoYXMgYmVlbiBkZXByZWNhdGVkIGluIGZhdm9yIG9mIG91ciBvd24gcmVzaXplIGltcGxlbWVudGF0aW9uIGFuZCB3aWxsIGJlIHJlbW92ZWQgb24gMy4wLjAnLFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogZWRpdG9ySW5pdGlhbGl6ZWQ6IGZ1bmN0aW9uKCRldmVudClcbiAgICogRXZlbnQgZW1pdHRlZCB3aGVuIGVkaXRvciBpcyBmaXJzdCBpbml0aWFsaXplZFxuICAgKi9cbiAgQE91dHB1dCgpIGVkaXRvckluaXRpYWxpemVkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIGVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkOiBmdW5jdGlvbigkZXZlbnQpXG4gICAqIEV2ZW50IGVtaXR0ZWQgd2hlbiBlZGl0b3IncyBjb25maWd1cmF0aW9uIGNoYW5nZXNcbiAgICovXG4gIEBPdXRwdXQoKSBlZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBlZGl0b3JMYW5ndWFnZUNoYW5nZWQ6IGZ1bmN0aW9uKCRldmVudClcbiAgICogRXZlbnQgZW1pdHRlZCB3aGVuIGVkaXRvcidzIExhbmd1YWdlIGNoYW5nZXNcbiAgICovXG4gIEBPdXRwdXQoKSBlZGl0b3JMYW5ndWFnZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAvKipcbiAgICogZWRpdG9yVmFsdWVDaGFuZ2U6IGZ1bmN0aW9uKCRldmVudClcbiAgICogRXZlbnQgZW1pdHRlZCBhbnkgdGltZSBzb21ldGhpbmcgY2hhbmdlcyB0aGUgZWRpdG9yIHZhbHVlXG4gICAqL1xuICBAT3V0cHV0KCkgZWRpdG9yVmFsdWVDaGFuZ2U6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAvKipcbiAgICogVGhlIGNoYW5nZSBldmVudCBub3RpZmllcyB5b3UgYWJvdXQgYSBjaGFuZ2UgaGFwcGVuaW5nIGluIGFuIGlucHV0IGZpZWxkLlxuICAgKiBTaW5jZSB0aGUgY29tcG9uZW50IGlzIG5vdCBhIG5hdGl2ZSBBbmd1bGFyIGNvbXBvbmVudCBoYXZlIHRvIHNwZWNpZml5IHRoZSBldmVudCBlbWl0dGVyIG91cnNlbGZcbiAgICovXG4gIEBPdXRwdXQoKSBjaGFuZ2U6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAgLyogdHNsaW50OmRpc2FibGUtbmV4dC1saW5lICovXG4gIHByb3BhZ2F0ZUNoYW5nZSA9IChfOiBhbnkpID0+IHt9O1xuICBvblRvdWNoZWQgPSAoKSA9PiBub29wO1xuXG4gIC8qKlxuICAgKiBTZXQgaWYgdXNpbmcgRWxlY3Ryb24gbW9kZSB3aGVuIG9iamVjdCBpcyBjcmVhdGVkXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHpvbmU6IE5nWm9uZSwgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLCBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7XG4gICAgLy8gc2luY2UgYWNjZXNzaW5nIHRoZSB3aW5kb3cgb2JqZWN0IG5lZWQgdGhpcyBjaGVjayBzbyBzZXJ2ZXJzaWRlIHJlbmRlcmluZyBkb2Vzbid0IGZhaWxcbiAgICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAnb2JqZWN0JyAmJiAhIWRvY3VtZW50KSB7XG4gICAgICAvKiB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmUgKi9cbiAgICAgIHRoaXMuX2lzRWxlY3Ryb25BcHAgPSAoPGFueT53aW5kb3cpWydwcm9jZXNzJ10gPyB0cnVlIDogZmFsc2U7XG4gICAgICBpZiAodGhpcy5faXNFbGVjdHJvbkFwcCkge1xuICAgICAgICB0aGlzLl9hcHBQYXRoID0gZWxlY3Ryb24ucmVtb3RlLmFwcFxuICAgICAgICAgIC5nZXRBcHBQYXRoKClcbiAgICAgICAgICAuc3BsaXQoJ1xcXFwnKVxuICAgICAgICAgIC5qb2luKCcvJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHZhbHVlPzogc3RyaW5nXG4gICAqIFZhbHVlIGluIHRoZSBFZGl0b3IgYWZ0ZXIgYXN5bmMgZ2V0RWRpdG9yQ29udGVudCB3YXMgY2FsbGVkXG4gICAqL1xuICBASW5wdXQoJ3ZhbHVlJylcbiAgc2V0IHZhbHVlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAvLyBDbGVhciBhbnkgdGltZW91dCB0aGF0IG1pZ2h0IG92ZXJ3cml0ZSB0aGlzIHZhbHVlIHNldCBpbiB0aGUgZnV0dXJlXG4gICAgaWYgKHRoaXMuX3NldFZhbHVlVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3NldFZhbHVlVGltZW91dCk7XG4gICAgfVxuICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICBpZiAodGhpcy5fd2Vidmlldy5zZW5kICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBkb24ndCB3YW50IHRvIGtlZXAgc2VuZGluZyBjb250ZW50IGlmIGV2ZW50IGNhbWUgZnJvbSBJUEMsIGluZmluaXRlIGxvb3BcbiAgICAgICAgICBpZiAoIXRoaXMuX2Zyb21FZGl0b3IpIHtcbiAgICAgICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnc2V0RWRpdG9yQ29udGVudCcsIHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5lZGl0b3JWYWx1ZUNoYW5nZS5lbWl0KCk7XG4gICAgICAgICAgdGhpcy5wcm9wYWdhdGVDaGFuZ2UodGhpcy5fdmFsdWUpO1xuICAgICAgICAgIHRoaXMuY2hhbmdlLmVtaXQoKTtcbiAgICAgICAgICB0aGlzLl9mcm9tRWRpdG9yID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gRWRpdG9yIGlzIG5vdCBsb2FkZWQgeWV0LCB0cnkgYWdhaW4gaW4gaGFsZiBhIHNlY29uZFxuICAgICAgICAgIHRoaXMuX3NldFZhbHVlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLl9lZGl0b3IgJiYgdGhpcy5fZWRpdG9yLnNldFZhbHVlKSB7XG4gICAgICAgICAgLy8gZG9uJ3Qgd2FudCB0byBrZWVwIHNlbmRpbmcgY29udGVudCBpZiBldmVudCBjYW1lIGZyb20gdGhlIGVkaXRvciwgaW5maW5pdGUgbG9vcFxuICAgICAgICAgIGlmICghdGhpcy5fZnJvbUVkaXRvcikge1xuICAgICAgICAgICAgdGhpcy5fZWRpdG9yLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5lZGl0b3JWYWx1ZUNoYW5nZS5lbWl0KCk7XG4gICAgICAgICAgdGhpcy5wcm9wYWdhdGVDaGFuZ2UodGhpcy5fdmFsdWUpO1xuICAgICAgICAgIHRoaXMuY2hhbmdlLmVtaXQoKTtcbiAgICAgICAgICB0aGlzLl9mcm9tRWRpdG9yID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy56b25lLnJ1bigoKSA9PiAodGhpcy5fdmFsdWUgPSB2YWx1ZSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEVkaXRvciBpcyBub3QgbG9hZGVkIHlldCwgdHJ5IGFnYWluIGluIGhhbGYgYSBzZWNvbmRcbiAgICAgICAgICB0aGlzLl9zZXRWYWx1ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICB9LCA1MDApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3NldFZhbHVlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICB9LCA1MDApO1xuICAgIH1cbiAgfVxuXG4gIGdldCB2YWx1ZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICAgKi9cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgLy8gZG8gbm90IHdyaXRlIGlmIG51bGwgb3IgdW5kZWZpbmVkXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lXG4gICAgaWYgKHZhbHVlICE9IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BhZ2F0ZUNoYW5nZSA9IGZuO1xuICB9XG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLm9uVG91Y2hlZCA9IGZuO1xuICB9XG5cbiAgLyoqXG4gICAqIGdldEVkaXRvckNvbnRlbnQ/OiBmdW5jdGlvblxuICAgKiBSZXR1cm5zIHRoZSBjb250ZW50IHdpdGhpbiB0aGUgZWRpdG9yXG4gICAqL1xuICBnZXRWYWx1ZSgpOiBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdnZXRFZGl0b3JDb250ZW50Jyk7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgdGhpcy5fdmFsdWUgPSB0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fc3ViamVjdC5uZXh0KHRoaXMuX3ZhbHVlKTtcbiAgICAgICAgICB0aGlzLl9zdWJqZWN0LmNvbXBsZXRlKCk7XG4gICAgICAgICAgdGhpcy5fc3ViamVjdCA9IG5ldyBTdWJqZWN0KCk7XG4gICAgICAgICAgdGhpcy5lZGl0b3JWYWx1ZUNoYW5nZS5lbWl0KCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcy5fc3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogbGFuZ3VhZ2U/OiBzdHJpbmdcbiAgICogbGFuZ3VhZ2UgdXNlZCBpbiBlZGl0b3JcbiAgICovXG4gIEBJbnB1dCgnbGFuZ3VhZ2UnKVxuICBzZXQgbGFuZ3VhZ2UobGFuZ3VhZ2U6IHN0cmluZykge1xuICAgIHRoaXMuX2xhbmd1YWdlID0gbGFuZ3VhZ2U7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3NldExhbmd1YWdlJywgbGFuZ3VhZ2UpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgY29uc3QgY3VycmVudFZhbHVlOiBzdHJpbmcgPSB0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgdGhpcy5fZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICAgICAgY29uc3QgbXlEaXY6IEhUTUxEaXZFbGVtZW50ID0gdGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMuX2VkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKFxuICAgICAgICAgIG15RGl2LFxuICAgICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgIGxhbmd1YWdlLFxuICAgICAgICAgICAgICB0aGVtZTogdGhpcy5fdGhlbWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGhpcy5lZGl0b3JPcHRpb25zLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuX2VkaXRvci5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlQ29udGVudCgoZTogYW55KSA9PiB7XG4gICAgICAgICAgdGhpcy5fZnJvbUVkaXRvciA9IHRydWU7XG4gICAgICAgICAgdGhpcy53cml0ZVZhbHVlKHRoaXMuX2VkaXRvci5nZXRWYWx1ZSgpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCgpO1xuICAgICAgICB0aGlzLmVkaXRvckxhbmd1YWdlQ2hhbmdlZC5lbWl0KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGdldCBsYW5ndWFnZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9sYW5ndWFnZTtcbiAgfVxuXG4gIC8qKlxuICAgKiByZWdpc3Rlckxhbmd1YWdlPzogZnVuY3Rpb25cbiAgICogUmVnaXN0ZXJzIGEgY3VzdG9tIExhbmd1YWdlIHdpdGhpbiB0aGUgZWRpdG9yXG4gICAqL1xuICByZWdpc3Rlckxhbmd1YWdlKGxhbmd1YWdlOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgncmVnaXN0ZXJMYW5ndWFnZScsIGxhbmd1YWdlKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICAgIHRoaXMuX2VkaXRvci5kaXNwb3NlKCk7XG5cbiAgICAgICAgZm9yIChjb25zdCBwcm92aWRlciBvZiBsYW5ndWFnZS5jb21wbGV0aW9uSXRlbVByb3ZpZGVyKSB7XG4gICAgICAgICAgLyogdHNsaW50OmRpc2FibGUtbmV4dC1saW5lICovXG4gICAgICAgICAgcHJvdmlkZXIua2luZCA9IGV2YWwocHJvdmlkZXIua2luZCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBtb25hcmNoVG9rZW5zIG9mIGxhbmd1YWdlLm1vbmFyY2hUb2tlbnNQcm92aWRlcikge1xuICAgICAgICAgIC8qIHRzbGludDpkaXNhYmxlLW5leHQtbGluZSAqL1xuICAgICAgICAgIG1vbmFyY2hUb2tlbnNbMF0gPSBldmFsKG1vbmFyY2hUb2tlbnNbMF0pO1xuICAgICAgICB9XG4gICAgICAgIG1vbmFjby5sYW5ndWFnZXMucmVnaXN0ZXIoeyBpZDogbGFuZ3VhZ2UuaWQgfSk7XG5cbiAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5zZXRNb25hcmNoVG9rZW5zUHJvdmlkZXIobGFuZ3VhZ2UuaWQsIHtcbiAgICAgICAgICB0b2tlbml6ZXI6IHtcbiAgICAgICAgICAgIHJvb3Q6IGxhbmd1YWdlLm1vbmFyY2hUb2tlbnNQcm92aWRlcixcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBEZWZpbmUgYSBuZXcgdGhlbWUgdGhhdCBjb25zdGFpbnMgb25seSBydWxlcyB0aGF0IG1hdGNoIHRoaXMgbGFuZ3VhZ2VcbiAgICAgICAgbW9uYWNvLmVkaXRvci5kZWZpbmVUaGVtZShsYW5ndWFnZS5jdXN0b21UaGVtZS5pZCwgbGFuZ3VhZ2UuY3VzdG9tVGhlbWUudGhlbWUpO1xuICAgICAgICB0aGlzLl90aGVtZSA9IGxhbmd1YWdlLmN1c3RvbVRoZW1lLmlkO1xuXG4gICAgICAgIG1vbmFjby5sYW5ndWFnZXMucmVnaXN0ZXJDb21wbGV0aW9uSXRlbVByb3ZpZGVyKGxhbmd1YWdlLmlkLCB7XG4gICAgICAgICAgcHJvdmlkZUNvbXBsZXRpb25JdGVtczogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGxhbmd1YWdlLmNvbXBsZXRpb25JdGVtUHJvdmlkZXI7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgY3NzOiBIVE1MU3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgY3NzLnR5cGUgPSAndGV4dC9jc3MnO1xuICAgICAgICBjc3MuaW5uZXJIVE1MID0gbGFuZ3VhZ2UubW9uYXJjaFRva2Vuc1Byb3ZpZGVyQ1NTO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNzcyk7XG4gICAgICAgIHRoaXMuZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCgpO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcmVkTGFuZ3VhZ2VzU3R5bGVzID0gWy4uLnRoaXMuX3JlZ2lzdGVyZWRMYW5ndWFnZXNTdHlsZXMsIGNzc107XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHN0eWxlPzogc3RyaW5nXG4gICAqIGNzcyBzdHlsZSBvZiB0aGUgZWRpdG9yIG9uIHRoZSBwYWdlXG4gICAqL1xuICBASW5wdXQoJ2VkaXRvclN0eWxlJylcbiAgc2V0IGVkaXRvclN0eWxlKGVkaXRvclN0eWxlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9lZGl0b3JTdHlsZSA9IGVkaXRvclN0eWxlO1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdzZXRFZGl0b3JTdHlsZScsIHsgbGFuZ3VhZ2U6IHRoaXMuX2xhbmd1YWdlLCB0aGVtZTogdGhpcy5fdGhlbWUsIHN0eWxlOiBlZGl0b3JTdHlsZSB9KTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lckRpdjogSFRNTERpdkVsZW1lbnQgPSB0aGlzLl9lZGl0b3JDb250YWluZXIubmF0aXZlRWxlbWVudDtcbiAgICAgICAgY29udGFpbmVyRGl2LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBlZGl0b3JTdHlsZSk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZTogc3RyaW5nID0gdGhpcy5fZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgIHRoaXMuX2VkaXRvci5kaXNwb3NlKCk7XG4gICAgICAgIGNvbnN0IG15RGl2OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50O1xuICAgICAgICB0aGlzLl9lZGl0b3IgPSBtb25hY28uZWRpdG9yLmNyZWF0ZShcbiAgICAgICAgICBteURpdixcbiAgICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB2YWx1ZTogY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICBsYW5ndWFnZTogdGhpcy5fbGFuZ3VhZ2UsXG4gICAgICAgICAgICAgIHRoZW1lOiB0aGlzLl90aGVtZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0aGlzLmVkaXRvck9wdGlvbnMsXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fZWRpdG9yLmdldE1vZGVsKCkub25EaWRDaGFuZ2VDb250ZW50KChlOiBhbnkpID0+IHtcbiAgICAgICAgICB0aGlzLl9mcm9tRWRpdG9yID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLndyaXRlVmFsdWUodGhpcy5fZWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0IGVkaXRvclN0eWxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRvclN0eWxlO1xuICB9XG5cbiAgLyoqXG4gICAqIHRoZW1lPzogc3RyaW5nXG4gICAqIFRoZW1lIHRvIGJlIGFwcGxpZWQgdG8gZWRpdG9yXG4gICAqL1xuICBASW5wdXQoJ3RoZW1lJylcbiAgc2V0IHRoZW1lKHRoZW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLl90aGVtZSA9IHRoZW1lO1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdzZXRFZGl0b3JPcHRpb25zJywgeyB0aGVtZSB9KTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICAgIHRoaXMuX2VkaXRvci51cGRhdGVPcHRpb25zKHsgdGhlbWUgfSk7XG4gICAgICAgIHRoaXMuZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXQgdGhlbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fdGhlbWU7XG4gIH1cblxuICAvKipcbiAgICogZnVsbFNjcmVlbktleUJpbmRpbmc/OiBudW1iZXJcbiAgICogU2VlIGhlcmUgZm9yIGtleSBiaW5kaW5ncyBodHRwczovL21pY3Jvc29mdC5naXRodWIuaW8vbW9uYWNvLWVkaXRvci9hcGkvZW51bXMvbW9uYWNvLmtleWNvZGUuaHRtbFxuICAgKiBTZXRzIHRoZSBLZXlDb2RlIGZvciBzaG9ydGN1dHRpbmcgdG8gRnVsbHNjcmVlbiBtb2RlXG4gICAqL1xuICBASW5wdXQoJ2Z1bGxTY3JlZW5LZXlCaW5kaW5nJylcbiAgc2V0IGZ1bGxTY3JlZW5LZXlCaW5kaW5nKGtleWNvZGU6IG51bWJlcltdKSB7XG4gICAgdGhpcy5fa2V5Y29kZSA9IGtleWNvZGU7XG4gIH1cbiAgZ2V0IGZ1bGxTY3JlZW5LZXlCaW5kaW5nKCk6IG51bWJlcltdIHtcbiAgICByZXR1cm4gdGhpcy5fa2V5Y29kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBlZGl0b3JPcHRpb25zPzogb2JqZWN0XG4gICAqIE9wdGlvbnMgdXNlZCBvbiBlZGl0b3IgaW5zdGFudGlhdGlvbi4gQXZhaWxhYmxlIG9wdGlvbnMgbGlzdGVkIGhlcmU6XG4gICAqIGh0dHBzOi8vbWljcm9zb2Z0LmdpdGh1Yi5pby9tb25hY28tZWRpdG9yL2FwaS9pbnRlcmZhY2VzL21vbmFjby5lZGl0b3IuaWVkaXRvcm9wdGlvbnMuaHRtbFxuICAgKi9cbiAgQElucHV0KCdlZGl0b3JPcHRpb25zJylcbiAgc2V0IGVkaXRvck9wdGlvbnMoZWRpdG9yT3B0aW9uczogYW55KSB7XG4gICAgdGhpcy5fZWRpdG9yT3B0aW9ucyA9IGVkaXRvck9wdGlvbnM7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3NldEVkaXRvck9wdGlvbnMnLCBlZGl0b3JPcHRpb25zKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICAgIHRoaXMuX2VkaXRvci51cGRhdGVPcHRpb25zKGVkaXRvck9wdGlvbnMpO1xuICAgICAgICB0aGlzLmVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkLmVtaXQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0IGVkaXRvck9wdGlvbnMoKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdG9yT3B0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBsYXlvdXQgbWV0aG9kIHRoYXQgY2FsbHMgbGF5b3V0IG1ldGhvZCBvZiBlZGl0b3IgYW5kIGluc3RydWN0cyB0aGUgZWRpdG9yIHRvIHJlbWVhc3VyZSBpdHMgY29udGFpbmVyXG4gICAqL1xuICBsYXlvdXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2xheW91dCcpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgdGhpcy5fZWRpdG9yLmxheW91dCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGlmIGluIEVsZWN0cm9uIG1vZGUgb3Igbm90XG4gICAqL1xuICBnZXQgaXNFbGVjdHJvbkFwcCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNFbGVjdHJvbkFwcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGlmIGluIEZ1bGwgU2NyZWVuIE1vZGUgb3Igbm90XG4gICAqL1xuICBnZXQgaXNGdWxsU2NyZWVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc0Z1bGxTY3JlZW47XG4gIH1cblxuICAvKipcbiAgICogc2V0RWRpdG9yTm9kZU1vZHVsZURpck92ZXJyaWRlIGZ1bmN0aW9uIHRoYXQgb3ZlcnJpZGVzIHdoZXJlIHRvIGxvb2tcbiAgICogZm9yIHRoZSBlZGl0b3Igbm9kZV9tb2R1bGUuIFVzZWQgaW4gdGVzdHMgZm9yIEVsZWN0cm9uIG9yIGFueXdoZXJlIHRoYXQgdGhlXG4gICAqIG5vZGVfbW9kdWxlcyBhcmUgbm90IGluIHRoZSBleHBlY3RlZCBsb2NhdGlvbi5cbiAgICovXG4gIHNldEVkaXRvck5vZGVNb2R1bGVEaXJPdmVycmlkZShkaXJPdmVycmlkZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZWRpdG9yTm9kZU1vZHVsZURpck92ZXJyaWRlID0gZGlyT3ZlcnJpZGU7XG4gICAgdGhpcy5fYXBwUGF0aCA9IGRpck92ZXJyaWRlO1xuICB9XG5cbiAgLyoqXG4gICAqIG5nT25Jbml0IG9ubHkgdXNlZCBmb3IgRWxlY3Ryb24gdmVyc2lvbiBvZiBlZGl0b3JcbiAgICogVGhpcyBpcyB3aGVyZSB0aGUgd2VidmlldyBpcyBjcmVhdGVkIHRvIHNhbmRib3ggYXdheSB0aGUgZWRpdG9yXG4gICAqL1xuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICBsZXQgZWRpdG9ySFRNTDogc3RyaW5nID0gJyc7XG4gICAgaWYgKHRoaXMuX2lzRWxlY3Ryb25BcHApIHtcbiAgICAgIGVkaXRvckhUTUwgPSBgPCFET0NUWVBFIGh0bWw+XG4gICAgICAgICAgICA8aHRtbCBzdHlsZT1cImhlaWdodDoxMDAlXCI+XG4gICAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICAgICAgICA8bWV0YSBodHRwLWVxdWl2PVwiWC1VQS1Db21wYXRpYmxlXCIgY29udGVudD1cIklFPWVkZ2VcIiAvPlxuICAgICAgICAgICAgICAgIDxtZXRhIGh0dHAtZXF1aXY9XCJDb250ZW50LVR5cGVcIiBjb250ZW50PVwidGV4dC9odG1sO2NoYXJzZXQ9dXRmLThcIiA+XG4gICAgICAgICAgICAgICAgPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGRhdGEtbmFtZT1cInZzL2VkaXRvci9lZGl0b3IubWFpblwiXG4gICAgICAgICAgICAgICAgICAgIGhyZWY9XCJmaWxlOi8vJHt0aGlzLl9lZGl0b3JOb2RlTW9kdWxlRGlyT3ZlcnJpZGV9L2Fzc2V0cy9tb25hY28vdnMvZWRpdG9yL2VkaXRvci5tYWluLmNzc1wiPlxuICAgICAgICAgICAgPC9oZWFkPlxuICAgICAgICAgICAgPGJvZHkgc3R5bGU9XCJoZWlnaHQ6MTAwJTt3aWR0aDogMTAwJTttYXJnaW46IDA7cGFkZGluZzogMDtvdmVyZmxvdzogaGlkZGVuO1wiPlxuICAgICAgICAgICAgPGRpdiBpZD1cIiR7dGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJ9XCIgc3R5bGU9XCJ3aWR0aDoxMDAlO2hlaWdodDoxMDAlOyR7dGhpcy5fZWRpdG9yU3R5bGV9XCI+PC9kaXY+XG4gICAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgaXBjUmVuZGVyZXIgb2YgZWxlY3Ryb24gZm9yIGNvbW11bmljYXRpb25cbiAgICAgICAgICAgICAgICBjb25zdCB7aXBjUmVuZGVyZXJ9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKTtcbiAgICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgICAgPHNjcmlwdCBzcmM9XCJmaWxlOi8vJHt0aGlzLl9lZGl0b3JOb2RlTW9kdWxlRGlyT3ZlcnJpZGV9L2Fzc2V0cy9tb25hY28vdnMvbG9hZGVyLmpzXCI+PC9zY3JpcHQ+XG4gICAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgICAgIHZhciBlZGl0b3I7XG4gICAgICAgICAgICAgICAgdmFyIHRoZW1lID0gJyR7dGhpcy5fdGhlbWV9JztcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSAnJHt0aGlzLl92YWx1ZX0nO1xuICAgICAgICAgICAgICAgIHZhciByZWdpc3RlcmVkTGFuZ3VhZ2VzU3R5bGVzID0gW107XG5cbiAgICAgICAgICAgICAgICByZXF1aXJlLmNvbmZpZyh7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VVcmw6ICcke3RoaXMuX2FwcFBhdGh9L2Fzc2V0cy9tb25hY28nXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2VsZi5tb2R1bGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgc2VsZi5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgcmVxdWlyZShbJ3ZzL2VkaXRvci9lZGl0b3IubWFpbiddLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yID0gbW9uYWNvLmVkaXRvci5jcmVhdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJcbiAgICAgICAgICAgICAgICAgICAgfScpLCBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhbmd1YWdlOiAnJHt0aGlzLmxhbmd1YWdlfScsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJyR7dGhpcy5fdGhlbWV9JyxcbiAgICAgICAgICAgICAgICAgICAgfSwgJHtKU09OLnN0cmluZ2lmeSh0aGlzLmVkaXRvck9wdGlvbnMpfSkpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IuZ2V0TW9kZWwoKS5vbkRpZENoYW5nZUNvbnRlbnQoIChlKT0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJvbkVkaXRvckNvbnRlbnRDaGFuZ2VcIiwgZWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmFkZEFjdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gQW4gdW5pcXVlIGlkZW50aWZpZXIgb2YgdGhlIGNvbnRyaWJ1dGVkIGFjdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgICBpZDogJ2Z1bGxTY3JlZW4nLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIEEgbGFiZWwgb2YgdGhlIGFjdGlvbiB0aGF0IHdpbGwgYmUgcHJlc2VudGVkIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRnVsbCBTY3JlZW4nLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIEFuIG9wdGlvbmFsIGFycmF5IG9mIGtleWJpbmRpbmdzIGZvciB0aGUgYWN0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHRNZW51R3JvdXBJZDogJ25hdmlnYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICAgIGtleWJpbmRpbmdzOiBbJHt0aGlzLl9rZXljb2RlfV0sXG4gICAgICAgICAgICAgICAgICAgICAgY29udGV4dE1lbnVPcmRlcjogMS41LFxuICAgICAgICAgICAgICAgICAgICAgIC8vIE1ldGhvZCB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgd2hlbiB0aGUgYWN0aW9uIGlzIHRyaWdnZXJlZC5cbiAgICAgICAgICAgICAgICAgICAgICAvLyBAcGFyYW0gZWRpdG9yIFRoZSBlZGl0b3IgaW5zdGFuY2UgaXMgcGFzc2VkIGluIGFzIGEgY29udmluaWVuY2VcbiAgICAgICAgICAgICAgICAgICAgICBydW46IGZ1bmN0aW9uKGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWRpdG9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7dGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJ9Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0b3JEaXYud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IuYWRkQWN0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBBbiB1bmlxdWUgaWRlbnRpZmllciBvZiB0aGUgY29udHJpYnV0ZWQgYWN0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZXhpdGZ1bGxTY3JlZW4nLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIEEgbGFiZWwgb2YgdGhlIGFjdGlvbiB0aGF0IHdpbGwgYmUgcHJlc2VudGVkIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRXhpdCBGdWxsIFNjcmVlbicsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gQW4gb3B0aW9uYWwgYXJyYXkgb2Yga2V5YmluZGluZ3MgZm9yIHRoZSBhY3Rpb24uXG4gICAgICAgICAgICAgICAgICAgICAgY29udGV4dE1lbnVHcm91cElkOiAnbmF2aWdhdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAga2V5YmluZGluZ3M6IFs5XSxcbiAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0TWVudU9yZGVyOiAxLjUsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gTWV0aG9kIHRoYXQgd2lsbCBiZSBleGVjdXRlZCB3aGVuIHRoZSBhY3Rpb24gaXMgdHJpZ2dlcmVkLlxuICAgICAgICAgICAgICAgICAgICAgIC8vIEBwYXJhbSBlZGl0b3IgVGhlIGVkaXRvciBpbnN0YW5jZSBpcyBwYXNzZWQgaW4gYXMgYSBjb252aW5pZW5jZVxuICAgICAgICAgICAgICAgICAgICAgIHJ1bjogZnVuY3Rpb24oZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlZGl0b3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LndlYmtpdEV4aXRGdWxsc2NyZWVuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIuc2VuZFRvSG9zdChcImVkaXRvckluaXRpYWxpemVkXCIsIHRoaXMuX2VkaXRvcik7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gYmFjayB0aGUgdmFsdWUgaW4gdGhlIGVkaXRvciB0byB0aGUgbWFpbnZpZXdcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignZ2V0RWRpdG9yQ29udGVudCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJlZGl0b3JDb250ZW50XCIsIGVkaXRvci5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgdmFsdWUgb2YgdGhlIGVkaXRvciBmcm9tIHdoYXQgd2FzIHNlbnQgZnJvbSB0aGUgbWFpbnZpZXdcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignc2V0RWRpdG9yQ29udGVudCcsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBkYXRhO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3Iuc2V0VmFsdWUoZGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIHN0eWxlIG9mIHRoZSBlZGl0b3IgY29udGFpbmVyIGRpdlxuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdzZXRFZGl0b3JTdHlsZScsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVkaXRvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke3RoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyfScpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3JEaXYuc3R5bGUgPSBkYXRhLnN0eWxlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudFZhbHVlID0gZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyXG4gICAgICAgICAgICAgICAgICAgIH0nKSwgT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFuZ3VhZ2U6IGRhdGEubGFuZ3VhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogZGF0YS50aGVtZSxcbiAgICAgICAgICAgICAgICAgICAgfSwgJHtKU09OLnN0cmluZ2lmeSh0aGlzLmVkaXRvck9wdGlvbnMpfSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBvcHRpb25zIG9mIHRoZSBlZGl0b3IgZnJvbSB3aGF0IHdhcyBzZW50IGZyb20gdGhlIG1haW52aWV3XG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ3NldEVkaXRvck9wdGlvbnMnLCBmdW5jdGlvbihldmVudCwgZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci51cGRhdGVPcHRpb25zKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwiZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWRcIiwgJycpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBsYW5ndWFnZSBvZiB0aGUgZWRpdG9yIGZyb20gd2hhdCB3YXMgc2VudCBmcm9tIHRoZSBtYWludmlld1xuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdzZXRMYW5ndWFnZScsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IgPSBtb25hY28uZWRpdG9yLmNyZWF0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHtcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lclxuICAgICAgICAgICAgICAgICAgICB9JyksIE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGN1cnJlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhbmd1YWdlOiBkYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgICAgICAgICB9LCAke0pTT04uc3RyaW5naWZ5KHRoaXMuZWRpdG9yT3B0aW9ucyl9KSk7XG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJlZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZFwiLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJlZGl0b3JMYW5ndWFnZUNoYW5nZWRcIiwgJycpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gcmVnaXN0ZXIgYSBuZXcgbGFuZ3VhZ2Ugd2l0aCBlZGl0b3JcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbigncmVnaXN0ZXJMYW5ndWFnZScsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IuZGlzcG9zZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5jb21wbGV0aW9uSXRlbVByb3ZpZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvdmlkZXIgPSBkYXRhLmNvbXBsZXRpb25JdGVtUHJvdmlkZXJbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlci5raW5kID0gZXZhbChwcm92aWRlci5raW5kKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubW9uYXJjaFRva2Vuc1Byb3ZpZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbW9uYXJjaFRva2VucyA9IGRhdGEubW9uYXJjaFRva2Vuc1Byb3ZpZGVyW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9uYXJjaFRva2Vuc1swXSA9IGV2YWwobW9uYXJjaFRva2Vuc1swXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5yZWdpc3Rlcih7IGlkOiBkYXRhLmlkIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIG1vbmFjby5sYW5ndWFnZXMuc2V0TW9uYXJjaFRva2Vuc1Byb3ZpZGVyKGRhdGEuaWQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuaXplcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3Q6IGRhdGEubW9uYXJjaFRva2Vuc1Byb3ZpZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIERlZmluZSBhIG5ldyB0aGVtZSB0aGF0IGNvbnN0YWlucyBvbmx5IHJ1bGVzIHRoYXQgbWF0Y2ggdGhpcyBsYW5ndWFnZVxuICAgICAgICAgICAgICAgICAgICBtb25hY28uZWRpdG9yLmRlZmluZVRoZW1lKGRhdGEuY3VzdG9tVGhlbWUuaWQsIGRhdGEuY3VzdG9tVGhlbWUudGhlbWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGVtZSA9IGRhdGEuY3VzdG9tVGhlbWUuaWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5yZWdpc3RlckNvbXBsZXRpb25JdGVtUHJvdmlkZXIoZGF0YS5pZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZUNvbXBsZXRpb25JdGVtczogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLmNvbXBsZXRpb25JdGVtUHJvdmlkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGNzcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgY3NzLnR5cGUgPSBcInRleHQvY3NzXCI7XG4gICAgICAgICAgICAgICAgICAgIGNzcy5pbm5lckhUTUwgPSBkYXRhLm1vbmFyY2hUb2tlbnNQcm92aWRlckNTUztcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjc3MpO1xuICAgICAgICAgICAgICAgICAgICByZWdpc3RlcmVkTGFuZ3VhZ2VzU3R5bGVzID0gWy4uLnJlZ2lzdGVyZWRMYW5ndWFnZXNTdHlsZXMsIGNzc107XG5cblxuICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwiZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWRcIiwgJycpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gSW5zdHJ1Y3QgdGhlIGVkaXRvciB0byByZW1lYXN1cmUgaXRzIGNvbnRhaW5lclxuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdsYXlvdXQnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IubGF5b3V0KCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJbnN0cnVjdCB0aGUgZWRpdG9yIGdvIHRvIGZ1bGwgc2NyZWVuIG1vZGVcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignc2hvd0Z1bGxTY3JlZW5FZGl0b3InLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBlZGl0b3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn0nKTtcbiAgICAgICAgICAgICAgICAgIGVkaXRvckRpdi53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gSW5zdHJ1Y3QgdGhlIGVkaXRvciBleGl0IGZ1bGwgc2NyZWVuIG1vZGVcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignZXhpdEZ1bGxTY3JlZW5FZGl0b3InLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBlZGl0b3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn0nKTtcbiAgICAgICAgICAgICAgICAgIGVkaXRvckRpdi53ZWJraXRFeGl0RnVsbHNjcmVlbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ2Rpc3Bvc2UnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICAgIHJlZ2lzdGVyZWRMYW5ndWFnZXNTdHlsZXMuZm9yRWFjaCgoc3R5bGUpID0+IHN0eWxlLnJlbW92ZSgpKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIG5lZWQgdG8gbWFudWFsbHkgcmVzaXplIHRoZSBlZGl0b3IgYW55IHRpbWUgdGhlIHdpbmRvdyBzaXplXG4gICAgICAgICAgICAgICAgLy8gY2hhbmdlcy4gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L21vbmFjby1lZGl0b3IvaXNzdWVzLzI4XG4gICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZnVuY3Rpb24gcmVzaXplRWRpdG9yKCkge1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IubGF5b3V0KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgICAgIDwvaHRtbD5gO1xuXG4gICAgICAvLyBkeW5hbWljYWxseSBjcmVhdGUgdGhlIEVsZWN0cm9uIFdlYnZpZXcgRWxlbWVudFxuICAgICAgLy8gdGhpcyB3aWxsIHNhbmRib3ggdGhlIG1vbmFjbyBjb2RlIGludG8gaXRzIG93biBET00gYW5kIGl0cyBvd25cbiAgICAgIC8vIGphdmFzY3JpcHQgaW5zdGFuY2UuIE5lZWQgdG8gZG8gdGhpcyB0byBhdm9pZCBwcm9ibGVtcyB3aXRoIG1vbmFjb1xuICAgICAgLy8gdXNpbmcgQU1EIFJlcXVpcmVzIGFuZCBFbGVjdHJvbiB1c2luZyBOb2RlIFJlcXVpcmVzXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9tb25hY28tZWRpdG9yL2lzc3Vlcy85MFxuICAgICAgdGhpcy5fd2VidmlldyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3dlYnZpZXcnKTtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2V0QXR0cmlidXRlKCdub2RlaW50ZWdyYXRpb24nLCAndHJ1ZScpO1xuICAgICAgdGhpcy5fd2Vidmlldy5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGV3ZWJzZWN1cml0eScsICd0cnVlJyk7XG4gICAgICAvLyB0YWtlIHRoZSBodG1sIGNvbnRlbnQgZm9yIHRoZSB3ZWJ2aWV3IGFuZCBiYXNlNjQgZW5jb2RlIGl0IGFuZCB1c2UgYXMgdGhlIHNyYyB0YWdcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2V0QXR0cmlidXRlKCdzcmMnLCAnZGF0YTp0ZXh0L2h0bWw7YmFzZTY0LCcgKyB3aW5kb3cuYnRvYShlZGl0b3JIVE1MKSk7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnZGlzcGxheTppbmxpbmUtZmxleDsgd2lkdGg6MTAwJTsgaGVpZ2h0OjEwMCUnKTtcbiAgICAgIC8vIHRvIGRlYnVnOlxuICAgICAgLy8gIHRoaXMuX3dlYnZpZXcuYWRkRXZlbnRMaXN0ZW5lcignZG9tLXJlYWR5JywgKCkgPT4ge1xuICAgICAgLy8gICAgIHRoaXMuX3dlYnZpZXcub3BlbkRldlRvb2xzKCk7XG4gICAgICAvLyAgfSk7XG5cbiAgICAgIC8vIFByb2Nlc3MgdGhlIGRhdGEgZnJvbSB0aGUgd2Vidmlld1xuICAgICAgdGhpcy5fd2Vidmlldy5hZGRFdmVudExpc3RlbmVyKCdpcGMtbWVzc2FnZScsIChldmVudDogYW55KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5jaGFubmVsID09PSAnZWRpdG9yQ29udGVudCcpIHtcbiAgICAgICAgICB0aGlzLl9mcm9tRWRpdG9yID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLndyaXRlVmFsdWUoZXZlbnQuYXJnc1swXSk7XG4gICAgICAgICAgdGhpcy5fc3ViamVjdC5uZXh0KHRoaXMuX3ZhbHVlKTtcbiAgICAgICAgICB0aGlzLl9zdWJqZWN0LmNvbXBsZXRlKCk7XG4gICAgICAgICAgdGhpcy5fc3ViamVjdCA9IG5ldyBTdWJqZWN0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY2hhbm5lbCA9PT0gJ29uRWRpdG9yQ29udGVudENoYW5nZScpIHtcbiAgICAgICAgICB0aGlzLl9mcm9tRWRpdG9yID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLndyaXRlVmFsdWUoZXZlbnQuYXJnc1swXSk7XG4gICAgICAgICAgaWYgKHRoaXMuaW5pdGlhbENvbnRlbnRDaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbENvbnRlbnRDaGFuZ2UgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubGF5b3V0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmNoYW5uZWwgPT09ICdlZGl0b3JJbml0aWFsaXplZCcpIHtcbiAgICAgICAgICB0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgdGhpcy5fZWRpdG9yUHJveHkgPSB0aGlzLndyYXBFZGl0b3JDYWxscyh0aGlzLl9lZGl0b3IpO1xuICAgICAgICAgIHRoaXMuZWRpdG9ySW5pdGlhbGl6ZWQuZW1pdCh0aGlzLl9lZGl0b3JQcm94eSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY2hhbm5lbCA9PT0gJ2VkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkJykge1xuICAgICAgICAgIHRoaXMuZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmNoYW5uZWwgPT09ICdlZGl0b3JMYW5ndWFnZUNoYW5nZWQnKSB7XG4gICAgICAgICAgdGhpcy5lZGl0b3JMYW5ndWFnZUNoYW5nZWQuZW1pdCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gYXBwZW5kIHRoZSB3ZWJ2aWV3IHRvIHRoZSBET01cbiAgICAgIHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX3dlYnZpZXcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBuZ0FmdGVyVmlld0luaXQgb25seSB1c2VkIGZvciBicm93c2VyIHZlcnNpb24gb2YgZWRpdG9yXG4gICAqIFRoaXMgaXMgd2hlcmUgdGhlIEFNRCBMb2FkZXIgc2NyaXB0cyBhcmUgYWRkZWQgdG8gdGhlIGJyb3dzZXIgYW5kIHRoZSBlZGl0b3Igc2NyaXB0cyBhcmUgXCJyZXF1aXJlZFwiXG4gICAqL1xuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9pc0VsZWN0cm9uQXBwKSB7XG4gICAgICBsb2FkTW9uYWNvKCk7XG4gICAgICB3YWl0VW50aWxNb25hY29SZWFkeSgpXG4gICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95KSlcbiAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5pbml0TW9uYWNvKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtZXJnZShcbiAgICAgIGZyb21FdmVudCh3aW5kb3csICdyZXNpemUnKS5waXBlKGRlYm91bmNlVGltZSgxMDApKSxcbiAgICAgIHRoaXMuX3dpZHRoU3ViamVjdC5hc09ic2VydmFibGUoKS5waXBlKGRpc3RpbmN0VW50aWxDaGFuZ2VkKCkpLFxuICAgICAgdGhpcy5faGVpZ2h0U3ViamVjdC5hc09ic2VydmFibGUoKS5waXBlKGRpc3RpbmN0VW50aWxDaGFuZ2VkKCkpLFxuICAgIClcbiAgICAgIC5waXBlKFxuICAgICAgICB0YWtlVW50aWwodGhpcy5fZGVzdHJveSksXG4gICAgICAgIGRlYm91bmNlVGltZSgxMDApLFxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMubGF5b3V0KCk7XG4gICAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgfSk7XG4gICAgdGltZXIoNTAwLCAyNTApXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveSkpXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2VsZW1lbnRSZWYgJiYgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSB7XG4gICAgICAgICAgdGhpcy5fd2lkdGhTdWJqZWN0Lm5leHQoKDxIVE1MRWxlbWVudD50aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoKTtcbiAgICAgICAgICB0aGlzLl9oZWlnaHRTdWJqZWN0Lm5leHQoKDxIVE1MRWxlbWVudD50aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYuZGV0YWNoKCk7XG4gICAgdGhpcy5fcmVnaXN0ZXJlZExhbmd1YWdlc1N0eWxlcy5mb3JFYWNoKChzdHlsZTogSFRNTFN0eWxlRWxlbWVudCkgPT4gc3R5bGUucmVtb3ZlKCkpO1xuICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2Rpc3Bvc2UnKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgdGhpcy5fZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgdGhpcy5fZGVzdHJveS5uZXh0KHRydWUpO1xuICAgIHRoaXMuX2Rlc3Ryb3kudW5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBzaG93RnVsbFNjcmVlbkVkaXRvciByZXF1ZXN0IGZvciBmdWxsIHNjcmVlbiBvZiBDb2RlIEVkaXRvciBiYXNlZCBvbiBpdHMgYnJvd3NlciB0eXBlLlxuICAgKi9cbiAgcHVibGljIHNob3dGdWxsU2NyZWVuRWRpdG9yKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdzaG93RnVsbFNjcmVlbkVkaXRvcicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgY29kZUVkaXRvckVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50ID0gdGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQgYXMgSFRNTERpdkVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGZ1bGxTY3JlZW5NYXA6IG9iamVjdCA9IHtcbiAgICAgICAgICAvLyBDaHJvbWVcbiAgICAgICAgICByZXF1ZXN0RnVsbHNjcmVlbjogKCkgPT4gY29kZUVkaXRvckVsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgICAvLyBTYWZhcmlcbiAgICAgICAgICB3ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbjogKCkgPT4gKDxhbnk+Y29kZUVkaXRvckVsZW1lbnQpLndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKCksXG4gICAgICAgICAgLy8gSUVcbiAgICAgICAgICBtc1JlcXVlc3RGdWxsc2NyZWVuOiAoKSA9PiAoPGFueT5jb2RlRWRpdG9yRWxlbWVudCkubXNSZXF1ZXN0RnVsbHNjcmVlbigpLFxuICAgICAgICAgIC8vIEZpcmVmb3hcbiAgICAgICAgICBtb3pSZXF1ZXN0RnVsbFNjcmVlbjogKCkgPT4gKDxhbnk+Y29kZUVkaXRvckVsZW1lbnQpLm1velJlcXVlc3RGdWxsU2NyZWVuKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgZm9yIChjb25zdCBoYW5kbGVyIG9mIE9iamVjdC5rZXlzKGZ1bGxTY3JlZW5NYXApKSB7XG4gICAgICAgICAgaWYgKGNvZGVFZGl0b3JFbGVtZW50W2hhbmRsZXJdKSB7XG4gICAgICAgICAgICBmdWxsU2NyZWVuTWFwW2hhbmRsZXJdKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2lzRnVsbFNjcmVlbiA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogZXhpdEZ1bGxTY3JlZW5FZGl0b3IgcmVxdWVzdCB0byBleGl0IGZ1bGwgc2NyZWVuIG9mIENvZGUgRWRpdG9yIGJhc2VkIG9uIGl0cyBicm93c2VyIHR5cGUuXG4gICAqL1xuICBwdWJsaWMgZXhpdEZ1bGxTY3JlZW5FZGl0b3IoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2V4aXRGdWxsU2NyZWVuRWRpdG9yJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBleGl0RnVsbFNjcmVlbk1hcDogb2JqZWN0ID0ge1xuICAgICAgICAgIC8vIENocm9tZVxuICAgICAgICAgIGV4aXRGdWxsc2NyZWVuOiAoKSA9PiBkb2N1bWVudC5leGl0RnVsbHNjcmVlbigpLFxuICAgICAgICAgIC8vIFNhZmFyaVxuICAgICAgICAgIHdlYmtpdEV4aXRGdWxsc2NyZWVuOiAoKSA9PiAoPGFueT5kb2N1bWVudCkud2Via2l0RXhpdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgICAvLyBGaXJlZm94XG4gICAgICAgICAgbW96Q2FuY2VsRnVsbFNjcmVlbjogKCkgPT4gKDxhbnk+ZG9jdW1lbnQpLm1vekNhbmNlbEZ1bGxTY3JlZW4oKSxcbiAgICAgICAgICAvLyBJRVxuICAgICAgICAgIG1zRXhpdEZ1bGxzY3JlZW46ICgpID0+ICg8YW55PmRvY3VtZW50KS5tc0V4aXRGdWxsc2NyZWVuKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgZm9yIChjb25zdCBoYW5kbGVyIG9mIE9iamVjdC5rZXlzKGV4aXRGdWxsU2NyZWVuTWFwKSkge1xuICAgICAgICAgIGlmIChkb2N1bWVudFtoYW5kbGVyXSkge1xuICAgICAgICAgICAgZXhpdEZ1bGxTY3JlZW5NYXBbaGFuZGxlcl0oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5faXNGdWxsU2NyZWVuID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogYWRkRnVsbFNjcmVlbk1vZGVDb21tYW5kIHVzZWQgdG8gYWRkIHRoZSBmdWxsc2NyZWVuIG9wdGlvbiB0byB0aGUgY29udGV4dCBtZW51XG4gICAqL1xuICBwcml2YXRlIGFkZEZ1bGxTY3JlZW5Nb2RlQ29tbWFuZCgpOiB2b2lkIHtcbiAgICB0aGlzLl9lZGl0b3IuYWRkQWN0aW9uKHtcbiAgICAgIC8vIEFuIHVuaXF1ZSBpZGVudGlmaWVyIG9mIHRoZSBjb250cmlidXRlZCBhY3Rpb24uXG4gICAgICBpZDogJ2Z1bGxTY3JlZW4nLFxuICAgICAgLy8gQSBsYWJlbCBvZiB0aGUgYWN0aW9uIHRoYXQgd2lsbCBiZSBwcmVzZW50ZWQgdG8gdGhlIHVzZXIuXG4gICAgICBsYWJlbDogJ0Z1bGwgU2NyZWVuJyxcbiAgICAgIC8vIEFuIG9wdGlvbmFsIGFycmF5IG9mIGtleWJpbmRpbmdzIGZvciB0aGUgYWN0aW9uLlxuICAgICAgY29udGV4dE1lbnVHcm91cElkOiAnbmF2aWdhdGlvbicsXG4gICAgICBrZXliaW5kaW5nczogdGhpcy5fa2V5Y29kZSxcbiAgICAgIGNvbnRleHRNZW51T3JkZXI6IDEuNSxcbiAgICAgIC8vIE1ldGhvZCB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgd2hlbiB0aGUgYWN0aW9uIGlzIHRyaWdnZXJlZC5cbiAgICAgIC8vIEBwYXJhbSBlZGl0b3IgVGhlIGVkaXRvciBpbnN0YW5jZSBpcyBwYXNzZWQgaW4gYXMgYSBjb252aW5pZW5jZVxuICAgICAgcnVuOiAoZWQ6IGFueSkgPT4ge1xuICAgICAgICB0aGlzLnNob3dGdWxsU2NyZWVuRWRpdG9yKCk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIHdyYXBFZGl0b3JDYWxscyB1c2VkIHRvIHByb3h5IGFsbCB0aGUgY2FsbHMgdG8gdGhlIG1vbmFjbyBlZGl0b3JcbiAgICogRm9yIGNhbGxzIGZvciBFbGVjdHJvbiB1c2UgdGhpcyB0byBjYWxsIHRoZSBlZGl0b3IgaW5zaWRlIHRoZSB3ZWJ2aWV3XG4gICAqL1xuICBwcml2YXRlIHdyYXBFZGl0b3JDYWxscyhvYmo6IGFueSk6IGFueSB7XG4gICAgY29uc3QgdGhhdDogYW55ID0gdGhpcztcbiAgICBjb25zdCBoYW5kbGVyOiBhbnkgPSB7XG4gICAgICBnZXQodGFyZ2V0OiBhbnksIHByb3BLZXk6IGFueSwgcmVjZWl2ZXI6IGFueSk6IGFueSB7XG4gICAgICAgIHJldHVybiBhc3luYyAoLi4uYXJnczogYW55KTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgICAgICAgICBpZiAodGhhdC5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIGlmICh0aGF0Ll93ZWJ2aWV3KSB7XG4gICAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGVKYXZhU2NyaXB0OiAoY29kZTogc3RyaW5nKSA9PiBQcm9taXNlPGFueT4gPSAoY29kZTogc3RyaW5nKSA9PlxuICAgICAgICAgICAgICAgIG5ldyBQcm9taXNlKChyZXNvbHZlOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgIHRoYXQuX3dlYnZpZXcuZXhlY3V0ZUphdmFTY3JpcHQoY29kZSwgcmVzb2x2ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJldHVybiBleGVjdXRlSmF2YVNjcmlwdCgnZWRpdG9yLicgKyBwcm9wS2V5ICsgJygnICsgYXJncyArICcpJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zdCBvcmlnTWV0aG9kOiBhbnkgPSB0YXJnZXRbcHJvcEtleV07XG4gICAgICAgICAgICAgIGNvbnN0IHJlc3VsdDogYW55ID0gYXdhaXQgb3JpZ01ldGhvZC5hcHBseSh0aGF0Ll9lZGl0b3IsIGFyZ3MpO1xuICAgICAgICAgICAgICAvLyBzaW5jZSBydW5uaW5nIGphdmFzY3JpcHQgY29kZSBtYW51YWxseSBuZWVkIHRvIGZvcmNlIEFuZ3VsYXIgdG8gZGV0ZWN0IGNoYW5nZXNcbiAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhhdC56b25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmVcbiAgICAgICAgICAgICAgICAgIGlmICghdGhhdC5fY2hhbmdlRGV0ZWN0b3JSZWZbJ2Rlc3Ryb3llZCddKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuX2NoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICB9O1xuICAgIHJldHVybiBuZXcgUHJveHkob2JqLCBoYW5kbGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBpbml0TW9uYWNvIG1ldGhvZCBjcmVhdGVzIHRoZSBtb25hY28gZWRpdG9yIGludG8gdGhlIEBWaWV3Q2hpbGQoJ2VkaXRvckNvbnRhaW5lcicpXG4gICAqIGFuZCBlbWl0IHRoZSBlZGl0b3JJbml0aWFsaXplZCBldmVudC4gIFRoaXMgaXMgb25seSB1c2VkIGluIHRoZSBicm93c2VyIHZlcnNpb24uXG4gICAqL1xuICBwcml2YXRlIGluaXRNb25hY28oKTogdm9pZCB7XG4gICAgY29uc3QgY29udGFpbmVyRGl2OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50O1xuICAgIGNvbnRhaW5lckRpdi5pZCA9IHRoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyO1xuICAgIHRoaXMuX2VkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKFxuICAgICAgY29udGFpbmVyRGl2LFxuICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAge1xuICAgICAgICAgIHZhbHVlOiB0aGlzLl92YWx1ZSxcbiAgICAgICAgICBsYW5ndWFnZTogdGhpcy5sYW5ndWFnZSxcbiAgICAgICAgICB0aGVtZTogdGhpcy5fdGhlbWUsXG4gICAgICAgIH0sXG4gICAgICAgIHRoaXMuZWRpdG9yT3B0aW9ucyxcbiAgICAgICksXG4gICAgKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX2VkaXRvclByb3h5ID0gdGhpcy53cmFwRWRpdG9yQ2FsbHModGhpcy5fZWRpdG9yKTtcbiAgICAgIHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuZWRpdG9ySW5pdGlhbGl6ZWQuZW1pdCh0aGlzLl9lZGl0b3JQcm94eSk7XG4gICAgfSk7XG4gICAgdGhpcy5fZWRpdG9yLmdldE1vZGVsKCkub25EaWRDaGFuZ2VDb250ZW50KChlOiBhbnkpID0+IHtcbiAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSB0cnVlO1xuICAgICAgdGhpcy53cml0ZVZhbHVlKHRoaXMuX2VkaXRvci5nZXRWYWx1ZSgpKTtcbiAgICAgIGlmICh0aGlzLmluaXRpYWxDb250ZW50Q2hhbmdlKSB7XG4gICAgICAgIHRoaXMuaW5pdGlhbENvbnRlbnRDaGFuZ2UgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sYXlvdXQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLmFkZEZ1bGxTY3JlZW5Nb2RlQ29tbWFuZCgpO1xuICB9XG59XG4iXX0=