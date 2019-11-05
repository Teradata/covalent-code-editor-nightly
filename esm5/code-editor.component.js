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
var noop = (/**
 * @return {?}
 */
function () {
    // empty method
});
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
        function (_) { });
        this.onTouched = (/**
         * @return {?}
         */
        function () { return noop; });
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
                        function () {
                            _this.value = value;
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
                        function () { return (_this._value = value); }));
                    }
                    else {
                        // Editor is not loaded yet, try again in half a second
                        this._setValueTimeout = setTimeout((/**
                         * @return {?}
                         */
                        function () {
                            _this.value = value;
                        }), 500);
                    }
                }
            }
            else {
                this._setValueTimeout = setTimeout((/**
                 * @return {?}
                 */
                function () {
                    _this.value = value;
                }), 500);
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
                setTimeout((/**
                 * @return {?}
                 */
                function () {
                    _this._subject.next(_this._value);
                    _this._subject.complete();
                    _this._subject = new Subject();
                    _this.editorValueChange.emit();
                }));
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
                    this._editor.getModel().onDidChangeContent((/**
                     * @param {?} e
                     * @return {?}
                     */
                    function (e) {
                        _this._fromEditor = true;
                        _this.writeValue(_this._editor.getValue());
                    }));
                    this.editorConfigurationChanged.emit();
                    this.editorLanguageChanged.emit();
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
        var e_1, _a, e_2, _b;
        if (this._componentInitialized) {
            if (this._webview) {
                this._webview.send('registerLanguage', language);
            }
            else if (this._editor) {
                this._editor.dispose();
                try {
                    for (var _c = tslib_1.__values(language.completionItemProvider), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var provider = _d.value;
                        /* tslint:disable-next-line */
                        provider.kind = eval(provider.kind);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                try {
                    for (var _e = tslib_1.__values(language.monarchTokensProvider), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var monarchTokens = _f.value;
                        /* tslint:disable-next-line */
                        monarchTokens[0] = eval(monarchTokens[0]);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_2) throw e_2.error; }
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
                    function () {
                        return language.completionItemProvider;
                    }),
                });
                /** @type {?} */
                var css = document.createElement('style');
                css.type = 'text/css';
                css.innerHTML = language.monarchTokensProviderCSS;
                document.body.appendChild(css);
                this.editorConfigurationChanged.emit();
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
                    this._editor.getModel().onDidChangeContent((/**
                     * @param {?} e
                     * @return {?}
                     */
                    function (e) {
                        _this._fromEditor = true;
                        _this.writeValue(_this._editor.getValue());
                    }));
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
                    this._webview.send('setEditorOptions', { theme: theme });
                }
                else if (this._editor) {
                    this._editor.updateOptions({ theme: theme });
                    this.editorConfigurationChanged.emit();
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
         * editorOptions?: object
         * Options used on editor instantiation. Available options listed here:
         * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditoroptions.html
         */
        set: /**
         * editorOptions?: object
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
                    this.editorConfigurationChanged.emit();
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
            editorHTML = "<!DOCTYPE html>\n            <html style=\"height:100%\">\n            <head>\n                <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\" />\n                <meta http-equiv=\"Content-Type\" content=\"text/html;charset=utf-8\" >\n                <link rel=\"stylesheet\" data-name=\"vs/editor/editor.main\"\n                    href=\"file://" + this._editorNodeModuleDirOverride + "/assets/monaco/vs/editor/editor.main.css\">\n            </head>\n            <body style=\"height:100%;width: 100%;margin: 0;padding: 0;overflow: hidden;\">\n            <div id=\"" + this._editorInnerContainer + "\" style=\"width:100%;height:100%;" + this._editorStyle + "\"></div>\n            <script>\n                // Get the ipcRenderer of electron for communication\n                const {ipcRenderer} = require('electron');\n            </script>\n            <script src=\"file://" + this._editorNodeModuleDirOverride + "/assets/monaco/vs/loader.js\"></script>\n            <script>\n                var editor;\n                var theme = '" + this._theme + "';\n                var value = '" + this._value + "';\n\n                require.config({\n                    baseUrl: '" + this._appPath + "/assets/monaco'\n                });\n                self.module = undefined;\n                self.process.browser = true;\n\n                require(['vs/editor/editor.main'], function() {\n                    editor = monaco.editor.create(document.getElementById('" + this._editorInnerContainer + "'), Object.assign({\n                        value: value,\n                        language: '" + this.language + "',\n                        theme: '" + this._theme + "',\n                    }, " + JSON.stringify(this.editorOptions) + "));\n                    editor.getModel().onDidChangeContent( (e)=> {\n                        ipcRenderer.sendToHost(\"onEditorContentChange\", editor.getValue());\n                    });\n                    editor.addAction({\n                      // An unique identifier of the contributed action.\n                      id: 'fullScreen',\n                      // A label of the action that will be presented to the user.\n                      label: 'Full Screen',\n                      // An optional array of keybindings for the action.\n                      contextMenuGroupId: 'navigation',\n                      keybindings: [" + this._keycode + "],\n                      contextMenuOrder: 1.5,\n                      // Method that will be executed when the action is triggered.\n                      // @param editor The editor instance is passed in as a convinience\n                      run: function(ed) {\n                        var editorDiv = document.getElementById('" + this._editorInnerContainer + "');\n                        editorDiv.webkitRequestFullscreen();\n                      }\n                    });\n                    editor.addAction({\n                      // An unique identifier of the contributed action.\n                      id: 'exitfullScreen',\n                      // A label of the action that will be presented to the user.\n                      label: 'Exit Full Screen',\n                      // An optional array of keybindings for the action.\n                      contextMenuGroupId: 'navigation',\n                      keybindings: [9],\n                      contextMenuOrder: 1.5,\n                      // Method that will be executed when the action is triggered.\n                      // @param editor The editor instance is passed in as a convinience\n                      run: function(ed) {\n                        var editorDiv = document.getElementById('" + this._editorInnerContainer + "');\n                        document.webkitExitFullscreen();\n                      }\n                    });\n                    ipcRenderer.sendToHost(\"editorInitialized\", this._editor);\n                });\n\n                // return back the value in the editor to the mainview\n                ipcRenderer.on('getEditorContent', function(){\n                    ipcRenderer.sendToHost(\"editorContent\", editor.getValue());\n                });\n\n                // set the value of the editor from what was sent from the mainview\n                ipcRenderer.on('setEditorContent', function(event, data){\n                    value = data;\n                    editor.setValue(data);\n                });\n\n                // set the style of the editor container div\n                ipcRenderer.on('setEditorStyle', function(event, data){\n                    var editorDiv = document.getElementById('" + this._editorInnerContainer + "');\n                    editorDiv.style = data.style;\n                    var currentValue = editor.getValue();\n                    editor.dispose();\n                    editor = monaco.editor.create(document.getElementById('" + this._editorInnerContainer + "'), Object.assign({\n                        value: currentValue,\n                        language: data.language,\n                        theme: data.theme,\n                    }, " + JSON.stringify(this.editorOptions) + "));\n                });\n\n                // set the options of the editor from what was sent from the mainview\n                ipcRenderer.on('setEditorOptions', function(event, data){\n                    editor.updateOptions(data);\n                    ipcRenderer.sendToHost(\"editorConfigurationChanged\", '');\n                });\n\n                // set the language of the editor from what was sent from the mainview\n                ipcRenderer.on('setLanguage', function(event, data){\n                    var currentValue = editor.getValue();\n                    editor.dispose();\n                    editor = monaco.editor.create(document.getElementById('" + this._editorInnerContainer + "'), Object.assign({\n                        value: currentValue,\n                        language: data,\n                        theme: theme,\n                    }, " + JSON.stringify(this.editorOptions) + "));\n                    ipcRenderer.sendToHost(\"editorConfigurationChanged\", '');\n                    ipcRenderer.sendToHost(\"editorLanguageChanged\", '');\n                });\n\n                // register a new language with editor\n                ipcRenderer.on('registerLanguage', function(event, data){\n                    var currentValue = editor.getValue();\n                    editor.dispose();\n\n                    for (var i = 0; i < data.completionItemProvider.length; i++) {\n                        var provider = data.completionItemProvider[i];\n                        provider.kind = eval(provider.kind);\n                    }\n                    for (var i = 0; i < data.monarchTokensProvider.length; i++) {\n                        var monarchTokens = data.monarchTokensProvider[i];\n                        monarchTokens[0] = eval(monarchTokens[0]);\n                    }\n                    monaco.languages.register({ id: data.id });\n\n                    monaco.languages.setMonarchTokensProvider(data.id, {\n                        tokenizer: {\n                            root: data.monarchTokensProvider\n                        }\n                    });\n\n                    // Define a new theme that constains only rules that match this language\n                    monaco.editor.defineTheme(data.customTheme.id, data.customTheme.theme);\n                    theme = data.customTheme.id;\n\n                    monaco.languages.registerCompletionItemProvider(data.id, {\n                        provideCompletionItems: () => {\n                            return data.completionItemProvider\n                        }\n                    });\n\n                    var css = document.createElement(\"style\");\n                    css.type = \"text/css\";\n                    css.innerHTML = data.monarchTokensProviderCSS;\n                    document.body.appendChild(css);\n\n                    ipcRenderer.sendToHost(\"editorConfigurationChanged\", '');\n                });\n\n                // Instruct the editor to remeasure its container\n                ipcRenderer.on('layout', function(){\n                    editor.layout();\n                });\n\n                // Instruct the editor go to full screen mode\n                ipcRenderer.on('showFullScreenEditor', function() {\n                  var editorDiv = document.getElementById('" + this._editorInnerContainer + "');\n                  editorDiv.webkitRequestFullscreen();\n                });\n\n                // Instruct the editor exit full screen mode\n                ipcRenderer.on('exitFullScreenEditor', function() {\n                  var editorDiv = document.getElementById('" + this._editorInnerContainer + "');\n                  editorDiv.webkitExitFullscreen();\n                });\n\n                ipcRenderer.on('dispose', function(){\n                  editor.dispose();\n                });\n\n                // need to manually resize the editor any time the window size\n                // changes. See: https://github.com/Microsoft/monaco-editor/issues/28\n                window.addEventListener(\"resize\", function resizeEditor() {\n                    editor.layout();\n                });\n            </script>\n            </body>\n            </html>";
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
            function (event) {
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
                else if (event.channel === 'editorInitialized') {
                    _this._componentInitialized = true;
                    _this._editorProxy = _this.wrapEditorCalls(_this._editor);
                    _this.editorInitialized.emit(_this._editorProxy);
                }
                else if (event.channel === 'editorConfigurationChanged') {
                    _this.editorConfigurationChanged.emit();
                }
                else if (event.channel === 'editorLanguageChanged') {
                    _this.editorLanguageChanged.emit();
                }
            }));
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
            waitUntilMonacoReady()
                .pipe(takeUntil(this._destroy))
                .subscribe((/**
             * @return {?}
             */
            function () {
                _this.initMonaco();
            }));
        }
        merge(fromEvent(window, 'resize').pipe(debounceTime(100)), this._widthSubject.asObservable().pipe(distinctUntilChanged()), this._heightSubject.asObservable().pipe(distinctUntilChanged()))
            .pipe(takeUntil(this._destroy), debounceTime(100))
            .subscribe((/**
         * @return {?}
         */
        function () {
            _this.layout();
            _this._changeDetectorRef.markForCheck();
        }));
        timer(500, 250)
            .pipe(takeUntil(this._destroy))
            .subscribe((/**
         * @return {?}
         */
        function () {
            if (_this._elementRef && _this._elementRef.nativeElement) {
                _this._widthSubject.next(((/** @type {?} */ (_this._elementRef.nativeElement))).getBoundingClientRect().width);
                _this._heightSubject.next(((/** @type {?} */ (_this._elementRef.nativeElement))).getBoundingClientRect().height);
            }
        }));
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
        var e_3, _a;
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
                    requestFullscreen: (/**
                     * @return {?}
                     */
                    function () { return codeEditorElement_1.requestFullscreen(); }),
                    // Safari
                    webkitRequestFullscreen: (/**
                     * @return {?}
                     */
                    function () { return ((/** @type {?} */ (codeEditorElement_1))).webkitRequestFullscreen(); }),
                    // IE
                    msRequestFullscreen: (/**
                     * @return {?}
                     */
                    function () { return ((/** @type {?} */ (codeEditorElement_1))).msRequestFullscreen(); }),
                    // Firefox
                    mozRequestFullScreen: (/**
                     * @return {?}
                     */
                    function () { return ((/** @type {?} */ (codeEditorElement_1))).mozRequestFullScreen(); }),
                };
                try {
                    for (var _b = tslib_1.__values(Object.keys(fullScreenMap)), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var handler = _c.value;
                        if (codeEditorElement_1[handler]) {
                            fullScreenMap[handler]();
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_3) throw e_3.error; }
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
        var e_4, _a;
        if (this._componentInitialized) {
            if (this._webview) {
                this._webview.send('exitFullScreenEditor');
            }
            else {
                /** @type {?} */
                var exitFullScreenMap = {
                    // Chrome
                    exitFullscreen: (/**
                     * @return {?}
                     */
                    function () { return document.exitFullscreen(); }),
                    // Safari
                    webkitExitFullscreen: (/**
                     * @return {?}
                     */
                    function () { return ((/** @type {?} */ (document))).webkitExitFullscreen(); }),
                    // Firefox
                    mozCancelFullScreen: (/**
                     * @return {?}
                     */
                    function () { return ((/** @type {?} */ (document))).mozCancelFullScreen(); }),
                    // IE
                    msExitFullscreen: (/**
                     * @return {?}
                     */
                    function () { return ((/** @type {?} */ (document))).msExitFullscreen(); }),
                };
                try {
                    for (var _b = tslib_1.__values(Object.keys(exitFullScreenMap)), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var handler = _c.value;
                        if (document[handler]) {
                            exitFullScreenMap[handler]();
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_4) throw e_4.error; }
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
     * @private
     * @return {?}
     */
    TdCodeEditorComponent.prototype.addFullScreenModeCommand = /**
     * addFullScreenModeCommand used to add the fullscreen option to the context menu
     * @private
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
            run: (/**
             * @param {?} ed
             * @return {?}
             */
            function (ed) {
                _this.showFullScreenEditor();
            }),
        });
    };
    /**
     * wrapEditorCalls used to proxy all the calls to the monaco editor
     * For calls for Electron use this to call the editor inside the webview
     */
    /**
     * wrapEditorCalls used to proxy all the calls to the monaco editor
     * For calls for Electron use this to call the editor inside the webview
     * @private
     * @param {?} obj
     * @return {?}
     */
    TdCodeEditorComponent.prototype.wrapEditorCalls = /**
     * wrapEditorCalls used to proxy all the calls to the monaco editor
     * For calls for Electron use this to call the editor inside the webview
     * @private
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
                return (/**
                 * @param {...?} args
                 * @return {?}
                 */
                function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var executeJavaScript, origMethod, result;
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!that._componentInitialized) return [3 /*break*/, 3];
                                    if (!that._webview) return [3 /*break*/, 1];
                                    executeJavaScript = (/**
                                     * @param {?} code
                                     * @return {?}
                                     */
                                    function (code) {
                                        return new Promise((/**
                                         * @param {?} resolve
                                         * @return {?}
                                         */
                                        function (resolve) {
                                            that._webview.executeJavaScript(code, resolve);
                                        }));
                                    });
                                    return [2 /*return*/, executeJavaScript('editor.' + propKey + '(' + args + ')')];
                                case 1:
                                    origMethod = target[propKey];
                                    return [4 /*yield*/, origMethod.apply(that._editor, args)];
                                case 2:
                                    result = _a.sent();
                                    // since running javascript code manually need to force Angular to detect changes
                                    setTimeout((/**
                                     * @return {?}
                                     */
                                    function () {
                                        that.zone.run((/**
                                         * @return {?}
                                         */
                                        function () {
                                            // tslint:disable-next-line
                                            if (!that._changeDetectorRef['destroyed']) {
                                                that._changeDetectorRef.detectChanges();
                                            }
                                        }));
                                    }));
                                    return [2 /*return*/, result];
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                });
            },
        };
        return new Proxy(obj, handler);
    };
    /**
     * initMonaco method creates the monaco editor into the @ViewChild('editorContainer')
     * and emit the editorInitialized event.  This is only used in the browser version.
     */
    /**
     * initMonaco method creates the monaco editor into the \@ViewChild('editorContainer')
     * and emit the editorInitialized event.  This is only used in the browser version.
     * @private
     * @return {?}
     */
    TdCodeEditorComponent.prototype.initMonaco = /**
     * initMonaco method creates the monaco editor into the \@ViewChild('editorContainer')
     * and emit the editorInitialized event.  This is only used in the browser version.
     * @private
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
        setTimeout((/**
         * @return {?}
         */
        function () {
            _this._editorProxy = _this.wrapEditorCalls(_this._editor);
            _this._componentInitialized = true;
            _this.editorInitialized.emit(_this._editorProxy);
        }));
        this._editor.getModel().onDidChangeContent((/**
         * @param {?} e
         * @return {?}
         */
        function (e) {
            _this._fromEditor = true;
            _this.writeValue(_this._editor.getValue());
            if (_this.initialContentChange) {
                _this.initialContentChange = false;
                _this.layout();
            }
        }));
        this.addFullScreenModeCommand();
    };
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
                            function () { return TdCodeEditorComponent; })),
                            multi: true,
                        },
                    ],
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
    return TdCodeEditorComponent;
}());
export { TdCodeEditorComponent };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS1lZGl0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGNvdmFsZW50L2NvZGUtZWRpdG9yLyIsInNvdXJjZXMiOlsiY29kZS1lZGl0b3IuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFlBQVksRUFHWixTQUFTLEVBQ1QsVUFBVSxFQUNWLFVBQVUsRUFDVixNQUFNLEVBQ04saUJBQWlCLEdBRWxCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxpQkFBaUIsRUFBd0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6RSxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvQyxPQUFPLEVBQUUsWUFBWSxFQUFFLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRS9FLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxVQUFVLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7SUFFakUsSUFBSTs7O0FBQVE7SUFDaEIsZUFBZTtBQUNqQixDQUFDLENBQUE7Ozs7SUFHRyxhQUFhLEdBQVcsQ0FBQztBQUs3QjtJQW9GRTs7T0FFRztJQUNILCtCQUFvQixJQUFZLEVBQVUsa0JBQXFDLEVBQVUsV0FBdUI7UUFBNUYsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFVLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBbUI7UUFBVSxnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQTFFeEcsYUFBUSxHQUFxQixJQUFJLE9BQU8sRUFBVyxDQUFDO1FBQ3BELGtCQUFhLEdBQW9CLElBQUksT0FBTyxFQUFVLENBQUM7UUFDdkQsbUJBQWMsR0FBb0IsSUFBSSxPQUFPLEVBQVUsQ0FBQztRQUV4RCxpQkFBWSxHQUFXLCtDQUErQyxDQUFD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Ozs7O0lBQ3RCLHVDQUE0Qjs7Ozs7SUFDNUIsdUNBQThCOzs7OztJQUM5QiwwQ0FBeUM7Ozs7O0lBQ3pDLHlDQUFrRDs7Ozs7SUFDbEQsc0RBQWlGOzs7OztJQUNqRiw2REFBa0Q7Ozs7O0lBQ2xELHdDQUFxQjs7Ozs7SUFDckIsNkNBQTBCOzs7OztJQUMxQixzREFBK0M7Ozs7O0lBQy9DLDRDQUFxQzs7Ozs7SUFDckMsK0NBQWlDOzs7OztJQUNqQyw4Q0FBdUM7Ozs7O0lBQ3ZDLHlDQUFzQjs7Ozs7SUFDdEIsaURBQThCOzs7OztJQUM5QixxREFBNkM7O0lBRTdDLGlEQUE2RTs7Ozs7O0lBa0I3RSxrREFBMkU7Ozs7OztJQU0zRSwyREFBb0Y7Ozs7OztJQU1wRixzREFBK0U7Ozs7OztJQU0vRSxrREFBMkU7Ozs7OztJQU0zRSx1Q0FBZ0U7O0lBRWhFLGdEQUFpQzs7SUFDakMsMENBQXVCOzs7OztJQUtYLHFDQUFvQjs7Ozs7SUFBRSxtREFBNkM7Ozs7O0lBQUUsNENBQStCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9uZW50LFxuICBJbnB1dCxcbiAgT3V0cHV0LFxuICBFdmVudEVtaXR0ZXIsXG4gIE9uSW5pdCxcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgVmlld0NoaWxkLFxuICBFbGVtZW50UmVmLFxuICBmb3J3YXJkUmVmLFxuICBOZ1pvbmUsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBPbkRlc3Ryb3ksXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTkdfVkFMVUVfQUNDRVNTT1IsIENvbnRyb2xWYWx1ZUFjY2Vzc29yIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZnJvbUV2ZW50LCBtZXJnZSwgdGltZXIgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGRlYm91bmNlVGltZSwgZGlzdGluY3RVbnRpbENoYW5nZWQsIHRha2VVbnRpbCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgd2FpdFVudGlsTW9uYWNvUmVhZHksIGxvYWRNb25hY28gfSBmcm9tICcuL2NvZGUtZWRpdG9yLnV0aWxzJztcblxuY29uc3Qgbm9vcDogYW55ID0gKCkgPT4ge1xuICAvLyBlbXB0eSBtZXRob2Rcbn07XG5cbi8vIGNvdW50ZXIgZm9yIGlkcyB0byBhbGxvdyBmb3IgbXVsdGlwbGUgZWRpdG9ycyBvbiBvbmUgcGFnZVxubGV0IHVuaXF1ZUNvdW50ZXI6IG51bWJlciA9IDA7XG4vLyBkZWNsYXJlIGFsbCB0aGUgYnVpbHQgaW4gZWxlY3Ryb24gb2JqZWN0c1xuZGVjbGFyZSBjb25zdCBlbGVjdHJvbjogYW55O1xuZGVjbGFyZSBjb25zdCBtb25hY286IGFueTtcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAndGQtY29kZS1lZGl0b3InLFxuICB0ZW1wbGF0ZVVybDogJy4vY29kZS1lZGl0b3IuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9jb2RlLWVkaXRvci5jb21wb25lbnQuc2NzcyddLFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IFRkQ29kZUVkaXRvckNvbXBvbmVudCksXG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICB9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBUZENvZGVFZGl0b3JDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyVmlld0luaXQsIENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9kZXN0cm95OiBTdWJqZWN0PGJvb2xlYW4+ID0gbmV3IFN1YmplY3Q8Ym9vbGVhbj4oKTtcbiAgcHJpdmF0ZSBfd2lkdGhTdWJqZWN0OiBTdWJqZWN0PG51bWJlcj4gPSBuZXcgU3ViamVjdDxudW1iZXI+KCk7XG4gIHByaXZhdGUgX2hlaWdodFN1YmplY3Q6IFN1YmplY3Q8bnVtYmVyPiA9IG5ldyBTdWJqZWN0PG51bWJlcj4oKTtcblxuICBwcml2YXRlIF9lZGl0b3JTdHlsZTogc3RyaW5nID0gJ3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7Ym9yZGVyOjFweCBzb2xpZCBncmV5Oyc7XG4gIHByaXZhdGUgX2FwcFBhdGg6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlIF9pc0VsZWN0cm9uQXBwOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX3dlYnZpZXc6IGFueTtcbiAgcHJpdmF0ZSBfdmFsdWU6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlIF90aGVtZTogc3RyaW5nID0gJ3ZzJztcbiAgcHJpdmF0ZSBfbGFuZ3VhZ2U6IHN0cmluZyA9ICdqYXZhc2NyaXB0JztcbiAgcHJpdmF0ZSBfc3ViamVjdDogU3ViamVjdDxzdHJpbmc+ID0gbmV3IFN1YmplY3QoKTtcbiAgcHJpdmF0ZSBfZWRpdG9ySW5uZXJDb250YWluZXI6IHN0cmluZyA9ICdlZGl0b3JJbm5lckNvbnRhaW5lcicgKyB1bmlxdWVDb3VudGVyKys7XG4gIHByaXZhdGUgX2VkaXRvck5vZGVNb2R1bGVEaXJPdmVycmlkZTogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgX2VkaXRvcjogYW55O1xuICBwcml2YXRlIF9lZGl0b3JQcm94eTogYW55O1xuICBwcml2YXRlIF9jb21wb25lbnRJbml0aWFsaXplZDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9mcm9tRWRpdG9yOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX2VkaXRvck9wdGlvbnM6IGFueSA9IHt9O1xuICBwcml2YXRlIF9pc0Z1bGxTY3JlZW46IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfa2V5Y29kZTogYW55O1xuICBwcml2YXRlIF9zZXRWYWx1ZVRpbWVvdXQ6IGFueTtcbiAgcHJpdmF0ZSBpbml0aWFsQ29udGVudENoYW5nZTogYm9vbGVhbiA9IHRydWU7XG5cbiAgQFZpZXdDaGlsZCgnZWRpdG9yQ29udGFpbmVyJywgeyBzdGF0aWM6IHRydWUgfSkgX2VkaXRvckNvbnRhaW5lcjogRWxlbWVudFJlZjtcblxuICAvKipcbiAgICogYXV0b21hdGljTGF5b3V0PzogYm9vbGVhblxuICAgKiBAZGVwcmVjYXRlZCBpbiBmYXZvciBvZiBvdXIgb3duIHJlc2l6ZSBpbXBsZW1lbnRhdGlvbi5cbiAgICovXG4gIEBJbnB1dCgnYXV0b21hdGljTGF5b3V0JylcbiAgc2V0IGF1dG9tYXRpY0xheW91dChhdXRvbWF0aWNMYXlvdXQ6IGJvb2xlYW4pIHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmVcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICAnW2F1dG9tYXRpY0xheW91dF0gaGFzIGJlZW4gZGVwcmVjYXRlZCBpbiBmYXZvciBvZiBvdXIgb3duIHJlc2l6ZSBpbXBsZW1lbnRhdGlvbiBhbmQgd2lsbCBiZSByZW1vdmVkIG9uIDMuMC4wJyxcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIGVkaXRvckluaXRpYWxpemVkOiBmdW5jdGlvbigkZXZlbnQpXG4gICAqIEV2ZW50IGVtaXR0ZWQgd2hlbiBlZGl0b3IgaXMgZmlyc3QgaW5pdGlhbGl6ZWRcbiAgICovXG4gIEBPdXRwdXQoKSBlZGl0b3JJbml0aWFsaXplZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBlZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZDogZnVuY3Rpb24oJGV2ZW50KVxuICAgKiBFdmVudCBlbWl0dGVkIHdoZW4gZWRpdG9yJ3MgY29uZmlndXJhdGlvbiBjaGFuZ2VzXG4gICAqL1xuICBAT3V0cHV0KCkgZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAvKipcbiAgICogZWRpdG9yTGFuZ3VhZ2VDaGFuZ2VkOiBmdW5jdGlvbigkZXZlbnQpXG4gICAqIEV2ZW50IGVtaXR0ZWQgd2hlbiBlZGl0b3IncyBMYW5ndWFnZSBjaGFuZ2VzXG4gICAqL1xuICBAT3V0cHV0KCkgZWRpdG9yTGFuZ3VhZ2VDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIGVkaXRvclZhbHVlQ2hhbmdlOiBmdW5jdGlvbigkZXZlbnQpXG4gICAqIEV2ZW50IGVtaXR0ZWQgYW55IHRpbWUgc29tZXRoaW5nIGNoYW5nZXMgdGhlIGVkaXRvciB2YWx1ZVxuICAgKi9cbiAgQE91dHB1dCgpIGVkaXRvclZhbHVlQ2hhbmdlOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIFRoZSBjaGFuZ2UgZXZlbnQgbm90aWZpZXMgeW91IGFib3V0IGEgY2hhbmdlIGhhcHBlbmluZyBpbiBhbiBpbnB1dCBmaWVsZC5cbiAgICogU2luY2UgdGhlIGNvbXBvbmVudCBpcyBub3QgYSBuYXRpdmUgQW5ndWxhciBjb21wb25lbnQgaGF2ZSB0byBzcGVjaWZpeSB0aGUgZXZlbnQgZW1pdHRlciBvdXJzZWxmXG4gICAqL1xuICBAT3V0cHV0KCkgY2hhbmdlOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG4gIC8qIHRzbGludDpkaXNhYmxlLW5leHQtbGluZSAqL1xuICBwcm9wYWdhdGVDaGFuZ2UgPSAoXzogYW55KSA9PiB7fTtcbiAgb25Ub3VjaGVkID0gKCkgPT4gbm9vcDtcblxuICAvKipcbiAgICogU2V0IGlmIHVzaW5nIEVsZWN0cm9uIG1vZGUgd2hlbiBvYmplY3QgaXMgY3JlYXRlZFxuICAgKi9cbiAgY29uc3RydWN0b3IocHJpdmF0ZSB6b25lOiBOZ1pvbmUsIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZiwgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZikge1xuICAgIC8vIHNpbmNlIGFjY2Vzc2luZyB0aGUgd2luZG93IG9iamVjdCBuZWVkIHRoaXMgY2hlY2sgc28gc2VydmVyc2lkZSByZW5kZXJpbmcgZG9lc24ndCBmYWlsXG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ29iamVjdCcgJiYgISFkb2N1bWVudCkge1xuICAgICAgLyogdHNsaW50OmRpc2FibGUtbmV4dC1saW5lICovXG4gICAgICB0aGlzLl9pc0VsZWN0cm9uQXBwID0gKDxhbnk+d2luZG93KVsncHJvY2VzcyddID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgaWYgKHRoaXMuX2lzRWxlY3Ryb25BcHApIHtcbiAgICAgICAgdGhpcy5fYXBwUGF0aCA9IGVsZWN0cm9uLnJlbW90ZS5hcHBcbiAgICAgICAgICAuZ2V0QXBwUGF0aCgpXG4gICAgICAgICAgLnNwbGl0KCdcXFxcJylcbiAgICAgICAgICAuam9pbignLycpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiB2YWx1ZT86IHN0cmluZ1xuICAgKiBWYWx1ZSBpbiB0aGUgRWRpdG9yIGFmdGVyIGFzeW5jIGdldEVkaXRvckNvbnRlbnQgd2FzIGNhbGxlZFxuICAgKi9cbiAgQElucHV0KCd2YWx1ZScpXG4gIHNldCB2YWx1ZSh2YWx1ZTogc3RyaW5nKSB7XG4gICAgLy8gQ2xlYXIgYW55IHRpbWVvdXQgdGhhdCBtaWdodCBvdmVyd3JpdGUgdGhpcyB2YWx1ZSBzZXQgaW4gdGhlIGZ1dHVyZVxuICAgIGlmICh0aGlzLl9zZXRWYWx1ZVRpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9zZXRWYWx1ZVRpbWVvdXQpO1xuICAgIH1cbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgaWYgKHRoaXMuX3dlYnZpZXcuc2VuZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gZG9uJ3Qgd2FudCB0byBrZWVwIHNlbmRpbmcgY29udGVudCBpZiBldmVudCBjYW1lIGZyb20gSVBDLCBpbmZpbml0ZSBsb29wXG4gICAgICAgICAgaWYgKCF0aGlzLl9mcm9tRWRpdG9yKSB7XG4gICAgICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3NldEVkaXRvckNvbnRlbnQnLCB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuZWRpdG9yVmFsdWVDaGFuZ2UuZW1pdCgpO1xuICAgICAgICAgIHRoaXMucHJvcGFnYXRlQ2hhbmdlKHRoaXMuX3ZhbHVlKTtcbiAgICAgICAgICB0aGlzLmNoYW5nZS5lbWl0KCk7XG4gICAgICAgICAgdGhpcy5fZnJvbUVkaXRvciA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEVkaXRvciBpcyBub3QgbG9hZGVkIHlldCwgdHJ5IGFnYWluIGluIGhhbGYgYSBzZWNvbmRcbiAgICAgICAgICB0aGlzLl9zZXRWYWx1ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICB9LCA1MDApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5fZWRpdG9yICYmIHRoaXMuX2VkaXRvci5zZXRWYWx1ZSkge1xuICAgICAgICAgIC8vIGRvbid0IHdhbnQgdG8ga2VlcCBzZW5kaW5nIGNvbnRlbnQgaWYgZXZlbnQgY2FtZSBmcm9tIHRoZSBlZGl0b3IsIGluZmluaXRlIGxvb3BcbiAgICAgICAgICBpZiAoIXRoaXMuX2Zyb21FZGl0b3IpIHtcbiAgICAgICAgICAgIHRoaXMuX2VkaXRvci5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuZWRpdG9yVmFsdWVDaGFuZ2UuZW1pdCgpO1xuICAgICAgICAgIHRoaXMucHJvcGFnYXRlQ2hhbmdlKHRoaXMuX3ZhbHVlKTtcbiAgICAgICAgICB0aGlzLmNoYW5nZS5lbWl0KCk7XG4gICAgICAgICAgdGhpcy5fZnJvbUVkaXRvciA9IGZhbHNlO1xuICAgICAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4gKHRoaXMuX3ZhbHVlID0gdmFsdWUpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBFZGl0b3IgaXMgbm90IGxvYWRlZCB5ZXQsIHRyeSBhZ2FpbiBpbiBoYWxmIGEgc2Vjb25kXG4gICAgICAgICAgdGhpcy5fc2V0VmFsdWVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zZXRWYWx1ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgfSwgNTAwKTtcbiAgICB9XG4gIH1cblxuICBnZXQgdmFsdWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBDb250cm9sVmFsdWVBY2Nlc3Nvci5cbiAgICovXG4gIHdyaXRlVmFsdWUodmFsdWU6IGFueSk6IHZvaWQge1xuICAgIC8vIGRvIG5vdCB3cml0ZSBpZiBudWxsIG9yIHVuZGVmaW5lZFxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZVxuICAgIGlmICh2YWx1ZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogYW55KTogdm9pZCB7XG4gICAgdGhpcy5wcm9wYWdhdGVDaGFuZ2UgPSBmbjtcbiAgfVxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogYW55KTogdm9pZCB7XG4gICAgdGhpcy5vblRvdWNoZWQgPSBmbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXRFZGl0b3JDb250ZW50PzogZnVuY3Rpb25cbiAgICogUmV0dXJucyB0aGUgY29udGVudCB3aXRoaW4gdGhlIGVkaXRvclxuICAgKi9cbiAgZ2V0VmFsdWUoKTogT2JzZXJ2YWJsZTxzdHJpbmc+IHtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnZ2V0RWRpdG9yQ29udGVudCcpO1xuICAgICAgICByZXR1cm4gdGhpcy5fc3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICAgIHRoaXMuX3ZhbHVlID0gdGhpcy5fZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX3N1YmplY3QubmV4dCh0aGlzLl92YWx1ZSk7XG4gICAgICAgICAgdGhpcy5fc3ViamVjdC5jb21wbGV0ZSgpO1xuICAgICAgICAgIHRoaXMuX3N1YmplY3QgPSBuZXcgU3ViamVjdCgpO1xuICAgICAgICAgIHRoaXMuZWRpdG9yVmFsdWVDaGFuZ2UuZW1pdCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIGxhbmd1YWdlPzogc3RyaW5nXG4gICAqIGxhbmd1YWdlIHVzZWQgaW4gZWRpdG9yXG4gICAqL1xuICBASW5wdXQoJ2xhbmd1YWdlJylcbiAgc2V0IGxhbmd1YWdlKGxhbmd1YWdlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9sYW5ndWFnZSA9IGxhbmd1YWdlO1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdzZXRMYW5ndWFnZScsIGxhbmd1YWdlKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZTogc3RyaW5nID0gdGhpcy5fZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgIHRoaXMuX2VkaXRvci5kaXNwb3NlKCk7XG4gICAgICAgIGNvbnN0IG15RGl2OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50O1xuICAgICAgICB0aGlzLl9lZGl0b3IgPSBtb25hY28uZWRpdG9yLmNyZWF0ZShcbiAgICAgICAgICBteURpdixcbiAgICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB2YWx1ZTogY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICBsYW5ndWFnZSxcbiAgICAgICAgICAgICAgdGhlbWU6IHRoaXMuX3RoZW1lLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yT3B0aW9ucyxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLl9lZGl0b3IuZ2V0TW9kZWwoKS5vbkRpZENoYW5nZUNvbnRlbnQoKGU6IGFueSkgPT4ge1xuICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSB0cnVlO1xuICAgICAgICAgIHRoaXMud3JpdGVWYWx1ZSh0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkLmVtaXQoKTtcbiAgICAgICAgdGhpcy5lZGl0b3JMYW5ndWFnZUNoYW5nZWQuZW1pdCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXQgbGFuZ3VhZ2UoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fbGFuZ3VhZ2U7XG4gIH1cblxuICAvKipcbiAgICogcmVnaXN0ZXJMYW5ndWFnZT86IGZ1bmN0aW9uXG4gICAqIFJlZ2lzdGVycyBhIGN1c3RvbSBMYW5ndWFnZSB3aXRoaW4gdGhlIGVkaXRvclxuICAgKi9cbiAgcmVnaXN0ZXJMYW5ndWFnZShsYW5ndWFnZTogYW55KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3JlZ2lzdGVyTGFuZ3VhZ2UnLCBsYW5ndWFnZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgICB0aGlzLl9lZGl0b3IuZGlzcG9zZSgpO1xuXG4gICAgICAgIGZvciAoY29uc3QgcHJvdmlkZXIgb2YgbGFuZ3VhZ2UuY29tcGxldGlvbkl0ZW1Qcm92aWRlcikge1xuICAgICAgICAgIC8qIHRzbGludDpkaXNhYmxlLW5leHQtbGluZSAqL1xuICAgICAgICAgIHByb3ZpZGVyLmtpbmQgPSBldmFsKHByb3ZpZGVyLmtpbmQpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgbW9uYXJjaFRva2VucyBvZiBsYW5ndWFnZS5tb25hcmNoVG9rZW5zUHJvdmlkZXIpIHtcbiAgICAgICAgICAvKiB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmUgKi9cbiAgICAgICAgICBtb25hcmNoVG9rZW5zWzBdID0gZXZhbChtb25hcmNoVG9rZW5zWzBdKTtcbiAgICAgICAgfVxuICAgICAgICBtb25hY28ubGFuZ3VhZ2VzLnJlZ2lzdGVyKHsgaWQ6IGxhbmd1YWdlLmlkIH0pO1xuXG4gICAgICAgIG1vbmFjby5sYW5ndWFnZXMuc2V0TW9uYXJjaFRva2Vuc1Byb3ZpZGVyKGxhbmd1YWdlLmlkLCB7XG4gICAgICAgICAgdG9rZW5pemVyOiB7XG4gICAgICAgICAgICByb290OiBsYW5ndWFnZS5tb25hcmNoVG9rZW5zUHJvdmlkZXIsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gRGVmaW5lIGEgbmV3IHRoZW1lIHRoYXQgY29uc3RhaW5zIG9ubHkgcnVsZXMgdGhhdCBtYXRjaCB0aGlzIGxhbmd1YWdlXG4gICAgICAgIG1vbmFjby5lZGl0b3IuZGVmaW5lVGhlbWUobGFuZ3VhZ2UuY3VzdG9tVGhlbWUuaWQsIGxhbmd1YWdlLmN1c3RvbVRoZW1lLnRoZW1lKTtcbiAgICAgICAgdGhpcy5fdGhlbWUgPSBsYW5ndWFnZS5jdXN0b21UaGVtZS5pZDtcblxuICAgICAgICBtb25hY28ubGFuZ3VhZ2VzLnJlZ2lzdGVyQ29tcGxldGlvbkl0ZW1Qcm92aWRlcihsYW5ndWFnZS5pZCwge1xuICAgICAgICAgIHByb3ZpZGVDb21wbGV0aW9uSXRlbXM6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBsYW5ndWFnZS5jb21wbGV0aW9uSXRlbVByb3ZpZGVyO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGNzczogSFRNTFN0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgIGNzcy50eXBlID0gJ3RleHQvY3NzJztcbiAgICAgICAgY3NzLmlubmVySFRNTCA9IGxhbmd1YWdlLm1vbmFyY2hUb2tlbnNQcm92aWRlckNTUztcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjc3MpO1xuICAgICAgICB0aGlzLmVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkLmVtaXQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogc3R5bGU/OiBzdHJpbmdcbiAgICogY3NzIHN0eWxlIG9mIHRoZSBlZGl0b3Igb24gdGhlIHBhZ2VcbiAgICovXG4gIEBJbnB1dCgnZWRpdG9yU3R5bGUnKVxuICBzZXQgZWRpdG9yU3R5bGUoZWRpdG9yU3R5bGU6IHN0cmluZykge1xuICAgIHRoaXMuX2VkaXRvclN0eWxlID0gZWRpdG9yU3R5bGU7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3NldEVkaXRvclN0eWxlJywgeyBsYW5ndWFnZTogdGhpcy5fbGFuZ3VhZ2UsIHRoZW1lOiB0aGlzLl90aGVtZSwgc3R5bGU6IGVkaXRvclN0eWxlIH0pO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgY29uc3QgY29udGFpbmVyRGl2OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50O1xuICAgICAgICBjb250YWluZXJEaXYuc2V0QXR0cmlidXRlKCdzdHlsZScsIGVkaXRvclN0eWxlKTtcbiAgICAgICAgY29uc3QgY3VycmVudFZhbHVlOiBzdHJpbmcgPSB0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgdGhpcy5fZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICAgICAgY29uc3QgbXlEaXY6IEhUTUxEaXZFbGVtZW50ID0gdGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMuX2VkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKFxuICAgICAgICAgIG15RGl2LFxuICAgICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgIGxhbmd1YWdlOiB0aGlzLl9sYW5ndWFnZSxcbiAgICAgICAgICAgICAgdGhlbWU6IHRoaXMuX3RoZW1lLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yT3B0aW9ucyxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLl9lZGl0b3IuZ2V0TW9kZWwoKS5vbkRpZENoYW5nZUNvbnRlbnQoKGU6IGFueSkgPT4ge1xuICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSB0cnVlO1xuICAgICAgICAgIHRoaXMud3JpdGVWYWx1ZSh0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXQgZWRpdG9yU3R5bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdG9yU3R5bGU7XG4gIH1cblxuICAvKipcbiAgICogdGhlbWU/OiBzdHJpbmdcbiAgICogVGhlbWUgdG8gYmUgYXBwbGllZCB0byBlZGl0b3JcbiAgICovXG4gIEBJbnB1dCgndGhlbWUnKVxuICBzZXQgdGhlbWUodGhlbWU6IHN0cmluZykge1xuICAgIHRoaXMuX3RoZW1lID0gdGhlbWU7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3NldEVkaXRvck9wdGlvbnMnLCB7IHRoZW1lIH0pO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgdGhpcy5fZWRpdG9yLnVwZGF0ZU9wdGlvbnMoeyB0aGVtZSB9KTtcbiAgICAgICAgdGhpcy5lZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZC5lbWl0KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGdldCB0aGVtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl90aGVtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBmdWxsU2NyZWVuS2V5QmluZGluZz86IG51bWJlclxuICAgKiBTZWUgaGVyZSBmb3Iga2V5IGJpbmRpbmdzIGh0dHBzOi8vbWljcm9zb2Z0LmdpdGh1Yi5pby9tb25hY28tZWRpdG9yL2FwaS9lbnVtcy9tb25hY28ua2V5Y29kZS5odG1sXG4gICAqIFNldHMgdGhlIEtleUNvZGUgZm9yIHNob3J0Y3V0dGluZyB0byBGdWxsc2NyZWVuIG1vZGVcbiAgICovXG4gIEBJbnB1dCgnZnVsbFNjcmVlbktleUJpbmRpbmcnKVxuICBzZXQgZnVsbFNjcmVlbktleUJpbmRpbmcoa2V5Y29kZTogbnVtYmVyW10pIHtcbiAgICB0aGlzLl9rZXljb2RlID0ga2V5Y29kZTtcbiAgfVxuICBnZXQgZnVsbFNjcmVlbktleUJpbmRpbmcoKTogbnVtYmVyW10ge1xuICAgIHJldHVybiB0aGlzLl9rZXljb2RlO1xuICB9XG5cbiAgLyoqXG4gICAqIGVkaXRvck9wdGlvbnM/OiBvYmplY3RcbiAgICogT3B0aW9ucyB1c2VkIG9uIGVkaXRvciBpbnN0YW50aWF0aW9uLiBBdmFpbGFibGUgb3B0aW9ucyBsaXN0ZWQgaGVyZTpcbiAgICogaHR0cHM6Ly9taWNyb3NvZnQuZ2l0aHViLmlvL21vbmFjby1lZGl0b3IvYXBpL2ludGVyZmFjZXMvbW9uYWNvLmVkaXRvci5pZWRpdG9yb3B0aW9ucy5odG1sXG4gICAqL1xuICBASW5wdXQoJ2VkaXRvck9wdGlvbnMnKVxuICBzZXQgZWRpdG9yT3B0aW9ucyhlZGl0b3JPcHRpb25zOiBhbnkpIHtcbiAgICB0aGlzLl9lZGl0b3JPcHRpb25zID0gZWRpdG9yT3B0aW9ucztcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnc2V0RWRpdG9yT3B0aW9ucycsIGVkaXRvck9wdGlvbnMpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgdGhpcy5fZWRpdG9yLnVwZGF0ZU9wdGlvbnMoZWRpdG9yT3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXQgZWRpdG9yT3B0aW9ucygpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl9lZGl0b3JPcHRpb25zO1xuICB9XG5cbiAgLyoqXG4gICAqIGxheW91dCBtZXRob2QgdGhhdCBjYWxscyBsYXlvdXQgbWV0aG9kIG9mIGVkaXRvciBhbmQgaW5zdHJ1Y3RzIHRoZSBlZGl0b3IgdG8gcmVtZWFzdXJlIGl0cyBjb250YWluZXJcbiAgICovXG4gIGxheW91dCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnbGF5b3V0Jyk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgICB0aGlzLl9lZGl0b3IubGF5b3V0KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaWYgaW4gRWxlY3Ryb24gbW9kZSBvciBub3RcbiAgICovXG4gIGdldCBpc0VsZWN0cm9uQXBwKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc0VsZWN0cm9uQXBwO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaWYgaW4gRnVsbCBTY3JlZW4gTW9kZSBvciBub3RcbiAgICovXG4gIGdldCBpc0Z1bGxTY3JlZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzRnVsbFNjcmVlbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBzZXRFZGl0b3JOb2RlTW9kdWxlRGlyT3ZlcnJpZGUgZnVuY3Rpb24gdGhhdCBvdmVycmlkZXMgd2hlcmUgdG8gbG9va1xuICAgKiBmb3IgdGhlIGVkaXRvciBub2RlX21vZHVsZS4gVXNlZCBpbiB0ZXN0cyBmb3IgRWxlY3Ryb24gb3IgYW55d2hlcmUgdGhhdCB0aGVcbiAgICogbm9kZV9tb2R1bGVzIGFyZSBub3QgaW4gdGhlIGV4cGVjdGVkIGxvY2F0aW9uLlxuICAgKi9cbiAgc2V0RWRpdG9yTm9kZU1vZHVsZURpck92ZXJyaWRlKGRpck92ZXJyaWRlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9lZGl0b3JOb2RlTW9kdWxlRGlyT3ZlcnJpZGUgPSBkaXJPdmVycmlkZTtcbiAgICB0aGlzLl9hcHBQYXRoID0gZGlyT3ZlcnJpZGU7XG4gIH1cblxuICAvKipcbiAgICogbmdPbkluaXQgb25seSB1c2VkIGZvciBFbGVjdHJvbiB2ZXJzaW9uIG9mIGVkaXRvclxuICAgKiBUaGlzIGlzIHdoZXJlIHRoZSB3ZWJ2aWV3IGlzIGNyZWF0ZWQgdG8gc2FuZGJveCBhd2F5IHRoZSBlZGl0b3JcbiAgICovXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIGxldCBlZGl0b3JIVE1MOiBzdHJpbmcgPSAnJztcbiAgICBpZiAodGhpcy5faXNFbGVjdHJvbkFwcCkge1xuICAgICAgZWRpdG9ySFRNTCA9IGA8IURPQ1RZUEUgaHRtbD5cbiAgICAgICAgICAgIDxodG1sIHN0eWxlPVwiaGVpZ2h0OjEwMCVcIj5cbiAgICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgICAgIDxtZXRhIGh0dHAtZXF1aXY9XCJYLVVBLUNvbXBhdGlibGVcIiBjb250ZW50PVwiSUU9ZWRnZVwiIC8+XG4gICAgICAgICAgICAgICAgPG1ldGEgaHR0cC1lcXVpdj1cIkNvbnRlbnQtVHlwZVwiIGNvbnRlbnQ9XCJ0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOFwiID5cbiAgICAgICAgICAgICAgICA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgZGF0YS1uYW1lPVwidnMvZWRpdG9yL2VkaXRvci5tYWluXCJcbiAgICAgICAgICAgICAgICAgICAgaHJlZj1cImZpbGU6Ly8ke3RoaXMuX2VkaXRvck5vZGVNb2R1bGVEaXJPdmVycmlkZX0vYXNzZXRzL21vbmFjby92cy9lZGl0b3IvZWRpdG9yLm1haW4uY3NzXCI+XG4gICAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgICA8Ym9keSBzdHlsZT1cImhlaWdodDoxMDAlO3dpZHRoOiAxMDAlO21hcmdpbjogMDtwYWRkaW5nOiAwO292ZXJmbG93OiBoaWRkZW47XCI+XG4gICAgICAgICAgICA8ZGl2IGlkPVwiJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn1cIiBzdHlsZT1cIndpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7JHt0aGlzLl9lZGl0b3JTdHlsZX1cIj48L2Rpdj5cbiAgICAgICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBpcGNSZW5kZXJlciBvZiBlbGVjdHJvbiBmb3IgY29tbXVuaWNhdGlvblxuICAgICAgICAgICAgICAgIGNvbnN0IHtpcGNSZW5kZXJlcn0gPSByZXF1aXJlKCdlbGVjdHJvbicpO1xuICAgICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgICAgICA8c2NyaXB0IHNyYz1cImZpbGU6Ly8ke3RoaXMuX2VkaXRvck5vZGVNb2R1bGVEaXJPdmVycmlkZX0vYXNzZXRzL21vbmFjby92cy9sb2FkZXIuanNcIj48L3NjcmlwdD5cbiAgICAgICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICAgICAgICAgdmFyIGVkaXRvcjtcbiAgICAgICAgICAgICAgICB2YXIgdGhlbWUgPSAnJHt0aGlzLl90aGVtZX0nO1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9ICcke3RoaXMuX3ZhbHVlfSc7XG5cbiAgICAgICAgICAgICAgICByZXF1aXJlLmNvbmZpZyh7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VVcmw6ICcke3RoaXMuX2FwcFBhdGh9L2Fzc2V0cy9tb25hY28nXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2VsZi5tb2R1bGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgc2VsZi5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgcmVxdWlyZShbJ3ZzL2VkaXRvci9lZGl0b3IubWFpbiddLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yID0gbW9uYWNvLmVkaXRvci5jcmVhdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJcbiAgICAgICAgICAgICAgICAgICAgfScpLCBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhbmd1YWdlOiAnJHt0aGlzLmxhbmd1YWdlfScsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJyR7dGhpcy5fdGhlbWV9JyxcbiAgICAgICAgICAgICAgICAgICAgfSwgJHtKU09OLnN0cmluZ2lmeSh0aGlzLmVkaXRvck9wdGlvbnMpfSkpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IuZ2V0TW9kZWwoKS5vbkRpZENoYW5nZUNvbnRlbnQoIChlKT0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJvbkVkaXRvckNvbnRlbnRDaGFuZ2VcIiwgZWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmFkZEFjdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gQW4gdW5pcXVlIGlkZW50aWZpZXIgb2YgdGhlIGNvbnRyaWJ1dGVkIGFjdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgICBpZDogJ2Z1bGxTY3JlZW4nLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIEEgbGFiZWwgb2YgdGhlIGFjdGlvbiB0aGF0IHdpbGwgYmUgcHJlc2VudGVkIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRnVsbCBTY3JlZW4nLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIEFuIG9wdGlvbmFsIGFycmF5IG9mIGtleWJpbmRpbmdzIGZvciB0aGUgYWN0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHRNZW51R3JvdXBJZDogJ25hdmlnYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICAgIGtleWJpbmRpbmdzOiBbJHt0aGlzLl9rZXljb2RlfV0sXG4gICAgICAgICAgICAgICAgICAgICAgY29udGV4dE1lbnVPcmRlcjogMS41LFxuICAgICAgICAgICAgICAgICAgICAgIC8vIE1ldGhvZCB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgd2hlbiB0aGUgYWN0aW9uIGlzIHRyaWdnZXJlZC5cbiAgICAgICAgICAgICAgICAgICAgICAvLyBAcGFyYW0gZWRpdG9yIFRoZSBlZGl0b3IgaW5zdGFuY2UgaXMgcGFzc2VkIGluIGFzIGEgY29udmluaWVuY2VcbiAgICAgICAgICAgICAgICAgICAgICBydW46IGZ1bmN0aW9uKGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWRpdG9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7dGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJ9Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0b3JEaXYud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IuYWRkQWN0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBBbiB1bmlxdWUgaWRlbnRpZmllciBvZiB0aGUgY29udHJpYnV0ZWQgYWN0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZXhpdGZ1bGxTY3JlZW4nLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIEEgbGFiZWwgb2YgdGhlIGFjdGlvbiB0aGF0IHdpbGwgYmUgcHJlc2VudGVkIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRXhpdCBGdWxsIFNjcmVlbicsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gQW4gb3B0aW9uYWwgYXJyYXkgb2Yga2V5YmluZGluZ3MgZm9yIHRoZSBhY3Rpb24uXG4gICAgICAgICAgICAgICAgICAgICAgY29udGV4dE1lbnVHcm91cElkOiAnbmF2aWdhdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAga2V5YmluZGluZ3M6IFs5XSxcbiAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0TWVudU9yZGVyOiAxLjUsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gTWV0aG9kIHRoYXQgd2lsbCBiZSBleGVjdXRlZCB3aGVuIHRoZSBhY3Rpb24gaXMgdHJpZ2dlcmVkLlxuICAgICAgICAgICAgICAgICAgICAgIC8vIEBwYXJhbSBlZGl0b3IgVGhlIGVkaXRvciBpbnN0YW5jZSBpcyBwYXNzZWQgaW4gYXMgYSBjb252aW5pZW5jZVxuICAgICAgICAgICAgICAgICAgICAgIHJ1bjogZnVuY3Rpb24oZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlZGl0b3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LndlYmtpdEV4aXRGdWxsc2NyZWVuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIuc2VuZFRvSG9zdChcImVkaXRvckluaXRpYWxpemVkXCIsIHRoaXMuX2VkaXRvcik7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gYmFjayB0aGUgdmFsdWUgaW4gdGhlIGVkaXRvciB0byB0aGUgbWFpbnZpZXdcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignZ2V0RWRpdG9yQ29udGVudCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJlZGl0b3JDb250ZW50XCIsIGVkaXRvci5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgdmFsdWUgb2YgdGhlIGVkaXRvciBmcm9tIHdoYXQgd2FzIHNlbnQgZnJvbSB0aGUgbWFpbnZpZXdcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignc2V0RWRpdG9yQ29udGVudCcsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBkYXRhO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3Iuc2V0VmFsdWUoZGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIHN0eWxlIG9mIHRoZSBlZGl0b3IgY29udGFpbmVyIGRpdlxuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdzZXRFZGl0b3JTdHlsZScsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVkaXRvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke3RoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyfScpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3JEaXYuc3R5bGUgPSBkYXRhLnN0eWxlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudFZhbHVlID0gZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyXG4gICAgICAgICAgICAgICAgICAgIH0nKSwgT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFuZ3VhZ2U6IGRhdGEubGFuZ3VhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogZGF0YS50aGVtZSxcbiAgICAgICAgICAgICAgICAgICAgfSwgJHtKU09OLnN0cmluZ2lmeSh0aGlzLmVkaXRvck9wdGlvbnMpfSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBvcHRpb25zIG9mIHRoZSBlZGl0b3IgZnJvbSB3aGF0IHdhcyBzZW50IGZyb20gdGhlIG1haW52aWV3XG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ3NldEVkaXRvck9wdGlvbnMnLCBmdW5jdGlvbihldmVudCwgZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci51cGRhdGVPcHRpb25zKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwiZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWRcIiwgJycpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBsYW5ndWFnZSBvZiB0aGUgZWRpdG9yIGZyb20gd2hhdCB3YXMgc2VudCBmcm9tIHRoZSBtYWludmlld1xuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdzZXRMYW5ndWFnZScsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IgPSBtb25hY28uZWRpdG9yLmNyZWF0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHtcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lclxuICAgICAgICAgICAgICAgICAgICB9JyksIE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGN1cnJlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhbmd1YWdlOiBkYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6IHRoZW1lLFxuICAgICAgICAgICAgICAgICAgICB9LCAke0pTT04uc3RyaW5naWZ5KHRoaXMuZWRpdG9yT3B0aW9ucyl9KSk7XG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJlZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZFwiLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJlZGl0b3JMYW5ndWFnZUNoYW5nZWRcIiwgJycpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gcmVnaXN0ZXIgYSBuZXcgbGFuZ3VhZ2Ugd2l0aCBlZGl0b3JcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbigncmVnaXN0ZXJMYW5ndWFnZScsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IuZGlzcG9zZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5jb21wbGV0aW9uSXRlbVByb3ZpZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvdmlkZXIgPSBkYXRhLmNvbXBsZXRpb25JdGVtUHJvdmlkZXJbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlci5raW5kID0gZXZhbChwcm92aWRlci5raW5kKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubW9uYXJjaFRva2Vuc1Byb3ZpZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbW9uYXJjaFRva2VucyA9IGRhdGEubW9uYXJjaFRva2Vuc1Byb3ZpZGVyW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9uYXJjaFRva2Vuc1swXSA9IGV2YWwobW9uYXJjaFRva2Vuc1swXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5yZWdpc3Rlcih7IGlkOiBkYXRhLmlkIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIG1vbmFjby5sYW5ndWFnZXMuc2V0TW9uYXJjaFRva2Vuc1Byb3ZpZGVyKGRhdGEuaWQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuaXplcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3Q6IGRhdGEubW9uYXJjaFRva2Vuc1Byb3ZpZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIERlZmluZSBhIG5ldyB0aGVtZSB0aGF0IGNvbnN0YWlucyBvbmx5IHJ1bGVzIHRoYXQgbWF0Y2ggdGhpcyBsYW5ndWFnZVxuICAgICAgICAgICAgICAgICAgICBtb25hY28uZWRpdG9yLmRlZmluZVRoZW1lKGRhdGEuY3VzdG9tVGhlbWUuaWQsIGRhdGEuY3VzdG9tVGhlbWUudGhlbWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGVtZSA9IGRhdGEuY3VzdG9tVGhlbWUuaWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5yZWdpc3RlckNvbXBsZXRpb25JdGVtUHJvdmlkZXIoZGF0YS5pZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZUNvbXBsZXRpb25JdGVtczogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLmNvbXBsZXRpb25JdGVtUHJvdmlkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGNzcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgY3NzLnR5cGUgPSBcInRleHQvY3NzXCI7XG4gICAgICAgICAgICAgICAgICAgIGNzcy5pbm5lckhUTUwgPSBkYXRhLm1vbmFyY2hUb2tlbnNQcm92aWRlckNTUztcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjc3MpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJlZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZFwiLCAnJyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJbnN0cnVjdCB0aGUgZWRpdG9yIHRvIHJlbWVhc3VyZSBpdHMgY29udGFpbmVyXG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ2xheW91dCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5sYXlvdXQoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIEluc3RydWN0IHRoZSBlZGl0b3IgZ28gdG8gZnVsbCBzY3JlZW4gbW9kZVxuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdzaG93RnVsbFNjcmVlbkVkaXRvcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgdmFyIGVkaXRvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke3RoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyfScpO1xuICAgICAgICAgICAgICAgICAgZWRpdG9yRGl2LndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJbnN0cnVjdCB0aGUgZWRpdG9yIGV4aXQgZnVsbCBzY3JlZW4gbW9kZVxuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdleGl0RnVsbFNjcmVlbkVkaXRvcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgdmFyIGVkaXRvckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcke3RoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyfScpO1xuICAgICAgICAgICAgICAgICAgZWRpdG9yRGl2LndlYmtpdEV4aXRGdWxsc2NyZWVuKCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignZGlzcG9zZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICBlZGl0b3IuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gbmVlZCB0byBtYW51YWxseSByZXNpemUgdGhlIGVkaXRvciBhbnkgdGltZSB0aGUgd2luZG93IHNpemVcbiAgICAgICAgICAgICAgICAvLyBjaGFuZ2VzLiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvbW9uYWNvLWVkaXRvci9pc3N1ZXMvMjhcbiAgICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBmdW5jdGlvbiByZXNpemVFZGl0b3IoKSB7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5sYXlvdXQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgICAgPC9ib2R5PlxuICAgICAgICAgICAgPC9odG1sPmA7XG5cbiAgICAgIC8vIGR5bmFtaWNhbGx5IGNyZWF0ZSB0aGUgRWxlY3Ryb24gV2VidmlldyBFbGVtZW50XG4gICAgICAvLyB0aGlzIHdpbGwgc2FuZGJveCB0aGUgbW9uYWNvIGNvZGUgaW50byBpdHMgb3duIERPTSBhbmQgaXRzIG93blxuICAgICAgLy8gamF2YXNjcmlwdCBpbnN0YW5jZS4gTmVlZCB0byBkbyB0aGlzIHRvIGF2b2lkIHByb2JsZW1zIHdpdGggbW9uYWNvXG4gICAgICAvLyB1c2luZyBBTUQgUmVxdWlyZXMgYW5kIEVsZWN0cm9uIHVzaW5nIE5vZGUgUmVxdWlyZXNcbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L21vbmFjby1lZGl0b3IvaXNzdWVzLzkwXG4gICAgICB0aGlzLl93ZWJ2aWV3ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnd2VidmlldycpO1xuICAgICAgdGhpcy5fd2Vidmlldy5zZXRBdHRyaWJ1dGUoJ25vZGVpbnRlZ3JhdGlvbicsICd0cnVlJyk7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNldEF0dHJpYnV0ZSgnZGlzYWJsZXdlYnNlY3VyaXR5JywgJ3RydWUnKTtcbiAgICAgIC8vIHRha2UgdGhlIGh0bWwgY29udGVudCBmb3IgdGhlIHdlYnZpZXcgYW5kIGJhc2U2NCBlbmNvZGUgaXQgYW5kIHVzZSBhcyB0aGUgc3JjIHRhZ1xuICAgICAgdGhpcy5fd2Vidmlldy5zZXRBdHRyaWJ1dGUoJ3NyYycsICdkYXRhOnRleHQvaHRtbDtiYXNlNjQsJyArIHdpbmRvdy5idG9hKGVkaXRvckhUTUwpKTtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2V0QXR0cmlidXRlKCdzdHlsZScsICdkaXNwbGF5OmlubGluZS1mbGV4OyB3aWR0aDoxMDAlOyBoZWlnaHQ6MTAwJScpO1xuICAgICAgLy8gdG8gZGVidWc6XG4gICAgICAvLyAgdGhpcy5fd2Vidmlldy5hZGRFdmVudExpc3RlbmVyKCdkb20tcmVhZHknLCAoKSA9PiB7XG4gICAgICAvLyAgICAgdGhpcy5fd2Vidmlldy5vcGVuRGV2VG9vbHMoKTtcbiAgICAgIC8vICB9KTtcblxuICAgICAgLy8gUHJvY2VzcyB0aGUgZGF0YSBmcm9tIHRoZSB3ZWJ2aWV3XG4gICAgICB0aGlzLl93ZWJ2aWV3LmFkZEV2ZW50TGlzdGVuZXIoJ2lwYy1tZXNzYWdlJywgKGV2ZW50OiBhbnkpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmNoYW5uZWwgPT09ICdlZGl0b3JDb250ZW50Jykge1xuICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSB0cnVlO1xuICAgICAgICAgIHRoaXMud3JpdGVWYWx1ZShldmVudC5hcmdzWzBdKTtcbiAgICAgICAgICB0aGlzLl9zdWJqZWN0Lm5leHQodGhpcy5fdmFsdWUpO1xuICAgICAgICAgIHRoaXMuX3N1YmplY3QuY29tcGxldGUoKTtcbiAgICAgICAgICB0aGlzLl9zdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5jaGFubmVsID09PSAnb25FZGl0b3JDb250ZW50Q2hhbmdlJykge1xuICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSB0cnVlO1xuICAgICAgICAgIHRoaXMud3JpdGVWYWx1ZShldmVudC5hcmdzWzBdKTtcbiAgICAgICAgICBpZiAodGhpcy5pbml0aWFsQ29udGVudENoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5pbml0aWFsQ29udGVudENoYW5nZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5sYXlvdXQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY2hhbm5lbCA9PT0gJ2VkaXRvckluaXRpYWxpemVkJykge1xuICAgICAgICAgIHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLl9lZGl0b3JQcm94eSA9IHRoaXMud3JhcEVkaXRvckNhbGxzKHRoaXMuX2VkaXRvcik7XG4gICAgICAgICAgdGhpcy5lZGl0b3JJbml0aWFsaXplZC5lbWl0KHRoaXMuX2VkaXRvclByb3h5KTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5jaGFubmVsID09PSAnZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQnKSB7XG4gICAgICAgICAgdGhpcy5lZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZC5lbWl0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY2hhbm5lbCA9PT0gJ2VkaXRvckxhbmd1YWdlQ2hhbmdlZCcpIHtcbiAgICAgICAgICB0aGlzLmVkaXRvckxhbmd1YWdlQ2hhbmdlZC5lbWl0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBhcHBlbmQgdGhlIHdlYnZpZXcgdG8gdGhlIERPTVxuICAgICAgdGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fd2Vidmlldyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIG5nQWZ0ZXJWaWV3SW5pdCBvbmx5IHVzZWQgZm9yIGJyb3dzZXIgdmVyc2lvbiBvZiBlZGl0b3JcbiAgICogVGhpcyBpcyB3aGVyZSB0aGUgQU1EIExvYWRlciBzY3JpcHRzIGFyZSBhZGRlZCB0byB0aGUgYnJvd3NlciBhbmQgdGhlIGVkaXRvciBzY3JpcHRzIGFyZSBcInJlcXVpcmVkXCJcbiAgICovXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2lzRWxlY3Ryb25BcHApIHtcbiAgICAgIGxvYWRNb25hY28oKTtcbiAgICAgIHdhaXRVbnRpbE1vbmFjb1JlYWR5KClcbiAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3kpKVxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmluaXRNb25hY28oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1lcmdlKFxuICAgICAgZnJvbUV2ZW50KHdpbmRvdywgJ3Jlc2l6ZScpLnBpcGUoZGVib3VuY2VUaW1lKDEwMCkpLFxuICAgICAgdGhpcy5fd2lkdGhTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpLnBpcGUoZGlzdGluY3RVbnRpbENoYW5nZWQoKSksXG4gICAgICB0aGlzLl9oZWlnaHRTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpLnBpcGUoZGlzdGluY3RVbnRpbENoYW5nZWQoKSksXG4gICAgKVxuICAgICAgLnBpcGUoXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95KSxcbiAgICAgICAgZGVib3VuY2VUaW1lKDEwMCksXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgdGhpcy5sYXlvdXQoKTtcbiAgICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgICB9KTtcbiAgICB0aW1lcig1MDAsIDI1MClcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95KSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fZWxlbWVudFJlZiAmJiB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpIHtcbiAgICAgICAgICB0aGlzLl93aWR0aFN1YmplY3QubmV4dCgoPEhUTUxFbGVtZW50PnRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgpO1xuICAgICAgICAgIHRoaXMuX2hlaWdodFN1YmplY3QubmV4dCgoPEhUTUxFbGVtZW50PnRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5kZXRhY2goKTtcbiAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdkaXNwb3NlJyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgIHRoaXMuX2VkaXRvci5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX2Rlc3Ryb3kubmV4dCh0cnVlKTtcbiAgICB0aGlzLl9kZXN0cm95LnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICAvKipcbiAgICogc2hvd0Z1bGxTY3JlZW5FZGl0b3IgcmVxdWVzdCBmb3IgZnVsbCBzY3JlZW4gb2YgQ29kZSBFZGl0b3IgYmFzZWQgb24gaXRzIGJyb3dzZXIgdHlwZS5cbiAgICovXG4gIHB1YmxpYyBzaG93RnVsbFNjcmVlbkVkaXRvcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnc2hvd0Z1bGxTY3JlZW5FZGl0b3InKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGNvZGVFZGl0b3JFbGVtZW50OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50IGFzIEhUTUxEaXZFbGVtZW50O1xuICAgICAgICBjb25zdCBmdWxsU2NyZWVuTWFwOiBvYmplY3QgPSB7XG4gICAgICAgICAgLy8gQ2hyb21lXG4gICAgICAgICAgcmVxdWVzdEZ1bGxzY3JlZW46ICgpID0+IGNvZGVFZGl0b3JFbGVtZW50LnJlcXVlc3RGdWxsc2NyZWVuKCksXG4gICAgICAgICAgLy8gU2FmYXJpXG4gICAgICAgICAgd2Via2l0UmVxdWVzdEZ1bGxzY3JlZW46ICgpID0+ICg8YW55PmNvZGVFZGl0b3JFbGVtZW50KS53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbigpLFxuICAgICAgICAgIC8vIElFXG4gICAgICAgICAgbXNSZXF1ZXN0RnVsbHNjcmVlbjogKCkgPT4gKDxhbnk+Y29kZUVkaXRvckVsZW1lbnQpLm1zUmVxdWVzdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgICAvLyBGaXJlZm94XG4gICAgICAgICAgbW96UmVxdWVzdEZ1bGxTY3JlZW46ICgpID0+ICg8YW55PmNvZGVFZGl0b3JFbGVtZW50KS5tb3pSZXF1ZXN0RnVsbFNjcmVlbigpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGZvciAoY29uc3QgaGFuZGxlciBvZiBPYmplY3Qua2V5cyhmdWxsU2NyZWVuTWFwKSkge1xuICAgICAgICAgIGlmIChjb2RlRWRpdG9yRWxlbWVudFtoYW5kbGVyXSkge1xuICAgICAgICAgICAgZnVsbFNjcmVlbk1hcFtoYW5kbGVyXSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9pc0Z1bGxTY3JlZW4gPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIGV4aXRGdWxsU2NyZWVuRWRpdG9yIHJlcXVlc3QgdG8gZXhpdCBmdWxsIHNjcmVlbiBvZiBDb2RlIEVkaXRvciBiYXNlZCBvbiBpdHMgYnJvd3NlciB0eXBlLlxuICAgKi9cbiAgcHVibGljIGV4aXRGdWxsU2NyZWVuRWRpdG9yKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdleGl0RnVsbFNjcmVlbkVkaXRvcicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZXhpdEZ1bGxTY3JlZW5NYXA6IG9iamVjdCA9IHtcbiAgICAgICAgICAvLyBDaHJvbWVcbiAgICAgICAgICBleGl0RnVsbHNjcmVlbjogKCkgPT4gZG9jdW1lbnQuZXhpdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgICAvLyBTYWZhcmlcbiAgICAgICAgICB3ZWJraXRFeGl0RnVsbHNjcmVlbjogKCkgPT4gKDxhbnk+ZG9jdW1lbnQpLndlYmtpdEV4aXRGdWxsc2NyZWVuKCksXG4gICAgICAgICAgLy8gRmlyZWZveFxuICAgICAgICAgIG1vekNhbmNlbEZ1bGxTY3JlZW46ICgpID0+ICg8YW55PmRvY3VtZW50KS5tb3pDYW5jZWxGdWxsU2NyZWVuKCksXG4gICAgICAgICAgLy8gSUVcbiAgICAgICAgICBtc0V4aXRGdWxsc2NyZWVuOiAoKSA9PiAoPGFueT5kb2N1bWVudCkubXNFeGl0RnVsbHNjcmVlbigpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGZvciAoY29uc3QgaGFuZGxlciBvZiBPYmplY3Qua2V5cyhleGl0RnVsbFNjcmVlbk1hcCkpIHtcbiAgICAgICAgICBpZiAoZG9jdW1lbnRbaGFuZGxlcl0pIHtcbiAgICAgICAgICAgIGV4aXRGdWxsU2NyZWVuTWFwW2hhbmRsZXJdKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2lzRnVsbFNjcmVlbiA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIGFkZEZ1bGxTY3JlZW5Nb2RlQ29tbWFuZCB1c2VkIHRvIGFkZCB0aGUgZnVsbHNjcmVlbiBvcHRpb24gdG8gdGhlIGNvbnRleHQgbWVudVxuICAgKi9cbiAgcHJpdmF0ZSBhZGRGdWxsU2NyZWVuTW9kZUNvbW1hbmQoKTogdm9pZCB7XG4gICAgdGhpcy5fZWRpdG9yLmFkZEFjdGlvbih7XG4gICAgICAvLyBBbiB1bmlxdWUgaWRlbnRpZmllciBvZiB0aGUgY29udHJpYnV0ZWQgYWN0aW9uLlxuICAgICAgaWQ6ICdmdWxsU2NyZWVuJyxcbiAgICAgIC8vIEEgbGFiZWwgb2YgdGhlIGFjdGlvbiB0aGF0IHdpbGwgYmUgcHJlc2VudGVkIHRvIHRoZSB1c2VyLlxuICAgICAgbGFiZWw6ICdGdWxsIFNjcmVlbicsXG4gICAgICAvLyBBbiBvcHRpb25hbCBhcnJheSBvZiBrZXliaW5kaW5ncyBmb3IgdGhlIGFjdGlvbi5cbiAgICAgIGNvbnRleHRNZW51R3JvdXBJZDogJ25hdmlnYXRpb24nLFxuICAgICAga2V5YmluZGluZ3M6IHRoaXMuX2tleWNvZGUsXG4gICAgICBjb250ZXh0TWVudU9yZGVyOiAxLjUsXG4gICAgICAvLyBNZXRob2QgdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGFjdGlvbiBpcyB0cmlnZ2VyZWQuXG4gICAgICAvLyBAcGFyYW0gZWRpdG9yIFRoZSBlZGl0b3IgaW5zdGFuY2UgaXMgcGFzc2VkIGluIGFzIGEgY29udmluaWVuY2VcbiAgICAgIHJ1bjogKGVkOiBhbnkpID0+IHtcbiAgICAgICAgdGhpcy5zaG93RnVsbFNjcmVlbkVkaXRvcigpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiB3cmFwRWRpdG9yQ2FsbHMgdXNlZCB0byBwcm94eSBhbGwgdGhlIGNhbGxzIHRvIHRoZSBtb25hY28gZWRpdG9yXG4gICAqIEZvciBjYWxscyBmb3IgRWxlY3Ryb24gdXNlIHRoaXMgdG8gY2FsbCB0aGUgZWRpdG9yIGluc2lkZSB0aGUgd2Vidmlld1xuICAgKi9cbiAgcHJpdmF0ZSB3cmFwRWRpdG9yQ2FsbHMob2JqOiBhbnkpOiBhbnkge1xuICAgIGNvbnN0IHRoYXQ6IGFueSA9IHRoaXM7XG4gICAgY29uc3QgaGFuZGxlcjogYW55ID0ge1xuICAgICAgZ2V0KHRhcmdldDogYW55LCBwcm9wS2V5OiBhbnksIHJlY2VpdmVyOiBhbnkpOiBhbnkge1xuICAgICAgICByZXR1cm4gYXN5bmMgKC4uLmFyZ3M6IGFueSk6IFByb21pc2U8YW55PiA9PiB7XG4gICAgICAgICAgaWYgKHRoYXQuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICAgICAgICBpZiAodGhhdC5fd2Vidmlldykge1xuICAgICAgICAgICAgICBjb25zdCBleGVjdXRlSmF2YVNjcmlwdDogKGNvZGU6IHN0cmluZykgPT4gUHJvbWlzZTxhbnk+ID0gKGNvZGU6IHN0cmluZykgPT5cbiAgICAgICAgICAgICAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICB0aGF0Ll93ZWJ2aWV3LmV4ZWN1dGVKYXZhU2NyaXB0KGNvZGUsIHJlc29sdmUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gZXhlY3V0ZUphdmFTY3JpcHQoJ2VkaXRvci4nICsgcHJvcEtleSArICcoJyArIGFyZ3MgKyAnKScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc3Qgb3JpZ01ldGhvZDogYW55ID0gdGFyZ2V0W3Byb3BLZXldO1xuICAgICAgICAgICAgICBjb25zdCByZXN1bHQ6IGFueSA9IGF3YWl0IG9yaWdNZXRob2QuYXBwbHkodGhhdC5fZWRpdG9yLCBhcmdzKTtcbiAgICAgICAgICAgICAgLy8gc2luY2UgcnVubmluZyBqYXZhc2NyaXB0IGNvZGUgbWFudWFsbHkgbmVlZCB0byBmb3JjZSBBbmd1bGFyIHRvIGRldGVjdCBjaGFuZ2VzXG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoYXQuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lXG4gICAgICAgICAgICAgICAgICBpZiAoIXRoYXQuX2NoYW5nZURldGVjdG9yUmVmWydkZXN0cm95ZWQnXSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0Ll9jaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfTtcbiAgICByZXR1cm4gbmV3IFByb3h5KG9iaiwgaGFuZGxlcik7XG4gIH1cblxuICAvKipcbiAgICogaW5pdE1vbmFjbyBtZXRob2QgY3JlYXRlcyB0aGUgbW9uYWNvIGVkaXRvciBpbnRvIHRoZSBAVmlld0NoaWxkKCdlZGl0b3JDb250YWluZXInKVxuICAgKiBhbmQgZW1pdCB0aGUgZWRpdG9ySW5pdGlhbGl6ZWQgZXZlbnQuICBUaGlzIGlzIG9ubHkgdXNlZCBpbiB0aGUgYnJvd3NlciB2ZXJzaW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBpbml0TW9uYWNvKCk6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRhaW5lckRpdjogSFRNTERpdkVsZW1lbnQgPSB0aGlzLl9lZGl0b3JDb250YWluZXIubmF0aXZlRWxlbWVudDtcbiAgICBjb250YWluZXJEaXYuaWQgPSB0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcjtcbiAgICB0aGlzLl9lZGl0b3IgPSBtb25hY28uZWRpdG9yLmNyZWF0ZShcbiAgICAgIGNvbnRhaW5lckRpdixcbiAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgIHtcbiAgICAgICAgICB2YWx1ZTogdGhpcy5fdmFsdWUsXG4gICAgICAgICAgbGFuZ3VhZ2U6IHRoaXMubGFuZ3VhZ2UsXG4gICAgICAgICAgdGhlbWU6IHRoaXMuX3RoZW1lLFxuICAgICAgICB9LFxuICAgICAgICB0aGlzLmVkaXRvck9wdGlvbnMsXG4gICAgICApLFxuICAgICk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9lZGl0b3JQcm94eSA9IHRoaXMud3JhcEVkaXRvckNhbGxzKHRoaXMuX2VkaXRvcik7XG4gICAgICB0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICB0aGlzLmVkaXRvckluaXRpYWxpemVkLmVtaXQodGhpcy5fZWRpdG9yUHJveHkpO1xuICAgIH0pO1xuICAgIHRoaXMuX2VkaXRvci5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlQ29udGVudCgoZTogYW55KSA9PiB7XG4gICAgICB0aGlzLl9mcm9tRWRpdG9yID0gdHJ1ZTtcbiAgICAgIHRoaXMud3JpdGVWYWx1ZSh0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKSk7XG4gICAgICBpZiAodGhpcy5pbml0aWFsQ29udGVudENoYW5nZSkge1xuICAgICAgICB0aGlzLmluaXRpYWxDb250ZW50Q2hhbmdlID0gZmFsc2U7XG4gICAgICAgIHRoaXMubGF5b3V0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5hZGRGdWxsU2NyZWVuTW9kZUNvbW1hbmQoKTtcbiAgfVxufVxuIl19