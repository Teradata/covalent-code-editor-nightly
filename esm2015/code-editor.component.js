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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS1lZGl0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGNvdmFsZW50L2NvZGUtZWRpdG9yLyIsInNvdXJjZXMiOlsiY29kZS1lZGl0b3IuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFlBQVksRUFHWixTQUFTLEVBQ1QsVUFBVSxFQUNWLFVBQVUsRUFDVixNQUFNLEVBQ04saUJBQWlCLEdBRWxCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxpQkFBaUIsRUFBd0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6RSxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvQyxPQUFPLEVBQUUsWUFBWSxFQUFFLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRS9FLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxVQUFVLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7TUFFakUsSUFBSTs7O0FBQVEsR0FBRyxFQUFFO0lBQ3JCLGVBQWU7QUFDakIsQ0FBQyxDQUFBOzs7O0lBR0csYUFBYSxHQUFXLENBQUM7QUFpQjdCLE1BQU0sT0FBTyxxQkFBcUI7Ozs7Ozs7SUEyRWhDLFlBQW9CLElBQVksRUFBVSxrQkFBcUMsRUFBVSxXQUF1QjtRQUE1RixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVUsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFZO1FBMUV4RyxhQUFRLEdBQXFCLElBQUksT0FBTyxFQUFXLENBQUM7UUFDcEQsa0JBQWEsR0FBb0IsSUFBSSxPQUFPLEVBQVUsQ0FBQztRQUN2RCxtQkFBYyxHQUFvQixJQUFJLE9BQU8sRUFBVSxDQUFDO1FBRXhE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TUFBTTtxQkFNTixNQUFNO29CQTBCTixLQUFLLFNBQUMsT0FBTzt1QkFnR2IsS0FBSyxTQUFDLFVBQVU7MEJBb0ZoQixLQUFLLFNBQUMsYUFBYTtvQkFzQ25CLEtBQUssU0FBQyxPQUFPO21DQXFCYixLQUFLLFNBQUMsc0JBQXNCOzRCQWE1QixLQUFLLFNBQUMsZUFBZTs7Ozs7OztJQXhWdEIseUNBQTREOzs7OztJQUM1RCw4Q0FBK0Q7Ozs7O0lBQy9ELCtDQUFnRTs7Ozs7SUFFaEUsNkNBQStFOzs7OztJQUMvRSx5Q0FBOEI7Ozs7O0lBQzlCLCtDQUF3Qzs7Ozs7SUFDeEMseUNBQXNCOzs7OztJQUN0Qix1Q0FBNEI7Ozs7O0lBQzVCLHVDQUE4Qjs7Ozs7SUFDOUIsMENBQXlDOzs7OztJQUN6Qyx5Q0FBa0Q7Ozs7O0lBQ2xELHNEQUFpRjs7Ozs7SUFDakYsNkRBQWtEOzs7OztJQUNsRCx3Q0FBcUI7Ozs7O0lBQ3JCLDZDQUEwQjs7Ozs7SUFDMUIsc0RBQStDOzs7OztJQUMvQyw0Q0FBcUM7Ozs7O0lBQ3JDLCtDQUFpQzs7Ozs7SUFDakMsOENBQXVDOzs7OztJQUN2Qyx5Q0FBc0I7Ozs7O0lBQ3RCLGlEQUE4Qjs7Ozs7SUFDOUIscURBQTZDOztJQUU3QyxpREFBNkU7Ozs7OztJQWtCN0Usa0RBQTJFOzs7Ozs7SUFNM0UsMkRBQW9GOzs7Ozs7SUFNcEYsc0RBQStFOzs7Ozs7SUFNL0Usa0RBQTJFOzs7Ozs7SUFNM0UsdUNBQWdFOztJQUVoRSxnREFBaUM7O0lBQ2pDLDBDQUF1Qjs7Ozs7SUFLWCxxQ0FBb0I7Ozs7O0lBQUUsbURBQTZDOzs7OztJQUFFLDRDQUErQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBvbmVudCxcbiAgSW5wdXQsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyLFxuICBPbkluaXQsXG4gIEFmdGVyVmlld0luaXQsXG4gIFZpZXdDaGlsZCxcbiAgRWxlbWVudFJlZixcbiAgZm9yd2FyZFJlZixcbiAgTmdab25lLFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgT25EZXN0cm95LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5HX1ZBTFVFX0FDQ0VTU09SLCBDb250cm9sVmFsdWVBY2Nlc3NvciB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGZyb21FdmVudCwgbWVyZ2UsIHRpbWVyIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBkZWJvdW5jZVRpbWUsIGRpc3RpbmN0VW50aWxDaGFuZ2VkLCB0YWtlVW50aWwgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IHdhaXRVbnRpbE1vbmFjb1JlYWR5LCBsb2FkTW9uYWNvIH0gZnJvbSAnLi9jb2RlLWVkaXRvci51dGlscyc7XG5cbmNvbnN0IG5vb3A6IGFueSA9ICgpID0+IHtcbiAgLy8gZW1wdHkgbWV0aG9kXG59O1xuXG4vLyBjb3VudGVyIGZvciBpZHMgdG8gYWxsb3cgZm9yIG11bHRpcGxlIGVkaXRvcnMgb24gb25lIHBhZ2VcbmxldCB1bmlxdWVDb3VudGVyOiBudW1iZXIgPSAwO1xuLy8gZGVjbGFyZSBhbGwgdGhlIGJ1aWx0IGluIGVsZWN0cm9uIG9iamVjdHNcbmRlY2xhcmUgY29uc3QgZWxlY3Ryb246IGFueTtcbmRlY2xhcmUgY29uc3QgbW9uYWNvOiBhbnk7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3RkLWNvZGUtZWRpdG9yJyxcbiAgdGVtcGxhdGVVcmw6ICcuL2NvZGUtZWRpdG9yLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vY29kZS1lZGl0b3IuY29tcG9uZW50LnNjc3MnXSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG4gICAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBUZENvZGVFZGl0b3JDb21wb25lbnQpLFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgVGRDb2RlRWRpdG9yQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBBZnRlclZpZXdJbml0LCBDb250cm9sVmFsdWVBY2Nlc3NvciwgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBfZGVzdHJveTogU3ViamVjdDxib29sZWFuPiA9IG5ldyBTdWJqZWN0PGJvb2xlYW4+KCk7XG4gIHByaXZhdGUgX3dpZHRoU3ViamVjdDogU3ViamVjdDxudW1iZXI+ID0gbmV3IFN1YmplY3Q8bnVtYmVyPigpO1xuICBwcml2YXRlIF9oZWlnaHRTdWJqZWN0OiBTdWJqZWN0PG51bWJlcj4gPSBuZXcgU3ViamVjdDxudW1iZXI+KCk7XG5cbiAgcHJpdmF0ZSBfZWRpdG9yU3R5bGU6IHN0cmluZyA9ICd3aWR0aDoxMDAlO2hlaWdodDoxMDAlO2JvcmRlcjoxcHggc29saWQgZ3JleTsnO1xuICBwcml2YXRlIF9hcHBQYXRoOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSBfaXNFbGVjdHJvbkFwcDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF93ZWJ2aWV3OiBhbnk7XG4gIHByaXZhdGUgX3ZhbHVlOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSBfdGhlbWU6IHN0cmluZyA9ICd2cyc7XG4gIHByaXZhdGUgX2xhbmd1YWdlOiBzdHJpbmcgPSAnamF2YXNjcmlwdCc7XG4gIHByaXZhdGUgX3N1YmplY3Q6IFN1YmplY3Q8c3RyaW5nPiA9IG5ldyBTdWJqZWN0KCk7XG4gIHByaXZhdGUgX2VkaXRvcklubmVyQ29udGFpbmVyOiBzdHJpbmcgPSAnZWRpdG9ySW5uZXJDb250YWluZXInICsgdW5pcXVlQ291bnRlcisrO1xuICBwcml2YXRlIF9lZGl0b3JOb2RlTW9kdWxlRGlyT3ZlcnJpZGU6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlIF9lZGl0b3I6IGFueTtcbiAgcHJpdmF0ZSBfZWRpdG9yUHJveHk6IGFueTtcbiAgcHJpdmF0ZSBfY29tcG9uZW50SW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfZnJvbUVkaXRvcjogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9lZGl0b3JPcHRpb25zOiBhbnkgPSB7fTtcbiAgcHJpdmF0ZSBfaXNGdWxsU2NyZWVuOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX2tleWNvZGU6IGFueTtcbiAgcHJpdmF0ZSBfc2V0VmFsdWVUaW1lb3V0OiBhbnk7XG4gIHByaXZhdGUgaW5pdGlhbENvbnRlbnRDaGFuZ2U6IGJvb2xlYW4gPSB0cnVlO1xuXG4gIEBWaWV3Q2hpbGQoJ2VkaXRvckNvbnRhaW5lcicsIHsgc3RhdGljOiB0cnVlIH0pIF9lZGl0b3JDb250YWluZXI6IEVsZW1lbnRSZWY7XG5cbiAgLyoqXG4gICAqIGF1dG9tYXRpY0xheW91dD86IGJvb2xlYW5cbiAgICogQGRlcHJlY2F0ZWQgaW4gZmF2b3Igb2Ygb3VyIG93biByZXNpemUgaW1wbGVtZW50YXRpb24uXG4gICAqL1xuICBASW5wdXQoJ2F1dG9tYXRpY0xheW91dCcpXG4gIHNldCBhdXRvbWF0aWNMYXlvdXQoYXV0b21hdGljTGF5b3V0OiBib29sZWFuKSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lXG4gICAgY29uc29sZS53YXJuKFxuICAgICAgJ1thdXRvbWF0aWNMYXlvdXRdIGhhcyBiZWVuIGRlcHJlY2F0ZWQgaW4gZmF2b3Igb2Ygb3VyIG93biByZXNpemUgaW1wbGVtZW50YXRpb24gYW5kIHdpbGwgYmUgcmVtb3ZlZCBvbiAzLjAuMCcsXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBlZGl0b3JJbml0aWFsaXplZDogZnVuY3Rpb24oJGV2ZW50KVxuICAgKiBFdmVudCBlbWl0dGVkIHdoZW4gZWRpdG9yIGlzIGZpcnN0IGluaXRpYWxpemVkXG4gICAqL1xuICBAT3V0cHV0KCkgZWRpdG9ySW5pdGlhbGl6ZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAvKipcbiAgICogZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQ6IGZ1bmN0aW9uKCRldmVudClcbiAgICogRXZlbnQgZW1pdHRlZCB3aGVuIGVkaXRvcidzIGNvbmZpZ3VyYXRpb24gY2hhbmdlc1xuICAgKi9cbiAgQE91dHB1dCgpIGVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIGVkaXRvckxhbmd1YWdlQ2hhbmdlZDogZnVuY3Rpb24oJGV2ZW50KVxuICAgKiBFdmVudCBlbWl0dGVkIHdoZW4gZWRpdG9yJ3MgTGFuZ3VhZ2UgY2hhbmdlc1xuICAgKi9cbiAgQE91dHB1dCgpIGVkaXRvckxhbmd1YWdlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBlZGl0b3JWYWx1ZUNoYW5nZTogZnVuY3Rpb24oJGV2ZW50KVxuICAgKiBFdmVudCBlbWl0dGVkIGFueSB0aW1lIHNvbWV0aGluZyBjaGFuZ2VzIHRoZSBlZGl0b3IgdmFsdWVcbiAgICovXG4gIEBPdXRwdXQoKSBlZGl0b3JWYWx1ZUNoYW5nZTogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBUaGUgY2hhbmdlIGV2ZW50IG5vdGlmaWVzIHlvdSBhYm91dCBhIGNoYW5nZSBoYXBwZW5pbmcgaW4gYW4gaW5wdXQgZmllbGQuXG4gICAqIFNpbmNlIHRoZSBjb21wb25lbnQgaXMgbm90IGEgbmF0aXZlIEFuZ3VsYXIgY29tcG9uZW50IGhhdmUgdG8gc3BlY2lmaXkgdGhlIGV2ZW50IGVtaXR0ZXIgb3Vyc2VsZlxuICAgKi9cbiAgQE91dHB1dCgpIGNoYW5nZTogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICAvKiB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmUgKi9cbiAgcHJvcGFnYXRlQ2hhbmdlID0gKF86IGFueSkgPT4ge307XG4gIG9uVG91Y2hlZCA9ICgpID0+IG5vb3A7XG5cbiAgLyoqXG4gICAqIFNldCBpZiB1c2luZyBFbGVjdHJvbiBtb2RlIHdoZW4gb2JqZWN0IGlzIGNyZWF0ZWRcbiAgICovXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgem9uZTogTmdab25lLCBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICAvLyBzaW5jZSBhY2Nlc3NpbmcgdGhlIHdpbmRvdyBvYmplY3QgbmVlZCB0aGlzIGNoZWNrIHNvIHNlcnZlcnNpZGUgcmVuZGVyaW5nIGRvZXNuJ3QgZmFpbFxuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICdvYmplY3QnICYmICEhZG9jdW1lbnQpIHtcbiAgICAgIC8qIHRzbGludDpkaXNhYmxlLW5leHQtbGluZSAqL1xuICAgICAgdGhpcy5faXNFbGVjdHJvbkFwcCA9ICg8YW55PndpbmRvdylbJ3Byb2Nlc3MnXSA/IHRydWUgOiBmYWxzZTtcbiAgICAgIGlmICh0aGlzLl9pc0VsZWN0cm9uQXBwKSB7XG4gICAgICAgIHRoaXMuX2FwcFBhdGggPSBlbGVjdHJvbi5yZW1vdGUuYXBwXG4gICAgICAgICAgLmdldEFwcFBhdGgoKVxuICAgICAgICAgIC5zcGxpdCgnXFxcXCcpXG4gICAgICAgICAgLmpvaW4oJy8nKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogdmFsdWU/OiBzdHJpbmdcbiAgICogVmFsdWUgaW4gdGhlIEVkaXRvciBhZnRlciBhc3luYyBnZXRFZGl0b3JDb250ZW50IHdhcyBjYWxsZWRcbiAgICovXG4gIEBJbnB1dCgndmFsdWUnKVxuICBzZXQgdmFsdWUodmFsdWU6IHN0cmluZykge1xuICAgIC8vIENsZWFyIGFueSB0aW1lb3V0IHRoYXQgbWlnaHQgb3ZlcndyaXRlIHRoaXMgdmFsdWUgc2V0IGluIHRoZSBmdXR1cmVcbiAgICBpZiAodGhpcy5fc2V0VmFsdWVUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fc2V0VmFsdWVUaW1lb3V0KTtcbiAgICB9XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIGlmICh0aGlzLl93ZWJ2aWV3LnNlbmQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIGRvbid0IHdhbnQgdG8ga2VlcCBzZW5kaW5nIGNvbnRlbnQgaWYgZXZlbnQgY2FtZSBmcm9tIElQQywgaW5maW5pdGUgbG9vcFxuICAgICAgICAgIGlmICghdGhpcy5fZnJvbUVkaXRvcikge1xuICAgICAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdzZXRFZGl0b3JDb250ZW50JywgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmVkaXRvclZhbHVlQ2hhbmdlLmVtaXQoKTtcbiAgICAgICAgICB0aGlzLnByb3BhZ2F0ZUNoYW5nZSh0aGlzLl92YWx1ZSk7XG4gICAgICAgICAgdGhpcy5jaGFuZ2UuZW1pdCgpO1xuICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBFZGl0b3IgaXMgbm90IGxvYWRlZCB5ZXQsIHRyeSBhZ2FpbiBpbiBoYWxmIGEgc2Vjb25kXG4gICAgICAgICAgdGhpcy5fc2V0VmFsdWVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuX2VkaXRvciAmJiB0aGlzLl9lZGl0b3Iuc2V0VmFsdWUpIHtcbiAgICAgICAgICAvLyBkb24ndCB3YW50IHRvIGtlZXAgc2VuZGluZyBjb250ZW50IGlmIGV2ZW50IGNhbWUgZnJvbSB0aGUgZWRpdG9yLCBpbmZpbml0ZSBsb29wXG4gICAgICAgICAgaWYgKCF0aGlzLl9mcm9tRWRpdG9yKSB7XG4gICAgICAgICAgICB0aGlzLl9lZGl0b3Iuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmVkaXRvclZhbHVlQ2hhbmdlLmVtaXQoKTtcbiAgICAgICAgICB0aGlzLnByb3BhZ2F0ZUNoYW5nZSh0aGlzLl92YWx1ZSk7XG4gICAgICAgICAgdGhpcy5jaGFuZ2UuZW1pdCgpO1xuICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLnpvbmUucnVuKCgpID0+ICh0aGlzLl92YWx1ZSA9IHZhbHVlKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gRWRpdG9yIGlzIG5vdCBsb2FkZWQgeWV0LCB0cnkgYWdhaW4gaW4gaGFsZiBhIHNlY29uZFxuICAgICAgICAgIHRoaXMuX3NldFZhbHVlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2V0VmFsdWVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgIH0sIDUwMCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IHZhbHVlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gICAqL1xuICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAvLyBkbyBub3Qgd3JpdGUgaWYgbnVsbCBvciB1bmRlZmluZWRcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmVcbiAgICBpZiAodmFsdWUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICB9XG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46IGFueSk6IHZvaWQge1xuICAgIHRoaXMucHJvcGFnYXRlQ2hhbmdlID0gZm47XG4gIH1cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46IGFueSk6IHZvaWQge1xuICAgIHRoaXMub25Ub3VjaGVkID0gZm47XG4gIH1cblxuICAvKipcbiAgICogZ2V0RWRpdG9yQ29udGVudD86IGZ1bmN0aW9uXG4gICAqIFJldHVybnMgdGhlIGNvbnRlbnQgd2l0aGluIHRoZSBlZGl0b3JcbiAgICovXG4gIGdldFZhbHVlKCk6IE9ic2VydmFibGU8c3RyaW5nPiB7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2dldEVkaXRvckNvbnRlbnQnKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgICB0aGlzLl92YWx1ZSA9IHRoaXMuX2VkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGlzLl9zdWJqZWN0Lm5leHQodGhpcy5fdmFsdWUpO1xuICAgICAgICAgIHRoaXMuX3N1YmplY3QuY29tcGxldGUoKTtcbiAgICAgICAgICB0aGlzLl9zdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgICAgICAgICB0aGlzLmVkaXRvclZhbHVlQ2hhbmdlLmVtaXQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBsYW5ndWFnZT86IHN0cmluZ1xuICAgKiBsYW5ndWFnZSB1c2VkIGluIGVkaXRvclxuICAgKi9cbiAgQElucHV0KCdsYW5ndWFnZScpXG4gIHNldCBsYW5ndWFnZShsYW5ndWFnZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fbGFuZ3VhZ2UgPSBsYW5ndWFnZTtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnc2V0TGFuZ3VhZ2UnLCBsYW5ndWFnZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgICBjb25zdCBjdXJyZW50VmFsdWU6IHN0cmluZyA9IHRoaXMuX2VkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICB0aGlzLl9lZGl0b3IuZGlzcG9zZSgpO1xuICAgICAgICBjb25zdCBteURpdjogSFRNTERpdkVsZW1lbnQgPSB0aGlzLl9lZGl0b3JDb250YWluZXIubmF0aXZlRWxlbWVudDtcbiAgICAgICAgdGhpcy5fZWRpdG9yID0gbW9uYWNvLmVkaXRvci5jcmVhdGUoXG4gICAgICAgICAgbXlEaXYsXG4gICAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdmFsdWU6IGN1cnJlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgbGFuZ3VhZ2UsXG4gICAgICAgICAgICAgIHRoZW1lOiB0aGlzLl90aGVtZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0aGlzLmVkaXRvck9wdGlvbnMsXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fZWRpdG9yLmdldE1vZGVsKCkub25EaWRDaGFuZ2VDb250ZW50KChlOiBhbnkpID0+IHtcbiAgICAgICAgICB0aGlzLl9mcm9tRWRpdG9yID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLndyaXRlVmFsdWUodGhpcy5fZWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5lZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZC5lbWl0KCk7XG4gICAgICAgIHRoaXMuZWRpdG9yTGFuZ3VhZ2VDaGFuZ2VkLmVtaXQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0IGxhbmd1YWdlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2xhbmd1YWdlO1xuICB9XG5cbiAgLyoqXG4gICAqIHJlZ2lzdGVyTGFuZ3VhZ2U/OiBmdW5jdGlvblxuICAgKiBSZWdpc3RlcnMgYSBjdXN0b20gTGFuZ3VhZ2Ugd2l0aGluIHRoZSBlZGl0b3JcbiAgICovXG4gIHJlZ2lzdGVyTGFuZ3VhZ2UobGFuZ3VhZ2U6IGFueSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdyZWdpc3Rlckxhbmd1YWdlJywgbGFuZ3VhZ2UpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgdGhpcy5fZWRpdG9yLmRpc3Bvc2UoKTtcblxuICAgICAgICBmb3IgKGNvbnN0IHByb3ZpZGVyIG9mIGxhbmd1YWdlLmNvbXBsZXRpb25JdGVtUHJvdmlkZXIpIHtcbiAgICAgICAgICAvKiB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmUgKi9cbiAgICAgICAgICBwcm92aWRlci5raW5kID0gZXZhbChwcm92aWRlci5raW5kKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IG1vbmFyY2hUb2tlbnMgb2YgbGFuZ3VhZ2UubW9uYXJjaFRva2Vuc1Byb3ZpZGVyKSB7XG4gICAgICAgICAgLyogdHNsaW50OmRpc2FibGUtbmV4dC1saW5lICovXG4gICAgICAgICAgbW9uYXJjaFRva2Vuc1swXSA9IGV2YWwobW9uYXJjaFRva2Vuc1swXSk7XG4gICAgICAgIH1cbiAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5yZWdpc3Rlcih7IGlkOiBsYW5ndWFnZS5pZCB9KTtcblxuICAgICAgICBtb25hY28ubGFuZ3VhZ2VzLnNldE1vbmFyY2hUb2tlbnNQcm92aWRlcihsYW5ndWFnZS5pZCwge1xuICAgICAgICAgIHRva2VuaXplcjoge1xuICAgICAgICAgICAgcm9vdDogbGFuZ3VhZ2UubW9uYXJjaFRva2Vuc1Byb3ZpZGVyLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIERlZmluZSBhIG5ldyB0aGVtZSB0aGF0IGNvbnN0YWlucyBvbmx5IHJ1bGVzIHRoYXQgbWF0Y2ggdGhpcyBsYW5ndWFnZVxuICAgICAgICBtb25hY28uZWRpdG9yLmRlZmluZVRoZW1lKGxhbmd1YWdlLmN1c3RvbVRoZW1lLmlkLCBsYW5ndWFnZS5jdXN0b21UaGVtZS50aGVtZSk7XG4gICAgICAgIHRoaXMuX3RoZW1lID0gbGFuZ3VhZ2UuY3VzdG9tVGhlbWUuaWQ7XG5cbiAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5yZWdpc3RlckNvbXBsZXRpb25JdGVtUHJvdmlkZXIobGFuZ3VhZ2UuaWQsIHtcbiAgICAgICAgICBwcm92aWRlQ29tcGxldGlvbkl0ZW1zOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbGFuZ3VhZ2UuY29tcGxldGlvbkl0ZW1Qcm92aWRlcjtcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBjc3M6IEhUTUxTdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICBjc3MudHlwZSA9ICd0ZXh0L2Nzcyc7XG4gICAgICAgIGNzcy5pbm5lckhUTUwgPSBsYW5ndWFnZS5tb25hcmNoVG9rZW5zUHJvdmlkZXJDU1M7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY3NzKTtcbiAgICAgICAgdGhpcy5lZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZC5lbWl0KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHN0eWxlPzogc3RyaW5nXG4gICAqIGNzcyBzdHlsZSBvZiB0aGUgZWRpdG9yIG9uIHRoZSBwYWdlXG4gICAqL1xuICBASW5wdXQoJ2VkaXRvclN0eWxlJylcbiAgc2V0IGVkaXRvclN0eWxlKGVkaXRvclN0eWxlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9lZGl0b3JTdHlsZSA9IGVkaXRvclN0eWxlO1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdzZXRFZGl0b3JTdHlsZScsIHsgbGFuZ3VhZ2U6IHRoaXMuX2xhbmd1YWdlLCB0aGVtZTogdGhpcy5fdGhlbWUsIHN0eWxlOiBlZGl0b3JTdHlsZSB9KTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lckRpdjogSFRNTERpdkVsZW1lbnQgPSB0aGlzLl9lZGl0b3JDb250YWluZXIubmF0aXZlRWxlbWVudDtcbiAgICAgICAgY29udGFpbmVyRGl2LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBlZGl0b3JTdHlsZSk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZTogc3RyaW5nID0gdGhpcy5fZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgIHRoaXMuX2VkaXRvci5kaXNwb3NlKCk7XG4gICAgICAgIGNvbnN0IG15RGl2OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50O1xuICAgICAgICB0aGlzLl9lZGl0b3IgPSBtb25hY28uZWRpdG9yLmNyZWF0ZShcbiAgICAgICAgICBteURpdixcbiAgICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB2YWx1ZTogY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICBsYW5ndWFnZTogdGhpcy5fbGFuZ3VhZ2UsXG4gICAgICAgICAgICAgIHRoZW1lOiB0aGlzLl90aGVtZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0aGlzLmVkaXRvck9wdGlvbnMsXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fZWRpdG9yLmdldE1vZGVsKCkub25EaWRDaGFuZ2VDb250ZW50KChlOiBhbnkpID0+IHtcbiAgICAgICAgICB0aGlzLl9mcm9tRWRpdG9yID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLndyaXRlVmFsdWUodGhpcy5fZWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0IGVkaXRvclN0eWxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRvclN0eWxlO1xuICB9XG5cbiAgLyoqXG4gICAqIHRoZW1lPzogc3RyaW5nXG4gICAqIFRoZW1lIHRvIGJlIGFwcGxpZWQgdG8gZWRpdG9yXG4gICAqL1xuICBASW5wdXQoJ3RoZW1lJylcbiAgc2V0IHRoZW1lKHRoZW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLl90aGVtZSA9IHRoZW1lO1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdzZXRFZGl0b3JPcHRpb25zJywgeyB0aGVtZSB9KTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICAgIHRoaXMuX2VkaXRvci51cGRhdGVPcHRpb25zKHsgdGhlbWUgfSk7XG4gICAgICAgIHRoaXMuZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXQgdGhlbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fdGhlbWU7XG4gIH1cblxuICAvKipcbiAgICogZnVsbFNjcmVlbktleUJpbmRpbmc/OiBudW1iZXJcbiAgICogU2VlIGhlcmUgZm9yIGtleSBiaW5kaW5ncyBodHRwczovL21pY3Jvc29mdC5naXRodWIuaW8vbW9uYWNvLWVkaXRvci9hcGkvZW51bXMvbW9uYWNvLmtleWNvZGUuaHRtbFxuICAgKiBTZXRzIHRoZSBLZXlDb2RlIGZvciBzaG9ydGN1dHRpbmcgdG8gRnVsbHNjcmVlbiBtb2RlXG4gICAqL1xuICBASW5wdXQoJ2Z1bGxTY3JlZW5LZXlCaW5kaW5nJylcbiAgc2V0IGZ1bGxTY3JlZW5LZXlCaW5kaW5nKGtleWNvZGU6IG51bWJlcltdKSB7XG4gICAgdGhpcy5fa2V5Y29kZSA9IGtleWNvZGU7XG4gIH1cbiAgZ2V0IGZ1bGxTY3JlZW5LZXlCaW5kaW5nKCk6IG51bWJlcltdIHtcbiAgICByZXR1cm4gdGhpcy5fa2V5Y29kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBlZGl0b3JPcHRpb25zPzogb2JqZWN0XG4gICAqIE9wdGlvbnMgdXNlZCBvbiBlZGl0b3IgaW5zdGFudGlhdGlvbi4gQXZhaWxhYmxlIG9wdGlvbnMgbGlzdGVkIGhlcmU6XG4gICAqIGh0dHBzOi8vbWljcm9zb2Z0LmdpdGh1Yi5pby9tb25hY28tZWRpdG9yL2FwaS9pbnRlcmZhY2VzL21vbmFjby5lZGl0b3IuaWVkaXRvcm9wdGlvbnMuaHRtbFxuICAgKi9cbiAgQElucHV0KCdlZGl0b3JPcHRpb25zJylcbiAgc2V0IGVkaXRvck9wdGlvbnMoZWRpdG9yT3B0aW9uczogYW55KSB7XG4gICAgdGhpcy5fZWRpdG9yT3B0aW9ucyA9IGVkaXRvck9wdGlvbnM7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3NldEVkaXRvck9wdGlvbnMnLCBlZGl0b3JPcHRpb25zKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICAgIHRoaXMuX2VkaXRvci51cGRhdGVPcHRpb25zKGVkaXRvck9wdGlvbnMpO1xuICAgICAgICB0aGlzLmVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkLmVtaXQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0IGVkaXRvck9wdGlvbnMoKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdG9yT3B0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBsYXlvdXQgbWV0aG9kIHRoYXQgY2FsbHMgbGF5b3V0IG1ldGhvZCBvZiBlZGl0b3IgYW5kIGluc3RydWN0cyB0aGUgZWRpdG9yIHRvIHJlbWVhc3VyZSBpdHMgY29udGFpbmVyXG4gICAqL1xuICBsYXlvdXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2xheW91dCcpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgdGhpcy5fZWRpdG9yLmxheW91dCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGlmIGluIEVsZWN0cm9uIG1vZGUgb3Igbm90XG4gICAqL1xuICBnZXQgaXNFbGVjdHJvbkFwcCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNFbGVjdHJvbkFwcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGlmIGluIEZ1bGwgU2NyZWVuIE1vZGUgb3Igbm90XG4gICAqL1xuICBnZXQgaXNGdWxsU2NyZWVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc0Z1bGxTY3JlZW47XG4gIH1cblxuICAvKipcbiAgICogc2V0RWRpdG9yTm9kZU1vZHVsZURpck92ZXJyaWRlIGZ1bmN0aW9uIHRoYXQgb3ZlcnJpZGVzIHdoZXJlIHRvIGxvb2tcbiAgICogZm9yIHRoZSBlZGl0b3Igbm9kZV9tb2R1bGUuIFVzZWQgaW4gdGVzdHMgZm9yIEVsZWN0cm9uIG9yIGFueXdoZXJlIHRoYXQgdGhlXG4gICAqIG5vZGVfbW9kdWxlcyBhcmUgbm90IGluIHRoZSBleHBlY3RlZCBsb2NhdGlvbi5cbiAgICovXG4gIHNldEVkaXRvck5vZGVNb2R1bGVEaXJPdmVycmlkZShkaXJPdmVycmlkZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZWRpdG9yTm9kZU1vZHVsZURpck92ZXJyaWRlID0gZGlyT3ZlcnJpZGU7XG4gICAgdGhpcy5fYXBwUGF0aCA9IGRpck92ZXJyaWRlO1xuICB9XG5cbiAgLyoqXG4gICAqIG5nT25Jbml0IG9ubHkgdXNlZCBmb3IgRWxlY3Ryb24gdmVyc2lvbiBvZiBlZGl0b3JcbiAgICogVGhpcyBpcyB3aGVyZSB0aGUgd2VidmlldyBpcyBjcmVhdGVkIHRvIHNhbmRib3ggYXdheSB0aGUgZWRpdG9yXG4gICAqL1xuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICBsZXQgZWRpdG9ySFRNTDogc3RyaW5nID0gJyc7XG4gICAgaWYgKHRoaXMuX2lzRWxlY3Ryb25BcHApIHtcbiAgICAgIGVkaXRvckhUTUwgPSBgPCFET0NUWVBFIGh0bWw+XG4gICAgICAgICAgICA8aHRtbCBzdHlsZT1cImhlaWdodDoxMDAlXCI+XG4gICAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICAgICAgICA8bWV0YSBodHRwLWVxdWl2PVwiWC1VQS1Db21wYXRpYmxlXCIgY29udGVudD1cIklFPWVkZ2VcIiAvPlxuICAgICAgICAgICAgICAgIDxtZXRhIGh0dHAtZXF1aXY9XCJDb250ZW50LVR5cGVcIiBjb250ZW50PVwidGV4dC9odG1sO2NoYXJzZXQ9dXRmLThcIiA+XG4gICAgICAgICAgICAgICAgPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGRhdGEtbmFtZT1cInZzL2VkaXRvci9lZGl0b3IubWFpblwiXG4gICAgICAgICAgICAgICAgICAgIGhyZWY9XCJmaWxlOi8vJHt0aGlzLl9lZGl0b3JOb2RlTW9kdWxlRGlyT3ZlcnJpZGV9L2Fzc2V0cy9tb25hY28vdnMvZWRpdG9yL2VkaXRvci5tYWluLmNzc1wiPlxuICAgICAgICAgICAgPC9oZWFkPlxuICAgICAgICAgICAgPGJvZHkgc3R5bGU9XCJoZWlnaHQ6MTAwJTt3aWR0aDogMTAwJTttYXJnaW46IDA7cGFkZGluZzogMDtvdmVyZmxvdzogaGlkZGVuO1wiPlxuICAgICAgICAgICAgPGRpdiBpZD1cIiR7dGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJ9XCIgc3R5bGU9XCJ3aWR0aDoxMDAlO2hlaWdodDoxMDAlOyR7dGhpcy5fZWRpdG9yU3R5bGV9XCI+PC9kaXY+XG4gICAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgaXBjUmVuZGVyZXIgb2YgZWxlY3Ryb24gZm9yIGNvbW11bmljYXRpb25cbiAgICAgICAgICAgICAgICBjb25zdCB7aXBjUmVuZGVyZXJ9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKTtcbiAgICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgICAgPHNjcmlwdCBzcmM9XCJmaWxlOi8vJHt0aGlzLl9lZGl0b3JOb2RlTW9kdWxlRGlyT3ZlcnJpZGV9L2Fzc2V0cy9tb25hY28vdnMvbG9hZGVyLmpzXCI+PC9zY3JpcHQ+XG4gICAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgICAgIHZhciBlZGl0b3I7XG4gICAgICAgICAgICAgICAgdmFyIHRoZW1lID0gJyR7dGhpcy5fdGhlbWV9JztcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSAnJHt0aGlzLl92YWx1ZX0nO1xuXG4gICAgICAgICAgICAgICAgcmVxdWlyZS5jb25maWcoe1xuICAgICAgICAgICAgICAgICAgICBiYXNlVXJsOiAnJHt0aGlzLl9hcHBQYXRofS9hc3NldHMvbW9uYWNvJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHNlbGYubW9kdWxlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHNlbGYucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIHJlcXVpcmUoWyd2cy9lZGl0b3IvZWRpdG9yLm1haW4nXSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyXG4gICAgICAgICAgICAgICAgICAgIH0nKSwgT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYW5ndWFnZTogJyR7dGhpcy5sYW5ndWFnZX0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICcke3RoaXMuX3RoZW1lfScsXG4gICAgICAgICAgICAgICAgICAgIH0sICR7SlNPTi5zdHJpbmdpZnkodGhpcy5lZGl0b3JPcHRpb25zKX0pKTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmdldE1vZGVsKCkub25EaWRDaGFuZ2VDb250ZW50KCAoZSk9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwib25FZGl0b3JDb250ZW50Q2hhbmdlXCIsIGVkaXRvci5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5hZGRBY3Rpb24oe1xuICAgICAgICAgICAgICAgICAgICAgIC8vIEFuIHVuaXF1ZSBpZGVudGlmaWVyIG9mIHRoZSBjb250cmlidXRlZCBhY3Rpb24uXG4gICAgICAgICAgICAgICAgICAgICAgaWQ6ICdmdWxsU2NyZWVuJyxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBBIGxhYmVsIG9mIHRoZSBhY3Rpb24gdGhhdCB3aWxsIGJlIHByZXNlbnRlZCB0byB0aGUgdXNlci5cbiAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0Z1bGwgU2NyZWVuJyxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBBbiBvcHRpb25hbCBhcnJheSBvZiBrZXliaW5kaW5ncyBmb3IgdGhlIGFjdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0TWVudUdyb3VwSWQ6ICduYXZpZ2F0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgICBrZXliaW5kaW5nczogWyR7dGhpcy5fa2V5Y29kZX1dLFxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHRNZW51T3JkZXI6IDEuNSxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBNZXRob2QgdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGFjdGlvbiBpcyB0cmlnZ2VyZWQuXG4gICAgICAgICAgICAgICAgICAgICAgLy8gQHBhcmFtIGVkaXRvciBUaGUgZWRpdG9yIGluc3RhbmNlIGlzIHBhc3NlZCBpbiBhcyBhIGNvbnZpbmllbmNlXG4gICAgICAgICAgICAgICAgICAgICAgcnVuOiBmdW5jdGlvbihlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVkaXRvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke3RoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyfScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWRpdG9yRGl2LndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmFkZEFjdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gQW4gdW5pcXVlIGlkZW50aWZpZXIgb2YgdGhlIGNvbnRyaWJ1dGVkIGFjdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgICBpZDogJ2V4aXRmdWxsU2NyZWVuJyxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBBIGxhYmVsIG9mIHRoZSBhY3Rpb24gdGhhdCB3aWxsIGJlIHByZXNlbnRlZCB0byB0aGUgdXNlci5cbiAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0V4aXQgRnVsbCBTY3JlZW4nLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIEFuIG9wdGlvbmFsIGFycmF5IG9mIGtleWJpbmRpbmdzIGZvciB0aGUgYWN0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHRNZW51R3JvdXBJZDogJ25hdmlnYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICAgIGtleWJpbmRpbmdzOiBbOV0sXG4gICAgICAgICAgICAgICAgICAgICAgY29udGV4dE1lbnVPcmRlcjogMS41LFxuICAgICAgICAgICAgICAgICAgICAgIC8vIE1ldGhvZCB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgd2hlbiB0aGUgYWN0aW9uIGlzIHRyaWdnZXJlZC5cbiAgICAgICAgICAgICAgICAgICAgICAvLyBAcGFyYW0gZWRpdG9yIFRoZSBlZGl0b3IgaW5zdGFuY2UgaXMgcGFzc2VkIGluIGFzIGEgY29udmluaWVuY2VcbiAgICAgICAgICAgICAgICAgICAgICBydW46IGZ1bmN0aW9uKGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWRpdG9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7dGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJ9Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC53ZWJraXRFeGl0RnVsbHNjcmVlbigpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJlZGl0b3JJbml0aWFsaXplZFwiLCB0aGlzLl9lZGl0b3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIGJhY2sgdGhlIHZhbHVlIGluIHRoZSBlZGl0b3IgdG8gdGhlIG1haW52aWV3XG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ2dldEVkaXRvckNvbnRlbnQnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwiZWRpdG9yQ29udGVudFwiLCBlZGl0b3IuZ2V0VmFsdWUoKSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIHZhbHVlIG9mIHRoZSBlZGl0b3IgZnJvbSB3aGF0IHdhcyBzZW50IGZyb20gdGhlIG1haW52aWV3XG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ3NldEVkaXRvckNvbnRlbnQnLCBmdW5jdGlvbihldmVudCwgZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLnNldFZhbHVlKGRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBzdHlsZSBvZiB0aGUgZWRpdG9yIGNvbnRhaW5lciBkaXZcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignc2V0RWRpdG9yU3R5bGUnLCBmdW5jdGlvbihldmVudCwgZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlZGl0b3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn0nKTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yRGl2LnN0eWxlID0gZGF0YS5zdHlsZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IgPSBtb25hY28uZWRpdG9yLmNyZWF0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHtcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lclxuICAgICAgICAgICAgICAgICAgICB9JyksIE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGN1cnJlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhbmd1YWdlOiBkYXRhLmxhbmd1YWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6IGRhdGEudGhlbWUsXG4gICAgICAgICAgICAgICAgICAgIH0sICR7SlNPTi5zdHJpbmdpZnkodGhpcy5lZGl0b3JPcHRpb25zKX0pKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgb3B0aW9ucyBvZiB0aGUgZWRpdG9yIGZyb20gd2hhdCB3YXMgc2VudCBmcm9tIHRoZSBtYWludmlld1xuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdzZXRFZGl0b3JPcHRpb25zJywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpe1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IudXBkYXRlT3B0aW9ucyhkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIuc2VuZFRvSG9zdChcImVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkXCIsICcnKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgbGFuZ3VhZ2Ugb2YgdGhlIGVkaXRvciBmcm9tIHdoYXQgd2FzIHNlbnQgZnJvbSB0aGUgbWFpbnZpZXdcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignc2V0TGFuZ3VhZ2UnLCBmdW5jdGlvbihldmVudCwgZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50VmFsdWUgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yID0gbW9uYWNvLmVkaXRvci5jcmVhdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJcbiAgICAgICAgICAgICAgICAgICAgfScpLCBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYW5ndWFnZTogZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiB0aGVtZSxcbiAgICAgICAgICAgICAgICAgICAgfSwgJHtKU09OLnN0cmluZ2lmeSh0aGlzLmVkaXRvck9wdGlvbnMpfSkpO1xuICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwiZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWRcIiwgJycpO1xuICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwiZWRpdG9yTGFuZ3VhZ2VDaGFuZ2VkXCIsICcnKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHJlZ2lzdGVyIGEgbmV3IGxhbmd1YWdlIHdpdGggZWRpdG9yXG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ3JlZ2lzdGVyTGFuZ3VhZ2UnLCBmdW5jdGlvbihldmVudCwgZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50VmFsdWUgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmRpc3Bvc2UoKTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuY29tcGxldGlvbkl0ZW1Qcm92aWRlci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByb3ZpZGVyID0gZGF0YS5jb21wbGV0aW9uSXRlbVByb3ZpZGVyW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXIua2luZCA9IGV2YWwocHJvdmlkZXIua2luZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLm1vbmFyY2hUb2tlbnNQcm92aWRlci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1vbmFyY2hUb2tlbnMgPSBkYXRhLm1vbmFyY2hUb2tlbnNQcm92aWRlcltpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vbmFyY2hUb2tlbnNbMF0gPSBldmFsKG1vbmFyY2hUb2tlbnNbMF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG1vbmFjby5sYW5ndWFnZXMucmVnaXN0ZXIoeyBpZDogZGF0YS5pZCB9KTtcblxuICAgICAgICAgICAgICAgICAgICBtb25hY28ubGFuZ3VhZ2VzLnNldE1vbmFyY2hUb2tlbnNQcm92aWRlcihkYXRhLmlkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbml6ZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290OiBkYXRhLm1vbmFyY2hUb2tlbnNQcm92aWRlclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBEZWZpbmUgYSBuZXcgdGhlbWUgdGhhdCBjb25zdGFpbnMgb25seSBydWxlcyB0aGF0IG1hdGNoIHRoaXMgbGFuZ3VhZ2VcbiAgICAgICAgICAgICAgICAgICAgbW9uYWNvLmVkaXRvci5kZWZpbmVUaGVtZShkYXRhLmN1c3RvbVRoZW1lLmlkLCBkYXRhLmN1c3RvbVRoZW1lLnRoZW1lKTtcbiAgICAgICAgICAgICAgICAgICAgdGhlbWUgPSBkYXRhLmN1c3RvbVRoZW1lLmlkO1xuXG4gICAgICAgICAgICAgICAgICAgIG1vbmFjby5sYW5ndWFnZXMucmVnaXN0ZXJDb21wbGV0aW9uSXRlbVByb3ZpZGVyKGRhdGEuaWQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVDb21wbGV0aW9uSXRlbXM6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5jb21wbGV0aW9uSXRlbVByb3ZpZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBjc3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gICAgICAgICAgICAgICAgICAgIGNzcy50eXBlID0gXCJ0ZXh0L2Nzc1wiO1xuICAgICAgICAgICAgICAgICAgICBjc3MuaW5uZXJIVE1MID0gZGF0YS5tb25hcmNoVG9rZW5zUHJvdmlkZXJDU1M7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY3NzKTtcblxuICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwiZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWRcIiwgJycpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gSW5zdHJ1Y3QgdGhlIGVkaXRvciB0byByZW1lYXN1cmUgaXRzIGNvbnRhaW5lclxuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdsYXlvdXQnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IubGF5b3V0KCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJbnN0cnVjdCB0aGUgZWRpdG9yIGdvIHRvIGZ1bGwgc2NyZWVuIG1vZGVcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignc2hvd0Z1bGxTY3JlZW5FZGl0b3InLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBlZGl0b3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn0nKTtcbiAgICAgICAgICAgICAgICAgIGVkaXRvckRpdi53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gSW5zdHJ1Y3QgdGhlIGVkaXRvciBleGl0IGZ1bGwgc2NyZWVuIG1vZGVcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignZXhpdEZ1bGxTY3JlZW5FZGl0b3InLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBlZGl0b3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn0nKTtcbiAgICAgICAgICAgICAgICAgIGVkaXRvckRpdi53ZWJraXRFeGl0RnVsbHNjcmVlbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ2Rpc3Bvc2UnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIG5lZWQgdG8gbWFudWFsbHkgcmVzaXplIHRoZSBlZGl0b3IgYW55IHRpbWUgdGhlIHdpbmRvdyBzaXplXG4gICAgICAgICAgICAgICAgLy8gY2hhbmdlcy4gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L21vbmFjby1lZGl0b3IvaXNzdWVzLzI4XG4gICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZnVuY3Rpb24gcmVzaXplRWRpdG9yKCkge1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IubGF5b3V0KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgICAgIDwvaHRtbD5gO1xuXG4gICAgICAvLyBkeW5hbWljYWxseSBjcmVhdGUgdGhlIEVsZWN0cm9uIFdlYnZpZXcgRWxlbWVudFxuICAgICAgLy8gdGhpcyB3aWxsIHNhbmRib3ggdGhlIG1vbmFjbyBjb2RlIGludG8gaXRzIG93biBET00gYW5kIGl0cyBvd25cbiAgICAgIC8vIGphdmFzY3JpcHQgaW5zdGFuY2UuIE5lZWQgdG8gZG8gdGhpcyB0byBhdm9pZCBwcm9ibGVtcyB3aXRoIG1vbmFjb1xuICAgICAgLy8gdXNpbmcgQU1EIFJlcXVpcmVzIGFuZCBFbGVjdHJvbiB1c2luZyBOb2RlIFJlcXVpcmVzXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9tb25hY28tZWRpdG9yL2lzc3Vlcy85MFxuICAgICAgdGhpcy5fd2VidmlldyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3dlYnZpZXcnKTtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2V0QXR0cmlidXRlKCdub2RlaW50ZWdyYXRpb24nLCAndHJ1ZScpO1xuICAgICAgdGhpcy5fd2Vidmlldy5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGV3ZWJzZWN1cml0eScsICd0cnVlJyk7XG4gICAgICAvLyB0YWtlIHRoZSBodG1sIGNvbnRlbnQgZm9yIHRoZSB3ZWJ2aWV3IGFuZCBiYXNlNjQgZW5jb2RlIGl0IGFuZCB1c2UgYXMgdGhlIHNyYyB0YWdcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2V0QXR0cmlidXRlKCdzcmMnLCAnZGF0YTp0ZXh0L2h0bWw7YmFzZTY0LCcgKyB3aW5kb3cuYnRvYShlZGl0b3JIVE1MKSk7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnZGlzcGxheTppbmxpbmUtZmxleDsgd2lkdGg6MTAwJTsgaGVpZ2h0OjEwMCUnKTtcbiAgICAgIC8vIHRvIGRlYnVnOlxuICAgICAgLy8gIHRoaXMuX3dlYnZpZXcuYWRkRXZlbnRMaXN0ZW5lcignZG9tLXJlYWR5JywgKCkgPT4ge1xuICAgICAgLy8gICAgIHRoaXMuX3dlYnZpZXcub3BlbkRldlRvb2xzKCk7XG4gICAgICAvLyAgfSk7XG5cbiAgICAgIC8vIFByb2Nlc3MgdGhlIGRhdGEgZnJvbSB0aGUgd2Vidmlld1xuICAgICAgdGhpcy5fd2Vidmlldy5hZGRFdmVudExpc3RlbmVyKCdpcGMtbWVzc2FnZScsIChldmVudDogYW55KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5jaGFubmVsID09PSAnZWRpdG9yQ29udGVudCcpIHtcbiAgICAgICAgICB0aGlzLl9mcm9tRWRpdG9yID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLndyaXRlVmFsdWUoZXZlbnQuYXJnc1swXSk7XG4gICAgICAgICAgdGhpcy5fc3ViamVjdC5uZXh0KHRoaXMuX3ZhbHVlKTtcbiAgICAgICAgICB0aGlzLl9zdWJqZWN0LmNvbXBsZXRlKCk7XG4gICAgICAgICAgdGhpcy5fc3ViamVjdCA9IG5ldyBTdWJqZWN0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY2hhbm5lbCA9PT0gJ29uRWRpdG9yQ29udGVudENoYW5nZScpIHtcbiAgICAgICAgICB0aGlzLl9mcm9tRWRpdG9yID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLndyaXRlVmFsdWUoZXZlbnQuYXJnc1swXSk7XG4gICAgICAgICAgaWYgKHRoaXMuaW5pdGlhbENvbnRlbnRDaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbENvbnRlbnRDaGFuZ2UgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubGF5b3V0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmNoYW5uZWwgPT09ICdlZGl0b3JJbml0aWFsaXplZCcpIHtcbiAgICAgICAgICB0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgdGhpcy5fZWRpdG9yUHJveHkgPSB0aGlzLndyYXBFZGl0b3JDYWxscyh0aGlzLl9lZGl0b3IpO1xuICAgICAgICAgIHRoaXMuZWRpdG9ySW5pdGlhbGl6ZWQuZW1pdCh0aGlzLl9lZGl0b3JQcm94eSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY2hhbm5lbCA9PT0gJ2VkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkJykge1xuICAgICAgICAgIHRoaXMuZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmNoYW5uZWwgPT09ICdlZGl0b3JMYW5ndWFnZUNoYW5nZWQnKSB7XG4gICAgICAgICAgdGhpcy5lZGl0b3JMYW5ndWFnZUNoYW5nZWQuZW1pdCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gYXBwZW5kIHRoZSB3ZWJ2aWV3IHRvIHRoZSBET01cbiAgICAgIHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX3dlYnZpZXcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBuZ0FmdGVyVmlld0luaXQgb25seSB1c2VkIGZvciBicm93c2VyIHZlcnNpb24gb2YgZWRpdG9yXG4gICAqIFRoaXMgaXMgd2hlcmUgdGhlIEFNRCBMb2FkZXIgc2NyaXB0cyBhcmUgYWRkZWQgdG8gdGhlIGJyb3dzZXIgYW5kIHRoZSBlZGl0b3Igc2NyaXB0cyBhcmUgXCJyZXF1aXJlZFwiXG4gICAqL1xuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9pc0VsZWN0cm9uQXBwKSB7XG4gICAgICBsb2FkTW9uYWNvKCk7XG4gICAgICB3YWl0VW50aWxNb25hY29SZWFkeSgpXG4gICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95KSlcbiAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5pbml0TW9uYWNvKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtZXJnZShcbiAgICAgIGZyb21FdmVudCh3aW5kb3csICdyZXNpemUnKS5waXBlKGRlYm91bmNlVGltZSgxMDApKSxcbiAgICAgIHRoaXMuX3dpZHRoU3ViamVjdC5hc09ic2VydmFibGUoKS5waXBlKGRpc3RpbmN0VW50aWxDaGFuZ2VkKCkpLFxuICAgICAgdGhpcy5faGVpZ2h0U3ViamVjdC5hc09ic2VydmFibGUoKS5waXBlKGRpc3RpbmN0VW50aWxDaGFuZ2VkKCkpLFxuICAgIClcbiAgICAgIC5waXBlKFxuICAgICAgICB0YWtlVW50aWwodGhpcy5fZGVzdHJveSksXG4gICAgICAgIGRlYm91bmNlVGltZSgxMDApLFxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMubGF5b3V0KCk7XG4gICAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgfSk7XG4gICAgdGltZXIoNTAwLCAyNTApXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveSkpXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2VsZW1lbnRSZWYgJiYgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSB7XG4gICAgICAgICAgdGhpcy5fd2lkdGhTdWJqZWN0Lm5leHQoKDxIVE1MRWxlbWVudD50aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoKTtcbiAgICAgICAgICB0aGlzLl9oZWlnaHRTdWJqZWN0Lm5leHQoKDxIVE1MRWxlbWVudD50aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYuZGV0YWNoKCk7XG4gICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnZGlzcG9zZScpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICB0aGlzLl9lZGl0b3IuZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9kZXN0cm95Lm5leHQodHJ1ZSk7XG4gICAgdGhpcy5fZGVzdHJveS51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIHNob3dGdWxsU2NyZWVuRWRpdG9yIHJlcXVlc3QgZm9yIGZ1bGwgc2NyZWVuIG9mIENvZGUgRWRpdG9yIGJhc2VkIG9uIGl0cyBicm93c2VyIHR5cGUuXG4gICAqL1xuICBwdWJsaWMgc2hvd0Z1bGxTY3JlZW5FZGl0b3IoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3Nob3dGdWxsU2NyZWVuRWRpdG9yJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBjb2RlRWRpdG9yRWxlbWVudDogSFRNTERpdkVsZW1lbnQgPSB0aGlzLl9lZGl0b3JDb250YWluZXIubmF0aXZlRWxlbWVudCBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICAgICAgY29uc3QgZnVsbFNjcmVlbk1hcDogb2JqZWN0ID0ge1xuICAgICAgICAgIC8vIENocm9tZVxuICAgICAgICAgIHJlcXVlc3RGdWxsc2NyZWVuOiAoKSA9PiBjb2RlRWRpdG9yRWxlbWVudC5yZXF1ZXN0RnVsbHNjcmVlbigpLFxuICAgICAgICAgIC8vIFNhZmFyaVxuICAgICAgICAgIHdlYmtpdFJlcXVlc3RGdWxsc2NyZWVuOiAoKSA9PiAoPGFueT5jb2RlRWRpdG9yRWxlbWVudCkud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgICAvLyBJRVxuICAgICAgICAgIG1zUmVxdWVzdEZ1bGxzY3JlZW46ICgpID0+ICg8YW55PmNvZGVFZGl0b3JFbGVtZW50KS5tc1JlcXVlc3RGdWxsc2NyZWVuKCksXG4gICAgICAgICAgLy8gRmlyZWZveFxuICAgICAgICAgIG1velJlcXVlc3RGdWxsU2NyZWVuOiAoKSA9PiAoPGFueT5jb2RlRWRpdG9yRWxlbWVudCkubW96UmVxdWVzdEZ1bGxTY3JlZW4oKSxcbiAgICAgICAgfTtcblxuICAgICAgICBmb3IgKGNvbnN0IGhhbmRsZXIgb2YgT2JqZWN0LmtleXMoZnVsbFNjcmVlbk1hcCkpIHtcbiAgICAgICAgICBpZiAoY29kZUVkaXRvckVsZW1lbnRbaGFuZGxlcl0pIHtcbiAgICAgICAgICAgIGZ1bGxTY3JlZW5NYXBbaGFuZGxlcl0oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5faXNGdWxsU2NyZWVuID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBleGl0RnVsbFNjcmVlbkVkaXRvciByZXF1ZXN0IHRvIGV4aXQgZnVsbCBzY3JlZW4gb2YgQ29kZSBFZGl0b3IgYmFzZWQgb24gaXRzIGJyb3dzZXIgdHlwZS5cbiAgICovXG4gIHB1YmxpYyBleGl0RnVsbFNjcmVlbkVkaXRvcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnZXhpdEZ1bGxTY3JlZW5FZGl0b3InKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGV4aXRGdWxsU2NyZWVuTWFwOiBvYmplY3QgPSB7XG4gICAgICAgICAgLy8gQ2hyb21lXG4gICAgICAgICAgZXhpdEZ1bGxzY3JlZW46ICgpID0+IGRvY3VtZW50LmV4aXRGdWxsc2NyZWVuKCksXG4gICAgICAgICAgLy8gU2FmYXJpXG4gICAgICAgICAgd2Via2l0RXhpdEZ1bGxzY3JlZW46ICgpID0+ICg8YW55PmRvY3VtZW50KS53ZWJraXRFeGl0RnVsbHNjcmVlbigpLFxuICAgICAgICAgIC8vIEZpcmVmb3hcbiAgICAgICAgICBtb3pDYW5jZWxGdWxsU2NyZWVuOiAoKSA9PiAoPGFueT5kb2N1bWVudCkubW96Q2FuY2VsRnVsbFNjcmVlbigpLFxuICAgICAgICAgIC8vIElFXG4gICAgICAgICAgbXNFeGl0RnVsbHNjcmVlbjogKCkgPT4gKDxhbnk+ZG9jdW1lbnQpLm1zRXhpdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgfTtcblxuICAgICAgICBmb3IgKGNvbnN0IGhhbmRsZXIgb2YgT2JqZWN0LmtleXMoZXhpdEZ1bGxTY3JlZW5NYXApKSB7XG4gICAgICAgICAgaWYgKGRvY3VtZW50W2hhbmRsZXJdKSB7XG4gICAgICAgICAgICBleGl0RnVsbFNjcmVlbk1hcFtoYW5kbGVyXSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9pc0Z1bGxTY3JlZW4gPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBhZGRGdWxsU2NyZWVuTW9kZUNvbW1hbmQgdXNlZCB0byBhZGQgdGhlIGZ1bGxzY3JlZW4gb3B0aW9uIHRvIHRoZSBjb250ZXh0IG1lbnVcbiAgICovXG4gIHByaXZhdGUgYWRkRnVsbFNjcmVlbk1vZGVDb21tYW5kKCk6IHZvaWQge1xuICAgIHRoaXMuX2VkaXRvci5hZGRBY3Rpb24oe1xuICAgICAgLy8gQW4gdW5pcXVlIGlkZW50aWZpZXIgb2YgdGhlIGNvbnRyaWJ1dGVkIGFjdGlvbi5cbiAgICAgIGlkOiAnZnVsbFNjcmVlbicsXG4gICAgICAvLyBBIGxhYmVsIG9mIHRoZSBhY3Rpb24gdGhhdCB3aWxsIGJlIHByZXNlbnRlZCB0byB0aGUgdXNlci5cbiAgICAgIGxhYmVsOiAnRnVsbCBTY3JlZW4nLFxuICAgICAgLy8gQW4gb3B0aW9uYWwgYXJyYXkgb2Yga2V5YmluZGluZ3MgZm9yIHRoZSBhY3Rpb24uXG4gICAgICBjb250ZXh0TWVudUdyb3VwSWQ6ICduYXZpZ2F0aW9uJyxcbiAgICAgIGtleWJpbmRpbmdzOiB0aGlzLl9rZXljb2RlLFxuICAgICAgY29udGV4dE1lbnVPcmRlcjogMS41LFxuICAgICAgLy8gTWV0aG9kIHRoYXQgd2lsbCBiZSBleGVjdXRlZCB3aGVuIHRoZSBhY3Rpb24gaXMgdHJpZ2dlcmVkLlxuICAgICAgLy8gQHBhcmFtIGVkaXRvciBUaGUgZWRpdG9yIGluc3RhbmNlIGlzIHBhc3NlZCBpbiBhcyBhIGNvbnZpbmllbmNlXG4gICAgICBydW46IChlZDogYW55KSA9PiB7XG4gICAgICAgIHRoaXMuc2hvd0Z1bGxTY3JlZW5FZGl0b3IoKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogd3JhcEVkaXRvckNhbGxzIHVzZWQgdG8gcHJveHkgYWxsIHRoZSBjYWxscyB0byB0aGUgbW9uYWNvIGVkaXRvclxuICAgKiBGb3IgY2FsbHMgZm9yIEVsZWN0cm9uIHVzZSB0aGlzIHRvIGNhbGwgdGhlIGVkaXRvciBpbnNpZGUgdGhlIHdlYnZpZXdcbiAgICovXG4gIHByaXZhdGUgd3JhcEVkaXRvckNhbGxzKG9iajogYW55KTogYW55IHtcbiAgICBjb25zdCB0aGF0OiBhbnkgPSB0aGlzO1xuICAgIGNvbnN0IGhhbmRsZXI6IGFueSA9IHtcbiAgICAgIGdldCh0YXJnZXQ6IGFueSwgcHJvcEtleTogYW55LCByZWNlaXZlcjogYW55KTogYW55IHtcbiAgICAgICAgcmV0dXJuIGFzeW5jICguLi5hcmdzOiBhbnkpOiBQcm9taXNlPGFueT4gPT4ge1xuICAgICAgICAgIGlmICh0aGF0Ll9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgaWYgKHRoYXQuX3dlYnZpZXcpIHtcbiAgICAgICAgICAgICAgY29uc3QgZXhlY3V0ZUphdmFTY3JpcHQ6IChjb2RlOiBzdHJpbmcpID0+IFByb21pc2U8YW55PiA9IChjb2RlOiBzdHJpbmcpID0+XG4gICAgICAgICAgICAgICAgbmV3IFByb21pc2UoKHJlc29sdmU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgdGhhdC5fd2Vidmlldy5leGVjdXRlSmF2YVNjcmlwdChjb2RlLCByZXNvbHZlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuIGV4ZWN1dGVKYXZhU2NyaXB0KCdlZGl0b3IuJyArIHByb3BLZXkgKyAnKCcgKyBhcmdzICsgJyknKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnN0IG9yaWdNZXRob2Q6IGFueSA9IHRhcmdldFtwcm9wS2V5XTtcbiAgICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBhbnkgPSBhd2FpdCBvcmlnTWV0aG9kLmFwcGx5KHRoYXQuX2VkaXRvciwgYXJncyk7XG4gICAgICAgICAgICAgIC8vIHNpbmNlIHJ1bm5pbmcgamF2YXNjcmlwdCBjb2RlIG1hbnVhbGx5IG5lZWQgdG8gZm9yY2UgQW5ndWxhciB0byBkZXRlY3QgY2hhbmdlc1xuICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGF0LnpvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZVxuICAgICAgICAgICAgICAgICAgaWYgKCF0aGF0Ll9jaGFuZ2VEZXRlY3RvclJlZlsnZGVzdHJveWVkJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5fY2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgIH07XG4gICAgcmV0dXJuIG5ldyBQcm94eShvYmosIGhhbmRsZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIGluaXRNb25hY28gbWV0aG9kIGNyZWF0ZXMgdGhlIG1vbmFjbyBlZGl0b3IgaW50byB0aGUgQFZpZXdDaGlsZCgnZWRpdG9yQ29udGFpbmVyJylcbiAgICogYW5kIGVtaXQgdGhlIGVkaXRvckluaXRpYWxpemVkIGV2ZW50LiAgVGhpcyBpcyBvbmx5IHVzZWQgaW4gdGhlIGJyb3dzZXIgdmVyc2lvbi5cbiAgICovXG4gIHByaXZhdGUgaW5pdE1vbmFjbygpOiB2b2lkIHtcbiAgICBjb25zdCBjb250YWluZXJEaXY6IEhUTUxEaXZFbGVtZW50ID0gdGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQ7XG4gICAgY29udGFpbmVyRGl2LmlkID0gdGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXI7XG4gICAgdGhpcy5fZWRpdG9yID0gbW9uYWNvLmVkaXRvci5jcmVhdGUoXG4gICAgICBjb250YWluZXJEaXYsXG4gICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICB7XG4gICAgICAgICAgdmFsdWU6IHRoaXMuX3ZhbHVlLFxuICAgICAgICAgIGxhbmd1YWdlOiB0aGlzLmxhbmd1YWdlLFxuICAgICAgICAgIHRoZW1lOiB0aGlzLl90aGVtZSxcbiAgICAgICAgfSxcbiAgICAgICAgdGhpcy5lZGl0b3JPcHRpb25zLFxuICAgICAgKSxcbiAgICApO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fZWRpdG9yUHJveHkgPSB0aGlzLndyYXBFZGl0b3JDYWxscyh0aGlzLl9lZGl0b3IpO1xuICAgICAgdGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgdGhpcy5lZGl0b3JJbml0aWFsaXplZC5lbWl0KHRoaXMuX2VkaXRvclByb3h5KTtcbiAgICB9KTtcbiAgICB0aGlzLl9lZGl0b3IuZ2V0TW9kZWwoKS5vbkRpZENoYW5nZUNvbnRlbnQoKGU6IGFueSkgPT4ge1xuICAgICAgdGhpcy5fZnJvbUVkaXRvciA9IHRydWU7XG4gICAgICB0aGlzLndyaXRlVmFsdWUodGhpcy5fZWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICAgaWYgKHRoaXMuaW5pdGlhbENvbnRlbnRDaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5pbml0aWFsQ29udGVudENoYW5nZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmxheW91dCgpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuYWRkRnVsbFNjcmVlbk1vZGVDb21tYW5kKCk7XG4gIH1cbn1cbiJdfQ==