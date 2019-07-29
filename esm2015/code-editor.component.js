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
                    this.onEditorValueChange.emit(undefined);
                    this.propagateChange(this._value);
                    this.onChange.emit(undefined);
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
                    this.onEditorValueChange.emit(undefined);
                    this.propagateChange(this._value);
                    this.onChange.emit(undefined);
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
                    this.onEditorValueChange.emit(undefined);
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
                let currentValue = this._editor.getValue();
                this._editor.dispose();
                /** @type {?} */
                let myDiv = this._editorContainer.nativeElement;
                this._editor = monaco.editor.create(myDiv, Object.assign({
                    value: currentValue,
                    language: language,
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
                    provideCompletionItems: (/**
                     * @return {?}
                     */
                    () => {
                        return language.completionItemProvider;
                    }),
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
                this._webview.send('setEditorOptions', { theme: theme });
            }
            else if (this._editor) {
                this._editor.updateOptions({ theme: theme });
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
     * and emit the onEditorInitialized event.  This is only used in the browser version.
     * @private
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
        setTimeout((/**
         * @return {?}
         */
        () => {
            this._editorProxy = this.wrapEditorCalls(this._editor);
            this._componentInitialized = true;
            this.onEditorInitialized.emit(this._editorProxy);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS1lZGl0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGNvdmFsZW50L2NvZGUtZWRpdG9yLyIsInNvdXJjZXMiOlsiY29kZS1lZGl0b3IuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFlBQVksRUFHWixTQUFTLEVBQ1QsVUFBVSxFQUNWLFVBQVUsRUFDVixNQUFNLEVBQ04saUJBQWlCLEdBRWxCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxpQkFBaUIsRUFBd0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6RSxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvQyxPQUFPLEVBQUUsWUFBWSxFQUFFLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRS9FLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxVQUFVLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7TUFFakUsSUFBSTs7O0FBQVEsR0FBRyxFQUFFO0lBQ3JCLGVBQWU7QUFDakIsQ0FBQyxDQUFBOzs7O0lBR0csYUFBYSxHQUFXLENBQUM7QUFpQjdCLE1BQU0sT0FBTyxxQkFBcUI7Ozs7Ozs7SUEyRWhDLFlBQW9CLElBQVksRUFBVSxrQkFBcUMsRUFBVSxXQUF1QjtRQUE1RixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVUsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFZO1FBMUV4RyxhQUFRLEdBQXFCLElBQUksT0FBTyxFQUFXLENBQUM7UUFDcEQsa0JBQWEsR0FBb0IsSUFBSSxPQUFPLEVBQVUsQ0FBQztRQUN2RCxtQkFBYyxHQUFvQixJQUFJLE9BQU8sRUFBVSxDQUFDO1FBRXhE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Qy9DLDRDQUFxQzs7Ozs7SUFDckMsK0NBQWlDOzs7OztJQUNqQyw4Q0FBdUM7Ozs7O0lBQ3ZDLHlDQUFzQjs7Ozs7SUFDdEIsaURBQThCOzs7OztJQUM5QixxREFBNkM7O0lBRTdDLGlEQUE2RTs7Ozs7O0lBa0I3RSxvREFBZ0c7Ozs7OztJQU1oRyw2REFBa0g7Ozs7OztJQU1sSCx3REFBd0c7Ozs7OztJQU14RyxvREFBZ0c7Ozs7OztJQU1oRyx5Q0FBMEU7O0lBRTFFLGdEQUFpQzs7SUFDakMsMENBQXVCOzs7OztJQUtYLHFDQUFvQjs7Ozs7SUFBRSxtREFBNkM7Ozs7O0lBQUUsNENBQStCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9uZW50LFxuICBJbnB1dCxcbiAgT3V0cHV0LFxuICBFdmVudEVtaXR0ZXIsXG4gIE9uSW5pdCxcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgVmlld0NoaWxkLFxuICBFbGVtZW50UmVmLFxuICBmb3J3YXJkUmVmLFxuICBOZ1pvbmUsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBPbkRlc3Ryb3ksXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTkdfVkFMVUVfQUNDRVNTT1IsIENvbnRyb2xWYWx1ZUFjY2Vzc29yIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZnJvbUV2ZW50LCBtZXJnZSwgdGltZXIgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGRlYm91bmNlVGltZSwgZGlzdGluY3RVbnRpbENoYW5nZWQsIHRha2VVbnRpbCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgd2FpdFVudGlsTW9uYWNvUmVhZHksIGxvYWRNb25hY28gfSBmcm9tICcuL2NvZGUtZWRpdG9yLnV0aWxzJztcblxuY29uc3Qgbm9vcDogYW55ID0gKCkgPT4ge1xuICAvLyBlbXB0eSBtZXRob2Rcbn07XG5cbi8vIGNvdW50ZXIgZm9yIGlkcyB0byBhbGxvdyBmb3IgbXVsdGlwbGUgZWRpdG9ycyBvbiBvbmUgcGFnZVxubGV0IHVuaXF1ZUNvdW50ZXI6IG51bWJlciA9IDA7XG4vLyBkZWNsYXJlIGFsbCB0aGUgYnVpbHQgaW4gZWxlY3Ryb24gb2JqZWN0c1xuZGVjbGFyZSBjb25zdCBlbGVjdHJvbjogYW55O1xuZGVjbGFyZSBjb25zdCBtb25hY286IGFueTtcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAndGQtY29kZS1lZGl0b3InLFxuICB0ZW1wbGF0ZVVybDogJy4vY29kZS1lZGl0b3IuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9jb2RlLWVkaXRvci5jb21wb25lbnQuc2NzcyddLFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IFRkQ29kZUVkaXRvckNvbXBvbmVudCksXG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICB9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBUZENvZGVFZGl0b3JDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyVmlld0luaXQsIENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9kZXN0cm95OiBTdWJqZWN0PGJvb2xlYW4+ID0gbmV3IFN1YmplY3Q8Ym9vbGVhbj4oKTtcbiAgcHJpdmF0ZSBfd2lkdGhTdWJqZWN0OiBTdWJqZWN0PG51bWJlcj4gPSBuZXcgU3ViamVjdDxudW1iZXI+KCk7XG4gIHByaXZhdGUgX2hlaWdodFN1YmplY3Q6IFN1YmplY3Q8bnVtYmVyPiA9IG5ldyBTdWJqZWN0PG51bWJlcj4oKTtcblxuICBwcml2YXRlIF9lZGl0b3JTdHlsZTogc3RyaW5nID0gJ3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7Ym9yZGVyOjFweCBzb2xpZCBncmV5Oyc7XG4gIHByaXZhdGUgX2FwcFBhdGg6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlIF9pc0VsZWN0cm9uQXBwOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX3dlYnZpZXc6IGFueTtcbiAgcHJpdmF0ZSBfdmFsdWU6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlIF90aGVtZTogc3RyaW5nID0gJ3ZzJztcbiAgcHJpdmF0ZSBfbGFuZ3VhZ2U6IHN0cmluZyA9ICdqYXZhc2NyaXB0JztcbiAgcHJpdmF0ZSBfc3ViamVjdDogU3ViamVjdDxzdHJpbmc+ID0gbmV3IFN1YmplY3QoKTtcbiAgcHJpdmF0ZSBfZWRpdG9ySW5uZXJDb250YWluZXI6IHN0cmluZyA9ICdlZGl0b3JJbm5lckNvbnRhaW5lcicgKyB1bmlxdWVDb3VudGVyKys7XG4gIHByaXZhdGUgX2VkaXRvck5vZGVNb2R1bGVEaXJPdmVycmlkZTogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgX2VkaXRvcjogYW55O1xuICBwcml2YXRlIF9lZGl0b3JQcm94eTogYW55O1xuICBwcml2YXRlIF9jb21wb25lbnRJbml0aWFsaXplZDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9mcm9tRWRpdG9yOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX2VkaXRvck9wdGlvbnM6IGFueSA9IHt9O1xuICBwcml2YXRlIF9pc0Z1bGxTY3JlZW46IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfa2V5Y29kZTogYW55O1xuICBwcml2YXRlIF9zZXRWYWx1ZVRpbWVvdXQ6IGFueTtcbiAgcHJpdmF0ZSBpbml0aWFsQ29udGVudENoYW5nZTogYm9vbGVhbiA9IHRydWU7XG5cbiAgQFZpZXdDaGlsZCgnZWRpdG9yQ29udGFpbmVyJywgeyBzdGF0aWM6IHRydWUgfSkgX2VkaXRvckNvbnRhaW5lcjogRWxlbWVudFJlZjtcblxuICAvKipcbiAgICogYXV0b21hdGljTGF5b3V0PzogYm9vbGVhblxuICAgKiBAZGVwcmVjYXRlZCBpbiBmYXZvciBvZiBvdXIgb3duIHJlc2l6ZSBpbXBsZW1lbnRhdGlvbi5cbiAgICovXG4gIEBJbnB1dCgnYXV0b21hdGljTGF5b3V0JylcbiAgc2V0IGF1dG9tYXRpY0xheW91dChhdXRvbWF0aWNMYXlvdXQ6IGJvb2xlYW4pIHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmVcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICAnW2F1dG9tYXRpY0xheW91dF0gaGFzIGJlZW4gZGVwcmVjYXRlZCBpbiBmYXZvciBvZiBvdXIgb3duIHJlc2l6ZSBpbXBsZW1lbnRhdGlvbiBhbmQgd2lsbCBiZSByZW1vdmVkIG9uIDMuMC4wJyxcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIGVkaXRvckluaXRpYWxpemVkOiBmdW5jdGlvbigkZXZlbnQpXG4gICAqIEV2ZW50IGVtaXR0ZWQgd2hlbiBlZGl0b3IgaXMgZmlyc3QgaW5pdGlhbGl6ZWRcbiAgICovXG4gIEBPdXRwdXQoJ2VkaXRvckluaXRpYWxpemVkJykgb25FZGl0b3JJbml0aWFsaXplZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBlZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZDogZnVuY3Rpb24oJGV2ZW50KVxuICAgKiBFdmVudCBlbWl0dGVkIHdoZW4gZWRpdG9yJ3MgY29uZmlndXJhdGlvbiBjaGFuZ2VzXG4gICAqL1xuICBAT3V0cHV0KCdlZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZCcpIG9uRWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAvKipcbiAgICogZWRpdG9yTGFuZ3VhZ2VDaGFuZ2VkOiBmdW5jdGlvbigkZXZlbnQpXG4gICAqIEV2ZW50IGVtaXR0ZWQgd2hlbiBlZGl0b3IncyBMYW5ndWFnZSBjaGFuZ2VzXG4gICAqL1xuICBAT3V0cHV0KCdlZGl0b3JMYW5ndWFnZUNoYW5nZWQnKSBvbkVkaXRvckxhbmd1YWdlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBlZGl0b3JWYWx1ZUNoYW5nZTogZnVuY3Rpb24oJGV2ZW50KVxuICAgKiBFdmVudCBlbWl0dGVkIGFueSB0aW1lIHNvbWV0aGluZyBjaGFuZ2VzIHRoZSBlZGl0b3IgdmFsdWVcbiAgICovXG4gIEBPdXRwdXQoJ2VkaXRvclZhbHVlQ2hhbmdlJykgb25FZGl0b3JWYWx1ZUNoYW5nZTogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBUaGUgY2hhbmdlIGV2ZW50IG5vdGlmaWVzIHlvdSBhYm91dCBhIGNoYW5nZSBoYXBwZW5pbmcgaW4gYW4gaW5wdXQgZmllbGQuXG4gICAqIFNpbmNlIHRoZSBjb21wb25lbnQgaXMgbm90IGEgbmF0aXZlIEFuZ3VsYXIgY29tcG9uZW50IGhhdmUgdG8gc3BlY2lmaXkgdGhlIGV2ZW50IGVtaXR0ZXIgb3Vyc2VsZlxuICAgKi9cbiAgQE91dHB1dCgnY2hhbmdlJykgb25DaGFuZ2U6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAgLyogdHNsaW50OmRpc2FibGUtbmV4dC1saW5lICovXG4gIHByb3BhZ2F0ZUNoYW5nZSA9IChfOiBhbnkpID0+IHt9O1xuICBvblRvdWNoZWQgPSAoKSA9PiBub29wO1xuXG4gIC8qKlxuICAgKiBTZXQgaWYgdXNpbmcgRWxlY3Ryb24gbW9kZSB3aGVuIG9iamVjdCBpcyBjcmVhdGVkXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHpvbmU6IE5nWm9uZSwgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLCBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7XG4gICAgLy8gc2luY2UgYWNjZXNzaW5nIHRoZSB3aW5kb3cgb2JqZWN0IG5lZWQgdGhpcyBjaGVjayBzbyBzZXJ2ZXJzaWRlIHJlbmRlcmluZyBkb2Vzbid0IGZhaWxcbiAgICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAnb2JqZWN0JyAmJiAhIWRvY3VtZW50KSB7XG4gICAgICAvKiB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmUgKi9cbiAgICAgIHRoaXMuX2lzRWxlY3Ryb25BcHAgPSAoPGFueT53aW5kb3cpWydwcm9jZXNzJ10gPyB0cnVlIDogZmFsc2U7XG4gICAgICBpZiAodGhpcy5faXNFbGVjdHJvbkFwcCkge1xuICAgICAgICB0aGlzLl9hcHBQYXRoID0gZWxlY3Ryb24ucmVtb3RlLmFwcFxuICAgICAgICAgIC5nZXRBcHBQYXRoKClcbiAgICAgICAgICAuc3BsaXQoJ1xcXFwnKVxuICAgICAgICAgIC5qb2luKCcvJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHZhbHVlPzogc3RyaW5nXG4gICAqIFZhbHVlIGluIHRoZSBFZGl0b3IgYWZ0ZXIgYXN5bmMgZ2V0RWRpdG9yQ29udGVudCB3YXMgY2FsbGVkXG4gICAqL1xuICBASW5wdXQoJ3ZhbHVlJylcbiAgc2V0IHZhbHVlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAvLyBDbGVhciBhbnkgdGltZW91dCB0aGF0IG1pZ2h0IG92ZXJ3cml0ZSB0aGlzIHZhbHVlIHNldCBpbiB0aGUgZnV0dXJlXG4gICAgaWYgKHRoaXMuX3NldFZhbHVlVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3NldFZhbHVlVGltZW91dCk7XG4gICAgfVxuICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICBpZiAodGhpcy5fd2Vidmlldy5zZW5kICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBkb24ndCB3YW50IHRvIGtlZXAgc2VuZGluZyBjb250ZW50IGlmIGV2ZW50IGNhbWUgZnJvbSBJUEMsIGluZmluaXRlIGxvb3BcbiAgICAgICAgICBpZiAoIXRoaXMuX2Zyb21FZGl0b3IpIHtcbiAgICAgICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnc2V0RWRpdG9yQ29udGVudCcsIHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5vbkVkaXRvclZhbHVlQ2hhbmdlLmVtaXQodW5kZWZpbmVkKTtcbiAgICAgICAgICB0aGlzLnByb3BhZ2F0ZUNoYW5nZSh0aGlzLl92YWx1ZSk7XG4gICAgICAgICAgdGhpcy5vbkNoYW5nZS5lbWl0KHVuZGVmaW5lZCk7XG4gICAgICAgICAgdGhpcy5fZnJvbUVkaXRvciA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEVkaXRvciBpcyBub3QgbG9hZGVkIHlldCwgdHJ5IGFnYWluIGluIGhhbGYgYSBzZWNvbmRcbiAgICAgICAgICB0aGlzLl9zZXRWYWx1ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICB9LCA1MDApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5fZWRpdG9yICYmIHRoaXMuX2VkaXRvci5zZXRWYWx1ZSkge1xuICAgICAgICAgIC8vIGRvbid0IHdhbnQgdG8ga2VlcCBzZW5kaW5nIGNvbnRlbnQgaWYgZXZlbnQgY2FtZSBmcm9tIHRoZSBlZGl0b3IsIGluZmluaXRlIGxvb3BcbiAgICAgICAgICBpZiAoIXRoaXMuX2Zyb21FZGl0b3IpIHtcbiAgICAgICAgICAgIHRoaXMuX2VkaXRvci5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMub25FZGl0b3JWYWx1ZUNoYW5nZS5lbWl0KHVuZGVmaW5lZCk7XG4gICAgICAgICAgdGhpcy5wcm9wYWdhdGVDaGFuZ2UodGhpcy5fdmFsdWUpO1xuICAgICAgICAgIHRoaXMub25DaGFuZ2UuZW1pdCh1bmRlZmluZWQpO1xuICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLnpvbmUucnVuKCgpID0+ICh0aGlzLl92YWx1ZSA9IHZhbHVlKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gRWRpdG9yIGlzIG5vdCBsb2FkZWQgeWV0LCB0cnkgYWdhaW4gaW4gaGFsZiBhIHNlY29uZFxuICAgICAgICAgIHRoaXMuX3NldFZhbHVlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2V0VmFsdWVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgIH0sIDUwMCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IHZhbHVlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gICAqL1xuICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAvLyBkbyBub3Qgd3JpdGUgaWYgbnVsbCBvciB1bmRlZmluZWRcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmVcbiAgICBpZiAodmFsdWUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICB9XG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46IGFueSk6IHZvaWQge1xuICAgIHRoaXMucHJvcGFnYXRlQ2hhbmdlID0gZm47XG4gIH1cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46IGFueSk6IHZvaWQge1xuICAgIHRoaXMub25Ub3VjaGVkID0gZm47XG4gIH1cblxuICAvKipcbiAgICogZ2V0RWRpdG9yQ29udGVudD86IGZ1bmN0aW9uXG4gICAqIFJldHVybnMgdGhlIGNvbnRlbnQgd2l0aGluIHRoZSBlZGl0b3JcbiAgICovXG4gIGdldFZhbHVlKCk6IE9ic2VydmFibGU8c3RyaW5nPiB7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2dldEVkaXRvckNvbnRlbnQnKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgICB0aGlzLl92YWx1ZSA9IHRoaXMuX2VkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGlzLl9zdWJqZWN0Lm5leHQodGhpcy5fdmFsdWUpO1xuICAgICAgICAgIHRoaXMuX3N1YmplY3QuY29tcGxldGUoKTtcbiAgICAgICAgICB0aGlzLl9zdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgICAgICAgICB0aGlzLm9uRWRpdG9yVmFsdWVDaGFuZ2UuZW1pdCh1bmRlZmluZWQpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIGxhbmd1YWdlPzogc3RyaW5nXG4gICAqIGxhbmd1YWdlIHVzZWQgaW4gZWRpdG9yXG4gICAqL1xuICBASW5wdXQoJ2xhbmd1YWdlJylcbiAgc2V0IGxhbmd1YWdlKGxhbmd1YWdlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9sYW5ndWFnZSA9IGxhbmd1YWdlO1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdzZXRMYW5ndWFnZScsIGxhbmd1YWdlKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICAgIGxldCBjdXJyZW50VmFsdWU6IHN0cmluZyA9IHRoaXMuX2VkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICB0aGlzLl9lZGl0b3IuZGlzcG9zZSgpO1xuICAgICAgICBsZXQgbXlEaXY6IEhUTUxEaXZFbGVtZW50ID0gdGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMuX2VkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKFxuICAgICAgICAgIG15RGl2LFxuICAgICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgIGxhbmd1YWdlOiBsYW5ndWFnZSxcbiAgICAgICAgICAgICAgdGhlbWU6IHRoaXMuX3RoZW1lLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yT3B0aW9ucyxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLl9lZGl0b3IuZ2V0TW9kZWwoKS5vbkRpZENoYW5nZUNvbnRlbnQoKGU6IGFueSkgPT4ge1xuICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSB0cnVlO1xuICAgICAgICAgIHRoaXMud3JpdGVWYWx1ZSh0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm9uRWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCh1bmRlZmluZWQpO1xuICAgICAgICB0aGlzLm9uRWRpdG9yTGFuZ3VhZ2VDaGFuZ2VkLmVtaXQodW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0IGxhbmd1YWdlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2xhbmd1YWdlO1xuICB9XG5cbiAgLyoqXG4gICAqIHJlZ2lzdGVyTGFuZ3VhZ2U/OiBmdW5jdGlvblxuICAgKiBSZWdpc3RlcnMgYSBjdXN0b20gTGFuZ3VhZ2Ugd2l0aGluIHRoZSBlZGl0b3JcbiAgICovXG4gIHJlZ2lzdGVyTGFuZ3VhZ2UobGFuZ3VhZ2U6IGFueSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdyZWdpc3Rlckxhbmd1YWdlJywgbGFuZ3VhZ2UpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgbGV0IGN1cnJlbnRWYWx1ZTogc3RyaW5nID0gdGhpcy5fZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgIHRoaXMuX2VkaXRvci5kaXNwb3NlKCk7XG5cbiAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGxhbmd1YWdlLmNvbXBsZXRpb25JdGVtUHJvdmlkZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBsZXQgcHJvdmlkZXI6IGFueSA9IGxhbmd1YWdlLmNvbXBsZXRpb25JdGVtUHJvdmlkZXJbaV07XG4gICAgICAgICAgLyogdHNsaW50OmRpc2FibGUtbmV4dC1saW5lICovXG4gICAgICAgICAgcHJvdmlkZXIua2luZCA9IGV2YWwocHJvdmlkZXIua2luZCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGxhbmd1YWdlLm1vbmFyY2hUb2tlbnNQcm92aWRlci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGxldCBtb25hcmNoVG9rZW5zOiBhbnkgPSBsYW5ndWFnZS5tb25hcmNoVG9rZW5zUHJvdmlkZXJbaV07XG4gICAgICAgICAgLyogdHNsaW50OmRpc2FibGUtbmV4dC1saW5lICovXG4gICAgICAgICAgbW9uYXJjaFRva2Vuc1swXSA9IGV2YWwobW9uYXJjaFRva2Vuc1swXSk7XG4gICAgICAgIH1cbiAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5yZWdpc3Rlcih7IGlkOiBsYW5ndWFnZS5pZCB9KTtcblxuICAgICAgICBtb25hY28ubGFuZ3VhZ2VzLnNldE1vbmFyY2hUb2tlbnNQcm92aWRlcihsYW5ndWFnZS5pZCwge1xuICAgICAgICAgIHRva2VuaXplcjoge1xuICAgICAgICAgICAgcm9vdDogbGFuZ3VhZ2UubW9uYXJjaFRva2Vuc1Byb3ZpZGVyLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIERlZmluZSBhIG5ldyB0aGVtZSB0aGF0IGNvbnN0YWlucyBvbmx5IHJ1bGVzIHRoYXQgbWF0Y2ggdGhpcyBsYW5ndWFnZVxuICAgICAgICBtb25hY28uZWRpdG9yLmRlZmluZVRoZW1lKGxhbmd1YWdlLmN1c3RvbVRoZW1lLmlkLCBsYW5ndWFnZS5jdXN0b21UaGVtZS50aGVtZSk7XG4gICAgICAgIHRoaXMuX3RoZW1lID0gbGFuZ3VhZ2UuY3VzdG9tVGhlbWUuaWQ7XG5cbiAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5yZWdpc3RlckNvbXBsZXRpb25JdGVtUHJvdmlkZXIobGFuZ3VhZ2UuaWQsIHtcbiAgICAgICAgICBwcm92aWRlQ29tcGxldGlvbkl0ZW1zOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbGFuZ3VhZ2UuY29tcGxldGlvbkl0ZW1Qcm92aWRlcjtcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgY3NzOiBIVE1MU3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgY3NzLnR5cGUgPSAndGV4dC9jc3MnO1xuICAgICAgICBjc3MuaW5uZXJIVE1MID0gbGFuZ3VhZ2UubW9uYXJjaFRva2Vuc1Byb3ZpZGVyQ1NTO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNzcyk7XG4gICAgICAgIHRoaXMub25FZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZC5lbWl0KHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHN0eWxlPzogc3RyaW5nXG4gICAqIGNzcyBzdHlsZSBvZiB0aGUgZWRpdG9yIG9uIHRoZSBwYWdlXG4gICAqL1xuICBASW5wdXQoJ2VkaXRvclN0eWxlJylcbiAgc2V0IGVkaXRvclN0eWxlKGVkaXRvclN0eWxlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9lZGl0b3JTdHlsZSA9IGVkaXRvclN0eWxlO1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdzZXRFZGl0b3JTdHlsZScsIHsgbGFuZ3VhZ2U6IHRoaXMuX2xhbmd1YWdlLCB0aGVtZTogdGhpcy5fdGhlbWUsIHN0eWxlOiBlZGl0b3JTdHlsZSB9KTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICAgIGxldCBjb250YWluZXJEaXY6IEhUTUxEaXZFbGVtZW50ID0gdGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIGNvbnRhaW5lckRpdi5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgZWRpdG9yU3R5bGUpO1xuICAgICAgICBsZXQgY3VycmVudFZhbHVlOiBzdHJpbmcgPSB0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgdGhpcy5fZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICAgICAgbGV0IG15RGl2OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50O1xuICAgICAgICB0aGlzLl9lZGl0b3IgPSBtb25hY28uZWRpdG9yLmNyZWF0ZShcbiAgICAgICAgICBteURpdixcbiAgICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB2YWx1ZTogY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICBsYW5ndWFnZTogdGhpcy5fbGFuZ3VhZ2UsXG4gICAgICAgICAgICAgIHRoZW1lOiB0aGlzLl90aGVtZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0aGlzLmVkaXRvck9wdGlvbnMsXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fZWRpdG9yLmdldE1vZGVsKCkub25EaWRDaGFuZ2VDb250ZW50KChlOiBhbnkpID0+IHtcbiAgICAgICAgICB0aGlzLl9mcm9tRWRpdG9yID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLndyaXRlVmFsdWUodGhpcy5fZWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0IGVkaXRvclN0eWxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRvclN0eWxlO1xuICB9XG5cbiAgLyoqXG4gICAqIHRoZW1lPzogc3RyaW5nXG4gICAqIFRoZW1lIHRvIGJlIGFwcGxpZWQgdG8gZWRpdG9yXG4gICAqL1xuICBASW5wdXQoJ3RoZW1lJylcbiAgc2V0IHRoZW1lKHRoZW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLl90aGVtZSA9IHRoZW1lO1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdzZXRFZGl0b3JPcHRpb25zJywgeyB0aGVtZTogdGhlbWUgfSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgICB0aGlzLl9lZGl0b3IudXBkYXRlT3B0aW9ucyh7IHRoZW1lOiB0aGVtZSB9KTtcbiAgICAgICAgdGhpcy5vbkVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkLmVtaXQodW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0IHRoZW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3RoZW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIGZ1bGxTY3JlZW5LZXlCaW5kaW5nPzogbnVtYmVyXG4gICAqIFNlZSBoZXJlIGZvciBrZXkgYmluZGluZ3MgaHR0cHM6Ly9taWNyb3NvZnQuZ2l0aHViLmlvL21vbmFjby1lZGl0b3IvYXBpL2VudW1zL21vbmFjby5rZXljb2RlLmh0bWxcbiAgICogU2V0cyB0aGUgS2V5Q29kZSBmb3Igc2hvcnRjdXR0aW5nIHRvIEZ1bGxzY3JlZW4gbW9kZVxuICAgKi9cbiAgQElucHV0KCdmdWxsU2NyZWVuS2V5QmluZGluZycpXG4gIHNldCBmdWxsU2NyZWVuS2V5QmluZGluZyhrZXljb2RlOiBudW1iZXJbXSkge1xuICAgIHRoaXMuX2tleWNvZGUgPSBrZXljb2RlO1xuICB9XG4gIGdldCBmdWxsU2NyZWVuS2V5QmluZGluZygpOiBudW1iZXJbXSB7XG4gICAgcmV0dXJuIHRoaXMuX2tleWNvZGU7XG4gIH1cblxuICAvKipcbiAgICogZWRpdG9yT3B0aW9ucz86IE9iamVjdFxuICAgKiBPcHRpb25zIHVzZWQgb24gZWRpdG9yIGluc3RhbnRpYXRpb24uIEF2YWlsYWJsZSBvcHRpb25zIGxpc3RlZCBoZXJlOlxuICAgKiBodHRwczovL21pY3Jvc29mdC5naXRodWIuaW8vbW9uYWNvLWVkaXRvci9hcGkvaW50ZXJmYWNlcy9tb25hY28uZWRpdG9yLmllZGl0b3JvcHRpb25zLmh0bWxcbiAgICovXG4gIEBJbnB1dCgnZWRpdG9yT3B0aW9ucycpXG4gIHNldCBlZGl0b3JPcHRpb25zKGVkaXRvck9wdGlvbnM6IGFueSkge1xuICAgIHRoaXMuX2VkaXRvck9wdGlvbnMgPSBlZGl0b3JPcHRpb25zO1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdzZXRFZGl0b3JPcHRpb25zJywgZWRpdG9yT3B0aW9ucyk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgICB0aGlzLl9lZGl0b3IudXBkYXRlT3B0aW9ucyhlZGl0b3JPcHRpb25zKTtcbiAgICAgICAgdGhpcy5vbkVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkLmVtaXQodW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0IGVkaXRvck9wdGlvbnMoKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdG9yT3B0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBsYXlvdXQgbWV0aG9kIHRoYXQgY2FsbHMgbGF5b3V0IG1ldGhvZCBvZiBlZGl0b3IgYW5kIGluc3RydWN0cyB0aGUgZWRpdG9yIHRvIHJlbWVhc3VyZSBpdHMgY29udGFpbmVyXG4gICAqL1xuICBsYXlvdXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2xheW91dCcpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgdGhpcy5fZWRpdG9yLmxheW91dCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGlmIGluIEVsZWN0cm9uIG1vZGUgb3Igbm90XG4gICAqL1xuICBnZXQgaXNFbGVjdHJvbkFwcCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNFbGVjdHJvbkFwcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGlmIGluIEZ1bGwgU2NyZWVuIE1vZGUgb3Igbm90XG4gICAqL1xuICBnZXQgaXNGdWxsU2NyZWVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc0Z1bGxTY3JlZW47XG4gIH1cblxuICAvKipcbiAgICogc2V0RWRpdG9yTm9kZU1vZHVsZURpck92ZXJyaWRlIGZ1bmN0aW9uIHRoYXQgb3ZlcnJpZGVzIHdoZXJlIHRvIGxvb2tcbiAgICogZm9yIHRoZSBlZGl0b3Igbm9kZV9tb2R1bGUuIFVzZWQgaW4gdGVzdHMgZm9yIEVsZWN0cm9uIG9yIGFueXdoZXJlIHRoYXQgdGhlXG4gICAqIG5vZGVfbW9kdWxlcyBhcmUgbm90IGluIHRoZSBleHBlY3RlZCBsb2NhdGlvbi5cbiAgICovXG4gIHNldEVkaXRvck5vZGVNb2R1bGVEaXJPdmVycmlkZShkaXJPdmVycmlkZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZWRpdG9yTm9kZU1vZHVsZURpck92ZXJyaWRlID0gZGlyT3ZlcnJpZGU7XG4gICAgdGhpcy5fYXBwUGF0aCA9IGRpck92ZXJyaWRlO1xuICB9XG5cbiAgLyoqXG4gICAqIG5nT25Jbml0IG9ubHkgdXNlZCBmb3IgRWxlY3Ryb24gdmVyc2lvbiBvZiBlZGl0b3JcbiAgICogVGhpcyBpcyB3aGVyZSB0aGUgd2VidmlldyBpcyBjcmVhdGVkIHRvIHNhbmRib3ggYXdheSB0aGUgZWRpdG9yXG4gICAqL1xuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICBsZXQgZWRpdG9ySFRNTDogc3RyaW5nID0gJyc7XG4gICAgaWYgKHRoaXMuX2lzRWxlY3Ryb25BcHApIHtcbiAgICAgIGVkaXRvckhUTUwgPSBgPCFET0NUWVBFIGh0bWw+XG4gICAgICAgICAgICA8aHRtbCBzdHlsZT1cImhlaWdodDoxMDAlXCI+XG4gICAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICAgICAgICA8bWV0YSBodHRwLWVxdWl2PVwiWC1VQS1Db21wYXRpYmxlXCIgY29udGVudD1cIklFPWVkZ2VcIiAvPlxuICAgICAgICAgICAgICAgIDxtZXRhIGh0dHAtZXF1aXY9XCJDb250ZW50LVR5cGVcIiBjb250ZW50PVwidGV4dC9odG1sO2NoYXJzZXQ9dXRmLThcIiA+XG4gICAgICAgICAgICAgICAgPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGRhdGEtbmFtZT1cInZzL2VkaXRvci9lZGl0b3IubWFpblwiXG4gICAgICAgICAgICAgICAgICAgIGhyZWY9XCJmaWxlOi8vJHt0aGlzLl9lZGl0b3JOb2RlTW9kdWxlRGlyT3ZlcnJpZGV9L2Fzc2V0cy9tb25hY28vdnMvZWRpdG9yL2VkaXRvci5tYWluLmNzc1wiPlxuICAgICAgICAgICAgPC9oZWFkPlxuICAgICAgICAgICAgPGJvZHkgc3R5bGU9XCJoZWlnaHQ6MTAwJTt3aWR0aDogMTAwJTttYXJnaW46IDA7cGFkZGluZzogMDtvdmVyZmxvdzogaGlkZGVuO1wiPlxuICAgICAgICAgICAgPGRpdiBpZD1cIiR7dGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJ9XCIgc3R5bGU9XCJ3aWR0aDoxMDAlO2hlaWdodDoxMDAlOyR7dGhpcy5fZWRpdG9yU3R5bGV9XCI+PC9kaXY+XG4gICAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgaXBjUmVuZGVyZXIgb2YgZWxlY3Ryb24gZm9yIGNvbW11bmljYXRpb25cbiAgICAgICAgICAgICAgICBjb25zdCB7aXBjUmVuZGVyZXJ9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKTtcbiAgICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgICAgPHNjcmlwdCBzcmM9XCJmaWxlOi8vJHt0aGlzLl9lZGl0b3JOb2RlTW9kdWxlRGlyT3ZlcnJpZGV9L2Fzc2V0cy9tb25hY28vdnMvbG9hZGVyLmpzXCI+PC9zY3JpcHQ+XG4gICAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgICAgIHZhciBlZGl0b3I7XG4gICAgICAgICAgICAgICAgdmFyIHRoZW1lID0gJyR7dGhpcy5fdGhlbWV9JztcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSAnJHt0aGlzLl92YWx1ZX0nO1xuXG4gICAgICAgICAgICAgICAgcmVxdWlyZS5jb25maWcoe1xuICAgICAgICAgICAgICAgICAgICBiYXNlVXJsOiAnJHt0aGlzLl9hcHBQYXRofS9hc3NldHMvbW9uYWNvJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHNlbGYubW9kdWxlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHNlbGYucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIHJlcXVpcmUoWyd2cy9lZGl0b3IvZWRpdG9yLm1haW4nXSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyXG4gICAgICAgICAgICAgICAgICAgIH0nKSwgT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYW5ndWFnZTogJyR7dGhpcy5sYW5ndWFnZX0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICcke3RoaXMuX3RoZW1lfScsXG4gICAgICAgICAgICAgICAgICAgIH0sICR7SlNPTi5zdHJpbmdpZnkodGhpcy5lZGl0b3JPcHRpb25zKX0pKTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmdldE1vZGVsKCkub25EaWRDaGFuZ2VDb250ZW50KCAoZSk9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwib25FZGl0b3JDb250ZW50Q2hhbmdlXCIsIGVkaXRvci5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5hZGRBY3Rpb24oe1xuICAgICAgICAgICAgICAgICAgICAgIC8vIEFuIHVuaXF1ZSBpZGVudGlmaWVyIG9mIHRoZSBjb250cmlidXRlZCBhY3Rpb24uXG4gICAgICAgICAgICAgICAgICAgICAgaWQ6ICdmdWxsU2NyZWVuJyxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBBIGxhYmVsIG9mIHRoZSBhY3Rpb24gdGhhdCB3aWxsIGJlIHByZXNlbnRlZCB0byB0aGUgdXNlci5cbiAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0Z1bGwgU2NyZWVuJyxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBBbiBvcHRpb25hbCBhcnJheSBvZiBrZXliaW5kaW5ncyBmb3IgdGhlIGFjdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0TWVudUdyb3VwSWQ6ICduYXZpZ2F0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgICBrZXliaW5kaW5nczogWyR7dGhpcy5fa2V5Y29kZX1dLFxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHRNZW51T3JkZXI6IDEuNSxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBNZXRob2QgdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGFjdGlvbiBpcyB0cmlnZ2VyZWQuXG4gICAgICAgICAgICAgICAgICAgICAgLy8gQHBhcmFtIGVkaXRvciBUaGUgZWRpdG9yIGluc3RhbmNlIGlzIHBhc3NlZCBpbiBhcyBhIGNvbnZpbmllbmNlXG4gICAgICAgICAgICAgICAgICAgICAgcnVuOiBmdW5jdGlvbihlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVkaXRvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke3RoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyfScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWRpdG9yRGl2LndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmFkZEFjdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gQW4gdW5pcXVlIGlkZW50aWZpZXIgb2YgdGhlIGNvbnRyaWJ1dGVkIGFjdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgICBpZDogJ2V4aXRmdWxsU2NyZWVuJyxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBBIGxhYmVsIG9mIHRoZSBhY3Rpb24gdGhhdCB3aWxsIGJlIHByZXNlbnRlZCB0byB0aGUgdXNlci5cbiAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0V4aXQgRnVsbCBTY3JlZW4nLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIEFuIG9wdGlvbmFsIGFycmF5IG9mIGtleWJpbmRpbmdzIGZvciB0aGUgYWN0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHRNZW51R3JvdXBJZDogJ25hdmlnYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICAgIGtleWJpbmRpbmdzOiBbOV0sXG4gICAgICAgICAgICAgICAgICAgICAgY29udGV4dE1lbnVPcmRlcjogMS41LFxuICAgICAgICAgICAgICAgICAgICAgIC8vIE1ldGhvZCB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgd2hlbiB0aGUgYWN0aW9uIGlzIHRyaWdnZXJlZC5cbiAgICAgICAgICAgICAgICAgICAgICAvLyBAcGFyYW0gZWRpdG9yIFRoZSBlZGl0b3IgaW5zdGFuY2UgaXMgcGFzc2VkIGluIGFzIGEgY29udmluaWVuY2VcbiAgICAgICAgICAgICAgICAgICAgICBydW46IGZ1bmN0aW9uKGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWRpdG9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7dGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJ9Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC53ZWJraXRFeGl0RnVsbHNjcmVlbigpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJvbkVkaXRvckluaXRpYWxpemVkXCIsIHRoaXMuX2VkaXRvcik7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gYmFjayB0aGUgdmFsdWUgaW4gdGhlIGVkaXRvciB0byB0aGUgbWFpbnZpZXdcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignZ2V0RWRpdG9yQ29udGVudCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJlZGl0b3JDb250ZW50XCIsIGVkaXRvci5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgdmFsdWUgb2YgdGhlIGVkaXRvciBmcm9tIHdoYXQgd2FzIHNlbnQgZnJvbSB0aGUgbWFpbnZpZXdcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignc2V0RWRpdG9yQ29udGVudCcsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBkYXRhO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3Iuc2V0VmFsdWUoZGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIHN0eWxlIG9mIHRoZSBlZGl0b3IgY29udGFpbmVyIGRpdlxuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdzZXRFZGl0b3JTdHlsZScsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVkaXRvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke3RoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyfScpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3JEaXYuc3R5bGUgPSBkYXRhLnN0eWxlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudFZhbHVlID0gZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyXG4gICAgICAgICAgICAgICAgICAgIH0nKSwgT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFuZ3VhZ2U6IGRhdGEubGFuZ3VhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogZGF0YS50aGVtZSxcbiAgICAgICAgICAgICAgICAgICAgfSwgJHtKU09OLnN0cmluZ2lmeSh0aGlzLmVkaXRvck9wdGlvbnMpfSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBvcHRpb25zIG9mIHRoZSBlZGl0b3IgZnJvbSB3aGF0IHdhcyBzZW50IGZyb20gdGhlIG1haW52aWV3XG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ3NldEVkaXRvck9wdGlvbnMnLCBmdW5jdGlvbihldmVudCwgZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci51cGRhdGVPcHRpb25zKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwib25FZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZFwiLCAnJyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIGxhbmd1YWdlIG9mIHRoZSBlZGl0b3IgZnJvbSB3aGF0IHdhcyBzZW50IGZyb20gdGhlIG1haW52aWV3XG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ3NldExhbmd1YWdlJywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpe1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudFZhbHVlID0gZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyXG4gICAgICAgICAgICAgICAgICAgIH0nKSwgT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFuZ3VhZ2U6IGRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogdGhlbWUsXG4gICAgICAgICAgICAgICAgICAgIH0sICR7SlNPTi5zdHJpbmdpZnkodGhpcy5lZGl0b3JPcHRpb25zKX0pKTtcbiAgICAgICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIuc2VuZFRvSG9zdChcIm9uRWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWRcIiwgJycpO1xuICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwib25FZGl0b3JMYW5ndWFnZUNoYW5nZWRcIiwgJycpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gcmVnaXN0ZXIgYSBuZXcgbGFuZ3VhZ2Ugd2l0aCBlZGl0b3JcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbigncmVnaXN0ZXJMYW5ndWFnZScsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IuZGlzcG9zZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5jb21wbGV0aW9uSXRlbVByb3ZpZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvdmlkZXIgPSBkYXRhLmNvbXBsZXRpb25JdGVtUHJvdmlkZXJbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlci5raW5kID0gZXZhbChwcm92aWRlci5raW5kKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubW9uYXJjaFRva2Vuc1Byb3ZpZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbW9uYXJjaFRva2VucyA9IGRhdGEubW9uYXJjaFRva2Vuc1Byb3ZpZGVyW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9uYXJjaFRva2Vuc1swXSA9IGV2YWwobW9uYXJjaFRva2Vuc1swXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5yZWdpc3Rlcih7IGlkOiBkYXRhLmlkIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIG1vbmFjby5sYW5ndWFnZXMuc2V0TW9uYXJjaFRva2Vuc1Byb3ZpZGVyKGRhdGEuaWQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuaXplcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3Q6IGRhdGEubW9uYXJjaFRva2Vuc1Byb3ZpZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIERlZmluZSBhIG5ldyB0aGVtZSB0aGF0IGNvbnN0YWlucyBvbmx5IHJ1bGVzIHRoYXQgbWF0Y2ggdGhpcyBsYW5ndWFnZVxuICAgICAgICAgICAgICAgICAgICBtb25hY28uZWRpdG9yLmRlZmluZVRoZW1lKGRhdGEuY3VzdG9tVGhlbWUuaWQsIGRhdGEuY3VzdG9tVGhlbWUudGhlbWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGVtZSA9IGRhdGEuY3VzdG9tVGhlbWUuaWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5yZWdpc3RlckNvbXBsZXRpb25JdGVtUHJvdmlkZXIoZGF0YS5pZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZUNvbXBsZXRpb25JdGVtczogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLmNvbXBsZXRpb25JdGVtUHJvdmlkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGNzcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgY3NzLnR5cGUgPSBcInRleHQvY3NzXCI7XG4gICAgICAgICAgICAgICAgICAgIGNzcy5pbm5lckhUTUwgPSBkYXRhLm1vbmFyY2hUb2tlbnNQcm92aWRlckNTUztcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjc3MpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJvbkVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkXCIsICcnKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIEluc3RydWN0IHRoZSBlZGl0b3IgdG8gcmVtZWFzdXJlIGl0cyBjb250YWluZXJcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignbGF5b3V0JywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmxheW91dCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gSW5zdHJ1Y3QgdGhlIGVkaXRvciBnbyB0byBmdWxsIHNjcmVlbiBtb2RlXG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ3Nob3dGdWxsU2NyZWVuRWRpdG9yJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgZWRpdG9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7dGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJ9Jyk7XG4gICAgICAgICAgICAgICAgICBlZGl0b3JEaXYud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4oKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIEluc3RydWN0IHRoZSBlZGl0b3IgZXhpdCBmdWxsIHNjcmVlbiBtb2RlXG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ2V4aXRGdWxsU2NyZWVuRWRpdG9yJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgZWRpdG9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7dGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJ9Jyk7XG4gICAgICAgICAgICAgICAgICBlZGl0b3JEaXYud2Via2l0RXhpdEZ1bGxzY3JlZW4oKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdkaXNwb3NlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgIGVkaXRvci5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBuZWVkIHRvIG1hbnVhbGx5IHJlc2l6ZSB0aGUgZWRpdG9yIGFueSB0aW1lIHRoZSB3aW5kb3cgc2l6ZVxuICAgICAgICAgICAgICAgIC8vIGNoYW5nZXMuIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9tb25hY28tZWRpdG9yL2lzc3Vlcy8yOFxuICAgICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIGZ1bmN0aW9uIHJlc2l6ZUVkaXRvcigpIHtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmxheW91dCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgICAgICA8L2JvZHk+XG4gICAgICAgICAgICA8L2h0bWw+YDtcblxuICAgICAgLy8gZHluYW1pY2FsbHkgY3JlYXRlIHRoZSBFbGVjdHJvbiBXZWJ2aWV3IEVsZW1lbnRcbiAgICAgIC8vIHRoaXMgd2lsbCBzYW5kYm94IHRoZSBtb25hY28gY29kZSBpbnRvIGl0cyBvd24gRE9NIGFuZCBpdHMgb3duXG4gICAgICAvLyBqYXZhc2NyaXB0IGluc3RhbmNlLiBOZWVkIHRvIGRvIHRoaXMgdG8gYXZvaWQgcHJvYmxlbXMgd2l0aCBtb25hY29cbiAgICAgIC8vIHVzaW5nIEFNRCBSZXF1aXJlcyBhbmQgRWxlY3Ryb24gdXNpbmcgTm9kZSBSZXF1aXJlc1xuICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvbW9uYWNvLWVkaXRvci9pc3N1ZXMvOTBcbiAgICAgIHRoaXMuX3dlYnZpZXcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd3ZWJ2aWV3Jyk7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNldEF0dHJpYnV0ZSgnbm9kZWludGVncmF0aW9uJywgJ3RydWUnKTtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2V0QXR0cmlidXRlKCdkaXNhYmxld2Vic2VjdXJpdHknLCAndHJ1ZScpO1xuICAgICAgLy8gdGFrZSB0aGUgaHRtbCBjb250ZW50IGZvciB0aGUgd2VidmlldyBhbmQgYmFzZTY0IGVuY29kZSBpdCBhbmQgdXNlIGFzIHRoZSBzcmMgdGFnXG4gICAgICB0aGlzLl93ZWJ2aWV3LnNldEF0dHJpYnV0ZSgnc3JjJywgJ2RhdGE6dGV4dC9odG1sO2Jhc2U2NCwnICsgd2luZG93LmJ0b2EoZWRpdG9ySFRNTCkpO1xuICAgICAgdGhpcy5fd2Vidmlldy5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ2Rpc3BsYXk6aW5saW5lLWZsZXg7IHdpZHRoOjEwMCU7IGhlaWdodDoxMDAlJyk7XG4gICAgICAvLyAgdGhpcy5fd2Vidmlldy5hZGRFdmVudExpc3RlbmVyKCdkb20tcmVhZHknLCAoKSA9PiB7XG4gICAgICAvLyAgICAgdGhpcy5fd2Vidmlldy5vcGVuRGV2VG9vbHMoKTtcbiAgICAgIC8vICB9KTtcblxuICAgICAgLy8gUHJvY2VzcyB0aGUgZGF0YSBmcm9tIHRoZSB3ZWJ2aWV3XG4gICAgICB0aGlzLl93ZWJ2aWV3LmFkZEV2ZW50TGlzdGVuZXIoJ2lwYy1tZXNzYWdlJywgKGV2ZW50OiBhbnkpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmNoYW5uZWwgPT09ICdlZGl0b3JDb250ZW50Jykge1xuICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSB0cnVlO1xuICAgICAgICAgIHRoaXMud3JpdGVWYWx1ZShldmVudC5hcmdzWzBdKTtcbiAgICAgICAgICB0aGlzLl9zdWJqZWN0Lm5leHQodGhpcy5fdmFsdWUpO1xuICAgICAgICAgIHRoaXMuX3N1YmplY3QuY29tcGxldGUoKTtcbiAgICAgICAgICB0aGlzLl9zdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5jaGFubmVsID09PSAnb25FZGl0b3JDb250ZW50Q2hhbmdlJykge1xuICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSB0cnVlO1xuICAgICAgICAgIHRoaXMud3JpdGVWYWx1ZShldmVudC5hcmdzWzBdKTtcbiAgICAgICAgICBpZiAodGhpcy5pbml0aWFsQ29udGVudENoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5pbml0aWFsQ29udGVudENoYW5nZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5sYXlvdXQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY2hhbm5lbCA9PT0gJ29uRWRpdG9ySW5pdGlhbGl6ZWQnKSB7XG4gICAgICAgICAgdGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICAgIHRoaXMuX2VkaXRvclByb3h5ID0gdGhpcy53cmFwRWRpdG9yQ2FsbHModGhpcy5fZWRpdG9yKTtcbiAgICAgICAgICB0aGlzLm9uRWRpdG9ySW5pdGlhbGl6ZWQuZW1pdCh0aGlzLl9lZGl0b3JQcm94eSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY2hhbm5lbCA9PT0gJ29uRWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQnKSB7XG4gICAgICAgICAgdGhpcy5vbkVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkLmVtaXQodW5kZWZpbmVkKTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5jaGFubmVsID09PSAnb25FZGl0b3JMYW5ndWFnZUNoYW5nZWQnKSB7XG4gICAgICAgICAgdGhpcy5vbkVkaXRvckxhbmd1YWdlQ2hhbmdlZC5lbWl0KHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBhcHBlbmQgdGhlIHdlYnZpZXcgdG8gdGhlIERPTVxuICAgICAgdGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fd2Vidmlldyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIG5nQWZ0ZXJWaWV3SW5pdCBvbmx5IHVzZWQgZm9yIGJyb3dzZXIgdmVyc2lvbiBvZiBlZGl0b3JcbiAgICogVGhpcyBpcyB3aGVyZSB0aGUgQU1EIExvYWRlciBzY3JpcHRzIGFyZSBhZGRlZCB0byB0aGUgYnJvd3NlciBhbmQgdGhlIGVkaXRvciBzY3JpcHRzIGFyZSBcInJlcXVpcmVkXCJcbiAgICovXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2lzRWxlY3Ryb25BcHApIHtcbiAgICAgIGxvYWRNb25hY28oKTtcbiAgICAgIHdhaXRVbnRpbE1vbmFjb1JlYWR5KClcbiAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3kpKVxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmluaXRNb25hY28oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1lcmdlKFxuICAgICAgZnJvbUV2ZW50KHdpbmRvdywgJ3Jlc2l6ZScpLnBpcGUoZGVib3VuY2VUaW1lKDEwMCkpLFxuICAgICAgdGhpcy5fd2lkdGhTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpLnBpcGUoZGlzdGluY3RVbnRpbENoYW5nZWQoKSksXG4gICAgICB0aGlzLl9oZWlnaHRTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpLnBpcGUoZGlzdGluY3RVbnRpbENoYW5nZWQoKSksXG4gICAgKVxuICAgICAgLnBpcGUoXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95KSxcbiAgICAgICAgZGVib3VuY2VUaW1lKDEwMCksXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgdGhpcy5sYXlvdXQoKTtcbiAgICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgICB9KTtcbiAgICB0aW1lcig1MDAsIDI1MClcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95KSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fZWxlbWVudFJlZiAmJiB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpIHtcbiAgICAgICAgICB0aGlzLl93aWR0aFN1YmplY3QubmV4dCgoPEhUTUxFbGVtZW50PnRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgpO1xuICAgICAgICAgIHRoaXMuX2hlaWdodFN1YmplY3QubmV4dCgoPEhUTUxFbGVtZW50PnRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5kZXRhY2goKTtcbiAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdkaXNwb3NlJyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgIHRoaXMuX2VkaXRvci5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX2Rlc3Ryb3kubmV4dCh0cnVlKTtcbiAgICB0aGlzLl9kZXN0cm95LnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICAvKipcbiAgICogc2hvd0Z1bGxTY3JlZW5FZGl0b3IgcmVxdWVzdCBmb3IgZnVsbCBzY3JlZW4gb2YgQ29kZSBFZGl0b3IgYmFzZWQgb24gaXRzIGJyb3dzZXIgdHlwZS5cbiAgICovXG4gIHB1YmxpYyBzaG93RnVsbFNjcmVlbkVkaXRvcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnc2hvd0Z1bGxTY3JlZW5FZGl0b3InKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGNvZGVFZGl0b3JFbGVtZW50OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50IGFzIEhUTUxEaXZFbGVtZW50O1xuICAgICAgICBjb25zdCBmdWxsU2NyZWVuTWFwOiBPYmplY3QgPSB7XG4gICAgICAgICAgLy8gQ2hyb21lXG4gICAgICAgICAgcmVxdWVzdEZ1bGxzY3JlZW46ICgpID0+IGNvZGVFZGl0b3JFbGVtZW50LnJlcXVlc3RGdWxsc2NyZWVuKCksXG4gICAgICAgICAgLy8gU2FmYXJpXG4gICAgICAgICAgd2Via2l0UmVxdWVzdEZ1bGxzY3JlZW46ICgpID0+ICg8YW55PmNvZGVFZGl0b3JFbGVtZW50KS53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbigpLFxuICAgICAgICAgIC8vIElFXG4gICAgICAgICAgbXNSZXF1ZXN0RnVsbHNjcmVlbjogKCkgPT4gKDxhbnk+Y29kZUVkaXRvckVsZW1lbnQpLm1zUmVxdWVzdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgICAvLyBGaXJlZm94XG4gICAgICAgICAgbW96UmVxdWVzdEZ1bGxTY3JlZW46ICgpID0+ICg8YW55PmNvZGVFZGl0b3JFbGVtZW50KS5tb3pSZXF1ZXN0RnVsbFNjcmVlbigpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGZvciAoY29uc3QgaGFuZGxlciBvZiBPYmplY3Qua2V5cyhmdWxsU2NyZWVuTWFwKSkge1xuICAgICAgICAgIGlmIChjb2RlRWRpdG9yRWxlbWVudFtoYW5kbGVyXSkge1xuICAgICAgICAgICAgZnVsbFNjcmVlbk1hcFtoYW5kbGVyXSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9pc0Z1bGxTY3JlZW4gPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIGV4aXRGdWxsU2NyZWVuRWRpdG9yIHJlcXVlc3QgdG8gZXhpdCBmdWxsIHNjcmVlbiBvZiBDb2RlIEVkaXRvciBiYXNlZCBvbiBpdHMgYnJvd3NlciB0eXBlLlxuICAgKi9cbiAgcHVibGljIGV4aXRGdWxsU2NyZWVuRWRpdG9yKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdleGl0RnVsbFNjcmVlbkVkaXRvcicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZXhpdEZ1bGxTY3JlZW5NYXA6IG9iamVjdCA9IHtcbiAgICAgICAgICAvLyBDaHJvbWVcbiAgICAgICAgICBleGl0RnVsbHNjcmVlbjogKCkgPT4gZG9jdW1lbnQuZXhpdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgICAvLyBTYWZhcmlcbiAgICAgICAgICB3ZWJraXRFeGl0RnVsbHNjcmVlbjogKCkgPT4gKDxhbnk+ZG9jdW1lbnQpLndlYmtpdEV4aXRGdWxsc2NyZWVuKCksXG4gICAgICAgICAgLy8gRmlyZWZveFxuICAgICAgICAgIG1vekNhbmNlbEZ1bGxTY3JlZW46ICgpID0+ICg8YW55PmRvY3VtZW50KS5tb3pDYW5jZWxGdWxsU2NyZWVuKCksXG4gICAgICAgICAgLy8gSUVcbiAgICAgICAgICBtc0V4aXRGdWxsc2NyZWVuOiAoKSA9PiAoPGFueT5kb2N1bWVudCkubXNFeGl0RnVsbHNjcmVlbigpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGZvciAoY29uc3QgaGFuZGxlciBvZiBPYmplY3Qua2V5cyhleGl0RnVsbFNjcmVlbk1hcCkpIHtcbiAgICAgICAgICBpZiAoZG9jdW1lbnRbaGFuZGxlcl0pIHtcbiAgICAgICAgICAgIGV4aXRGdWxsU2NyZWVuTWFwW2hhbmRsZXJdKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2lzRnVsbFNjcmVlbiA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIGFkZEZ1bGxTY3JlZW5Nb2RlQ29tbWFuZCB1c2VkIHRvIGFkZCB0aGUgZnVsbHNjcmVlbiBvcHRpb24gdG8gdGhlIGNvbnRleHQgbWVudVxuICAgKi9cbiAgcHJpdmF0ZSBhZGRGdWxsU2NyZWVuTW9kZUNvbW1hbmQoKTogdm9pZCB7XG4gICAgdGhpcy5fZWRpdG9yLmFkZEFjdGlvbih7XG4gICAgICAvLyBBbiB1bmlxdWUgaWRlbnRpZmllciBvZiB0aGUgY29udHJpYnV0ZWQgYWN0aW9uLlxuICAgICAgaWQ6ICdmdWxsU2NyZWVuJyxcbiAgICAgIC8vIEEgbGFiZWwgb2YgdGhlIGFjdGlvbiB0aGF0IHdpbGwgYmUgcHJlc2VudGVkIHRvIHRoZSB1c2VyLlxuICAgICAgbGFiZWw6ICdGdWxsIFNjcmVlbicsXG4gICAgICAvLyBBbiBvcHRpb25hbCBhcnJheSBvZiBrZXliaW5kaW5ncyBmb3IgdGhlIGFjdGlvbi5cbiAgICAgIGNvbnRleHRNZW51R3JvdXBJZDogJ25hdmlnYXRpb24nLFxuICAgICAga2V5YmluZGluZ3M6IHRoaXMuX2tleWNvZGUsXG4gICAgICBjb250ZXh0TWVudU9yZGVyOiAxLjUsXG4gICAgICAvLyBNZXRob2QgdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGFjdGlvbiBpcyB0cmlnZ2VyZWQuXG4gICAgICAvLyBAcGFyYW0gZWRpdG9yIFRoZSBlZGl0b3IgaW5zdGFuY2UgaXMgcGFzc2VkIGluIGFzIGEgY29udmluaWVuY2VcbiAgICAgIHJ1bjogKGVkOiBhbnkpID0+IHtcbiAgICAgICAgdGhpcy5zaG93RnVsbFNjcmVlbkVkaXRvcigpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiB3cmFwRWRpdG9yQ2FsbHMgdXNlZCB0byBwcm94eSBhbGwgdGhlIGNhbGxzIHRvIHRoZSBtb25hY28gZWRpdG9yXG4gICAqIEZvciBjYWxscyBmb3IgRWxlY3Ryb24gdXNlIHRoaXMgdG8gY2FsbCB0aGUgZWRpdG9yIGluc2lkZSB0aGUgd2Vidmlld1xuICAgKi9cbiAgcHJpdmF0ZSB3cmFwRWRpdG9yQ2FsbHMob2JqOiBhbnkpOiBhbnkge1xuICAgIGxldCB0aGF0OiBhbnkgPSB0aGlzO1xuICAgIGxldCBoYW5kbGVyOiBhbnkgPSB7XG4gICAgICBnZXQodGFyZ2V0OiBhbnksIHByb3BLZXk6IGFueSwgcmVjZWl2ZXI6IGFueSk6IGFueSB7XG4gICAgICAgIHJldHVybiBhc3luYyAoLi4uYXJnczogYW55KTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgICAgICAgICBpZiAodGhhdC5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIGlmICh0aGF0Ll93ZWJ2aWV3KSB7XG4gICAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGVKYXZhU2NyaXB0OiBGdW5jdGlvbiA9IChjb2RlOiBzdHJpbmcpID0+XG4gICAgICAgICAgICAgICAgbmV3IFByb21pc2UoKHJlc29sdmU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgdGhhdC5fd2Vidmlldy5leGVjdXRlSmF2YVNjcmlwdChjb2RlLCByZXNvbHZlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgbGV0IHJlc3VsdDogYW55ID0gYXdhaXQgZXhlY3V0ZUphdmFTY3JpcHQoJ2VkaXRvci4nICsgcHJvcEtleSArICcoJyArIGFyZ3MgKyAnKScpO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc3Qgb3JpZ01ldGhvZDogYW55ID0gdGFyZ2V0W3Byb3BLZXldO1xuICAgICAgICAgICAgICBsZXQgcmVzdWx0OiBhbnkgPSBhd2FpdCBvcmlnTWV0aG9kLmFwcGx5KHRoYXQuX2VkaXRvciwgYXJncyk7XG4gICAgICAgICAgICAgIC8vIHNpbmNlIHJ1bm5pbmcgamF2YXNjcmlwdCBjb2RlIG1hbnVhbGx5IG5lZWQgdG8gZm9yY2UgQW5ndWxhciB0byBkZXRlY3QgY2hhbmdlc1xuICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGF0LnpvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZVxuICAgICAgICAgICAgICAgICAgaWYgKCF0aGF0Ll9jaGFuZ2VEZXRlY3RvclJlZlsnZGVzdHJveWVkJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5fY2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgIH07XG4gICAgcmV0dXJuIG5ldyBQcm94eShvYmosIGhhbmRsZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIGluaXRNb25hY28gbWV0aG9kIGNyZWF0ZXMgdGhlIG1vbmFjbyBlZGl0b3IgaW50byB0aGUgQFZpZXdDaGlsZCgnZWRpdG9yQ29udGFpbmVyJylcbiAgICogYW5kIGVtaXQgdGhlIG9uRWRpdG9ySW5pdGlhbGl6ZWQgZXZlbnQuICBUaGlzIGlzIG9ubHkgdXNlZCBpbiB0aGUgYnJvd3NlciB2ZXJzaW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBpbml0TW9uYWNvKCk6IHZvaWQge1xuICAgIGxldCBjb250YWluZXJEaXY6IEhUTUxEaXZFbGVtZW50ID0gdGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQ7XG4gICAgY29udGFpbmVyRGl2LmlkID0gdGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXI7XG4gICAgdGhpcy5fZWRpdG9yID0gbW9uYWNvLmVkaXRvci5jcmVhdGUoXG4gICAgICBjb250YWluZXJEaXYsXG4gICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICB7XG4gICAgICAgICAgdmFsdWU6IHRoaXMuX3ZhbHVlLFxuICAgICAgICAgIGxhbmd1YWdlOiB0aGlzLmxhbmd1YWdlLFxuICAgICAgICAgIHRoZW1lOiB0aGlzLl90aGVtZSxcbiAgICAgICAgfSxcbiAgICAgICAgdGhpcy5lZGl0b3JPcHRpb25zLFxuICAgICAgKSxcbiAgICApO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fZWRpdG9yUHJveHkgPSB0aGlzLndyYXBFZGl0b3JDYWxscyh0aGlzLl9lZGl0b3IpO1xuICAgICAgdGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgdGhpcy5vbkVkaXRvckluaXRpYWxpemVkLmVtaXQodGhpcy5fZWRpdG9yUHJveHkpO1xuICAgIH0pO1xuICAgIHRoaXMuX2VkaXRvci5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlQ29udGVudCgoZTogYW55KSA9PiB7XG4gICAgICB0aGlzLl9mcm9tRWRpdG9yID0gdHJ1ZTtcbiAgICAgIHRoaXMud3JpdGVWYWx1ZSh0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKSk7XG4gICAgICBpZiAodGhpcy5pbml0aWFsQ29udGVudENoYW5nZSkge1xuICAgICAgICB0aGlzLmluaXRpYWxDb250ZW50Q2hhbmdlID0gZmFsc2U7XG4gICAgICAgIHRoaXMubGF5b3V0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5hZGRGdWxsU2NyZWVuTW9kZUNvbW1hbmQoKTtcbiAgfVxufVxuIl19