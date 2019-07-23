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
var noop = function () {
    // empty method
};
var ɵ0 = noop;
// counter for ids to allow for multiple editors on one page
/** @type {?} */
var uniqueCounter = 0;
var TdCodeEditorComponent = /** @class */ (function () {
    /**
     * Set if using Electron mode when object is created
     */
    function TdCodeEditorComponent(zone, _changeDetectorRef, _elementRef) {
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
        this.propagateChange = function (_) { };
        this.onTouched = function () { return noop; };
        // since accessing the window object need this check so serverside rendering doesn't fail
        if (typeof document === 'object' && !!document) {
            /* tslint:disable-next-line */
            this._isElectronApp = (((/** @type {?} */ (window)))['process']) ? true : false;
            if (this._isElectronApp) {
                this._appPath = electron.remote.app.getAppPath().split('\\').join('/');
            }
        }
    }
    Object.defineProperty(TdCodeEditorComponent.prototype, "automaticLayout", {
        /**
         * automaticLayout?: boolean
         * @deprecated in favor of our own resize implementation.
         */
        set: /**
         * automaticLayout?: boolean
         * @deprecated in favor of our own resize implementation.
         * @param {?} automaticLayout
         * @return {?}
         */
        function (automaticLayout) {
            // tslint:disable-next-line
            console.warn('[automaticLayout] has been deprecated in favor of our own resize implementation and will be removed on 3.0.0');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TdCodeEditorComponent.prototype, "value", {
        get: /**
         * @return {?}
         */
        function () {
            return this._value;
        },
        /**
         * value?: string
         * Value in the Editor after async getEditorContent was called
         */
        set: /**
         * value?: string
         * Value in the Editor after async getEditorContent was called
         * @param {?} value
         * @return {?}
         */
        function (value) {
            var _this = this;
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
                        this._setValueTimeout = setTimeout(function () {
                            _this.value = value;
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
                        this.zone.run(function () { return _this._value = value; });
                    }
                    else {
                        // Editor is not loaded yet, try again in half a second
                        this._setValueTimeout = setTimeout(function () {
                            _this.value = value;
                        }, 500);
                    }
                }
            }
            else {
                this._setValueTimeout = setTimeout(function () {
                    _this.value = value;
                }, 500);
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Implemented as part of ControlValueAccessor.
     */
    /**
     * Implemented as part of ControlValueAccessor.
     * @param {?} value
     * @return {?}
     */
    TdCodeEditorComponent.prototype.writeValue = /**
     * Implemented as part of ControlValueAccessor.
     * @param {?} value
     * @return {?}
     */
    function (value) {
        // do not write if null or undefined
        // tslint:disable-next-line
        if (value != undefined) {
            this.value = value;
        }
    };
    /**
     * @param {?} fn
     * @return {?}
     */
    TdCodeEditorComponent.prototype.registerOnChange = /**
     * @param {?} fn
     * @return {?}
     */
    function (fn) {
        this.propagateChange = fn;
    };
    /**
     * @param {?} fn
     * @return {?}
     */
    TdCodeEditorComponent.prototype.registerOnTouched = /**
     * @param {?} fn
     * @return {?}
     */
    function (fn) {
        this.onTouched = fn;
    };
    /**
     * getEditorContent?: function
     * Returns the content within the editor
     */
    /**
     * getEditorContent?: function
     * Returns the content within the editor
     * @return {?}
     */
    TdCodeEditorComponent.prototype.getValue = /**
     * getEditorContent?: function
     * Returns the content within the editor
     * @return {?}
     */
    function () {
        var _this = this;
        if (this._componentInitialized) {
            if (this._webview) {
                this._webview.send('getEditorContent');
                return this._subject.asObservable();
            }
            else if (this._editor) {
                this._value = this._editor.getValue();
                setTimeout(function () {
                    _this._subject.next(_this._value);
                    _this._subject.complete();
                    _this._subject = new Subject();
                    _this.onEditorValueChange.emit(undefined);
                });
                return this._subject.asObservable();
            }
        }
    };
    Object.defineProperty(TdCodeEditorComponent.prototype, "language", {
        get: /**
         * @return {?}
         */
        function () {
            return this._language;
        },
        /**
         * language?: string
         * language used in editor
         */
        set: /**
         * language?: string
         * language used in editor
         * @param {?} language
         * @return {?}
         */
        function (language) {
            var _this = this;
            this._language = language;
            if (this._componentInitialized) {
                if (this._webview) {
                    this._webview.send('setLanguage', language);
                }
                else if (this._editor) {
                    /** @type {?} */
                    var currentValue = this._editor.getValue();
                    this._editor.dispose();
                    /** @type {?} */
                    var myDiv = this._editorContainer.nativeElement;
                    this._editor = monaco.editor.create(myDiv, Object.assign({
                        value: currentValue,
                        language: language,
                        theme: this._theme,
                    }, this.editorOptions));
                    this._editor.getModel().onDidChangeContent(function (e) {
                        _this._fromEditor = true;
                        _this.writeValue(_this._editor.getValue());
                    });
                    this.onEditorConfigurationChanged.emit(undefined);
                    this.onEditorLanguageChanged.emit(undefined);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * registerLanguage?: function
     * Registers a custom Language within the editor
     */
    /**
     * registerLanguage?: function
     * Registers a custom Language within the editor
     * @param {?} language
     * @return {?}
     */
    TdCodeEditorComponent.prototype.registerLanguage = /**
     * registerLanguage?: function
     * Registers a custom Language within the editor
     * @param {?} language
     * @return {?}
     */
    function (language) {
        if (this._componentInitialized) {
            if (this._webview) {
                this._webview.send('registerLanguage', language);
            }
            else if (this._editor) {
                /** @type {?} */
                var currentValue = this._editor.getValue();
                this._editor.dispose();
                for (var i = 0; i < language.completionItemProvider.length; i++) {
                    /** @type {?} */
                    var provider = language.completionItemProvider[i];
                    /* tslint:disable-next-line */
                    provider.kind = eval(provider.kind);
                }
                for (var i = 0; i < language.monarchTokensProvider.length; i++) {
                    /** @type {?} */
                    var monarchTokens = language.monarchTokensProvider[i];
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
                    provideCompletionItems: function () {
                        return language.completionItemProvider;
                    },
                });
                /** @type {?} */
                var css = document.createElement('style');
                css.type = 'text/css';
                css.innerHTML = language.monarchTokensProviderCSS;
                document.body.appendChild(css);
                this.onEditorConfigurationChanged.emit(undefined);
            }
        }
    };
    Object.defineProperty(TdCodeEditorComponent.prototype, "editorStyle", {
        get: /**
         * @return {?}
         */
        function () {
            return this._editorStyle;
        },
        /**
         * style?: string
         * css style of the editor on the page
         */
        set: /**
         * style?: string
         * css style of the editor on the page
         * @param {?} editorStyle
         * @return {?}
         */
        function (editorStyle) {
            var _this = this;
            this._editorStyle = editorStyle;
            if (this._componentInitialized) {
                if (this._webview) {
                    this._webview.send('setEditorStyle', { language: this._language, theme: this._theme, style: editorStyle });
                }
                else if (this._editor) {
                    /** @type {?} */
                    var containerDiv = this._editorContainer.nativeElement;
                    containerDiv.setAttribute('style', editorStyle);
                    /** @type {?} */
                    var currentValue = this._editor.getValue();
                    this._editor.dispose();
                    /** @type {?} */
                    var myDiv = this._editorContainer.nativeElement;
                    this._editor = monaco.editor.create(myDiv, Object.assign({
                        value: currentValue,
                        language: this._language,
                        theme: this._theme,
                    }, this.editorOptions));
                    this._editor.getModel().onDidChangeContent(function (e) {
                        _this._fromEditor = true;
                        _this.writeValue(_this._editor.getValue());
                    });
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TdCodeEditorComponent.prototype, "theme", {
        get: /**
         * @return {?}
         */
        function () {
            return this._theme;
        },
        /**
         * theme?: string
         * Theme to be applied to editor
         */
        set: /**
         * theme?: string
         * Theme to be applied to editor
         * @param {?} theme
         * @return {?}
         */
        function (theme) {
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TdCodeEditorComponent.prototype, "fullScreenKeyBinding", {
        get: /**
         * @return {?}
         */
        function () {
            return this._keycode;
        },
        /**
         * fullScreenKeyBinding?: number
         * See here for key bindings https://microsoft.github.io/monaco-editor/api/enums/monaco.keycode.html
         * Sets the KeyCode for shortcutting to Fullscreen mode
         */
        set: /**
         * fullScreenKeyBinding?: number
         * See here for key bindings https://microsoft.github.io/monaco-editor/api/enums/monaco.keycode.html
         * Sets the KeyCode for shortcutting to Fullscreen mode
         * @param {?} keycode
         * @return {?}
         */
        function (keycode) {
            this._keycode = keycode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TdCodeEditorComponent.prototype, "editorOptions", {
        get: /**
         * @return {?}
         */
        function () {
            return this._editorOptions;
        },
        /**
         * editorOptions?: Object
         * Options used on editor instantiation. Available options listed here:
         * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditoroptions.html
         */
        set: /**
         * editorOptions?: Object
         * Options used on editor instantiation. Available options listed here:
         * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditoroptions.html
         * @param {?} editorOptions
         * @return {?}
         */
        function (editorOptions) {
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
        },
        enumerable: true,
        configurable: true
    });
    /**
     * layout method that calls layout method of editor and instructs the editor to remeasure its container
     */
    /**
     * layout method that calls layout method of editor and instructs the editor to remeasure its container
     * @return {?}
     */
    TdCodeEditorComponent.prototype.layout = /**
     * layout method that calls layout method of editor and instructs the editor to remeasure its container
     * @return {?}
     */
    function () {
        if (this._componentInitialized) {
            if (this._webview) {
                this._webview.send('layout');
            }
            else if (this._editor) {
                this._editor.layout();
            }
        }
    };
    Object.defineProperty(TdCodeEditorComponent.prototype, "isElectronApp", {
        /**
         * Returns if in Electron mode or not
         */
        get: /**
         * Returns if in Electron mode or not
         * @return {?}
         */
        function () {
            return this._isElectronApp;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TdCodeEditorComponent.prototype, "isFullScreen", {
        /**
         * Returns if in Full Screen Mode or not
         */
        get: /**
         * Returns if in Full Screen Mode or not
         * @return {?}
         */
        function () {
            return this._isFullScreen;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * setEditorNodeModuleDirOverride function that overrides where to look
     * for the editor node_module. Used in tests for Electron or anywhere that the
     * node_modules are not in the expected location.
     */
    /**
     * setEditorNodeModuleDirOverride function that overrides where to look
     * for the editor node_module. Used in tests for Electron or anywhere that the
     * node_modules are not in the expected location.
     * @param {?} dirOverride
     * @return {?}
     */
    TdCodeEditorComponent.prototype.setEditorNodeModuleDirOverride = /**
     * setEditorNodeModuleDirOverride function that overrides where to look
     * for the editor node_module. Used in tests for Electron or anywhere that the
     * node_modules are not in the expected location.
     * @param {?} dirOverride
     * @return {?}
     */
    function (dirOverride) {
        this._editorNodeModuleDirOverride = dirOverride;
        this._appPath = dirOverride;
    };
    /**
     * ngOnInit only used for Electron version of editor
     * This is where the webview is created to sandbox away the editor
     */
    /**
     * ngOnInit only used for Electron version of editor
     * This is where the webview is created to sandbox away the editor
     * @return {?}
     */
    TdCodeEditorComponent.prototype.ngOnInit = /**
     * ngOnInit only used for Electron version of editor
     * This is where the webview is created to sandbox away the editor
     * @return {?}
     */
    function () {
        var _this = this;
        /** @type {?} */
        var editorHTML = '';
        if (this._isElectronApp) {
            editorHTML = "<!DOCTYPE html>\n            <html style=\"height:100%\">\n            <head>\n                <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\" />\n                <meta http-equiv=\"Content-Type\" content=\"text/html;charset=utf-8\" >\n                <link rel=\"stylesheet\" data-name=\"vs/editor/editor.main\"\n                    href=\"file://" + this._editorNodeModuleDirOverride + "/assets/monaco/vs/editor/editor.main.css\">\n            </head>\n            <body style=\"height:100%;width: 100%;margin: 0;padding: 0;overflow: hidden;\">\n            <div id=\"" + this._editorInnerContainer + "\" style=\"width:100%;height:100%;" + this._editorStyle + "\"></div>\n            <script>\n                // Get the ipcRenderer of electron for communication\n                const {ipcRenderer} = require('electron');\n            </script>\n            <script src=\"file://" + this._editorNodeModuleDirOverride + "/assets/monaco/vs/loader.js\"></script>\n            <script>\n                var editor;\n                var theme = '" + this._theme + "';\n                var value = '" + this._value + "';\n\n                require.config({\n                    baseUrl: '" + this._appPath + "/assets/monaco'\n                });\n                self.module = undefined;\n                self.process.browser = true;\n\n                require(['vs/editor/editor.main'], function() {\n                    editor = monaco.editor.create(document.getElementById('" + this._editorInnerContainer + "'), Object.assign({\n                        value: value,\n                        language: '" + this.language + "',\n                        theme: '" + this._theme + "',\n                    }, " + JSON.stringify(this.editorOptions) + "));\n                    editor.getModel().onDidChangeContent( (e)=> {\n                        ipcRenderer.sendToHost(\"onEditorContentChange\", editor.getValue());\n                    });\n                    editor.addAction({\n                      // An unique identifier of the contributed action.\n                      id: 'fullScreen',\n                      // A label of the action that will be presented to the user.\n                      label: 'Full Screen',\n                      // An optional array of keybindings for the action.\n                      contextMenuGroupId: 'navigation',\n                      keybindings: [" + this._keycode + "],\n                      contextMenuOrder: 1.5,\n                      // Method that will be executed when the action is triggered.\n                      // @param editor The editor instance is passed in as a convinience\n                      run: function(ed) {\n                        var editorDiv = document.getElementById('" + this._editorInnerContainer + "');\n                        editorDiv.webkitRequestFullscreen();\n                      }\n                    });\n                    editor.addAction({\n                      // An unique identifier of the contributed action.\n                      id: 'exitfullScreen',\n                      // A label of the action that will be presented to the user.\n                      label: 'Exit Full Screen',\n                      // An optional array of keybindings for the action.\n                      contextMenuGroupId: 'navigation',\n                      keybindings: [9],\n                      contextMenuOrder: 1.5,\n                      // Method that will be executed when the action is triggered.\n                      // @param editor The editor instance is passed in as a convinience\n                      run: function(ed) {\n                        var editorDiv = document.getElementById('" + this._editorInnerContainer + "');\n                        document.webkitExitFullscreen();\n                      }\n                    });\n                    ipcRenderer.sendToHost(\"onEditorInitialized\", this._editor);\n                });\n\n                // return back the value in the editor to the mainview\n                ipcRenderer.on('getEditorContent', function(){\n                    ipcRenderer.sendToHost(\"editorContent\", editor.getValue());\n                });\n\n                // set the value of the editor from what was sent from the mainview\n                ipcRenderer.on('setEditorContent', function(event, data){\n                    value = data;\n                    editor.setValue(data);\n                });\n\n                // set the style of the editor container div\n                ipcRenderer.on('setEditorStyle', function(event, data){\n                    var editorDiv = document.getElementById('" + this._editorInnerContainer + "');\n                    editorDiv.style = data.style;\n                    var currentValue = editor.getValue();\n                    editor.dispose();\n                    editor = monaco.editor.create(document.getElementById('" + this._editorInnerContainer + "'), Object.assign({\n                        value: currentValue,\n                        language: data.language,\n                        theme: data.theme,\n                    }, " + JSON.stringify(this.editorOptions) + "));\n                });\n\n                // set the options of the editor from what was sent from the mainview\n                ipcRenderer.on('setEditorOptions', function(event, data){\n                    editor.updateOptions(data);\n                    ipcRenderer.sendToHost(\"onEditorConfigurationChanged\", '');\n                });\n\n                // set the language of the editor from what was sent from the mainview\n                ipcRenderer.on('setLanguage', function(event, data){\n                    var currentValue = editor.getValue();\n                    editor.dispose();\n                    editor = monaco.editor.create(document.getElementById('" + this._editorInnerContainer + "'), Object.assign({\n                        value: currentValue,\n                        language: data,\n                        theme: theme,\n                    }, " + JSON.stringify(this.editorOptions) + "));\n                    ipcRenderer.sendToHost(\"onEditorConfigurationChanged\", '');\n                    ipcRenderer.sendToHost(\"onEditorLanguageChanged\", '');\n                });\n\n                // register a new language with editor\n                ipcRenderer.on('registerLanguage', function(event, data){\n                    var currentValue = editor.getValue();\n                    editor.dispose();\n\n                    for (var i = 0; i < data.completionItemProvider.length; i++) {\n                        var provider = data.completionItemProvider[i];\n                        provider.kind = eval(provider.kind);\n                    }\n                    for (var i = 0; i < data.monarchTokensProvider.length; i++) {\n                        var monarchTokens = data.monarchTokensProvider[i];\n                        monarchTokens[0] = eval(monarchTokens[0]);\n                    }\n                    monaco.languages.register({ id: data.id });\n\n                    monaco.languages.setMonarchTokensProvider(data.id, {\n                        tokenizer: {\n                            root: data.monarchTokensProvider\n                        }\n                    });\n\n                    // Define a new theme that constains only rules that match this language\n                    monaco.editor.defineTheme(data.customTheme.id, data.customTheme.theme);\n                    theme = data.customTheme.id;\n\n                    monaco.languages.registerCompletionItemProvider(data.id, {\n                        provideCompletionItems: () => {\n                            return data.completionItemProvider\n                        }\n                    });\n\n                    var css = document.createElement(\"style\");\n                    css.type = \"text/css\";\n                    css.innerHTML = data.monarchTokensProviderCSS;\n                    document.body.appendChild(css);\n\n                    ipcRenderer.sendToHost(\"onEditorConfigurationChanged\", '');\n                });\n\n                // Instruct the editor to remeasure its container\n                ipcRenderer.on('layout', function(){\n                    editor.layout();\n                });\n\n                // Instruct the editor go to full screen mode\n                ipcRenderer.on('showFullScreenEditor', function() {\n                  var editorDiv = document.getElementById('" + this._editorInnerContainer + "');\n                  editorDiv.webkitRequestFullscreen();\n                });\n\n                // Instruct the editor exit full screen mode\n                ipcRenderer.on('exitFullScreenEditor', function() {\n                  var editorDiv = document.getElementById('" + this._editorInnerContainer + "');\n                  editorDiv.webkitExitFullscreen();\n                });\n\n                ipcRenderer.on('dispose', function(){\n                  editor.dispose();\n                });\n\n                // need to manually resize the editor any time the window size\n                // changes. See: https://github.com/Microsoft/monaco-editor/issues/28\n                window.addEventListener(\"resize\", function resizeEditor() {\n                    editor.layout();\n                });\n            </script>\n            </body>\n            </html>";
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
            this._webview.addEventListener('ipc-message', function (event) {
                if (event.channel === 'editorContent') {
                    _this._fromEditor = true;
                    _this.writeValue(event.args[0]);
                    _this._subject.next(_this._value);
                    _this._subject.complete();
                    _this._subject = new Subject();
                }
                else if (event.channel === 'onEditorContentChange') {
                    _this._fromEditor = true;
                    _this.writeValue(event.args[0]);
                    if (_this.initialContentChange) {
                        _this.initialContentChange = false;
                        _this.layout();
                    }
                }
                else if (event.channel === 'onEditorInitialized') {
                    _this._componentInitialized = true;
                    _this._editorProxy = _this.wrapEditorCalls(_this._editor);
                    _this.onEditorInitialized.emit(_this._editorProxy);
                }
                else if (event.channel === 'onEditorConfigurationChanged') {
                    _this.onEditorConfigurationChanged.emit(undefined);
                }
                else if (event.channel === 'onEditorLanguageChanged') {
                    _this.onEditorLanguageChanged.emit(undefined);
                }
            });
            // append the webview to the DOM
            this._editorContainer.nativeElement.appendChild(this._webview);
        }
    };
    /**
     * ngAfterViewInit only used for browser version of editor
     * This is where the AMD Loader scripts are added to the browser and the editor scripts are "required"
     */
    /**
     * ngAfterViewInit only used for browser version of editor
     * This is where the AMD Loader scripts are added to the browser and the editor scripts are "required"
     * @return {?}
     */
    TdCodeEditorComponent.prototype.ngAfterViewInit = /**
     * ngAfterViewInit only used for browser version of editor
     * This is where the AMD Loader scripts are added to the browser and the editor scripts are "required"
     * @return {?}
     */
    function () {
        var _this = this;
        if (!this._isElectronApp) {
            loadMonaco();
            waitUntilMonacoReady().pipe(takeUntil(this._destroy)).subscribe(function () {
                _this.initMonaco();
            });
        }
        merge(fromEvent(window, 'resize').pipe(debounceTime(100)), this._widthSubject.asObservable().pipe(distinctUntilChanged()), this._heightSubject.asObservable().pipe(distinctUntilChanged())).pipe(takeUntil(this._destroy), debounceTime(100)).subscribe(function () {
            _this.layout();
            _this._changeDetectorRef.markForCheck();
        });
        timer(500, 250).pipe(takeUntil(this._destroy)).subscribe(function () {
            if (_this._elementRef && _this._elementRef.nativeElement) {
                _this._widthSubject.next(((/** @type {?} */ (_this._elementRef.nativeElement))).getBoundingClientRect().width);
                _this._heightSubject.next(((/** @type {?} */ (_this._elementRef.nativeElement))).getBoundingClientRect().height);
            }
        });
    };
    /**
     * @return {?}
     */
    TdCodeEditorComponent.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        this._changeDetectorRef.detach();
        if (this._webview) {
            this._webview.send('dispose');
        }
        else if (this._editor) {
            this._editor.dispose();
        }
        this._destroy.next(true);
        this._destroy.unsubscribe();
    };
    /**
     * showFullScreenEditor request for full screen of Code Editor based on its browser type.
     */
    /**
     * showFullScreenEditor request for full screen of Code Editor based on its browser type.
     * @return {?}
     */
    TdCodeEditorComponent.prototype.showFullScreenEditor = /**
     * showFullScreenEditor request for full screen of Code Editor based on its browser type.
     * @return {?}
     */
    function () {
        var e_1, _a;
        if (this._componentInitialized) {
            if (this._webview) {
                this._webview.send('showFullScreenEditor');
            }
            else {
                /** @type {?} */
                var codeEditorElement_1 = (/** @type {?} */ (this._editorContainer.nativeElement));
                /** @type {?} */
                var fullScreenMap = {
                    // Chrome
                    'requestFullscreen': function () { return codeEditorElement_1.requestFullscreen(); },
                    // Safari
                    'webkitRequestFullscreen': function () { return ((/** @type {?} */ (codeEditorElement_1))).webkitRequestFullscreen(); },
                    // IE
                    'msRequestFullscreen': function () { return ((/** @type {?} */ (codeEditorElement_1))).msRequestFullscreen(); },
                    // Firefox
                    'mozRequestFullScreen': function () { return ((/** @type {?} */ (codeEditorElement_1))).mozRequestFullScreen(); },
                };
                try {
                    for (var _b = tslib_1.__values(Object.keys(fullScreenMap)), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var handler = _c.value;
                        if (codeEditorElement_1[handler]) {
                            fullScreenMap[handler]();
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        }
        this._isFullScreen = true;
    };
    /**
     * exitFullScreenEditor request to exit full screen of Code Editor based on its browser type.
     */
    /**
     * exitFullScreenEditor request to exit full screen of Code Editor based on its browser type.
     * @return {?}
     */
    TdCodeEditorComponent.prototype.exitFullScreenEditor = /**
     * exitFullScreenEditor request to exit full screen of Code Editor based on its browser type.
     * @return {?}
     */
    function () {
        var e_2, _a;
        if (this._componentInitialized) {
            if (this._webview) {
                this._webview.send('exitFullScreenEditor');
            }
            else {
                /** @type {?} */
                var exitFullScreenMap = {
                    // Chrome
                    'exitFullscreen': function () { return document.exitFullscreen(); },
                    // Safari
                    'webkitExitFullscreen': function () { return ((/** @type {?} */ (document))).webkitExitFullscreen(); },
                    // Firefox
                    'mozCancelFullScreen': function () { return ((/** @type {?} */ (document))).mozCancelFullScreen(); },
                    // IE
                    'msExitFullscreen': function () { return ((/** @type {?} */ (document))).msExitFullscreen(); },
                };
                try {
                    for (var _b = tslib_1.__values(Object.keys(exitFullScreenMap)), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var handler = _c.value;
                        if (document[handler]) {
                            exitFullScreenMap[handler]();
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        this._isFullScreen = false;
    };
    /**
     * addFullScreenModeCommand used to add the fullscreen option to the context menu
     */
    /**
     * addFullScreenModeCommand used to add the fullscreen option to the context menu
     * @return {?}
     */
    TdCodeEditorComponent.prototype.addFullScreenModeCommand = /**
     * addFullScreenModeCommand used to add the fullscreen option to the context menu
     * @return {?}
     */
    function () {
        var _this = this;
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
            run: function (ed) {
                _this.showFullScreenEditor();
            },
        });
    };
    /**
     * wrapEditorCalls used to proxy all the calls to the monaco editor
     * For calls for Electron use this to call the editor inside the webview
     */
    /**
     * wrapEditorCalls used to proxy all the calls to the monaco editor
     * For calls for Electron use this to call the editor inside the webview
     * @param {?} obj
     * @return {?}
     */
    TdCodeEditorComponent.prototype.wrapEditorCalls = /**
     * wrapEditorCalls used to proxy all the calls to the monaco editor
     * For calls for Electron use this to call the editor inside the webview
     * @param {?} obj
     * @return {?}
     */
    function (obj) {
        /** @type {?} */
        var that = this;
        /** @type {?} */
        var handler = {
            get: /**
             * @param {?} target
             * @param {?} propKey
             * @param {?} receiver
             * @return {?}
             */
            function (target, propKey, receiver) {
                var _this = this;
                return function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var executeJavaScript, result, origMethod, result;
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!that._componentInitialized) return [3 /*break*/, 4];
                                    if (!that._webview) return [3 /*break*/, 2];
                                    executeJavaScript = function (code) {
                                        return new Promise(function (resolve) {
                                            that._webview.executeJavaScript(code, resolve);
                                        });
                                    };
                                    return [4 /*yield*/, executeJavaScript('editor.' + propKey + '(' + args + ')')];
                                case 1:
                                    result = _a.sent();
                                    return [2 /*return*/, result];
                                case 2:
                                    origMethod = target[propKey];
                                    return [4 /*yield*/, origMethod.apply(that._editor, args)];
                                case 3:
                                    result = _a.sent();
                                    // since running javascript code manually need to force Angular to detect changes
                                    setTimeout(function () {
                                        that.zone.run(function () {
                                            // tslint:disable-next-line
                                            if (!that._changeDetectorRef['destroyed']) {
                                                that._changeDetectorRef.detectChanges();
                                            }
                                        });
                                    });
                                    return [2 /*return*/, result];
                                case 4: return [2 /*return*/];
                            }
                        });
                    });
                };
            },
        };
        return new Proxy(obj, handler);
    };
    /**
     * initMonaco method creates the monaco editor into the @ViewChild('editorContainer')
     * and emit the onEditorInitialized event.  This is only used in the browser version.
     */
    /**
     * initMonaco method creates the monaco editor into the \@ViewChild('editorContainer')
     * and emit the onEditorInitialized event.  This is only used in the browser version.
     * @return {?}
     */
    TdCodeEditorComponent.prototype.initMonaco = /**
     * initMonaco method creates the monaco editor into the \@ViewChild('editorContainer')
     * and emit the onEditorInitialized event.  This is only used in the browser version.
     * @return {?}
     */
    function () {
        var _this = this;
        /** @type {?} */
        var containerDiv = this._editorContainer.nativeElement;
        containerDiv.id = this._editorInnerContainer;
        this._editor = monaco.editor.create(containerDiv, Object.assign({
            value: this._value,
            language: this.language,
            theme: this._theme,
        }, this.editorOptions));
        setTimeout(function () {
            _this._editorProxy = _this.wrapEditorCalls(_this._editor);
            _this._componentInitialized = true;
            _this.onEditorInitialized.emit(_this._editorProxy);
        });
        this._editor.getModel().onDidChangeContent(function (e) {
            _this._fromEditor = true;
            _this.writeValue(_this._editor.getValue());
            if (_this.initialContentChange) {
                _this.initialContentChange = false;
                _this.layout();
            }
        });
        this.addFullScreenModeCommand();
    };
    TdCodeEditorComponent.decorators = [
        { type: Component, args: [{
                    selector: 'td-code-editor',
                    template: "<div class=\"editorContainer\" #editorContainer></div>\n",
                    providers: [{
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(function () { return TdCodeEditorComponent; }),
                            multi: true,
                        }],
                    styles: [":host{display:block;position:relative}:host .editorContainer{position:absolute;top:0;bottom:0;left:0;right:0}::ng-deep .monaco-aria-container{display:none}"]
                }] }
    ];
    /** @nocollapse */
    TdCodeEditorComponent.ctorParameters = function () { return [
        { type: NgZone },
        { type: ChangeDetectorRef },
        { type: ElementRef }
    ]; };
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
    return TdCodeEditorComponent;
}());
export { TdCodeEditorComponent };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS1lZGl0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGNvdmFsZW50L2NvZGUtZWRpdG9yLyIsInNvdXJjZXMiOlsiY29kZS1lZGl0b3IuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFDN0MsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixFQUFhLE1BQU0sZUFBZSxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxpQkFBaUIsRUFBd0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6RSxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvQyxPQUFPLEVBQUUsWUFBWSxFQUFFLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRS9FLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxVQUFVLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7SUFFakUsSUFBSSxHQUFRO0lBQ2hCLGVBQWU7QUFDakIsQ0FBQzs7OztJQUdHLGFBQWEsR0FBVyxDQUFDO0FBSzdCO0lBaUZFOztPQUVHO0lBQ0gsK0JBQ1UsSUFBWSxFQUNaLGtCQUFxQyxFQUNyQyxXQUF1QjtRQUZ2QixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ1osdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtRQUNyQyxnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQTNFekIsYUFBUSxHQUFxQixJQUFJLE9BQU8sRUFBVyxDQUFDO1FBQ3BELGtCQUFhLEdBQW9CLElBQUksT0FBTyxFQUFVLENBQUM7UUFDdkQsbUJBQWMsR0FBb0IsSUFBSSxPQUFPLEVBQVUsQ0FBQztRQUV4RCxpQkFBWSxHQUFXLCtDQUErQyxDQUFDO1FBQ3ZF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NUIsS0FBSyxTQUFDLGVBQWU7O0lBcWV4Qiw0QkFBQztDQUFBLEFBL3pCRCxJQSt6QkM7U0FyekJZLHFCQUFxQjs7O0lBRWhDLHlDQUE0RDs7SUFDNUQsOENBQStEOztJQUMvRCwrQ0FBZ0U7O0lBRWhFLDZDQUErRTs7SUFDL0UseUNBQThCOztJQUM5QiwrQ0FBd0M7O0lBQ3hDLHlDQUFzQjs7SUFDdEIsdUNBQTRCOztJQUM1Qix1Q0FBOEI7O0lBQzlCLDBDQUF5Qzs7SUFDekMseUNBQWtEOztJQUNsRCxzREFBaUY7O0lBQ2pGLDZEQUFrRDs7SUFDbEQsd0NBQXFCOztJQUNyQiw2Q0FBMEI7O0lBQzFCLHNEQUErQzs7SUFDL0MsNENBQXFDOztJQUNyQywrQ0FBaUM7O0lBQ2pDLDhDQUF1Qzs7SUFDdkMseUNBQXNCOztJQUN0QixpREFBOEI7O0lBQzlCLHFEQUE2Qzs7SUFFN0MsaURBQTJEOzs7Ozs7SUFnQjNELG9EQUFnRzs7Ozs7O0lBTWhHLDZEQUFrSDs7Ozs7O0lBTWxILHdEQUF3Rzs7Ozs7O0lBTXhHLG9EQUFnRzs7Ozs7O0lBTWhHLHlDQUEwRTs7SUFFMUUsZ0RBQWlDOztJQUNqQywwQ0FBdUI7O0lBTXJCLHFDQUFvQjs7SUFDcEIsbURBQTZDOztJQUM3Qyw0Q0FBK0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPdXRwdXQsIEV2ZW50RW1pdHRlciwgT25Jbml0LCBBZnRlclZpZXdJbml0LFxuICBWaWV3Q2hpbGQsIEVsZW1lbnRSZWYsIGZvcndhcmRSZWYsIE5nWm9uZSwgQ2hhbmdlRGV0ZWN0b3JSZWYsIE9uRGVzdHJveSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTkdfVkFMVUVfQUNDRVNTT1IsIENvbnRyb2xWYWx1ZUFjY2Vzc29yIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZnJvbUV2ZW50LCBtZXJnZSwgdGltZXIgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGRlYm91bmNlVGltZSwgZGlzdGluY3RVbnRpbENoYW5nZWQsIHRha2VVbnRpbCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgd2FpdFVudGlsTW9uYWNvUmVhZHksIGxvYWRNb25hY28gfSBmcm9tICcuL2NvZGUtZWRpdG9yLnV0aWxzJztcblxuY29uc3Qgbm9vcDogYW55ID0gKCkgPT4ge1xuICAvLyBlbXB0eSBtZXRob2Rcbn07XG5cbi8vIGNvdW50ZXIgZm9yIGlkcyB0byBhbGxvdyBmb3IgbXVsdGlwbGUgZWRpdG9ycyBvbiBvbmUgcGFnZVxubGV0IHVuaXF1ZUNvdW50ZXI6IG51bWJlciA9IDA7XG4vLyBkZWNsYXJlIGFsbCB0aGUgYnVpbHQgaW4gZWxlY3Ryb24gb2JqZWN0c1xuZGVjbGFyZSBjb25zdCBlbGVjdHJvbjogYW55O1xuZGVjbGFyZSBjb25zdCBtb25hY286IGFueTtcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAndGQtY29kZS1lZGl0b3InLFxuICB0ZW1wbGF0ZVVybDogJy4vY29kZS1lZGl0b3IuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vY29kZS1lZGl0b3IuY29tcG9uZW50LnNjc3MnIF0sXG4gIHByb3ZpZGVyczogW3tcbiAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBUZENvZGVFZGl0b3JDb21wb25lbnQpLFxuICAgIG11bHRpOiB0cnVlLFxuICB9XSxcbn0pXG5leHBvcnQgY2xhc3MgVGRDb2RlRWRpdG9yQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBBZnRlclZpZXdJbml0LCBDb250cm9sVmFsdWVBY2Nlc3NvciwgT25EZXN0cm95IHtcblxuICBwcml2YXRlIF9kZXN0cm95OiBTdWJqZWN0PGJvb2xlYW4+ID0gbmV3IFN1YmplY3Q8Ym9vbGVhbj4oKTtcbiAgcHJpdmF0ZSBfd2lkdGhTdWJqZWN0OiBTdWJqZWN0PG51bWJlcj4gPSBuZXcgU3ViamVjdDxudW1iZXI+KCk7XG4gIHByaXZhdGUgX2hlaWdodFN1YmplY3Q6IFN1YmplY3Q8bnVtYmVyPiA9IG5ldyBTdWJqZWN0PG51bWJlcj4oKTtcblxuICBwcml2YXRlIF9lZGl0b3JTdHlsZTogc3RyaW5nID0gJ3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7Ym9yZGVyOjFweCBzb2xpZCBncmV5Oyc7XG4gIHByaXZhdGUgX2FwcFBhdGg6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlIF9pc0VsZWN0cm9uQXBwOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX3dlYnZpZXc6IGFueTtcbiAgcHJpdmF0ZSBfdmFsdWU6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlIF90aGVtZTogc3RyaW5nID0gJ3ZzJztcbiAgcHJpdmF0ZSBfbGFuZ3VhZ2U6IHN0cmluZyA9ICdqYXZhc2NyaXB0JztcbiAgcHJpdmF0ZSBfc3ViamVjdDogU3ViamVjdDxzdHJpbmc+ID0gbmV3IFN1YmplY3QoKTtcbiAgcHJpdmF0ZSBfZWRpdG9ySW5uZXJDb250YWluZXI6IHN0cmluZyA9ICdlZGl0b3JJbm5lckNvbnRhaW5lcicgKyB1bmlxdWVDb3VudGVyKys7XG4gIHByaXZhdGUgX2VkaXRvck5vZGVNb2R1bGVEaXJPdmVycmlkZTogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgX2VkaXRvcjogYW55O1xuICBwcml2YXRlIF9lZGl0b3JQcm94eTogYW55O1xuICBwcml2YXRlIF9jb21wb25lbnRJbml0aWFsaXplZDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9mcm9tRWRpdG9yOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX2VkaXRvck9wdGlvbnM6IGFueSA9IHt9O1xuICBwcml2YXRlIF9pc0Z1bGxTY3JlZW46IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfa2V5Y29kZTogYW55O1xuICBwcml2YXRlIF9zZXRWYWx1ZVRpbWVvdXQ6IGFueTtcbiAgcHJpdmF0ZSBpbml0aWFsQ29udGVudENoYW5nZTogYm9vbGVhbiA9IHRydWU7XG5cbiAgQFZpZXdDaGlsZCgnZWRpdG9yQ29udGFpbmVyJykgX2VkaXRvckNvbnRhaW5lcjogRWxlbWVudFJlZjtcblxuICAvKipcbiAgICogYXV0b21hdGljTGF5b3V0PzogYm9vbGVhblxuICAgKiBAZGVwcmVjYXRlZCBpbiBmYXZvciBvZiBvdXIgb3duIHJlc2l6ZSBpbXBsZW1lbnRhdGlvbi5cbiAgICovXG4gIEBJbnB1dCgnYXV0b21hdGljTGF5b3V0JylcbiAgc2V0IGF1dG9tYXRpY0xheW91dChhdXRvbWF0aWNMYXlvdXQ6IGJvb2xlYW4pIHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmVcbiAgICBjb25zb2xlLndhcm4oJ1thdXRvbWF0aWNMYXlvdXRdIGhhcyBiZWVuIGRlcHJlY2F0ZWQgaW4gZmF2b3Igb2Ygb3VyIG93biByZXNpemUgaW1wbGVtZW50YXRpb24gYW5kIHdpbGwgYmUgcmVtb3ZlZCBvbiAzLjAuMCcpO1xuICB9XG5cbiAvKipcbiAgKiBlZGl0b3JJbml0aWFsaXplZDogZnVuY3Rpb24oJGV2ZW50KVxuICAqIEV2ZW50IGVtaXR0ZWQgd2hlbiBlZGl0b3IgaXMgZmlyc3QgaW5pdGlhbGl6ZWRcbiAgKi9cbiAgQE91dHB1dCgnZWRpdG9ySW5pdGlhbGl6ZWQnKSBvbkVkaXRvckluaXRpYWxpemVkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAvKipcbiAgKiBlZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZDogZnVuY3Rpb24oJGV2ZW50KVxuICAqIEV2ZW50IGVtaXR0ZWQgd2hlbiBlZGl0b3IncyBjb25maWd1cmF0aW9uIGNoYW5nZXNcbiAgKi9cbiAgQE91dHB1dCgnZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQnKSBvbkVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAvKipcbiAgKiBlZGl0b3JMYW5ndWFnZUNoYW5nZWQ6IGZ1bmN0aW9uKCRldmVudClcbiAgKiBFdmVudCBlbWl0dGVkIHdoZW4gZWRpdG9yJ3MgTGFuZ3VhZ2UgY2hhbmdlc1xuICAqL1xuICBAT3V0cHV0KCdlZGl0b3JMYW5ndWFnZUNoYW5nZWQnKSBvbkVkaXRvckxhbmd1YWdlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gLyoqXG4gICogZWRpdG9yVmFsdWVDaGFuZ2U6IGZ1bmN0aW9uKCRldmVudClcbiAgKiBFdmVudCBlbWl0dGVkIGFueSB0aW1lIHNvbWV0aGluZyBjaGFuZ2VzIHRoZSBlZGl0b3IgdmFsdWVcbiAgKi9cbiAgQE91dHB1dCgnZWRpdG9yVmFsdWVDaGFuZ2UnKSBvbkVkaXRvclZhbHVlQ2hhbmdlOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIFRoZSBjaGFuZ2UgZXZlbnQgbm90aWZpZXMgeW91IGFib3V0IGEgY2hhbmdlIGhhcHBlbmluZyBpbiBhbiBpbnB1dCBmaWVsZC5cbiAgICogU2luY2UgdGhlIGNvbXBvbmVudCBpcyBub3QgYSBuYXRpdmUgQW5ndWxhciBjb21wb25lbnQgaGF2ZSB0byBzcGVjaWZpeSB0aGUgZXZlbnQgZW1pdHRlciBvdXJzZWxmXG4gICAqL1xuICBAT3V0cHV0KCdjaGFuZ2UnKSBvbkNoYW5nZTogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICAvKiB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmUgKi9cbiAgcHJvcGFnYXRlQ2hhbmdlID0gKF86IGFueSkgPT4ge307XG4gIG9uVG91Y2hlZCA9ICgpID0+IG5vb3A7XG5cbiAgLyoqXG4gICAqIFNldCBpZiB1c2luZyBFbGVjdHJvbiBtb2RlIHdoZW4gb2JqZWN0IGlzIGNyZWF0ZWRcbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgem9uZTogTmdab25lLFxuICAgIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICApIHtcbiAgICAvLyBzaW5jZSBhY2Nlc3NpbmcgdGhlIHdpbmRvdyBvYmplY3QgbmVlZCB0aGlzIGNoZWNrIHNvIHNlcnZlcnNpZGUgcmVuZGVyaW5nIGRvZXNuJ3QgZmFpbFxuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICdvYmplY3QnICYmICEhZG9jdW1lbnQpIHtcbiAgICAgICAgLyogdHNsaW50OmRpc2FibGUtbmV4dC1saW5lICovXG4gICAgICAgIHRoaXMuX2lzRWxlY3Ryb25BcHAgPSAoKDxhbnk+d2luZG93KVsncHJvY2VzcyddKSA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuX2lzRWxlY3Ryb25BcHApIHtcbiAgICAgICAgICAgIHRoaXMuX2FwcFBhdGggPSBlbGVjdHJvbi5yZW1vdGUuYXBwLmdldEFwcFBhdGgoKS5zcGxpdCgnXFxcXCcpLmpvaW4oJy8nKTtcbiAgICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiB2YWx1ZT86IHN0cmluZ1xuICAgKiBWYWx1ZSBpbiB0aGUgRWRpdG9yIGFmdGVyIGFzeW5jIGdldEVkaXRvckNvbnRlbnQgd2FzIGNhbGxlZFxuICAgKi9cbiAgQElucHV0KCd2YWx1ZScpXG4gIHNldCB2YWx1ZSh2YWx1ZTogc3RyaW5nKSB7XG4gICAgLy8gQ2xlYXIgYW55IHRpbWVvdXQgdGhhdCBtaWdodCBvdmVyd3JpdGUgdGhpcyB2YWx1ZSBzZXQgaW4gdGhlIGZ1dHVyZVxuICAgIGlmICh0aGlzLl9zZXRWYWx1ZVRpbWVvdXQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3NldFZhbHVlVGltZW91dCk7XG4gICAgfVxuICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fd2Vidmlldy5zZW5kICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBkb24ndCB3YW50IHRvIGtlZXAgc2VuZGluZyBjb250ZW50IGlmIGV2ZW50IGNhbWUgZnJvbSBJUEMsIGluZmluaXRlIGxvb3BcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX2Zyb21FZGl0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdzZXRFZGl0b3JDb250ZW50JywgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLm9uRWRpdG9yVmFsdWVDaGFuZ2UuZW1pdCh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcGFnYXRlQ2hhbmdlKHRoaXMuX3ZhbHVlKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ2hhbmdlLmVtaXQodW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9mcm9tRWRpdG9yID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEVkaXRvciBpcyBub3QgbG9hZGVkIHlldCwgdHJ5IGFnYWluIGluIGhhbGYgYSBzZWNvbmRcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRWYWx1ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fZWRpdG9yICYmIHRoaXMuX2VkaXRvci5zZXRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIC8vIGRvbid0IHdhbnQgdG8ga2VlcCBzZW5kaW5nIGNvbnRlbnQgaWYgZXZlbnQgY2FtZSBmcm9tIHRoZSBlZGl0b3IsIGluZmluaXRlIGxvb3BcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX2Zyb21FZGl0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZWRpdG9yLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5vbkVkaXRvclZhbHVlQ2hhbmdlLmVtaXQodW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BhZ2F0ZUNoYW5nZSh0aGlzLl92YWx1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkNoYW5nZS5lbWl0KHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZnJvbUVkaXRvciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4gdGhpcy5fdmFsdWUgPSB2YWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBFZGl0b3IgaXMgbm90IGxvYWRlZCB5ZXQsIHRyeSBhZ2FpbiBpbiBoYWxmIGEgc2Vjb25kXG4gICAgICAgICAgICAgIHRoaXMuX3NldFZhbHVlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NldFZhbHVlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICB9LCA1MDApO1xuICAgIH1cbiAgfVxuXG4gIGdldCB2YWx1ZSgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gICAqL1xuICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAvLyBkbyBub3Qgd3JpdGUgaWYgbnVsbCBvciB1bmRlZmluZWRcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmVcbiAgICBpZiAoIHZhbHVlICE9IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BhZ2F0ZUNoYW5nZSA9IGZuO1xuICB9XG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLm9uVG91Y2hlZCA9IGZuO1xuICB9XG5cbiAgLyoqXG4gICAqIGdldEVkaXRvckNvbnRlbnQ/OiBmdW5jdGlvblxuICAgKiBSZXR1cm5zIHRoZSBjb250ZW50IHdpdGhpbiB0aGUgZWRpdG9yXG4gICAqL1xuICBnZXRWYWx1ZSgpOiBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICAgICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2dldEVkaXRvckNvbnRlbnQnKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgICAgICAgdGhpcy5fdmFsdWUgPSB0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX3N1YmplY3QubmV4dCh0aGlzLl92YWx1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3ViamVjdC5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3N1YmplY3QgPSBuZXcgU3ViamVjdCgpO1xuICAgICAgICAgICAgICAgIHRoaXMub25FZGl0b3JWYWx1ZUNoYW5nZS5lbWl0KHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gIH1cblxuICAvKipcbiAgICogbGFuZ3VhZ2U/OiBzdHJpbmdcbiAgICogbGFuZ3VhZ2UgdXNlZCBpbiBlZGl0b3JcbiAgICovXG4gIEBJbnB1dCgnbGFuZ3VhZ2UnKVxuICBzZXQgbGFuZ3VhZ2UobGFuZ3VhZ2U6IHN0cmluZykge1xuICAgIHRoaXMuX2xhbmd1YWdlID0gbGFuZ3VhZ2U7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3NldExhbmd1YWdlJywgbGFuZ3VhZ2UpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRWYWx1ZTogc3RyaW5nID0gdGhpcy5fZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICB0aGlzLl9lZGl0b3IuZGlzcG9zZSgpO1xuICAgICAgICAgICAgbGV0IG15RGl2OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50O1xuICAgICAgICAgICAgdGhpcy5fZWRpdG9yID0gbW9uYWNvLmVkaXRvci5jcmVhdGUobXlEaXYsIE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgbGFuZ3VhZ2U6IGxhbmd1YWdlLFxuICAgICAgICAgICAgICAgIHRoZW1lOiB0aGlzLl90aGVtZSxcbiAgICAgICAgICAgIH0sIHRoaXMuZWRpdG9yT3B0aW9ucykpO1xuICAgICAgICAgICAgdGhpcy5fZWRpdG9yLmdldE1vZGVsKCkub25EaWRDaGFuZ2VDb250ZW50KCAoZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZnJvbUVkaXRvciA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy53cml0ZVZhbHVlKHRoaXMuX2VkaXRvci5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5vbkVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkLmVtaXQodW5kZWZpbmVkKTtcbiAgICAgICAgICAgIHRoaXMub25FZGl0b3JMYW5ndWFnZUNoYW5nZWQuZW1pdCh1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgfVxuICB9XG4gIGdldCBsYW5ndWFnZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9sYW5ndWFnZTtcbiAgfVxuXG4gIC8qKlxuICAgKiByZWdpc3Rlckxhbmd1YWdlPzogZnVuY3Rpb25cbiAgICogUmVnaXN0ZXJzIGEgY3VzdG9tIExhbmd1YWdlIHdpdGhpbiB0aGUgZWRpdG9yXG4gICAqL1xuICByZWdpc3Rlckxhbmd1YWdlKGxhbmd1YWdlOiBhbnkpOiB2b2lkIHtcbiAgICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdyZWdpc3Rlckxhbmd1YWdlJywgbGFuZ3VhZ2UpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRWYWx1ZTogc3RyaW5nID0gdGhpcy5fZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICB0aGlzLl9lZGl0b3IuZGlzcG9zZSgpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgbGFuZ3VhZ2UuY29tcGxldGlvbkl0ZW1Qcm92aWRlci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBwcm92aWRlcjogYW55ID0gbGFuZ3VhZ2UuY29tcGxldGlvbkl0ZW1Qcm92aWRlcltpXTtcbiAgICAgICAgICAgICAgICAvKiB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmUgKi9cbiAgICAgICAgICAgICAgICBwcm92aWRlci5raW5kID0gZXZhbChwcm92aWRlci5raW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBsYW5ndWFnZS5tb25hcmNoVG9rZW5zUHJvdmlkZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgbW9uYXJjaFRva2VuczogYW55ID0gbGFuZ3VhZ2UubW9uYXJjaFRva2Vuc1Byb3ZpZGVyW2ldO1xuICAgICAgICAgICAgICAgIC8qIHRzbGludDpkaXNhYmxlLW5leHQtbGluZSAqL1xuICAgICAgICAgICAgICAgIG1vbmFyY2hUb2tlbnNbMF0gPSBldmFsKG1vbmFyY2hUb2tlbnNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5yZWdpc3Rlcih7IGlkOiBsYW5ndWFnZS5pZCB9KTtcblxuICAgICAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5zZXRNb25hcmNoVG9rZW5zUHJvdmlkZXIobGFuZ3VhZ2UuaWQsIHtcbiAgICAgICAgICAgICAgICB0b2tlbml6ZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgcm9vdDogbGFuZ3VhZ2UubW9uYXJjaFRva2Vuc1Byb3ZpZGVyLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gRGVmaW5lIGEgbmV3IHRoZW1lIHRoYXQgY29uc3RhaW5zIG9ubHkgcnVsZXMgdGhhdCBtYXRjaCB0aGlzIGxhbmd1YWdlXG4gICAgICAgICAgICBtb25hY28uZWRpdG9yLmRlZmluZVRoZW1lKGxhbmd1YWdlLmN1c3RvbVRoZW1lLmlkLCBsYW5ndWFnZS5jdXN0b21UaGVtZS50aGVtZSk7XG4gICAgICAgICAgICB0aGlzLl90aGVtZSA9IGxhbmd1YWdlLmN1c3RvbVRoZW1lLmlkO1xuXG4gICAgICAgICAgICBtb25hY28ubGFuZ3VhZ2VzLnJlZ2lzdGVyQ29tcGxldGlvbkl0ZW1Qcm92aWRlcihsYW5ndWFnZS5pZCwge1xuICAgICAgICAgICAgICAgIHByb3ZpZGVDb21wbGV0aW9uSXRlbXM6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhbmd1YWdlLmNvbXBsZXRpb25JdGVtUHJvdmlkZXI7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgY3NzOiBIVE1MU3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgICAgIGNzcy50eXBlID0gJ3RleHQvY3NzJztcbiAgICAgICAgICAgIGNzcy5pbm5lckhUTUwgPSBsYW5ndWFnZS5tb25hcmNoVG9rZW5zUHJvdmlkZXJDU1M7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNzcyk7XG4gICAgICAgICAgICB0aGlzLm9uRWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCh1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gIH1cblxuICAvKipcbiAgICogc3R5bGU/OiBzdHJpbmdcbiAgICogY3NzIHN0eWxlIG9mIHRoZSBlZGl0b3Igb24gdGhlIHBhZ2VcbiAgICovXG4gIEBJbnB1dCgnZWRpdG9yU3R5bGUnKVxuICBzZXQgZWRpdG9yU3R5bGUoZWRpdG9yU3R5bGU6IHN0cmluZykge1xuICAgIHRoaXMuX2VkaXRvclN0eWxlID0gZWRpdG9yU3R5bGU7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3NldEVkaXRvclN0eWxlJywge2xhbmd1YWdlOiB0aGlzLl9sYW5ndWFnZSwgdGhlbWU6IHRoaXMuX3RoZW1lLCBzdHlsZTogZWRpdG9yU3R5bGV9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgICAgIGxldCBjb250YWluZXJEaXY6IEhUTUxEaXZFbGVtZW50ID0gdGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgICAgICBjb250YWluZXJEaXYuc2V0QXR0cmlidXRlKCdzdHlsZScsIGVkaXRvclN0eWxlKTtcbiAgICAgICAgICAgIGxldCBjdXJyZW50VmFsdWU6IHN0cmluZyA9IHRoaXMuX2VkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgdGhpcy5fZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIGxldCBteURpdjogSFRNTERpdkVsZW1lbnQgPSB0aGlzLl9lZGl0b3JDb250YWluZXIubmF0aXZlRWxlbWVudDtcbiAgICAgICAgICAgIHRoaXMuX2VkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKG15RGl2LCBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICAgIGxhbmd1YWdlOiB0aGlzLl9sYW5ndWFnZSxcbiAgICAgICAgICAgICAgICB0aGVtZTogdGhpcy5fdGhlbWUsXG4gICAgICAgICAgICB9LCB0aGlzLmVkaXRvck9wdGlvbnMpKTtcbiAgICAgICAgICAgIHRoaXMuX2VkaXRvci5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlQ29udGVudCggKGU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMud3JpdGVWYWx1ZSh0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXQgZWRpdG9yU3R5bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdG9yU3R5bGU7XG4gIH1cblxuICAvKipcbiAgICogdGhlbWU/OiBzdHJpbmdcbiAgICogVGhlbWUgdG8gYmUgYXBwbGllZCB0byBlZGl0b3JcbiAgICovXG4gIEBJbnB1dCgndGhlbWUnKVxuICBzZXQgdGhlbWUodGhlbWU6IHN0cmluZykge1xuICAgIHRoaXMuX3RoZW1lID0gdGhlbWU7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3NldEVkaXRvck9wdGlvbnMnLCB7J3RoZW1lJzogdGhlbWV9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgICAgIHRoaXMuX2VkaXRvci51cGRhdGVPcHRpb25zKHsndGhlbWUnOiB0aGVtZX0pO1xuICAgICAgICAgICAgdGhpcy5vbkVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkLmVtaXQodW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXQgdGhlbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fdGhlbWU7XG4gIH1cblxuICAvKipcbiAgICogZnVsbFNjcmVlbktleUJpbmRpbmc/OiBudW1iZXJcbiAgICogU2VlIGhlcmUgZm9yIGtleSBiaW5kaW5ncyBodHRwczovL21pY3Jvc29mdC5naXRodWIuaW8vbW9uYWNvLWVkaXRvci9hcGkvZW51bXMvbW9uYWNvLmtleWNvZGUuaHRtbFxuICAgKiBTZXRzIHRoZSBLZXlDb2RlIGZvciBzaG9ydGN1dHRpbmcgdG8gRnVsbHNjcmVlbiBtb2RlXG4gICAqL1xuICBASW5wdXQoJ2Z1bGxTY3JlZW5LZXlCaW5kaW5nJylcbiAgc2V0IGZ1bGxTY3JlZW5LZXlCaW5kaW5nKGtleWNvZGU6IG51bWJlcltdKSB7XG4gICAgdGhpcy5fa2V5Y29kZSA9IGtleWNvZGU7XG4gIH1cbiAgZ2V0IGZ1bGxTY3JlZW5LZXlCaW5kaW5nKCk6IG51bWJlcltdIHtcbiAgICByZXR1cm4gdGhpcy5fa2V5Y29kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBlZGl0b3JPcHRpb25zPzogT2JqZWN0XG4gICAqIE9wdGlvbnMgdXNlZCBvbiBlZGl0b3IgaW5zdGFudGlhdGlvbi4gQXZhaWxhYmxlIG9wdGlvbnMgbGlzdGVkIGhlcmU6XG4gICAqIGh0dHBzOi8vbWljcm9zb2Z0LmdpdGh1Yi5pby9tb25hY28tZWRpdG9yL2FwaS9pbnRlcmZhY2VzL21vbmFjby5lZGl0b3IuaWVkaXRvcm9wdGlvbnMuaHRtbFxuICAgKi9cbiAgQElucHV0KCdlZGl0b3JPcHRpb25zJylcbiAgc2V0IGVkaXRvck9wdGlvbnMoZWRpdG9yT3B0aW9uczogYW55KSB7XG4gICAgICB0aGlzLl9lZGl0b3JPcHRpb25zID0gZWRpdG9yT3B0aW9ucztcbiAgICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnc2V0RWRpdG9yT3B0aW9ucycsIGVkaXRvck9wdGlvbnMpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgICAgIHRoaXMuX2VkaXRvci51cGRhdGVPcHRpb25zKGVkaXRvck9wdGlvbnMpO1xuICAgICAgICAgIHRoaXMub25FZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZC5lbWl0KHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgfVxuICBnZXQgZWRpdG9yT3B0aW9ucygpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl9lZGl0b3JPcHRpb25zO1xuICB9XG5cbiAgLyoqXG4gICAqIGxheW91dCBtZXRob2QgdGhhdCBjYWxscyBsYXlvdXQgbWV0aG9kIG9mIGVkaXRvciBhbmQgaW5zdHJ1Y3RzIHRoZSBlZGl0b3IgdG8gcmVtZWFzdXJlIGl0cyBjb250YWluZXJcbiAgICovXG4gICBsYXlvdXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2xheW91dCcpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgICAgICAgdGhpcy5fZWRpdG9yLmxheW91dCgpO1xuICAgICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaWYgaW4gRWxlY3Ryb24gbW9kZSBvciBub3RcbiAgICovXG4gIGdldCBpc0VsZWN0cm9uQXBwKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc0VsZWN0cm9uQXBwO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaWYgaW4gRnVsbCBTY3JlZW4gTW9kZSBvciBub3RcbiAgICovXG4gIGdldCBpc0Z1bGxTY3JlZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzRnVsbFNjcmVlbjtcbiAgfVxuXG4vKipcbiAqIHNldEVkaXRvck5vZGVNb2R1bGVEaXJPdmVycmlkZSBmdW5jdGlvbiB0aGF0IG92ZXJyaWRlcyB3aGVyZSB0byBsb29rXG4gKiBmb3IgdGhlIGVkaXRvciBub2RlX21vZHVsZS4gVXNlZCBpbiB0ZXN0cyBmb3IgRWxlY3Ryb24gb3IgYW55d2hlcmUgdGhhdCB0aGVcbiAqIG5vZGVfbW9kdWxlcyBhcmUgbm90IGluIHRoZSBleHBlY3RlZCBsb2NhdGlvbi5cbiAqL1xuICBzZXRFZGl0b3JOb2RlTW9kdWxlRGlyT3ZlcnJpZGUoZGlyT3ZlcnJpZGU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgdGhpcy5fZWRpdG9yTm9kZU1vZHVsZURpck92ZXJyaWRlID0gZGlyT3ZlcnJpZGU7XG4gICAgICB0aGlzLl9hcHBQYXRoID0gZGlyT3ZlcnJpZGU7XG4gIH1cblxuICAvKipcbiAgICogbmdPbkluaXQgb25seSB1c2VkIGZvciBFbGVjdHJvbiB2ZXJzaW9uIG9mIGVkaXRvclxuICAgKiBUaGlzIGlzIHdoZXJlIHRoZSB3ZWJ2aWV3IGlzIGNyZWF0ZWQgdG8gc2FuZGJveCBhd2F5IHRoZSBlZGl0b3JcbiAgICovXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIGxldCBlZGl0b3JIVE1MOiBzdHJpbmcgPSAnJztcbiAgICBpZiAodGhpcy5faXNFbGVjdHJvbkFwcCkge1xuICAgICAgICBlZGl0b3JIVE1MID0gYDwhRE9DVFlQRSBodG1sPlxuICAgICAgICAgICAgPGh0bWwgc3R5bGU9XCJoZWlnaHQ6MTAwJVwiPlxuICAgICAgICAgICAgPGhlYWQ+XG4gICAgICAgICAgICAgICAgPG1ldGEgaHR0cC1lcXVpdj1cIlgtVUEtQ29tcGF0aWJsZVwiIGNvbnRlbnQ9XCJJRT1lZGdlXCIgLz5cbiAgICAgICAgICAgICAgICA8bWV0YSBodHRwLWVxdWl2PVwiQ29udGVudC1UeXBlXCIgY29udGVudD1cInRleHQvaHRtbDtjaGFyc2V0PXV0Zi04XCIgPlxuICAgICAgICAgICAgICAgIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBkYXRhLW5hbWU9XCJ2cy9lZGl0b3IvZWRpdG9yLm1haW5cIlxuICAgICAgICAgICAgICAgICAgICBocmVmPVwiZmlsZTovLyR7dGhpcy5fZWRpdG9yTm9kZU1vZHVsZURpck92ZXJyaWRlfS9hc3NldHMvbW9uYWNvL3ZzL2VkaXRvci9lZGl0b3IubWFpbi5jc3NcIj5cbiAgICAgICAgICAgIDwvaGVhZD5cbiAgICAgICAgICAgIDxib2R5IHN0eWxlPVwiaGVpZ2h0OjEwMCU7d2lkdGg6IDEwMCU7bWFyZ2luOiAwO3BhZGRpbmc6IDA7b3ZlcmZsb3c6IGhpZGRlbjtcIj5cbiAgICAgICAgICAgIDxkaXYgaWQ9XCIke3RoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyfVwiIHN0eWxlPVwid2lkdGg6MTAwJTtoZWlnaHQ6MTAwJTske3RoaXMuX2VkaXRvclN0eWxlfVwiPjwvZGl2PlxuICAgICAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGlwY1JlbmRlcmVyIG9mIGVsZWN0cm9uIGZvciBjb21tdW5pY2F0aW9uXG4gICAgICAgICAgICAgICAgY29uc3Qge2lwY1JlbmRlcmVyfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJyk7XG4gICAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgICAgIDxzY3JpcHQgc3JjPVwiZmlsZTovLyR7dGhpcy5fZWRpdG9yTm9kZU1vZHVsZURpck92ZXJyaWRlfS9hc3NldHMvbW9uYWNvL3ZzL2xvYWRlci5qc1wiPjwvc2NyaXB0PlxuICAgICAgICAgICAgPHNjcmlwdD5cbiAgICAgICAgICAgICAgICB2YXIgZWRpdG9yO1xuICAgICAgICAgICAgICAgIHZhciB0aGVtZSA9ICcke3RoaXMuX3RoZW1lfSc7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gJyR7dGhpcy5fdmFsdWV9JztcblxuICAgICAgICAgICAgICAgIHJlcXVpcmUuY29uZmlnKHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZVVybDogJyR7dGhpcy5fYXBwUGF0aH0vYXNzZXRzL21vbmFjbydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzZWxmLm1vZHVsZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBzZWxmLnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICByZXF1aXJlKFsndnMvZWRpdG9yL2VkaXRvci5tYWluJ10sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IgPSBtb25hY28uZWRpdG9yLmNyZWF0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn0nKSwgT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYW5ndWFnZTogJyR7dGhpcy5sYW5ndWFnZX0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICcke3RoaXMuX3RoZW1lfScsXG4gICAgICAgICAgICAgICAgICAgIH0sICR7SlNPTi5zdHJpbmdpZnkodGhpcy5lZGl0b3JPcHRpb25zKX0pKTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmdldE1vZGVsKCkub25EaWRDaGFuZ2VDb250ZW50KCAoZSk9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwib25FZGl0b3JDb250ZW50Q2hhbmdlXCIsIGVkaXRvci5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5hZGRBY3Rpb24oe1xuICAgICAgICAgICAgICAgICAgICAgIC8vIEFuIHVuaXF1ZSBpZGVudGlmaWVyIG9mIHRoZSBjb250cmlidXRlZCBhY3Rpb24uXG4gICAgICAgICAgICAgICAgICAgICAgaWQ6ICdmdWxsU2NyZWVuJyxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBBIGxhYmVsIG9mIHRoZSBhY3Rpb24gdGhhdCB3aWxsIGJlIHByZXNlbnRlZCB0byB0aGUgdXNlci5cbiAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0Z1bGwgU2NyZWVuJyxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBBbiBvcHRpb25hbCBhcnJheSBvZiBrZXliaW5kaW5ncyBmb3IgdGhlIGFjdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0TWVudUdyb3VwSWQ6ICduYXZpZ2F0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgICBrZXliaW5kaW5nczogWyR7dGhpcy5fa2V5Y29kZX1dLFxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHRNZW51T3JkZXI6IDEuNSxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBNZXRob2QgdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGFjdGlvbiBpcyB0cmlnZ2VyZWQuXG4gICAgICAgICAgICAgICAgICAgICAgLy8gQHBhcmFtIGVkaXRvciBUaGUgZWRpdG9yIGluc3RhbmNlIGlzIHBhc3NlZCBpbiBhcyBhIGNvbnZpbmllbmNlXG4gICAgICAgICAgICAgICAgICAgICAgcnVuOiBmdW5jdGlvbihlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVkaXRvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke3RoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyfScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWRpdG9yRGl2LndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmFkZEFjdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gQW4gdW5pcXVlIGlkZW50aWZpZXIgb2YgdGhlIGNvbnRyaWJ1dGVkIGFjdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgICBpZDogJ2V4aXRmdWxsU2NyZWVuJyxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBBIGxhYmVsIG9mIHRoZSBhY3Rpb24gdGhhdCB3aWxsIGJlIHByZXNlbnRlZCB0byB0aGUgdXNlci5cbiAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0V4aXQgRnVsbCBTY3JlZW4nLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIEFuIG9wdGlvbmFsIGFycmF5IG9mIGtleWJpbmRpbmdzIGZvciB0aGUgYWN0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHRNZW51R3JvdXBJZDogJ25hdmlnYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICAgIGtleWJpbmRpbmdzOiBbOV0sXG4gICAgICAgICAgICAgICAgICAgICAgY29udGV4dE1lbnVPcmRlcjogMS41LFxuICAgICAgICAgICAgICAgICAgICAgIC8vIE1ldGhvZCB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgd2hlbiB0aGUgYWN0aW9uIGlzIHRyaWdnZXJlZC5cbiAgICAgICAgICAgICAgICAgICAgICAvLyBAcGFyYW0gZWRpdG9yIFRoZSBlZGl0b3IgaW5zdGFuY2UgaXMgcGFzc2VkIGluIGFzIGEgY29udmluaWVuY2VcbiAgICAgICAgICAgICAgICAgICAgICBydW46IGZ1bmN0aW9uKGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWRpdG9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7dGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJ9Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC53ZWJraXRFeGl0RnVsbHNjcmVlbigpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJvbkVkaXRvckluaXRpYWxpemVkXCIsIHRoaXMuX2VkaXRvcik7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gYmFjayB0aGUgdmFsdWUgaW4gdGhlIGVkaXRvciB0byB0aGUgbWFpbnZpZXdcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignZ2V0RWRpdG9yQ29udGVudCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJlZGl0b3JDb250ZW50XCIsIGVkaXRvci5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgdmFsdWUgb2YgdGhlIGVkaXRvciBmcm9tIHdoYXQgd2FzIHNlbnQgZnJvbSB0aGUgbWFpbnZpZXdcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignc2V0RWRpdG9yQ29udGVudCcsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBkYXRhO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3Iuc2V0VmFsdWUoZGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIHN0eWxlIG9mIHRoZSBlZGl0b3IgY29udGFpbmVyIGRpdlxuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdzZXRFZGl0b3JTdHlsZScsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVkaXRvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke3RoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyfScpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3JEaXYuc3R5bGUgPSBkYXRhLnN0eWxlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudFZhbHVlID0gZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke3RoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyfScpLCBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYW5ndWFnZTogZGF0YS5sYW5ndWFnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiBkYXRhLnRoZW1lLFxuICAgICAgICAgICAgICAgICAgICB9LCAke0pTT04uc3RyaW5naWZ5KHRoaXMuZWRpdG9yT3B0aW9ucyl9KSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIG9wdGlvbnMgb2YgdGhlIGVkaXRvciBmcm9tIHdoYXQgd2FzIHNlbnQgZnJvbSB0aGUgbWFpbnZpZXdcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignc2V0RWRpdG9yT3B0aW9ucycsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLnVwZGF0ZU9wdGlvbnMoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJvbkVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkXCIsICcnKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgbGFuZ3VhZ2Ugb2YgdGhlIGVkaXRvciBmcm9tIHdoYXQgd2FzIHNlbnQgZnJvbSB0aGUgbWFpbnZpZXdcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignc2V0TGFuZ3VhZ2UnLCBmdW5jdGlvbihldmVudCwgZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50VmFsdWUgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yID0gbW9uYWNvLmVkaXRvci5jcmVhdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7dGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJ9JyksIE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGN1cnJlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhbmd1YWdlOiBkYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgICAgICAgICB9LCAke0pTT04uc3RyaW5naWZ5KHRoaXMuZWRpdG9yT3B0aW9ucyl9KSk7XG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJvbkVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkXCIsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIuc2VuZFRvSG9zdChcIm9uRWRpdG9yTGFuZ3VhZ2VDaGFuZ2VkXCIsICcnKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHJlZ2lzdGVyIGEgbmV3IGxhbmd1YWdlIHdpdGggZWRpdG9yXG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ3JlZ2lzdGVyTGFuZ3VhZ2UnLCBmdW5jdGlvbihldmVudCwgZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50VmFsdWUgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmRpc3Bvc2UoKTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuY29tcGxldGlvbkl0ZW1Qcm92aWRlci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByb3ZpZGVyID0gZGF0YS5jb21wbGV0aW9uSXRlbVByb3ZpZGVyW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXIua2luZCA9IGV2YWwocHJvdmlkZXIua2luZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLm1vbmFyY2hUb2tlbnNQcm92aWRlci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1vbmFyY2hUb2tlbnMgPSBkYXRhLm1vbmFyY2hUb2tlbnNQcm92aWRlcltpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vbmFyY2hUb2tlbnNbMF0gPSBldmFsKG1vbmFyY2hUb2tlbnNbMF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG1vbmFjby5sYW5ndWFnZXMucmVnaXN0ZXIoeyBpZDogZGF0YS5pZCB9KTtcblxuICAgICAgICAgICAgICAgICAgICBtb25hY28ubGFuZ3VhZ2VzLnNldE1vbmFyY2hUb2tlbnNQcm92aWRlcihkYXRhLmlkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbml6ZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290OiBkYXRhLm1vbmFyY2hUb2tlbnNQcm92aWRlclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBEZWZpbmUgYSBuZXcgdGhlbWUgdGhhdCBjb25zdGFpbnMgb25seSBydWxlcyB0aGF0IG1hdGNoIHRoaXMgbGFuZ3VhZ2VcbiAgICAgICAgICAgICAgICAgICAgbW9uYWNvLmVkaXRvci5kZWZpbmVUaGVtZShkYXRhLmN1c3RvbVRoZW1lLmlkLCBkYXRhLmN1c3RvbVRoZW1lLnRoZW1lKTtcbiAgICAgICAgICAgICAgICAgICAgdGhlbWUgPSBkYXRhLmN1c3RvbVRoZW1lLmlkO1xuXG4gICAgICAgICAgICAgICAgICAgIG1vbmFjby5sYW5ndWFnZXMucmVnaXN0ZXJDb21wbGV0aW9uSXRlbVByb3ZpZGVyKGRhdGEuaWQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVDb21wbGV0aW9uSXRlbXM6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5jb21wbGV0aW9uSXRlbVByb3ZpZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBjc3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gICAgICAgICAgICAgICAgICAgIGNzcy50eXBlID0gXCJ0ZXh0L2Nzc1wiO1xuICAgICAgICAgICAgICAgICAgICBjc3MuaW5uZXJIVE1MID0gZGF0YS5tb25hcmNoVG9rZW5zUHJvdmlkZXJDU1M7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY3NzKTtcblxuICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwib25FZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZFwiLCAnJyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJbnN0cnVjdCB0aGUgZWRpdG9yIHRvIHJlbWVhc3VyZSBpdHMgY29udGFpbmVyXG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ2xheW91dCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5sYXlvdXQoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIEluc3RydWN0IHRoZSBlZGl0b3IgZ28gdG8gZnVsbCBzY3JlZW4gbW9kZVxuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdzaG93RnVsbFNjcmVlbkVkaXRvcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgdmFyIGVkaXRvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke3RoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyfScpO1xuICAgICAgICAgICAgICAgICAgZWRpdG9yRGl2LndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJbnN0cnVjdCB0aGUgZWRpdG9yIGV4aXQgZnVsbCBzY3JlZW4gbW9kZVxuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdleGl0RnVsbFNjcmVlbkVkaXRvcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgdmFyIGVkaXRvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke3RoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyfScpO1xuICAgICAgICAgICAgICAgICAgZWRpdG9yRGl2LndlYmtpdEV4aXRGdWxsc2NyZWVuKCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignZGlzcG9zZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICBlZGl0b3IuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gbmVlZCB0byBtYW51YWxseSByZXNpemUgdGhlIGVkaXRvciBhbnkgdGltZSB0aGUgd2luZG93IHNpemVcbiAgICAgICAgICAgICAgICAvLyBjaGFuZ2VzLiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvbW9uYWNvLWVkaXRvci9pc3N1ZXMvMjhcbiAgICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBmdW5jdGlvbiByZXNpemVFZGl0b3IoKSB7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5sYXlvdXQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgICAgPC9ib2R5PlxuICAgICAgICAgICAgPC9odG1sPmA7XG5cbiAgICAgICAgLy8gZHluYW1pY2FsbHkgY3JlYXRlIHRoZSBFbGVjdHJvbiBXZWJ2aWV3IEVsZW1lbnRcbiAgICAgICAgLy8gdGhpcyB3aWxsIHNhbmRib3ggdGhlIG1vbmFjbyBjb2RlIGludG8gaXRzIG93biBET00gYW5kIGl0cyBvd25cbiAgICAgICAgLy8gamF2YXNjcmlwdCBpbnN0YW5jZS4gTmVlZCB0byBkbyB0aGlzIHRvIGF2b2lkIHByb2JsZW1zIHdpdGggbW9uYWNvXG4gICAgICAgIC8vIHVzaW5nIEFNRCBSZXF1aXJlcyBhbmQgRWxlY3Ryb24gdXNpbmcgTm9kZSBSZXF1aXJlc1xuICAgICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9tb25hY28tZWRpdG9yL2lzc3Vlcy85MFxuICAgICAgICB0aGlzLl93ZWJ2aWV3ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnd2VidmlldycpO1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNldEF0dHJpYnV0ZSgnbm9kZWludGVncmF0aW9uJywgJ3RydWUnKTtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGV3ZWJzZWN1cml0eScsICd0cnVlJyk7XG4gICAgICAgIC8vIHRha2UgdGhlIGh0bWwgY29udGVudCBmb3IgdGhlIHdlYnZpZXcgYW5kIGJhc2U2NCBlbmNvZGUgaXQgYW5kIHVzZSBhcyB0aGUgc3JjIHRhZ1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNldEF0dHJpYnV0ZSgnc3JjJywgJ2RhdGE6dGV4dC9odG1sO2Jhc2U2NCwnICsgd2luZG93LmJ0b2EoZWRpdG9ySFRNTCkpO1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnZGlzcGxheTppbmxpbmUtZmxleDsgd2lkdGg6MTAwJTsgaGVpZ2h0OjEwMCUnKTtcbiAgICAgICAgLy8gIHRoaXMuX3dlYnZpZXcuYWRkRXZlbnRMaXN0ZW5lcignZG9tLXJlYWR5JywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgdGhpcy5fd2Vidmlldy5vcGVuRGV2VG9vbHMoKTtcbiAgICAgICAgLy8gIH0pO1xuXG4gICAgICAgIC8vIFByb2Nlc3MgdGhlIGRhdGEgZnJvbSB0aGUgd2Vidmlld1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LmFkZEV2ZW50TGlzdGVuZXIoJ2lwYy1tZXNzYWdlJywgKGV2ZW50OiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5jaGFubmVsID09PSAnZWRpdG9yQ29udGVudCcpIHtcbiAgICAgICAgICAgICAgdGhpcy5fZnJvbUVkaXRvciA9IHRydWU7XG4gICAgICAgICAgICAgIHRoaXMud3JpdGVWYWx1ZShldmVudC5hcmdzWzBdKTtcbiAgICAgICAgICAgICAgdGhpcy5fc3ViamVjdC5uZXh0KHRoaXMuX3ZhbHVlKTtcbiAgICAgICAgICAgICAgdGhpcy5fc3ViamVjdC5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgICB0aGlzLl9zdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY2hhbm5lbCA9PT0gJ29uRWRpdG9yQ29udGVudENoYW5nZScpIHtcbiAgICAgICAgICAgICAgdGhpcy5fZnJvbUVkaXRvciA9IHRydWU7XG4gICAgICAgICAgICAgIHRoaXMud3JpdGVWYWx1ZShldmVudC5hcmdzWzBdKTtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuaW5pdGlhbENvbnRlbnRDaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxDb250ZW50Q2hhbmdlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5sYXlvdXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY2hhbm5lbCA9PT0gJ29uRWRpdG9ySW5pdGlhbGl6ZWQnKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgdGhpcy5fZWRpdG9yUHJveHkgPSB0aGlzLndyYXBFZGl0b3JDYWxscyh0aGlzLl9lZGl0b3IpO1xuICAgICAgICAgICAgICB0aGlzLm9uRWRpdG9ySW5pdGlhbGl6ZWQuZW1pdCh0aGlzLl9lZGl0b3JQcm94eSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmNoYW5uZWwgPT09ICdvbkVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkJykge1xuICAgICAgICAgICAgICB0aGlzLm9uRWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCh1bmRlZmluZWQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5jaGFubmVsID09PSAnb25FZGl0b3JMYW5ndWFnZUNoYW5nZWQnKSB7XG4gICAgICAgICAgICAgIHRoaXMub25FZGl0b3JMYW5ndWFnZUNoYW5nZWQuZW1pdCh1bmRlZmluZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBhcHBlbmQgdGhlIHdlYnZpZXcgdG8gdGhlIERPTVxuICAgICAgICB0aGlzLl9lZGl0b3JDb250YWluZXIubmF0aXZlRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl93ZWJ2aWV3KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogbmdBZnRlclZpZXdJbml0IG9ubHkgdXNlZCBmb3IgYnJvd3NlciB2ZXJzaW9uIG9mIGVkaXRvclxuICAgKiBUaGlzIGlzIHdoZXJlIHRoZSBBTUQgTG9hZGVyIHNjcmlwdHMgYXJlIGFkZGVkIHRvIHRoZSBicm93c2VyIGFuZCB0aGUgZWRpdG9yIHNjcmlwdHMgYXJlIFwicmVxdWlyZWRcIlxuICAgKi9cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5faXNFbGVjdHJvbkFwcCkge1xuICAgICAgbG9hZE1vbmFjbygpO1xuICAgICAgd2FpdFVudGlsTW9uYWNvUmVhZHkoKS5waXBlKFxuICAgICAgICB0YWtlVW50aWwodGhpcy5fZGVzdHJveSksXG4gICAgICApLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuaW5pdE1vbmFjbygpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIG1lcmdlKFxuICAgICAgZnJvbUV2ZW50KHdpbmRvdywgJ3Jlc2l6ZScpLnBpcGUoXG4gICAgICAgIGRlYm91bmNlVGltZSgxMDApLFxuICAgICAgKSxcbiAgICAgIHRoaXMuX3dpZHRoU3ViamVjdC5hc09ic2VydmFibGUoKS5waXBlKFxuICAgICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICAgICAgKSxcbiAgICAgIHRoaXMuX2hlaWdodFN1YmplY3QuYXNPYnNlcnZhYmxlKCkucGlwZShcbiAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgICksXG4gICAgKS5waXBlKFxuICAgICAgdGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3kpLFxuICAgICAgZGVib3VuY2VUaW1lKDEwMCksXG4gICAgKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5sYXlvdXQoKTtcbiAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgIH0pO1xuICAgIHRpbWVyKDUwMCwgMjUwKS5waXBlKFxuICAgICAgdGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3kpLFxuICAgICkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLl9lbGVtZW50UmVmICYmIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkge1xuICAgICAgICB0aGlzLl93aWR0aFN1YmplY3QubmV4dCgoPEhUTUxFbGVtZW50PnRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgpO1xuICAgICAgICB0aGlzLl9oZWlnaHRTdWJqZWN0Lm5leHQoKDxIVE1MRWxlbWVudD50aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5kZXRhY2goKTtcbiAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdkaXNwb3NlJyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgIHRoaXMuX2VkaXRvci5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX2Rlc3Ryb3kubmV4dCh0cnVlKTtcbiAgICB0aGlzLl9kZXN0cm95LnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuIC8qKlxuICAqIHNob3dGdWxsU2NyZWVuRWRpdG9yIHJlcXVlc3QgZm9yIGZ1bGwgc2NyZWVuIG9mIENvZGUgRWRpdG9yIGJhc2VkIG9uIGl0cyBicm93c2VyIHR5cGUuXG4gICovXG4gIHB1YmxpYyBzaG93RnVsbFNjcmVlbkVkaXRvcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnc2hvd0Z1bGxTY3JlZW5FZGl0b3InKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGNvZGVFZGl0b3JFbGVtZW50OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50IGFzIEhUTUxEaXZFbGVtZW50O1xuICAgICAgICBjb25zdCBmdWxsU2NyZWVuTWFwOiBPYmplY3QgPSB7XG4gICAgICAgICAgLy8gQ2hyb21lXG4gICAgICAgICAgJ3JlcXVlc3RGdWxsc2NyZWVuJzogKCkgPT4gY29kZUVkaXRvckVsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgICAvLyBTYWZhcmlcbiAgICAgICAgICAnd2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4nOiAoKSA9PiAoPGFueT5jb2RlRWRpdG9yRWxlbWVudCkud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgICAvLyBJRVxuICAgICAgICAgICdtc1JlcXVlc3RGdWxsc2NyZWVuJzogKCkgPT4gKDxhbnk+Y29kZUVkaXRvckVsZW1lbnQpLm1zUmVxdWVzdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgICAvLyBGaXJlZm94XG4gICAgICAgICAgJ21velJlcXVlc3RGdWxsU2NyZWVuJzogKCkgPT4gKDxhbnk+Y29kZUVkaXRvckVsZW1lbnQpLm1velJlcXVlc3RGdWxsU2NyZWVuKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgZm9yIChjb25zdCBoYW5kbGVyIG9mIE9iamVjdC5rZXlzKGZ1bGxTY3JlZW5NYXApKSB7XG4gICAgICAgICAgaWYgKGNvZGVFZGl0b3JFbGVtZW50W2hhbmRsZXJdKSB7XG4gICAgICAgICAgICAgIGZ1bGxTY3JlZW5NYXBbaGFuZGxlcl0oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5faXNGdWxsU2NyZWVuID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBleGl0RnVsbFNjcmVlbkVkaXRvciByZXF1ZXN0IHRvIGV4aXQgZnVsbCBzY3JlZW4gb2YgQ29kZSBFZGl0b3IgYmFzZWQgb24gaXRzIGJyb3dzZXIgdHlwZS5cbiAgICovXG4gIHB1YmxpYyBleGl0RnVsbFNjcmVlbkVkaXRvcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnZXhpdEZ1bGxTY3JlZW5FZGl0b3InKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGV4aXRGdWxsU2NyZWVuTWFwOiBvYmplY3QgPSB7XG4gICAgICAgICAgLy8gQ2hyb21lXG4gICAgICAgICAgJ2V4aXRGdWxsc2NyZWVuJzogKCkgPT4gZG9jdW1lbnQuZXhpdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgICAvLyBTYWZhcmlcbiAgICAgICAgICAnd2Via2l0RXhpdEZ1bGxzY3JlZW4nOiAoKSA9PiAoPGFueT5kb2N1bWVudCkud2Via2l0RXhpdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgICAvLyBGaXJlZm94XG4gICAgICAgICAgJ21vekNhbmNlbEZ1bGxTY3JlZW4nOiAoKSA9PiAoPGFueT5kb2N1bWVudCkubW96Q2FuY2VsRnVsbFNjcmVlbigpLFxuICAgICAgICAgIC8vIElFXG4gICAgICAgICAgJ21zRXhpdEZ1bGxzY3JlZW4nOiAoKSA9PiAoPGFueT5kb2N1bWVudCkubXNFeGl0RnVsbHNjcmVlbigpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGZvciAoY29uc3QgaGFuZGxlciBvZiBPYmplY3Qua2V5cyhleGl0RnVsbFNjcmVlbk1hcCkpIHtcbiAgICAgICAgICBpZiAoZG9jdW1lbnRbaGFuZGxlcl0pIHtcbiAgICAgICAgICAgICAgZXhpdEZ1bGxTY3JlZW5NYXBbaGFuZGxlcl0oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5faXNGdWxsU2NyZWVuID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogYWRkRnVsbFNjcmVlbk1vZGVDb21tYW5kIHVzZWQgdG8gYWRkIHRoZSBmdWxsc2NyZWVuIG9wdGlvbiB0byB0aGUgY29udGV4dCBtZW51XG4gICAqL1xuICBwcml2YXRlIGFkZEZ1bGxTY3JlZW5Nb2RlQ29tbWFuZCgpOiB2b2lkIHtcbiAgICB0aGlzLl9lZGl0b3IuYWRkQWN0aW9uKHtcbiAgICAgIC8vIEFuIHVuaXF1ZSBpZGVudGlmaWVyIG9mIHRoZSBjb250cmlidXRlZCBhY3Rpb24uXG4gICAgICBpZDogJ2Z1bGxTY3JlZW4nLFxuICAgICAgLy8gQSBsYWJlbCBvZiB0aGUgYWN0aW9uIHRoYXQgd2lsbCBiZSBwcmVzZW50ZWQgdG8gdGhlIHVzZXIuXG4gICAgICBsYWJlbDogJ0Z1bGwgU2NyZWVuJyxcbiAgICAgIC8vIEFuIG9wdGlvbmFsIGFycmF5IG9mIGtleWJpbmRpbmdzIGZvciB0aGUgYWN0aW9uLlxuICAgICAgY29udGV4dE1lbnVHcm91cElkOiAnbmF2aWdhdGlvbicsXG4gICAgICBrZXliaW5kaW5nczogdGhpcy5fa2V5Y29kZSxcbiAgICAgIGNvbnRleHRNZW51T3JkZXI6IDEuNSxcbiAgICAgIC8vIE1ldGhvZCB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgd2hlbiB0aGUgYWN0aW9uIGlzIHRyaWdnZXJlZC5cbiAgICAgIC8vIEBwYXJhbSBlZGl0b3IgVGhlIGVkaXRvciBpbnN0YW5jZSBpcyBwYXNzZWQgaW4gYXMgYSBjb252aW5pZW5jZVxuICAgICAgcnVuOiAoZWQ6IGFueSkgPT4ge1xuICAgICAgICB0aGlzLnNob3dGdWxsU2NyZWVuRWRpdG9yKCk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIHdyYXBFZGl0b3JDYWxscyB1c2VkIHRvIHByb3h5IGFsbCB0aGUgY2FsbHMgdG8gdGhlIG1vbmFjbyBlZGl0b3JcbiAgICogRm9yIGNhbGxzIGZvciBFbGVjdHJvbiB1c2UgdGhpcyB0byBjYWxsIHRoZSBlZGl0b3IgaW5zaWRlIHRoZSB3ZWJ2aWV3XG4gICAqL1xuICBwcml2YXRlIHdyYXBFZGl0b3JDYWxscyhvYmo6IGFueSk6IGFueSB7XG4gICAgbGV0IHRoYXQ6IGFueSA9IHRoaXM7XG4gICAgbGV0IGhhbmRsZXI6IGFueSA9IHtcbiAgICAgIGdldCh0YXJnZXQ6IGFueSwgcHJvcEtleTogYW55LCByZWNlaXZlcjogYW55KTogYW55IHtcbiAgICAgICAgcmV0dXJuIGFzeW5jICguLi5hcmdzOiBhbnkpOiBQcm9taXNlPGFueT4gPT4ge1xuICAgICAgICAgIGlmICh0aGF0Ll9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgaWYgKHRoYXQuX3dlYnZpZXcpIHtcbiAgICAgICAgICAgICAgY29uc3QgZXhlY3V0ZUphdmFTY3JpcHQ6IEZ1bmN0aW9uID0gKGNvZGU6IHN0cmluZykgPT5cbiAgICAgICAgICAgICAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICB0aGF0Ll93ZWJ2aWV3LmV4ZWN1dGVKYXZhU2NyaXB0KGNvZGUsIHJlc29sdmUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBsZXQgcmVzdWx0OiBhbnkgPSBhd2FpdCBleGVjdXRlSmF2YVNjcmlwdCgnZWRpdG9yLicgKyBwcm9wS2V5ICsgJygnICsgYXJncyArICcpJyk7XG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zdCBvcmlnTWV0aG9kOiBhbnkgPSB0YXJnZXRbcHJvcEtleV07XG4gICAgICAgICAgICAgIGxldCByZXN1bHQ6IGFueSA9IGF3YWl0IG9yaWdNZXRob2QuYXBwbHkodGhhdC5fZWRpdG9yLCBhcmdzKTtcbiAgICAgICAgICAgICAgLy8gc2luY2UgcnVubmluZyBqYXZhc2NyaXB0IGNvZGUgbWFudWFsbHkgbmVlZCB0byBmb3JjZSBBbmd1bGFyIHRvIGRldGVjdCBjaGFuZ2VzXG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoYXQuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmVcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGF0Ll9jaGFuZ2VEZXRlY3RvclJlZlsnZGVzdHJveWVkJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuX2NoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgIH07XG4gICAgcmV0dXJuIG5ldyBQcm94eShvYmosIGhhbmRsZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIGluaXRNb25hY28gbWV0aG9kIGNyZWF0ZXMgdGhlIG1vbmFjbyBlZGl0b3IgaW50byB0aGUgQFZpZXdDaGlsZCgnZWRpdG9yQ29udGFpbmVyJylcbiAgICogYW5kIGVtaXQgdGhlIG9uRWRpdG9ySW5pdGlhbGl6ZWQgZXZlbnQuICBUaGlzIGlzIG9ubHkgdXNlZCBpbiB0aGUgYnJvd3NlciB2ZXJzaW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBpbml0TW9uYWNvKCk6IHZvaWQge1xuICAgIGxldCBjb250YWluZXJEaXY6IEhUTUxEaXZFbGVtZW50ID0gdGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQ7XG4gICAgY29udGFpbmVyRGl2LmlkID0gdGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXI7XG4gICAgdGhpcy5fZWRpdG9yID0gbW9uYWNvLmVkaXRvci5jcmVhdGUoY29udGFpbmVyRGl2LCBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgdmFsdWU6IHRoaXMuX3ZhbHVlLFxuICAgICAgICBsYW5ndWFnZTogdGhpcy5sYW5ndWFnZSxcbiAgICAgICAgdGhlbWU6IHRoaXMuX3RoZW1lLFxuICAgIH0sIHRoaXMuZWRpdG9yT3B0aW9ucykpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLl9lZGl0b3JQcm94eSA9IHRoaXMud3JhcEVkaXRvckNhbGxzKHRoaXMuX2VkaXRvcik7XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5vbkVkaXRvckluaXRpYWxpemVkLmVtaXQodGhpcy5fZWRpdG9yUHJveHkpO1xuICAgIH0pO1xuICAgIHRoaXMuX2VkaXRvci5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlQ29udGVudCggKGU6IGFueSkgPT4ge1xuICAgICAgICB0aGlzLl9mcm9tRWRpdG9yID0gdHJ1ZTtcbiAgICAgICAgdGhpcy53cml0ZVZhbHVlKHRoaXMuX2VkaXRvci5nZXRWYWx1ZSgpKTtcbiAgICAgICAgaWYgKHRoaXMuaW5pdGlhbENvbnRlbnRDaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbENvbnRlbnRDaGFuZ2UgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubGF5b3V0KCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLmFkZEZ1bGxTY3JlZW5Nb2RlQ29tbWFuZCgpO1xuICB9XG5cbn1cbiJdfQ==