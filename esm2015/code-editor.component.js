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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS1lZGl0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGNvdmFsZW50L2NvZGUtZWRpdG9yLyIsInNvdXJjZXMiOlsiY29kZS1lZGl0b3IuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFlBQVksRUFHWixTQUFTLEVBQ1QsVUFBVSxFQUNWLFVBQVUsRUFDVixNQUFNLEVBQ04saUJBQWlCLEdBRWxCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxpQkFBaUIsRUFBd0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6RSxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvQyxPQUFPLEVBQUUsWUFBWSxFQUFFLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRS9FLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxVQUFVLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7TUFFakUsSUFBSTs7O0FBQVEsR0FBRyxFQUFFO0lBQ3JCLGVBQWU7QUFDakIsQ0FBQyxDQUFBOzs7O0lBR0csYUFBYSxHQUFXLENBQUM7QUFpQjdCLE1BQU0sT0FBTyxxQkFBcUI7Ozs7Ozs7SUEyRWhDLFlBQW9CLElBQVksRUFBVSxrQkFBcUMsRUFBVSxXQUF1QjtRQUE1RixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVUsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFZO1FBMUV4RyxhQUFRLEdBQXFCLElBQUksT0FBTyxFQUFXLENBQUM7UUFDcEQsa0JBQWEsR0FBb0IsSUFBSSxPQUFPLEVBQVUsQ0FBQztRQUN2RCxtQkFBYyxHQUFvQixJQUFJLE9BQU8sRUFBVSxDQUFDO1FBRXhE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Ozs7OztJQUFFLG1EQUE2Qzs7Ozs7SUFBRSw0Q0FBK0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21wb25lbnQsXG4gIElucHV0LFxuICBPdXRwdXQsXG4gIEV2ZW50RW1pdHRlcixcbiAgT25Jbml0LFxuICBBZnRlclZpZXdJbml0LFxuICBWaWV3Q2hpbGQsXG4gIEVsZW1lbnRSZWYsXG4gIGZvcndhcmRSZWYsXG4gIE5nWm9uZSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIE9uRGVzdHJveSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOR19WQUxVRV9BQ0NFU1NPUiwgQ29udHJvbFZhbHVlQWNjZXNzb3IgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBmcm9tRXZlbnQsIG1lcmdlLCB0aW1lciB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZGVib3VuY2VUaW1lLCBkaXN0aW5jdFVudGlsQ2hhbmdlZCwgdGFrZVVudGlsIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQgeyB3YWl0VW50aWxNb25hY29SZWFkeSwgbG9hZE1vbmFjbyB9IGZyb20gJy4vY29kZS1lZGl0b3IudXRpbHMnO1xuXG5jb25zdCBub29wOiBhbnkgPSAoKSA9PiB7XG4gIC8vIGVtcHR5IG1ldGhvZFxufTtcblxuLy8gY291bnRlciBmb3IgaWRzIHRvIGFsbG93IGZvciBtdWx0aXBsZSBlZGl0b3JzIG9uIG9uZSBwYWdlXG5sZXQgdW5pcXVlQ291bnRlcjogbnVtYmVyID0gMDtcbi8vIGRlY2xhcmUgYWxsIHRoZSBidWlsdCBpbiBlbGVjdHJvbiBvYmplY3RzXG5kZWNsYXJlIGNvbnN0IGVsZWN0cm9uOiBhbnk7XG5kZWNsYXJlIGNvbnN0IG1vbmFjbzogYW55O1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICd0ZC1jb2RlLWVkaXRvcicsXG4gIHRlbXBsYXRlVXJsOiAnLi9jb2RlLWVkaXRvci5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL2NvZGUtZWRpdG9yLmNvbXBvbmVudC5zY3NzJ10sXG4gIHByb3ZpZGVyczogW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxuICAgICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gVGRDb2RlRWRpdG9yQ29tcG9uZW50KSxcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIFRkQ29kZUVkaXRvckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCwgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX2Rlc3Ryb3k6IFN1YmplY3Q8Ym9vbGVhbj4gPSBuZXcgU3ViamVjdDxib29sZWFuPigpO1xuICBwcml2YXRlIF93aWR0aFN1YmplY3Q6IFN1YmplY3Q8bnVtYmVyPiA9IG5ldyBTdWJqZWN0PG51bWJlcj4oKTtcbiAgcHJpdmF0ZSBfaGVpZ2h0U3ViamVjdDogU3ViamVjdDxudW1iZXI+ID0gbmV3IFN1YmplY3Q8bnVtYmVyPigpO1xuXG4gIHByaXZhdGUgX2VkaXRvclN0eWxlOiBzdHJpbmcgPSAnd2lkdGg6MTAwJTtoZWlnaHQ6MTAwJTtib3JkZXI6MXB4IHNvbGlkIGdyZXk7JztcbiAgcHJpdmF0ZSBfYXBwUGF0aDogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgX2lzRWxlY3Ryb25BcHA6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfd2VidmlldzogYW55O1xuICBwcml2YXRlIF92YWx1ZTogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgX3RoZW1lOiBzdHJpbmcgPSAndnMnO1xuICBwcml2YXRlIF9sYW5ndWFnZTogc3RyaW5nID0gJ2phdmFzY3JpcHQnO1xuICBwcml2YXRlIF9zdWJqZWN0OiBTdWJqZWN0PHN0cmluZz4gPSBuZXcgU3ViamVjdCgpO1xuICBwcml2YXRlIF9lZGl0b3JJbm5lckNvbnRhaW5lcjogc3RyaW5nID0gJ2VkaXRvcklubmVyQ29udGFpbmVyJyArIHVuaXF1ZUNvdW50ZXIrKztcbiAgcHJpdmF0ZSBfZWRpdG9yTm9kZU1vZHVsZURpck92ZXJyaWRlOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSBfZWRpdG9yOiBhbnk7XG4gIHByaXZhdGUgX2VkaXRvclByb3h5OiBhbnk7XG4gIHByaXZhdGUgX2NvbXBvbmVudEluaXRpYWxpemVkOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX2Zyb21FZGl0b3I6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfZWRpdG9yT3B0aW9uczogYW55ID0ge307XG4gIHByaXZhdGUgX2lzRnVsbFNjcmVlbjogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9rZXljb2RlOiBhbnk7XG4gIHByaXZhdGUgX3NldFZhbHVlVGltZW91dDogYW55O1xuICBwcml2YXRlIGluaXRpYWxDb250ZW50Q2hhbmdlOiBib29sZWFuID0gdHJ1ZTtcbiAgcHJpdmF0ZSBfcmVnaXN0ZXJlZExhbmd1YWdlc1N0eWxlczogSFRNTFN0eWxlRWxlbWVudFtdID0gW107XG4gIEBWaWV3Q2hpbGQoJ2VkaXRvckNvbnRhaW5lcicsIHsgc3RhdGljOiB0cnVlIH0pIF9lZGl0b3JDb250YWluZXI6IEVsZW1lbnRSZWY7XG5cbiAgLyoqXG4gICAqIGF1dG9tYXRpY0xheW91dD86IGJvb2xlYW5cbiAgICogQGRlcHJlY2F0ZWQgaW4gZmF2b3Igb2Ygb3VyIG93biByZXNpemUgaW1wbGVtZW50YXRpb24uXG4gICAqL1xuICBASW5wdXQoJ2F1dG9tYXRpY0xheW91dCcpXG4gIHNldCBhdXRvbWF0aWNMYXlvdXQoYXV0b21hdGljTGF5b3V0OiBib29sZWFuKSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lXG4gICAgY29uc29sZS53YXJuKFxuICAgICAgJ1thdXRvbWF0aWNMYXlvdXRdIGhhcyBiZWVuIGRlcHJlY2F0ZWQgaW4gZmF2b3Igb2Ygb3VyIG93biByZXNpemUgaW1wbGVtZW50YXRpb24gYW5kIHdpbGwgYmUgcmVtb3ZlZCBvbiAzLjAuMCcsXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBlZGl0b3JJbml0aWFsaXplZDogZnVuY3Rpb24oJGV2ZW50KVxuICAgKiBFdmVudCBlbWl0dGVkIHdoZW4gZWRpdG9yIGlzIGZpcnN0IGluaXRpYWxpemVkXG4gICAqL1xuICBAT3V0cHV0KCkgZWRpdG9ySW5pdGlhbGl6ZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAvKipcbiAgICogZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQ6IGZ1bmN0aW9uKCRldmVudClcbiAgICogRXZlbnQgZW1pdHRlZCB3aGVuIGVkaXRvcidzIGNvbmZpZ3VyYXRpb24gY2hhbmdlc1xuICAgKi9cbiAgQE91dHB1dCgpIGVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIGVkaXRvckxhbmd1YWdlQ2hhbmdlZDogZnVuY3Rpb24oJGV2ZW50KVxuICAgKiBFdmVudCBlbWl0dGVkIHdoZW4gZWRpdG9yJ3MgTGFuZ3VhZ2UgY2hhbmdlc1xuICAgKi9cbiAgQE91dHB1dCgpIGVkaXRvckxhbmd1YWdlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBlZGl0b3JWYWx1ZUNoYW5nZTogZnVuY3Rpb24oJGV2ZW50KVxuICAgKiBFdmVudCBlbWl0dGVkIGFueSB0aW1lIHNvbWV0aGluZyBjaGFuZ2VzIHRoZSBlZGl0b3IgdmFsdWVcbiAgICovXG4gIEBPdXRwdXQoKSBlZGl0b3JWYWx1ZUNoYW5nZTogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBUaGUgY2hhbmdlIGV2ZW50IG5vdGlmaWVzIHlvdSBhYm91dCBhIGNoYW5nZSBoYXBwZW5pbmcgaW4gYW4gaW5wdXQgZmllbGQuXG4gICAqIFNpbmNlIHRoZSBjb21wb25lbnQgaXMgbm90IGEgbmF0aXZlIEFuZ3VsYXIgY29tcG9uZW50IGhhdmUgdG8gc3BlY2lmaXkgdGhlIGV2ZW50IGVtaXR0ZXIgb3Vyc2VsZlxuICAgKi9cbiAgQE91dHB1dCgpIGNoYW5nZTogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICAvKiB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmUgKi9cbiAgcHJvcGFnYXRlQ2hhbmdlID0gKF86IGFueSkgPT4ge307XG4gIG9uVG91Y2hlZCA9ICgpID0+IG5vb3A7XG5cbiAgLyoqXG4gICAqIFNldCBpZiB1c2luZyBFbGVjdHJvbiBtb2RlIHdoZW4gb2JqZWN0IGlzIGNyZWF0ZWRcbiAgICovXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgem9uZTogTmdab25lLCBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICAvLyBzaW5jZSBhY2Nlc3NpbmcgdGhlIHdpbmRvdyBvYmplY3QgbmVlZCB0aGlzIGNoZWNrIHNvIHNlcnZlcnNpZGUgcmVuZGVyaW5nIGRvZXNuJ3QgZmFpbFxuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICdvYmplY3QnICYmICEhZG9jdW1lbnQpIHtcbiAgICAgIC8qIHRzbGludDpkaXNhYmxlLW5leHQtbGluZSAqL1xuICAgICAgdGhpcy5faXNFbGVjdHJvbkFwcCA9ICg8YW55PndpbmRvdylbJ3Byb2Nlc3MnXSA/IHRydWUgOiBmYWxzZTtcbiAgICAgIGlmICh0aGlzLl9pc0VsZWN0cm9uQXBwKSB7XG4gICAgICAgIHRoaXMuX2FwcFBhdGggPSBlbGVjdHJvbi5yZW1vdGUuYXBwXG4gICAgICAgICAgLmdldEFwcFBhdGgoKVxuICAgICAgICAgIC5zcGxpdCgnXFxcXCcpXG4gICAgICAgICAgLmpvaW4oJy8nKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogdmFsdWU/OiBzdHJpbmdcbiAgICogVmFsdWUgaW4gdGhlIEVkaXRvciBhZnRlciBhc3luYyBnZXRFZGl0b3JDb250ZW50IHdhcyBjYWxsZWRcbiAgICovXG4gIEBJbnB1dCgndmFsdWUnKVxuICBzZXQgdmFsdWUodmFsdWU6IHN0cmluZykge1xuICAgIC8vIENsZWFyIGFueSB0aW1lb3V0IHRoYXQgbWlnaHQgb3ZlcndyaXRlIHRoaXMgdmFsdWUgc2V0IGluIHRoZSBmdXR1cmVcbiAgICBpZiAodGhpcy5fc2V0VmFsdWVUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fc2V0VmFsdWVUaW1lb3V0KTtcbiAgICB9XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIGlmICh0aGlzLl93ZWJ2aWV3LnNlbmQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIGRvbid0IHdhbnQgdG8ga2VlcCBzZW5kaW5nIGNvbnRlbnQgaWYgZXZlbnQgY2FtZSBmcm9tIElQQywgaW5maW5pdGUgbG9vcFxuICAgICAgICAgIGlmICghdGhpcy5fZnJvbUVkaXRvcikge1xuICAgICAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdzZXRFZGl0b3JDb250ZW50JywgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmVkaXRvclZhbHVlQ2hhbmdlLmVtaXQoKTtcbiAgICAgICAgICB0aGlzLnByb3BhZ2F0ZUNoYW5nZSh0aGlzLl92YWx1ZSk7XG4gICAgICAgICAgdGhpcy5jaGFuZ2UuZW1pdCgpO1xuICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBFZGl0b3IgaXMgbm90IGxvYWRlZCB5ZXQsIHRyeSBhZ2FpbiBpbiBoYWxmIGEgc2Vjb25kXG4gICAgICAgICAgdGhpcy5fc2V0VmFsdWVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuX2VkaXRvciAmJiB0aGlzLl9lZGl0b3Iuc2V0VmFsdWUpIHtcbiAgICAgICAgICAvLyBkb24ndCB3YW50IHRvIGtlZXAgc2VuZGluZyBjb250ZW50IGlmIGV2ZW50IGNhbWUgZnJvbSB0aGUgZWRpdG9yLCBpbmZpbml0ZSBsb29wXG4gICAgICAgICAgaWYgKCF0aGlzLl9mcm9tRWRpdG9yKSB7XG4gICAgICAgICAgICB0aGlzLl9lZGl0b3Iuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmVkaXRvclZhbHVlQ2hhbmdlLmVtaXQoKTtcbiAgICAgICAgICB0aGlzLnByb3BhZ2F0ZUNoYW5nZSh0aGlzLl92YWx1ZSk7XG4gICAgICAgICAgdGhpcy5jaGFuZ2UuZW1pdCgpO1xuICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLnpvbmUucnVuKCgpID0+ICh0aGlzLl92YWx1ZSA9IHZhbHVlKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gRWRpdG9yIGlzIG5vdCBsb2FkZWQgeWV0LCB0cnkgYWdhaW4gaW4gaGFsZiBhIHNlY29uZFxuICAgICAgICAgIHRoaXMuX3NldFZhbHVlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2V0VmFsdWVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgIH0sIDUwMCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IHZhbHVlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gICAqL1xuICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAvLyBkbyBub3Qgd3JpdGUgaWYgbnVsbCBvciB1bmRlZmluZWRcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmVcbiAgICBpZiAodmFsdWUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICB9XG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46IGFueSk6IHZvaWQge1xuICAgIHRoaXMucHJvcGFnYXRlQ2hhbmdlID0gZm47XG4gIH1cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46IGFueSk6IHZvaWQge1xuICAgIHRoaXMub25Ub3VjaGVkID0gZm47XG4gIH1cblxuICAvKipcbiAgICogZ2V0RWRpdG9yQ29udGVudD86IGZ1bmN0aW9uXG4gICAqIFJldHVybnMgdGhlIGNvbnRlbnQgd2l0aGluIHRoZSBlZGl0b3JcbiAgICovXG4gIGdldFZhbHVlKCk6IE9ic2VydmFibGU8c3RyaW5nPiB7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2dldEVkaXRvckNvbnRlbnQnKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgICB0aGlzLl92YWx1ZSA9IHRoaXMuX2VkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGlzLl9zdWJqZWN0Lm5leHQodGhpcy5fdmFsdWUpO1xuICAgICAgICAgIHRoaXMuX3N1YmplY3QuY29tcGxldGUoKTtcbiAgICAgICAgICB0aGlzLl9zdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgICAgICAgICB0aGlzLmVkaXRvclZhbHVlQ2hhbmdlLmVtaXQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBsYW5ndWFnZT86IHN0cmluZ1xuICAgKiBsYW5ndWFnZSB1c2VkIGluIGVkaXRvclxuICAgKi9cbiAgQElucHV0KCdsYW5ndWFnZScpXG4gIHNldCBsYW5ndWFnZShsYW5ndWFnZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fbGFuZ3VhZ2UgPSBsYW5ndWFnZTtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnc2V0TGFuZ3VhZ2UnLCBsYW5ndWFnZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgICBjb25zdCBjdXJyZW50VmFsdWU6IHN0cmluZyA9IHRoaXMuX2VkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICB0aGlzLl9lZGl0b3IuZGlzcG9zZSgpO1xuICAgICAgICBjb25zdCBteURpdjogSFRNTERpdkVsZW1lbnQgPSB0aGlzLl9lZGl0b3JDb250YWluZXIubmF0aXZlRWxlbWVudDtcbiAgICAgICAgdGhpcy5fZWRpdG9yID0gbW9uYWNvLmVkaXRvci5jcmVhdGUoXG4gICAgICAgICAgbXlEaXYsXG4gICAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdmFsdWU6IGN1cnJlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgbGFuZ3VhZ2UsXG4gICAgICAgICAgICAgIHRoZW1lOiB0aGlzLl90aGVtZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0aGlzLmVkaXRvck9wdGlvbnMsXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fZWRpdG9yLmdldE1vZGVsKCkub25EaWRDaGFuZ2VDb250ZW50KChlOiBhbnkpID0+IHtcbiAgICAgICAgICB0aGlzLl9mcm9tRWRpdG9yID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLndyaXRlVmFsdWUodGhpcy5fZWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5lZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZC5lbWl0KCk7XG4gICAgICAgIHRoaXMuZWRpdG9yTGFuZ3VhZ2VDaGFuZ2VkLmVtaXQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0IGxhbmd1YWdlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2xhbmd1YWdlO1xuICB9XG5cbiAgLyoqXG4gICAqIHJlZ2lzdGVyTGFuZ3VhZ2U/OiBmdW5jdGlvblxuICAgKiBSZWdpc3RlcnMgYSBjdXN0b20gTGFuZ3VhZ2Ugd2l0aGluIHRoZSBlZGl0b3JcbiAgICovXG4gIHJlZ2lzdGVyTGFuZ3VhZ2UobGFuZ3VhZ2U6IGFueSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdyZWdpc3Rlckxhbmd1YWdlJywgbGFuZ3VhZ2UpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgdGhpcy5fZWRpdG9yLmRpc3Bvc2UoKTtcblxuICAgICAgICBmb3IgKGNvbnN0IHByb3ZpZGVyIG9mIGxhbmd1YWdlLmNvbXBsZXRpb25JdGVtUHJvdmlkZXIpIHtcbiAgICAgICAgICAvKiB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmUgKi9cbiAgICAgICAgICBwcm92aWRlci5raW5kID0gZXZhbChwcm92aWRlci5raW5kKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IG1vbmFyY2hUb2tlbnMgb2YgbGFuZ3VhZ2UubW9uYXJjaFRva2Vuc1Byb3ZpZGVyKSB7XG4gICAgICAgICAgLyogdHNsaW50OmRpc2FibGUtbmV4dC1saW5lICovXG4gICAgICAgICAgbW9uYXJjaFRva2Vuc1swXSA9IGV2YWwobW9uYXJjaFRva2Vuc1swXSk7XG4gICAgICAgIH1cbiAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5yZWdpc3Rlcih7IGlkOiBsYW5ndWFnZS5pZCB9KTtcblxuICAgICAgICBtb25hY28ubGFuZ3VhZ2VzLnNldE1vbmFyY2hUb2tlbnNQcm92aWRlcihsYW5ndWFnZS5pZCwge1xuICAgICAgICAgIHRva2VuaXplcjoge1xuICAgICAgICAgICAgcm9vdDogbGFuZ3VhZ2UubW9uYXJjaFRva2Vuc1Byb3ZpZGVyLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIERlZmluZSBhIG5ldyB0aGVtZSB0aGF0IGNvbnN0YWlucyBvbmx5IHJ1bGVzIHRoYXQgbWF0Y2ggdGhpcyBsYW5ndWFnZVxuICAgICAgICBtb25hY28uZWRpdG9yLmRlZmluZVRoZW1lKGxhbmd1YWdlLmN1c3RvbVRoZW1lLmlkLCBsYW5ndWFnZS5jdXN0b21UaGVtZS50aGVtZSk7XG4gICAgICAgIHRoaXMuX3RoZW1lID0gbGFuZ3VhZ2UuY3VzdG9tVGhlbWUuaWQ7XG5cbiAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5yZWdpc3RlckNvbXBsZXRpb25JdGVtUHJvdmlkZXIobGFuZ3VhZ2UuaWQsIHtcbiAgICAgICAgICBwcm92aWRlQ29tcGxldGlvbkl0ZW1zOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbGFuZ3VhZ2UuY29tcGxldGlvbkl0ZW1Qcm92aWRlcjtcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBjc3M6IEhUTUxTdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICBjc3MudHlwZSA9ICd0ZXh0L2Nzcyc7XG4gICAgICAgIGNzcy5pbm5lckhUTUwgPSBsYW5ndWFnZS5tb25hcmNoVG9rZW5zUHJvdmlkZXJDU1M7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY3NzKTtcbiAgICAgICAgdGhpcy5lZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZC5lbWl0KCk7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyZWRMYW5ndWFnZXNTdHlsZXMgPSBbLi4udGhpcy5fcmVnaXN0ZXJlZExhbmd1YWdlc1N0eWxlcywgY3NzXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogc3R5bGU/OiBzdHJpbmdcbiAgICogY3NzIHN0eWxlIG9mIHRoZSBlZGl0b3Igb24gdGhlIHBhZ2VcbiAgICovXG4gIEBJbnB1dCgnZWRpdG9yU3R5bGUnKVxuICBzZXQgZWRpdG9yU3R5bGUoZWRpdG9yU3R5bGU6IHN0cmluZykge1xuICAgIHRoaXMuX2VkaXRvclN0eWxlID0gZWRpdG9yU3R5bGU7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3NldEVkaXRvclN0eWxlJywgeyBsYW5ndWFnZTogdGhpcy5fbGFuZ3VhZ2UsIHRoZW1lOiB0aGlzLl90aGVtZSwgc3R5bGU6IGVkaXRvclN0eWxlIH0pO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgY29uc3QgY29udGFpbmVyRGl2OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50O1xuICAgICAgICBjb250YWluZXJEaXYuc2V0QXR0cmlidXRlKCdzdHlsZScsIGVkaXRvclN0eWxlKTtcbiAgICAgICAgY29uc3QgY3VycmVudFZhbHVlOiBzdHJpbmcgPSB0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgdGhpcy5fZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICAgICAgY29uc3QgbXlEaXY6IEhUTUxEaXZFbGVtZW50ID0gdGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMuX2VkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKFxuICAgICAgICAgIG15RGl2LFxuICAgICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgIGxhbmd1YWdlOiB0aGlzLl9sYW5ndWFnZSxcbiAgICAgICAgICAgICAgdGhlbWU6IHRoaXMuX3RoZW1lLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yT3B0aW9ucyxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLl9lZGl0b3IuZ2V0TW9kZWwoKS5vbkRpZENoYW5nZUNvbnRlbnQoKGU6IGFueSkgPT4ge1xuICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSB0cnVlO1xuICAgICAgICAgIHRoaXMud3JpdGVWYWx1ZSh0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXQgZWRpdG9yU3R5bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdG9yU3R5bGU7XG4gIH1cblxuICAvKipcbiAgICogdGhlbWU/OiBzdHJpbmdcbiAgICogVGhlbWUgdG8gYmUgYXBwbGllZCB0byBlZGl0b3JcbiAgICovXG4gIEBJbnB1dCgndGhlbWUnKVxuICBzZXQgdGhlbWUodGhlbWU6IHN0cmluZykge1xuICAgIHRoaXMuX3RoZW1lID0gdGhlbWU7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3NldEVkaXRvck9wdGlvbnMnLCB7IHRoZW1lIH0pO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgdGhpcy5fZWRpdG9yLnVwZGF0ZU9wdGlvbnMoeyB0aGVtZSB9KTtcbiAgICAgICAgdGhpcy5lZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZC5lbWl0KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGdldCB0aGVtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl90aGVtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBmdWxsU2NyZWVuS2V5QmluZGluZz86IG51bWJlclxuICAgKiBTZWUgaGVyZSBmb3Iga2V5IGJpbmRpbmdzIGh0dHBzOi8vbWljcm9zb2Z0LmdpdGh1Yi5pby9tb25hY28tZWRpdG9yL2FwaS9lbnVtcy9tb25hY28ua2V5Y29kZS5odG1sXG4gICAqIFNldHMgdGhlIEtleUNvZGUgZm9yIHNob3J0Y3V0dGluZyB0byBGdWxsc2NyZWVuIG1vZGVcbiAgICovXG4gIEBJbnB1dCgnZnVsbFNjcmVlbktleUJpbmRpbmcnKVxuICBzZXQgZnVsbFNjcmVlbktleUJpbmRpbmcoa2V5Y29kZTogbnVtYmVyW10pIHtcbiAgICB0aGlzLl9rZXljb2RlID0ga2V5Y29kZTtcbiAgfVxuICBnZXQgZnVsbFNjcmVlbktleUJpbmRpbmcoKTogbnVtYmVyW10ge1xuICAgIHJldHVybiB0aGlzLl9rZXljb2RlO1xuICB9XG5cbiAgLyoqXG4gICAqIGVkaXRvck9wdGlvbnM/OiBvYmplY3RcbiAgICogT3B0aW9ucyB1c2VkIG9uIGVkaXRvciBpbnN0YW50aWF0aW9uLiBBdmFpbGFibGUgb3B0aW9ucyBsaXN0ZWQgaGVyZTpcbiAgICogaHR0cHM6Ly9taWNyb3NvZnQuZ2l0aHViLmlvL21vbmFjby1lZGl0b3IvYXBpL2ludGVyZmFjZXMvbW9uYWNvLmVkaXRvci5pZWRpdG9yb3B0aW9ucy5odG1sXG4gICAqL1xuICBASW5wdXQoJ2VkaXRvck9wdGlvbnMnKVxuICBzZXQgZWRpdG9yT3B0aW9ucyhlZGl0b3JPcHRpb25zOiBhbnkpIHtcbiAgICB0aGlzLl9lZGl0b3JPcHRpb25zID0gZWRpdG9yT3B0aW9ucztcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnc2V0RWRpdG9yT3B0aW9ucycsIGVkaXRvck9wdGlvbnMpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgdGhpcy5fZWRpdG9yLnVwZGF0ZU9wdGlvbnMoZWRpdG9yT3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXQgZWRpdG9yT3B0aW9ucygpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl9lZGl0b3JPcHRpb25zO1xuICB9XG5cbiAgLyoqXG4gICAqIGxheW91dCBtZXRob2QgdGhhdCBjYWxscyBsYXlvdXQgbWV0aG9kIG9mIGVkaXRvciBhbmQgaW5zdHJ1Y3RzIHRoZSBlZGl0b3IgdG8gcmVtZWFzdXJlIGl0cyBjb250YWluZXJcbiAgICovXG4gIGxheW91dCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnbGF5b3V0Jyk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgICB0aGlzLl9lZGl0b3IubGF5b3V0KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaWYgaW4gRWxlY3Ryb24gbW9kZSBvciBub3RcbiAgICovXG4gIGdldCBpc0VsZWN0cm9uQXBwKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc0VsZWN0cm9uQXBwO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaWYgaW4gRnVsbCBTY3JlZW4gTW9kZSBvciBub3RcbiAgICovXG4gIGdldCBpc0Z1bGxTY3JlZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzRnVsbFNjcmVlbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBzZXRFZGl0b3JOb2RlTW9kdWxlRGlyT3ZlcnJpZGUgZnVuY3Rpb24gdGhhdCBvdmVycmlkZXMgd2hlcmUgdG8gbG9va1xuICAgKiBmb3IgdGhlIGVkaXRvciBub2RlX21vZHVsZS4gVXNlZCBpbiB0ZXN0cyBmb3IgRWxlY3Ryb24gb3IgYW55d2hlcmUgdGhhdCB0aGVcbiAgICogbm9kZV9tb2R1bGVzIGFyZSBub3QgaW4gdGhlIGV4cGVjdGVkIGxvY2F0aW9uLlxuICAgKi9cbiAgc2V0RWRpdG9yTm9kZU1vZHVsZURpck92ZXJyaWRlKGRpck92ZXJyaWRlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9lZGl0b3JOb2RlTW9kdWxlRGlyT3ZlcnJpZGUgPSBkaXJPdmVycmlkZTtcbiAgICB0aGlzLl9hcHBQYXRoID0gZGlyT3ZlcnJpZGU7XG4gIH1cblxuICAvKipcbiAgICogbmdPbkluaXQgb25seSB1c2VkIGZvciBFbGVjdHJvbiB2ZXJzaW9uIG9mIGVkaXRvclxuICAgKiBUaGlzIGlzIHdoZXJlIHRoZSB3ZWJ2aWV3IGlzIGNyZWF0ZWQgdG8gc2FuZGJveCBhd2F5IHRoZSBlZGl0b3JcbiAgICovXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIGxldCBlZGl0b3JIVE1MOiBzdHJpbmcgPSAnJztcbiAgICBpZiAodGhpcy5faXNFbGVjdHJvbkFwcCkge1xuICAgICAgZWRpdG9ySFRNTCA9IGA8IURPQ1RZUEUgaHRtbD5cbiAgICAgICAgICAgIDxodG1sIHN0eWxlPVwiaGVpZ2h0OjEwMCVcIj5cbiAgICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgICAgIDxtZXRhIGh0dHAtZXF1aXY9XCJYLVVBLUNvbXBhdGlibGVcIiBjb250ZW50PVwiSUU9ZWRnZVwiIC8+XG4gICAgICAgICAgICAgICAgPG1ldGEgaHR0cC1lcXVpdj1cIkNvbnRlbnQtVHlwZVwiIGNvbnRlbnQ9XCJ0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOFwiID5cbiAgICAgICAgICAgICAgICA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgZGF0YS1uYW1lPVwidnMvZWRpdG9yL2VkaXRvci5tYWluXCJcbiAgICAgICAgICAgICAgICAgICAgaHJlZj1cImZpbGU6Ly8ke3RoaXMuX2VkaXRvck5vZGVNb2R1bGVEaXJPdmVycmlkZX0vYXNzZXRzL21vbmFjby92cy9lZGl0b3IvZWRpdG9yLm1haW4uY3NzXCI+XG4gICAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgICA8Ym9keSBzdHlsZT1cImhlaWdodDoxMDAlO3dpZHRoOiAxMDAlO21hcmdpbjogMDtwYWRkaW5nOiAwO292ZXJmbG93OiBoaWRkZW47XCI+XG4gICAgICAgICAgICA8ZGl2IGlkPVwiJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn1cIiBzdHlsZT1cIndpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7JHt0aGlzLl9lZGl0b3JTdHlsZX1cIj48L2Rpdj5cbiAgICAgICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBpcGNSZW5kZXJlciBvZiBlbGVjdHJvbiBmb3IgY29tbXVuaWNhdGlvblxuICAgICAgICAgICAgICAgIGNvbnN0IHtpcGNSZW5kZXJlcn0gPSByZXF1aXJlKCdlbGVjdHJvbicpO1xuICAgICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgICAgICA8c2NyaXB0IHNyYz1cImZpbGU6Ly8ke3RoaXMuX2VkaXRvck5vZGVNb2R1bGVEaXJPdmVycmlkZX0vYXNzZXRzL21vbmFjby92cy9sb2FkZXIuanNcIj48L3NjcmlwdD5cbiAgICAgICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICAgICAgICAgdmFyIGVkaXRvcjtcbiAgICAgICAgICAgICAgICB2YXIgdGhlbWUgPSAnJHt0aGlzLl90aGVtZX0nO1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9ICcke3RoaXMuX3ZhbHVlfSc7XG4gICAgICAgICAgICAgICAgdmFyIHJlZ2lzdGVyZWRMYW5ndWFnZXNTdHlsZXMgPSBbXTtcblxuICAgICAgICAgICAgICAgIHJlcXVpcmUuY29uZmlnKHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZVVybDogJyR7dGhpcy5fYXBwUGF0aH0vYXNzZXRzL21vbmFjbydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzZWxmLm1vZHVsZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBzZWxmLnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICByZXF1aXJlKFsndnMvZWRpdG9yL2VkaXRvci5tYWluJ10sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IgPSBtb25hY28uZWRpdG9yLmNyZWF0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHtcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lclxuICAgICAgICAgICAgICAgICAgICB9JyksIE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFuZ3VhZ2U6ICcke3RoaXMubGFuZ3VhZ2V9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAnJHt0aGlzLl90aGVtZX0nLFxuICAgICAgICAgICAgICAgICAgICB9LCAke0pTT04uc3RyaW5naWZ5KHRoaXMuZWRpdG9yT3B0aW9ucyl9KSk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlQ29udGVudCggKGUpPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIuc2VuZFRvSG9zdChcIm9uRWRpdG9yQ29udGVudENoYW5nZVwiLCBlZGl0b3IuZ2V0VmFsdWUoKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IuYWRkQWN0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBBbiB1bmlxdWUgaWRlbnRpZmllciBvZiB0aGUgY29udHJpYnV0ZWQgYWN0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZnVsbFNjcmVlbicsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gQSBsYWJlbCBvZiB0aGUgYWN0aW9uIHRoYXQgd2lsbCBiZSBwcmVzZW50ZWQgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdGdWxsIFNjcmVlbicsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gQW4gb3B0aW9uYWwgYXJyYXkgb2Yga2V5YmluZGluZ3MgZm9yIHRoZSBhY3Rpb24uXG4gICAgICAgICAgICAgICAgICAgICAgY29udGV4dE1lbnVHcm91cElkOiAnbmF2aWdhdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAga2V5YmluZGluZ3M6IFske3RoaXMuX2tleWNvZGV9XSxcbiAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0TWVudU9yZGVyOiAxLjUsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gTWV0aG9kIHRoYXQgd2lsbCBiZSBleGVjdXRlZCB3aGVuIHRoZSBhY3Rpb24gaXMgdHJpZ2dlcmVkLlxuICAgICAgICAgICAgICAgICAgICAgIC8vIEBwYXJhbSBlZGl0b3IgVGhlIGVkaXRvciBpbnN0YW5jZSBpcyBwYXNzZWQgaW4gYXMgYSBjb252aW5pZW5jZVxuICAgICAgICAgICAgICAgICAgICAgIHJ1bjogZnVuY3Rpb24oZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlZGl0b3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRvckRpdi53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbigpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5hZGRBY3Rpb24oe1xuICAgICAgICAgICAgICAgICAgICAgIC8vIEFuIHVuaXF1ZSBpZGVudGlmaWVyIG9mIHRoZSBjb250cmlidXRlZCBhY3Rpb24uXG4gICAgICAgICAgICAgICAgICAgICAgaWQ6ICdleGl0ZnVsbFNjcmVlbicsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gQSBsYWJlbCBvZiB0aGUgYWN0aW9uIHRoYXQgd2lsbCBiZSBwcmVzZW50ZWQgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFeGl0IEZ1bGwgU2NyZWVuJyxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBBbiBvcHRpb25hbCBhcnJheSBvZiBrZXliaW5kaW5ncyBmb3IgdGhlIGFjdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0TWVudUdyb3VwSWQ6ICduYXZpZ2F0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgICBrZXliaW5kaW5nczogWzldLFxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHRNZW51T3JkZXI6IDEuNSxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBNZXRob2QgdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGFjdGlvbiBpcyB0cmlnZ2VyZWQuXG4gICAgICAgICAgICAgICAgICAgICAgLy8gQHBhcmFtIGVkaXRvciBUaGUgZWRpdG9yIGluc3RhbmNlIGlzIHBhc3NlZCBpbiBhcyBhIGNvbnZpbmllbmNlXG4gICAgICAgICAgICAgICAgICAgICAgcnVuOiBmdW5jdGlvbihlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVkaXRvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke3RoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyfScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQud2Via2l0RXhpdEZ1bGxzY3JlZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwiZWRpdG9ySW5pdGlhbGl6ZWRcIiwgdGhpcy5fZWRpdG9yKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHVybiBiYWNrIHRoZSB2YWx1ZSBpbiB0aGUgZWRpdG9yIHRvIHRoZSBtYWludmlld1xuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdnZXRFZGl0b3JDb250ZW50JywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIuc2VuZFRvSG9zdChcImVkaXRvckNvbnRlbnRcIiwgZWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSB2YWx1ZSBvZiB0aGUgZWRpdG9yIGZyb20gd2hhdCB3YXMgc2VudCBmcm9tIHRoZSBtYWludmlld1xuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdzZXRFZGl0b3JDb250ZW50JywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpe1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5zZXRWYWx1ZShkYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgc3R5bGUgb2YgdGhlIGVkaXRvciBjb250YWluZXIgZGl2XG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ3NldEVkaXRvclN0eWxlJywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpe1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWRpdG9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7dGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJ9Jyk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvckRpdi5zdHlsZSA9IGRhdGEuc3R5bGU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50VmFsdWUgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yID0gbW9uYWNvLmVkaXRvci5jcmVhdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJcbiAgICAgICAgICAgICAgICAgICAgfScpLCBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYW5ndWFnZTogZGF0YS5sYW5ndWFnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiBkYXRhLnRoZW1lLFxuICAgICAgICAgICAgICAgICAgICB9LCAke0pTT04uc3RyaW5naWZ5KHRoaXMuZWRpdG9yT3B0aW9ucyl9KSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIG9wdGlvbnMgb2YgdGhlIGVkaXRvciBmcm9tIHdoYXQgd2FzIHNlbnQgZnJvbSB0aGUgbWFpbnZpZXdcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignc2V0RWRpdG9yT3B0aW9ucycsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLnVwZGF0ZU9wdGlvbnMoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJlZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZFwiLCAnJyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIGxhbmd1YWdlIG9mIHRoZSBlZGl0b3IgZnJvbSB3aGF0IHdhcyBzZW50IGZyb20gdGhlIG1haW52aWV3XG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ3NldExhbmd1YWdlJywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpe1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudFZhbHVlID0gZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyXG4gICAgICAgICAgICAgICAgICAgIH0nKSwgT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFuZ3VhZ2U6IGRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogdGhlbWUsXG4gICAgICAgICAgICAgICAgICAgIH0sICR7SlNPTi5zdHJpbmdpZnkodGhpcy5lZGl0b3JPcHRpb25zKX0pKTtcbiAgICAgICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIuc2VuZFRvSG9zdChcImVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkXCIsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIuc2VuZFRvSG9zdChcImVkaXRvckxhbmd1YWdlQ2hhbmdlZFwiLCAnJyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZWdpc3RlciBhIG5ldyBsYW5ndWFnZSB3aXRoIGVkaXRvclxuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdyZWdpc3Rlckxhbmd1YWdlJywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpe1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudFZhbHVlID0gZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5kaXNwb3NlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmNvbXBsZXRpb25JdGVtUHJvdmlkZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcm92aWRlciA9IGRhdGEuY29tcGxldGlvbkl0ZW1Qcm92aWRlcltpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyLmtpbmQgPSBldmFsKHByb3ZpZGVyLmtpbmQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5tb25hcmNoVG9rZW5zUHJvdmlkZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtb25hcmNoVG9rZW5zID0gZGF0YS5tb25hcmNoVG9rZW5zUHJvdmlkZXJbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBtb25hcmNoVG9rZW5zWzBdID0gZXZhbChtb25hcmNoVG9rZW5zWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBtb25hY28ubGFuZ3VhZ2VzLnJlZ2lzdGVyKHsgaWQ6IGRhdGEuaWQgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5zZXRNb25hcmNoVG9rZW5zUHJvdmlkZXIoZGF0YS5pZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5pemVyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdDogZGF0YS5tb25hcmNoVG9rZW5zUHJvdmlkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gRGVmaW5lIGEgbmV3IHRoZW1lIHRoYXQgY29uc3RhaW5zIG9ubHkgcnVsZXMgdGhhdCBtYXRjaCB0aGlzIGxhbmd1YWdlXG4gICAgICAgICAgICAgICAgICAgIG1vbmFjby5lZGl0b3IuZGVmaW5lVGhlbWUoZGF0YS5jdXN0b21UaGVtZS5pZCwgZGF0YS5jdXN0b21UaGVtZS50aGVtZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoZW1lID0gZGF0YS5jdXN0b21UaGVtZS5pZDtcblxuICAgICAgICAgICAgICAgICAgICBtb25hY28ubGFuZ3VhZ2VzLnJlZ2lzdGVyQ29tcGxldGlvbkl0ZW1Qcm92aWRlcihkYXRhLmlkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlQ29tcGxldGlvbkl0ZW1zOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEuY29tcGxldGlvbkl0ZW1Qcm92aWRlclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgY3NzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICAgICAgICAgICAgICAgICAgICBjc3MudHlwZSA9IFwidGV4dC9jc3NcIjtcbiAgICAgICAgICAgICAgICAgICAgY3NzLmlubmVySFRNTCA9IGRhdGEubW9uYXJjaFRva2Vuc1Byb3ZpZGVyQ1NTO1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNzcyk7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lzdGVyZWRMYW5ndWFnZXNTdHlsZXMgPSBbLi4ucmVnaXN0ZXJlZExhbmd1YWdlc1N0eWxlcywgY3NzXTtcblxuXG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJlZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZFwiLCAnJyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJbnN0cnVjdCB0aGUgZWRpdG9yIHRvIHJlbWVhc3VyZSBpdHMgY29udGFpbmVyXG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ2xheW91dCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5sYXlvdXQoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIEluc3RydWN0IHRoZSBlZGl0b3IgZ28gdG8gZnVsbCBzY3JlZW4gbW9kZVxuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdzaG93RnVsbFNjcmVlbkVkaXRvcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgdmFyIGVkaXRvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke3RoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyfScpO1xuICAgICAgICAgICAgICAgICAgZWRpdG9yRGl2LndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJbnN0cnVjdCB0aGUgZWRpdG9yIGV4aXQgZnVsbCBzY3JlZW4gbW9kZVxuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdleGl0RnVsbFNjcmVlbkVkaXRvcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgdmFyIGVkaXRvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke3RoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyfScpO1xuICAgICAgICAgICAgICAgICAgZWRpdG9yRGl2LndlYmtpdEV4aXRGdWxsc2NyZWVuKCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignZGlzcG9zZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICBlZGl0b3IuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgICAgcmVnaXN0ZXJlZExhbmd1YWdlc1N0eWxlcy5mb3JFYWNoKChzdHlsZSkgPT4gc3R5bGUucmVtb3ZlKCkpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gbmVlZCB0byBtYW51YWxseSByZXNpemUgdGhlIGVkaXRvciBhbnkgdGltZSB0aGUgd2luZG93IHNpemVcbiAgICAgICAgICAgICAgICAvLyBjaGFuZ2VzLiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvbW9uYWNvLWVkaXRvci9pc3N1ZXMvMjhcbiAgICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBmdW5jdGlvbiByZXNpemVFZGl0b3IoKSB7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5sYXlvdXQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgICAgPC9ib2R5PlxuICAgICAgICAgICAgPC9odG1sPmA7XG5cbiAgICAgIC8vIGR5bmFtaWNhbGx5IGNyZWF0ZSB0aGUgRWxlY3Ryb24gV2VidmlldyBFbGVtZW50XG4gICAgICAvLyB0aGlzIHdpbGwgc2FuZGJveCB0aGUgbW9uYWNvIGNvZGUgaW50byBpdHMgb3duIERPTSBhbmQgaXRzIG93blxuICAgICAgLy8gamF2YXNjcmlwdCBpbnN0YW5jZS4gTmVlZCB0byBkbyB0aGlzIHRvIGF2b2lkIHByb2JsZW1zIHdpdGggbW9uYWNvXG4gICAgICAvLyB1c2luZyBBTUQgUmVxdWlyZXMgYW5kIEVsZWN0cm9uIHVzaW5nIE5vZGUgUmVxdWlyZXNcbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L21vbmFjby1lZGl0b3IvaXNzdWVzLzkwXG4gICAgICB0aGlzLl93ZWJ2aWV3ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnd2VidmlldycpO1xuICAgICAgdGhpcy5fd2Vidmlldy5zZXRBdHRyaWJ1dGUoJ25vZGVpbnRlZ3JhdGlvbicsICd0cnVlJyk7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNldEF0dHJpYnV0ZSgnZGlzYWJsZXdlYnNlY3VyaXR5JywgJ3RydWUnKTtcbiAgICAgIC8vIHRha2UgdGhlIGh0bWwgY29udGVudCBmb3IgdGhlIHdlYnZpZXcgYW5kIGJhc2U2NCBlbmNvZGUgaXQgYW5kIHVzZSBhcyB0aGUgc3JjIHRhZ1xuICAgICAgdGhpcy5fd2Vidmlldy5zZXRBdHRyaWJ1dGUoJ3NyYycsICdkYXRhOnRleHQvaHRtbDtiYXNlNjQsJyArIHdpbmRvdy5idG9hKGVkaXRvckhUTUwpKTtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2V0QXR0cmlidXRlKCdzdHlsZScsICdkaXNwbGF5OmlubGluZS1mbGV4OyB3aWR0aDoxMDAlOyBoZWlnaHQ6MTAwJScpO1xuICAgICAgLy8gdG8gZGVidWc6XG4gICAgICAvLyAgdGhpcy5fd2Vidmlldy5hZGRFdmVudExpc3RlbmVyKCdkb20tcmVhZHknLCAoKSA9PiB7XG4gICAgICAvLyAgICAgdGhpcy5fd2Vidmlldy5vcGVuRGV2VG9vbHMoKTtcbiAgICAgIC8vICB9KTtcblxuICAgICAgLy8gUHJvY2VzcyB0aGUgZGF0YSBmcm9tIHRoZSB3ZWJ2aWV3XG4gICAgICB0aGlzLl93ZWJ2aWV3LmFkZEV2ZW50TGlzdGVuZXIoJ2lwYy1tZXNzYWdlJywgKGV2ZW50OiBhbnkpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmNoYW5uZWwgPT09ICdlZGl0b3JDb250ZW50Jykge1xuICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSB0cnVlO1xuICAgICAgICAgIHRoaXMud3JpdGVWYWx1ZShldmVudC5hcmdzWzBdKTtcbiAgICAgICAgICB0aGlzLl9zdWJqZWN0Lm5leHQodGhpcy5fdmFsdWUpO1xuICAgICAgICAgIHRoaXMuX3N1YmplY3QuY29tcGxldGUoKTtcbiAgICAgICAgICB0aGlzLl9zdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5jaGFubmVsID09PSAnb25FZGl0b3JDb250ZW50Q2hhbmdlJykge1xuICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSB0cnVlO1xuICAgICAgICAgIHRoaXMud3JpdGVWYWx1ZShldmVudC5hcmdzWzBdKTtcbiAgICAgICAgICBpZiAodGhpcy5pbml0aWFsQ29udGVudENoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5pbml0aWFsQ29udGVudENoYW5nZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5sYXlvdXQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY2hhbm5lbCA9PT0gJ2VkaXRvckluaXRpYWxpemVkJykge1xuICAgICAgICAgIHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLl9lZGl0b3JQcm94eSA9IHRoaXMud3JhcEVkaXRvckNhbGxzKHRoaXMuX2VkaXRvcik7XG4gICAgICAgICAgdGhpcy5lZGl0b3JJbml0aWFsaXplZC5lbWl0KHRoaXMuX2VkaXRvclByb3h5KTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5jaGFubmVsID09PSAnZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQnKSB7XG4gICAgICAgICAgdGhpcy5lZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZC5lbWl0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY2hhbm5lbCA9PT0gJ2VkaXRvckxhbmd1YWdlQ2hhbmdlZCcpIHtcbiAgICAgICAgICB0aGlzLmVkaXRvckxhbmd1YWdlQ2hhbmdlZC5lbWl0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBhcHBlbmQgdGhlIHdlYnZpZXcgdG8gdGhlIERPTVxuICAgICAgdGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fd2Vidmlldyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIG5nQWZ0ZXJWaWV3SW5pdCBvbmx5IHVzZWQgZm9yIGJyb3dzZXIgdmVyc2lvbiBvZiBlZGl0b3JcbiAgICogVGhpcyBpcyB3aGVyZSB0aGUgQU1EIExvYWRlciBzY3JpcHRzIGFyZSBhZGRlZCB0byB0aGUgYnJvd3NlciBhbmQgdGhlIGVkaXRvciBzY3JpcHRzIGFyZSBcInJlcXVpcmVkXCJcbiAgICovXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2lzRWxlY3Ryb25BcHApIHtcbiAgICAgIGxvYWRNb25hY28oKTtcbiAgICAgIHdhaXRVbnRpbE1vbmFjb1JlYWR5KClcbiAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3kpKVxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmluaXRNb25hY28oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1lcmdlKFxuICAgICAgZnJvbUV2ZW50KHdpbmRvdywgJ3Jlc2l6ZScpLnBpcGUoZGVib3VuY2VUaW1lKDEwMCkpLFxuICAgICAgdGhpcy5fd2lkdGhTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpLnBpcGUoZGlzdGluY3RVbnRpbENoYW5nZWQoKSksXG4gICAgICB0aGlzLl9oZWlnaHRTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpLnBpcGUoZGlzdGluY3RVbnRpbENoYW5nZWQoKSksXG4gICAgKVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3kpLCBkZWJvdW5jZVRpbWUoMTAwKSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICB0aGlzLmxheW91dCgpO1xuICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICAgIH0pO1xuICAgIHRpbWVyKDUwMCwgMjUwKVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3kpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9lbGVtZW50UmVmICYmIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkge1xuICAgICAgICAgIHRoaXMuX3dpZHRoU3ViamVjdC5uZXh0KCg8SFRNTEVsZW1lbnQ+dGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCk7XG4gICAgICAgICAgdGhpcy5faGVpZ2h0U3ViamVjdC5uZXh0KCg8SFRNTEVsZW1lbnQ+dGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLmRldGFjaCgpO1xuICAgIHRoaXMuX3JlZ2lzdGVyZWRMYW5ndWFnZXNTdHlsZXMuZm9yRWFjaCgoc3R5bGU6IEhUTUxTdHlsZUVsZW1lbnQpID0+IHN0eWxlLnJlbW92ZSgpKTtcbiAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdkaXNwb3NlJyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgIHRoaXMuX2VkaXRvci5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX2Rlc3Ryb3kubmV4dCh0cnVlKTtcbiAgICB0aGlzLl9kZXN0cm95LnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICAvKipcbiAgICogc2hvd0Z1bGxTY3JlZW5FZGl0b3IgcmVxdWVzdCBmb3IgZnVsbCBzY3JlZW4gb2YgQ29kZSBFZGl0b3IgYmFzZWQgb24gaXRzIGJyb3dzZXIgdHlwZS5cbiAgICovXG4gIHB1YmxpYyBzaG93RnVsbFNjcmVlbkVkaXRvcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnc2hvd0Z1bGxTY3JlZW5FZGl0b3InKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGNvZGVFZGl0b3JFbGVtZW50OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50IGFzIEhUTUxEaXZFbGVtZW50O1xuICAgICAgICBjb25zdCBmdWxsU2NyZWVuTWFwOiBvYmplY3QgPSB7XG4gICAgICAgICAgLy8gQ2hyb21lXG4gICAgICAgICAgcmVxdWVzdEZ1bGxzY3JlZW46ICgpID0+IGNvZGVFZGl0b3JFbGVtZW50LnJlcXVlc3RGdWxsc2NyZWVuKCksXG4gICAgICAgICAgLy8gU2FmYXJpXG4gICAgICAgICAgd2Via2l0UmVxdWVzdEZ1bGxzY3JlZW46ICgpID0+ICg8YW55PmNvZGVFZGl0b3JFbGVtZW50KS53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbigpLFxuICAgICAgICAgIC8vIElFXG4gICAgICAgICAgbXNSZXF1ZXN0RnVsbHNjcmVlbjogKCkgPT4gKDxhbnk+Y29kZUVkaXRvckVsZW1lbnQpLm1zUmVxdWVzdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgICAvLyBGaXJlZm94XG4gICAgICAgICAgbW96UmVxdWVzdEZ1bGxTY3JlZW46ICgpID0+ICg8YW55PmNvZGVFZGl0b3JFbGVtZW50KS5tb3pSZXF1ZXN0RnVsbFNjcmVlbigpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGZvciAoY29uc3QgaGFuZGxlciBvZiBPYmplY3Qua2V5cyhmdWxsU2NyZWVuTWFwKSkge1xuICAgICAgICAgIGlmIChjb2RlRWRpdG9yRWxlbWVudFtoYW5kbGVyXSkge1xuICAgICAgICAgICAgZnVsbFNjcmVlbk1hcFtoYW5kbGVyXSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9pc0Z1bGxTY3JlZW4gPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIGV4aXRGdWxsU2NyZWVuRWRpdG9yIHJlcXVlc3QgdG8gZXhpdCBmdWxsIHNjcmVlbiBvZiBDb2RlIEVkaXRvciBiYXNlZCBvbiBpdHMgYnJvd3NlciB0eXBlLlxuICAgKi9cbiAgcHVibGljIGV4aXRGdWxsU2NyZWVuRWRpdG9yKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdleGl0RnVsbFNjcmVlbkVkaXRvcicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZXhpdEZ1bGxTY3JlZW5NYXA6IG9iamVjdCA9IHtcbiAgICAgICAgICAvLyBDaHJvbWVcbiAgICAgICAgICBleGl0RnVsbHNjcmVlbjogKCkgPT4gZG9jdW1lbnQuZXhpdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgICAvLyBTYWZhcmlcbiAgICAgICAgICB3ZWJraXRFeGl0RnVsbHNjcmVlbjogKCkgPT4gKDxhbnk+ZG9jdW1lbnQpLndlYmtpdEV4aXRGdWxsc2NyZWVuKCksXG4gICAgICAgICAgLy8gRmlyZWZveFxuICAgICAgICAgIG1vekNhbmNlbEZ1bGxTY3JlZW46ICgpID0+ICg8YW55PmRvY3VtZW50KS5tb3pDYW5jZWxGdWxsU2NyZWVuKCksXG4gICAgICAgICAgLy8gSUVcbiAgICAgICAgICBtc0V4aXRGdWxsc2NyZWVuOiAoKSA9PiAoPGFueT5kb2N1bWVudCkubXNFeGl0RnVsbHNjcmVlbigpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGZvciAoY29uc3QgaGFuZGxlciBvZiBPYmplY3Qua2V5cyhleGl0RnVsbFNjcmVlbk1hcCkpIHtcbiAgICAgICAgICBpZiAoZG9jdW1lbnRbaGFuZGxlcl0pIHtcbiAgICAgICAgICAgIGV4aXRGdWxsU2NyZWVuTWFwW2hhbmRsZXJdKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2lzRnVsbFNjcmVlbiA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIGFkZEZ1bGxTY3JlZW5Nb2RlQ29tbWFuZCB1c2VkIHRvIGFkZCB0aGUgZnVsbHNjcmVlbiBvcHRpb24gdG8gdGhlIGNvbnRleHQgbWVudVxuICAgKi9cbiAgcHJpdmF0ZSBhZGRGdWxsU2NyZWVuTW9kZUNvbW1hbmQoKTogdm9pZCB7XG4gICAgdGhpcy5fZWRpdG9yLmFkZEFjdGlvbih7XG4gICAgICAvLyBBbiB1bmlxdWUgaWRlbnRpZmllciBvZiB0aGUgY29udHJpYnV0ZWQgYWN0aW9uLlxuICAgICAgaWQ6ICdmdWxsU2NyZWVuJyxcbiAgICAgIC8vIEEgbGFiZWwgb2YgdGhlIGFjdGlvbiB0aGF0IHdpbGwgYmUgcHJlc2VudGVkIHRvIHRoZSB1c2VyLlxuICAgICAgbGFiZWw6ICdGdWxsIFNjcmVlbicsXG4gICAgICAvLyBBbiBvcHRpb25hbCBhcnJheSBvZiBrZXliaW5kaW5ncyBmb3IgdGhlIGFjdGlvbi5cbiAgICAgIGNvbnRleHRNZW51R3JvdXBJZDogJ25hdmlnYXRpb24nLFxuICAgICAga2V5YmluZGluZ3M6IHRoaXMuX2tleWNvZGUsXG4gICAgICBjb250ZXh0TWVudU9yZGVyOiAxLjUsXG4gICAgICAvLyBNZXRob2QgdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGFjdGlvbiBpcyB0cmlnZ2VyZWQuXG4gICAgICAvLyBAcGFyYW0gZWRpdG9yIFRoZSBlZGl0b3IgaW5zdGFuY2UgaXMgcGFzc2VkIGluIGFzIGEgY29udmluaWVuY2VcbiAgICAgIHJ1bjogKGVkOiBhbnkpID0+IHtcbiAgICAgICAgdGhpcy5zaG93RnVsbFNjcmVlbkVkaXRvcigpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiB3cmFwRWRpdG9yQ2FsbHMgdXNlZCB0byBwcm94eSBhbGwgdGhlIGNhbGxzIHRvIHRoZSBtb25hY28gZWRpdG9yXG4gICAqIEZvciBjYWxscyBmb3IgRWxlY3Ryb24gdXNlIHRoaXMgdG8gY2FsbCB0aGUgZWRpdG9yIGluc2lkZSB0aGUgd2Vidmlld1xuICAgKi9cbiAgcHJpdmF0ZSB3cmFwRWRpdG9yQ2FsbHMob2JqOiBhbnkpOiBhbnkge1xuICAgIGNvbnN0IHRoYXQ6IGFueSA9IHRoaXM7XG4gICAgY29uc3QgaGFuZGxlcjogYW55ID0ge1xuICAgICAgZ2V0KHRhcmdldDogYW55LCBwcm9wS2V5OiBhbnksIHJlY2VpdmVyOiBhbnkpOiBhbnkge1xuICAgICAgICByZXR1cm4gYXN5bmMgKC4uLmFyZ3M6IGFueSk6IFByb21pc2U8YW55PiA9PiB7XG4gICAgICAgICAgaWYgKHRoYXQuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICAgICAgICBpZiAodGhhdC5fd2Vidmlldykge1xuICAgICAgICAgICAgICBjb25zdCBleGVjdXRlSmF2YVNjcmlwdDogKGNvZGU6IHN0cmluZykgPT4gUHJvbWlzZTxhbnk+ID0gKGNvZGU6IHN0cmluZykgPT5cbiAgICAgICAgICAgICAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICB0aGF0Ll93ZWJ2aWV3LmV4ZWN1dGVKYXZhU2NyaXB0KGNvZGUsIHJlc29sdmUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gZXhlY3V0ZUphdmFTY3JpcHQoJ2VkaXRvci4nICsgcHJvcEtleSArICcoJyArIGFyZ3MgKyAnKScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc3Qgb3JpZ01ldGhvZDogYW55ID0gdGFyZ2V0W3Byb3BLZXldO1xuICAgICAgICAgICAgICBjb25zdCByZXN1bHQ6IGFueSA9IGF3YWl0IG9yaWdNZXRob2QuYXBwbHkodGhhdC5fZWRpdG9yLCBhcmdzKTtcbiAgICAgICAgICAgICAgLy8gc2luY2UgcnVubmluZyBqYXZhc2NyaXB0IGNvZGUgbWFudWFsbHkgbmVlZCB0byBmb3JjZSBBbmd1bGFyIHRvIGRldGVjdCBjaGFuZ2VzXG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoYXQuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lXG4gICAgICAgICAgICAgICAgICBpZiAoIXRoYXQuX2NoYW5nZURldGVjdG9yUmVmWydkZXN0cm95ZWQnXSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0Ll9jaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfTtcbiAgICByZXR1cm4gbmV3IFByb3h5KG9iaiwgaGFuZGxlcik7XG4gIH1cblxuICAvKipcbiAgICogaW5pdE1vbmFjbyBtZXRob2QgY3JlYXRlcyB0aGUgbW9uYWNvIGVkaXRvciBpbnRvIHRoZSBAVmlld0NoaWxkKCdlZGl0b3JDb250YWluZXInKVxuICAgKiBhbmQgZW1pdCB0aGUgZWRpdG9ySW5pdGlhbGl6ZWQgZXZlbnQuICBUaGlzIGlzIG9ubHkgdXNlZCBpbiB0aGUgYnJvd3NlciB2ZXJzaW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBpbml0TW9uYWNvKCk6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRhaW5lckRpdjogSFRNTERpdkVsZW1lbnQgPSB0aGlzLl9lZGl0b3JDb250YWluZXIubmF0aXZlRWxlbWVudDtcbiAgICBjb250YWluZXJEaXYuaWQgPSB0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcjtcbiAgICB0aGlzLl9lZGl0b3IgPSBtb25hY28uZWRpdG9yLmNyZWF0ZShcbiAgICAgIGNvbnRhaW5lckRpdixcbiAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgIHtcbiAgICAgICAgICB2YWx1ZTogdGhpcy5fdmFsdWUsXG4gICAgICAgICAgbGFuZ3VhZ2U6IHRoaXMubGFuZ3VhZ2UsXG4gICAgICAgICAgdGhlbWU6IHRoaXMuX3RoZW1lLFxuICAgICAgICB9LFxuICAgICAgICB0aGlzLmVkaXRvck9wdGlvbnMsXG4gICAgICApLFxuICAgICk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9lZGl0b3JQcm94eSA9IHRoaXMud3JhcEVkaXRvckNhbGxzKHRoaXMuX2VkaXRvcik7XG4gICAgICB0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICB0aGlzLmVkaXRvckluaXRpYWxpemVkLmVtaXQodGhpcy5fZWRpdG9yUHJveHkpO1xuICAgIH0pO1xuICAgIHRoaXMuX2VkaXRvci5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlQ29udGVudCgoZTogYW55KSA9PiB7XG4gICAgICB0aGlzLl9mcm9tRWRpdG9yID0gdHJ1ZTtcbiAgICAgIHRoaXMud3JpdGVWYWx1ZSh0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKSk7XG4gICAgICBpZiAodGhpcy5pbml0aWFsQ29udGVudENoYW5nZSkge1xuICAgICAgICB0aGlzLmluaXRpYWxDb250ZW50Q2hhbmdlID0gZmFsc2U7XG4gICAgICAgIHRoaXMubGF5b3V0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5hZGRGdWxsU2NyZWVuTW9kZUNvbW1hbmQoKTtcbiAgfVxufVxuIl19