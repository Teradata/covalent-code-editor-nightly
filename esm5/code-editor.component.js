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
                        this.onEditorValueChange.emit(undefined);
                        this.propagateChange(this._value);
                        this.onChange.emit(undefined);
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
                    _this.onEditorValueChange.emit(undefined);
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
                        var executeJavaScript, result, origMethod, result;
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!that._componentInitialized) return [3 /*break*/, 4];
                                    if (!that._webview) return [3 /*break*/, 2];
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
                                case 4: return [2 /*return*/];
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
     * and emit the onEditorInitialized event.  This is only used in the browser version.
     */
    /**
     * initMonaco method creates the monaco editor into the \@ViewChild('editorContainer')
     * and emit the onEditorInitialized event.  This is only used in the browser version.
     * @private
     * @return {?}
     */
    TdCodeEditorComponent.prototype.initMonaco = /**
     * initMonaco method creates the monaco editor into the \@ViewChild('editorContainer')
     * and emit the onEditorInitialized event.  This is only used in the browser version.
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
            _this.onEditorInitialized.emit(_this._editorProxy);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS1lZGl0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGNvdmFsZW50L2NvZGUtZWRpdG9yLyIsInNvdXJjZXMiOlsiY29kZS1lZGl0b3IuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFlBQVksRUFHWixTQUFTLEVBQ1QsVUFBVSxFQUNWLFVBQVUsRUFDVixNQUFNLEVBQ04saUJBQWlCLEdBRWxCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxpQkFBaUIsRUFBd0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6RSxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvQyxPQUFPLEVBQUUsWUFBWSxFQUFFLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRS9FLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxVQUFVLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7SUFFakUsSUFBSTs7O0FBQVE7SUFDaEIsZUFBZTtBQUNqQixDQUFDLENBQUE7Ozs7SUFHRyxhQUFhLEdBQVcsQ0FBQztBQUs3QjtJQW9GRTs7T0FFRztJQUNILCtCQUFvQixJQUFZLEVBQVUsa0JBQXFDLEVBQVUsV0FBdUI7UUFBNUYsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFVLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBbUI7UUFBVSxnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQTFFeEcsYUFBUSxHQUFxQixJQUFJLE9BQU8sRUFBVyxDQUFDO1FBQ3BELGtCQUFhLEdBQW9CLElBQUksT0FBTyxFQUFVLENBQUM7UUFDdkQsbUJBQWMsR0FBb0IsSUFBSSxPQUFPLEVBQVUsQ0FBQztRQUV4RCxpQkFBWSxHQUFXLCtDQUErQyxDQUFD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NEJBQTRCOzBDQU1uQyxNQUFNLFNBQUMsdUJBQXVCO3NDQU05QixNQUFNLFNBQUMsbUJBQW1COzJCQU0xQixNQUFNLFNBQUMsUUFBUTt3QkEwQmYsS0FBSyxTQUFDLE9BQU87MkJBZ0diLEtBQUssU0FBQyxVQUFVOzhCQXVGaEIsS0FBSyxTQUFDLGFBQWE7d0JBc0NuQixLQUFLLFNBQUMsT0FBTzt1Q0FxQmIsS0FBSyxTQUFDLHNCQUFzQjtnQ0FhNUIsS0FBSyxTQUFDLGVBQWU7O0lBNGV4Qiw0QkFBQztDQUFBLEFBcDFCRCxJQW8xQkM7U0F4MEJZLHFCQUFxQjs7Ozs7O0lBQ2hDLHlDQUE0RDs7Ozs7SUFDNUQsOENBQStEOzs7OztJQUMvRCwrQ0FBZ0U7Ozs7O0lBRWhFLDZDQUErRTs7Ozs7SUFDL0UseUNBQThCOzs7OztJQUM5QiwrQ0FBd0M7Ozs7O0lBQ3hDLHlDQUFzQjs7Ozs7SUFDdEIsdUNBQTRCOzs7OztJQUM1Qix1Q0FBOEI7Ozs7O0lBQzlCLDBDQUF5Qzs7Ozs7SUFDekMseUNBQWtEOzs7OztJQUNsRCxzREFBaUY7Ozs7O0lBQ2pGLDZEQUFrRDs7Ozs7SUFDbEQsd0NBQXFCOzs7OztJQUNyQiw2Q0FBMEI7Ozs7O0lBQzFCLHNEQUErQzs7Ozs7SUFDL0MsNENBQXFDOzs7OztJQUNyQywrQ0FBaUM7Ozs7O0lBQ2pDLDhDQUF1Qzs7Ozs7SUFDdkMseUNBQXNCOzs7OztJQUN0QixpREFBOEI7Ozs7O0lBQzlCLHFEQUE2Qzs7SUFFN0MsaURBQTZFOzs7Ozs7SUFrQjdFLG9EQUFnRzs7Ozs7O0lBTWhHLDZEQUFrSDs7Ozs7O0lBTWxILHdEQUF3Rzs7Ozs7O0lBTXhHLG9EQUFnRzs7Ozs7O0lBTWhHLHlDQUEwRTs7SUFFMUUsZ0RBQWlDOztJQUNqQywwQ0FBdUI7Ozs7O0lBS1gscUNBQW9COzs7OztJQUFFLG1EQUE2Qzs7Ozs7SUFBRSw0Q0FBK0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21wb25lbnQsXG4gIElucHV0LFxuICBPdXRwdXQsXG4gIEV2ZW50RW1pdHRlcixcbiAgT25Jbml0LFxuICBBZnRlclZpZXdJbml0LFxuICBWaWV3Q2hpbGQsXG4gIEVsZW1lbnRSZWYsXG4gIGZvcndhcmRSZWYsXG4gIE5nWm9uZSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIE9uRGVzdHJveSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOR19WQUxVRV9BQ0NFU1NPUiwgQ29udHJvbFZhbHVlQWNjZXNzb3IgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBmcm9tRXZlbnQsIG1lcmdlLCB0aW1lciB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZGVib3VuY2VUaW1lLCBkaXN0aW5jdFVudGlsQ2hhbmdlZCwgdGFrZVVudGlsIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQgeyB3YWl0VW50aWxNb25hY29SZWFkeSwgbG9hZE1vbmFjbyB9IGZyb20gJy4vY29kZS1lZGl0b3IudXRpbHMnO1xuXG5jb25zdCBub29wOiBhbnkgPSAoKSA9PiB7XG4gIC8vIGVtcHR5IG1ldGhvZFxufTtcblxuLy8gY291bnRlciBmb3IgaWRzIHRvIGFsbG93IGZvciBtdWx0aXBsZSBlZGl0b3JzIG9uIG9uZSBwYWdlXG5sZXQgdW5pcXVlQ291bnRlcjogbnVtYmVyID0gMDtcbi8vIGRlY2xhcmUgYWxsIHRoZSBidWlsdCBpbiBlbGVjdHJvbiBvYmplY3RzXG5kZWNsYXJlIGNvbnN0IGVsZWN0cm9uOiBhbnk7XG5kZWNsYXJlIGNvbnN0IG1vbmFjbzogYW55O1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICd0ZC1jb2RlLWVkaXRvcicsXG4gIHRlbXBsYXRlVXJsOiAnLi9jb2RlLWVkaXRvci5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL2NvZGUtZWRpdG9yLmNvbXBvbmVudC5zY3NzJ10sXG4gIHByb3ZpZGVyczogW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxuICAgICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gVGRDb2RlRWRpdG9yQ29tcG9uZW50KSxcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIFRkQ29kZUVkaXRvckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCwgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX2Rlc3Ryb3k6IFN1YmplY3Q8Ym9vbGVhbj4gPSBuZXcgU3ViamVjdDxib29sZWFuPigpO1xuICBwcml2YXRlIF93aWR0aFN1YmplY3Q6IFN1YmplY3Q8bnVtYmVyPiA9IG5ldyBTdWJqZWN0PG51bWJlcj4oKTtcbiAgcHJpdmF0ZSBfaGVpZ2h0U3ViamVjdDogU3ViamVjdDxudW1iZXI+ID0gbmV3IFN1YmplY3Q8bnVtYmVyPigpO1xuXG4gIHByaXZhdGUgX2VkaXRvclN0eWxlOiBzdHJpbmcgPSAnd2lkdGg6MTAwJTtoZWlnaHQ6MTAwJTtib3JkZXI6MXB4IHNvbGlkIGdyZXk7JztcbiAgcHJpdmF0ZSBfYXBwUGF0aDogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgX2lzRWxlY3Ryb25BcHA6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfd2VidmlldzogYW55O1xuICBwcml2YXRlIF92YWx1ZTogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgX3RoZW1lOiBzdHJpbmcgPSAndnMnO1xuICBwcml2YXRlIF9sYW5ndWFnZTogc3RyaW5nID0gJ2phdmFzY3JpcHQnO1xuICBwcml2YXRlIF9zdWJqZWN0OiBTdWJqZWN0PHN0cmluZz4gPSBuZXcgU3ViamVjdCgpO1xuICBwcml2YXRlIF9lZGl0b3JJbm5lckNvbnRhaW5lcjogc3RyaW5nID0gJ2VkaXRvcklubmVyQ29udGFpbmVyJyArIHVuaXF1ZUNvdW50ZXIrKztcbiAgcHJpdmF0ZSBfZWRpdG9yTm9kZU1vZHVsZURpck92ZXJyaWRlOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSBfZWRpdG9yOiBhbnk7XG4gIHByaXZhdGUgX2VkaXRvclByb3h5OiBhbnk7XG4gIHByaXZhdGUgX2NvbXBvbmVudEluaXRpYWxpemVkOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX2Zyb21FZGl0b3I6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfZWRpdG9yT3B0aW9uczogYW55ID0ge307XG4gIHByaXZhdGUgX2lzRnVsbFNjcmVlbjogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9rZXljb2RlOiBhbnk7XG4gIHByaXZhdGUgX3NldFZhbHVlVGltZW91dDogYW55O1xuICBwcml2YXRlIGluaXRpYWxDb250ZW50Q2hhbmdlOiBib29sZWFuID0gdHJ1ZTtcblxuICBAVmlld0NoaWxkKCdlZGl0b3JDb250YWluZXInLCB7IHN0YXRpYzogdHJ1ZSB9KSBfZWRpdG9yQ29udGFpbmVyOiBFbGVtZW50UmVmO1xuXG4gIC8qKlxuICAgKiBhdXRvbWF0aWNMYXlvdXQ/OiBib29sZWFuXG4gICAqIEBkZXByZWNhdGVkIGluIGZhdm9yIG9mIG91ciBvd24gcmVzaXplIGltcGxlbWVudGF0aW9uLlxuICAgKi9cbiAgQElucHV0KCdhdXRvbWF0aWNMYXlvdXQnKVxuICBzZXQgYXV0b21hdGljTGF5b3V0KGF1dG9tYXRpY0xheW91dDogYm9vbGVhbikge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZVxuICAgIGNvbnNvbGUud2FybihcbiAgICAgICdbYXV0b21hdGljTGF5b3V0XSBoYXMgYmVlbiBkZXByZWNhdGVkIGluIGZhdm9yIG9mIG91ciBvd24gcmVzaXplIGltcGxlbWVudGF0aW9uIGFuZCB3aWxsIGJlIHJlbW92ZWQgb24gMy4wLjAnLFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogZWRpdG9ySW5pdGlhbGl6ZWQ6IGZ1bmN0aW9uKCRldmVudClcbiAgICogRXZlbnQgZW1pdHRlZCB3aGVuIGVkaXRvciBpcyBmaXJzdCBpbml0aWFsaXplZFxuICAgKi9cbiAgQE91dHB1dCgnZWRpdG9ySW5pdGlhbGl6ZWQnKSBvbkVkaXRvckluaXRpYWxpemVkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIGVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkOiBmdW5jdGlvbigkZXZlbnQpXG4gICAqIEV2ZW50IGVtaXR0ZWQgd2hlbiBlZGl0b3IncyBjb25maWd1cmF0aW9uIGNoYW5nZXNcbiAgICovXG4gIEBPdXRwdXQoJ2VkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkJykgb25FZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBlZGl0b3JMYW5ndWFnZUNoYW5nZWQ6IGZ1bmN0aW9uKCRldmVudClcbiAgICogRXZlbnQgZW1pdHRlZCB3aGVuIGVkaXRvcidzIExhbmd1YWdlIGNoYW5nZXNcbiAgICovXG4gIEBPdXRwdXQoJ2VkaXRvckxhbmd1YWdlQ2hhbmdlZCcpIG9uRWRpdG9yTGFuZ3VhZ2VDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIGVkaXRvclZhbHVlQ2hhbmdlOiBmdW5jdGlvbigkZXZlbnQpXG4gICAqIEV2ZW50IGVtaXR0ZWQgYW55IHRpbWUgc29tZXRoaW5nIGNoYW5nZXMgdGhlIGVkaXRvciB2YWx1ZVxuICAgKi9cbiAgQE91dHB1dCgnZWRpdG9yVmFsdWVDaGFuZ2UnKSBvbkVkaXRvclZhbHVlQ2hhbmdlOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIFRoZSBjaGFuZ2UgZXZlbnQgbm90aWZpZXMgeW91IGFib3V0IGEgY2hhbmdlIGhhcHBlbmluZyBpbiBhbiBpbnB1dCBmaWVsZC5cbiAgICogU2luY2UgdGhlIGNvbXBvbmVudCBpcyBub3QgYSBuYXRpdmUgQW5ndWxhciBjb21wb25lbnQgaGF2ZSB0byBzcGVjaWZpeSB0aGUgZXZlbnQgZW1pdHRlciBvdXJzZWxmXG4gICAqL1xuICBAT3V0cHV0KCdjaGFuZ2UnKSBvbkNoYW5nZTogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICAvKiB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmUgKi9cbiAgcHJvcGFnYXRlQ2hhbmdlID0gKF86IGFueSkgPT4ge307XG4gIG9uVG91Y2hlZCA9ICgpID0+IG5vb3A7XG5cbiAgLyoqXG4gICAqIFNldCBpZiB1c2luZyBFbGVjdHJvbiBtb2RlIHdoZW4gb2JqZWN0IGlzIGNyZWF0ZWRcbiAgICovXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgem9uZTogTmdab25lLCBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICAvLyBzaW5jZSBhY2Nlc3NpbmcgdGhlIHdpbmRvdyBvYmplY3QgbmVlZCB0aGlzIGNoZWNrIHNvIHNlcnZlcnNpZGUgcmVuZGVyaW5nIGRvZXNuJ3QgZmFpbFxuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICdvYmplY3QnICYmICEhZG9jdW1lbnQpIHtcbiAgICAgIC8qIHRzbGludDpkaXNhYmxlLW5leHQtbGluZSAqL1xuICAgICAgdGhpcy5faXNFbGVjdHJvbkFwcCA9ICg8YW55PndpbmRvdylbJ3Byb2Nlc3MnXSA/IHRydWUgOiBmYWxzZTtcbiAgICAgIGlmICh0aGlzLl9pc0VsZWN0cm9uQXBwKSB7XG4gICAgICAgIHRoaXMuX2FwcFBhdGggPSBlbGVjdHJvbi5yZW1vdGUuYXBwXG4gICAgICAgICAgLmdldEFwcFBhdGgoKVxuICAgICAgICAgIC5zcGxpdCgnXFxcXCcpXG4gICAgICAgICAgLmpvaW4oJy8nKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogdmFsdWU/OiBzdHJpbmdcbiAgICogVmFsdWUgaW4gdGhlIEVkaXRvciBhZnRlciBhc3luYyBnZXRFZGl0b3JDb250ZW50IHdhcyBjYWxsZWRcbiAgICovXG4gIEBJbnB1dCgndmFsdWUnKVxuICBzZXQgdmFsdWUodmFsdWU6IHN0cmluZykge1xuICAgIC8vIENsZWFyIGFueSB0aW1lb3V0IHRoYXQgbWlnaHQgb3ZlcndyaXRlIHRoaXMgdmFsdWUgc2V0IGluIHRoZSBmdXR1cmVcbiAgICBpZiAodGhpcy5fc2V0VmFsdWVUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fc2V0VmFsdWVUaW1lb3V0KTtcbiAgICB9XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIGlmICh0aGlzLl93ZWJ2aWV3LnNlbmQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIGRvbid0IHdhbnQgdG8ga2VlcCBzZW5kaW5nIGNvbnRlbnQgaWYgZXZlbnQgY2FtZSBmcm9tIElQQywgaW5maW5pdGUgbG9vcFxuICAgICAgICAgIGlmICghdGhpcy5fZnJvbUVkaXRvcikge1xuICAgICAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdzZXRFZGl0b3JDb250ZW50JywgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLm9uRWRpdG9yVmFsdWVDaGFuZ2UuZW1pdCh1bmRlZmluZWQpO1xuICAgICAgICAgIHRoaXMucHJvcGFnYXRlQ2hhbmdlKHRoaXMuX3ZhbHVlKTtcbiAgICAgICAgICB0aGlzLm9uQ2hhbmdlLmVtaXQodW5kZWZpbmVkKTtcbiAgICAgICAgICB0aGlzLl9mcm9tRWRpdG9yID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gRWRpdG9yIGlzIG5vdCBsb2FkZWQgeWV0LCB0cnkgYWdhaW4gaW4gaGFsZiBhIHNlY29uZFxuICAgICAgICAgIHRoaXMuX3NldFZhbHVlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLl9lZGl0b3IgJiYgdGhpcy5fZWRpdG9yLnNldFZhbHVlKSB7XG4gICAgICAgICAgLy8gZG9uJ3Qgd2FudCB0byBrZWVwIHNlbmRpbmcgY29udGVudCBpZiBldmVudCBjYW1lIGZyb20gdGhlIGVkaXRvciwgaW5maW5pdGUgbG9vcFxuICAgICAgICAgIGlmICghdGhpcy5fZnJvbUVkaXRvcikge1xuICAgICAgICAgICAgdGhpcy5fZWRpdG9yLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5vbkVkaXRvclZhbHVlQ2hhbmdlLmVtaXQodW5kZWZpbmVkKTtcbiAgICAgICAgICB0aGlzLnByb3BhZ2F0ZUNoYW5nZSh0aGlzLl92YWx1ZSk7XG4gICAgICAgICAgdGhpcy5vbkNoYW5nZS5lbWl0KHVuZGVmaW5lZCk7XG4gICAgICAgICAgdGhpcy5fZnJvbUVkaXRvciA9IGZhbHNlO1xuICAgICAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4gKHRoaXMuX3ZhbHVlID0gdmFsdWUpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBFZGl0b3IgaXMgbm90IGxvYWRlZCB5ZXQsIHRyeSBhZ2FpbiBpbiBoYWxmIGEgc2Vjb25kXG4gICAgICAgICAgdGhpcy5fc2V0VmFsdWVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zZXRWYWx1ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgfSwgNTAwKTtcbiAgICB9XG4gIH1cblxuICBnZXQgdmFsdWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBDb250cm9sVmFsdWVBY2Nlc3Nvci5cbiAgICovXG4gIHdyaXRlVmFsdWUodmFsdWU6IGFueSk6IHZvaWQge1xuICAgIC8vIGRvIG5vdCB3cml0ZSBpZiBudWxsIG9yIHVuZGVmaW5lZFxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZVxuICAgIGlmICh2YWx1ZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogYW55KTogdm9pZCB7XG4gICAgdGhpcy5wcm9wYWdhdGVDaGFuZ2UgPSBmbjtcbiAgfVxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogYW55KTogdm9pZCB7XG4gICAgdGhpcy5vblRvdWNoZWQgPSBmbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXRFZGl0b3JDb250ZW50PzogZnVuY3Rpb25cbiAgICogUmV0dXJucyB0aGUgY29udGVudCB3aXRoaW4gdGhlIGVkaXRvclxuICAgKi9cbiAgZ2V0VmFsdWUoKTogT2JzZXJ2YWJsZTxzdHJpbmc+IHtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnZ2V0RWRpdG9yQ29udGVudCcpO1xuICAgICAgICByZXR1cm4gdGhpcy5fc3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICAgIHRoaXMuX3ZhbHVlID0gdGhpcy5fZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX3N1YmplY3QubmV4dCh0aGlzLl92YWx1ZSk7XG4gICAgICAgICAgdGhpcy5fc3ViamVjdC5jb21wbGV0ZSgpO1xuICAgICAgICAgIHRoaXMuX3N1YmplY3QgPSBuZXcgU3ViamVjdCgpO1xuICAgICAgICAgIHRoaXMub25FZGl0b3JWYWx1ZUNoYW5nZS5lbWl0KHVuZGVmaW5lZCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcy5fc3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogbGFuZ3VhZ2U/OiBzdHJpbmdcbiAgICogbGFuZ3VhZ2UgdXNlZCBpbiBlZGl0b3JcbiAgICovXG4gIEBJbnB1dCgnbGFuZ3VhZ2UnKVxuICBzZXQgbGFuZ3VhZ2UobGFuZ3VhZ2U6IHN0cmluZykge1xuICAgIHRoaXMuX2xhbmd1YWdlID0gbGFuZ3VhZ2U7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3NldExhbmd1YWdlJywgbGFuZ3VhZ2UpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgbGV0IGN1cnJlbnRWYWx1ZTogc3RyaW5nID0gdGhpcy5fZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgIHRoaXMuX2VkaXRvci5kaXNwb3NlKCk7XG4gICAgICAgIGxldCBteURpdjogSFRNTERpdkVsZW1lbnQgPSB0aGlzLl9lZGl0b3JDb250YWluZXIubmF0aXZlRWxlbWVudDtcbiAgICAgICAgdGhpcy5fZWRpdG9yID0gbW9uYWNvLmVkaXRvci5jcmVhdGUoXG4gICAgICAgICAgbXlEaXYsXG4gICAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdmFsdWU6IGN1cnJlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgbGFuZ3VhZ2U6IGxhbmd1YWdlLFxuICAgICAgICAgICAgICB0aGVtZTogdGhpcy5fdGhlbWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGhpcy5lZGl0b3JPcHRpb25zLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuX2VkaXRvci5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlQ29udGVudCgoZTogYW55KSA9PiB7XG4gICAgICAgICAgdGhpcy5fZnJvbUVkaXRvciA9IHRydWU7XG4gICAgICAgICAgdGhpcy53cml0ZVZhbHVlKHRoaXMuX2VkaXRvci5nZXRWYWx1ZSgpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMub25FZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZC5lbWl0KHVuZGVmaW5lZCk7XG4gICAgICAgIHRoaXMub25FZGl0b3JMYW5ndWFnZUNoYW5nZWQuZW1pdCh1bmRlZmluZWQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXQgbGFuZ3VhZ2UoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fbGFuZ3VhZ2U7XG4gIH1cblxuICAvKipcbiAgICogcmVnaXN0ZXJMYW5ndWFnZT86IGZ1bmN0aW9uXG4gICAqIFJlZ2lzdGVycyBhIGN1c3RvbSBMYW5ndWFnZSB3aXRoaW4gdGhlIGVkaXRvclxuICAgKi9cbiAgcmVnaXN0ZXJMYW5ndWFnZShsYW5ndWFnZTogYW55KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3JlZ2lzdGVyTGFuZ3VhZ2UnLCBsYW5ndWFnZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgICBsZXQgY3VycmVudFZhbHVlOiBzdHJpbmcgPSB0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgdGhpcy5fZWRpdG9yLmRpc3Bvc2UoKTtcblxuICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgbGFuZ3VhZ2UuY29tcGxldGlvbkl0ZW1Qcm92aWRlci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGxldCBwcm92aWRlcjogYW55ID0gbGFuZ3VhZ2UuY29tcGxldGlvbkl0ZW1Qcm92aWRlcltpXTtcbiAgICAgICAgICAvKiB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmUgKi9cbiAgICAgICAgICBwcm92aWRlci5raW5kID0gZXZhbChwcm92aWRlci5raW5kKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgbGFuZ3VhZ2UubW9uYXJjaFRva2Vuc1Byb3ZpZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgbGV0IG1vbmFyY2hUb2tlbnM6IGFueSA9IGxhbmd1YWdlLm1vbmFyY2hUb2tlbnNQcm92aWRlcltpXTtcbiAgICAgICAgICAvKiB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmUgKi9cbiAgICAgICAgICBtb25hcmNoVG9rZW5zWzBdID0gZXZhbChtb25hcmNoVG9rZW5zWzBdKTtcbiAgICAgICAgfVxuICAgICAgICBtb25hY28ubGFuZ3VhZ2VzLnJlZ2lzdGVyKHsgaWQ6IGxhbmd1YWdlLmlkIH0pO1xuXG4gICAgICAgIG1vbmFjby5sYW5ndWFnZXMuc2V0TW9uYXJjaFRva2Vuc1Byb3ZpZGVyKGxhbmd1YWdlLmlkLCB7XG4gICAgICAgICAgdG9rZW5pemVyOiB7XG4gICAgICAgICAgICByb290OiBsYW5ndWFnZS5tb25hcmNoVG9rZW5zUHJvdmlkZXIsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gRGVmaW5lIGEgbmV3IHRoZW1lIHRoYXQgY29uc3RhaW5zIG9ubHkgcnVsZXMgdGhhdCBtYXRjaCB0aGlzIGxhbmd1YWdlXG4gICAgICAgIG1vbmFjby5lZGl0b3IuZGVmaW5lVGhlbWUobGFuZ3VhZ2UuY3VzdG9tVGhlbWUuaWQsIGxhbmd1YWdlLmN1c3RvbVRoZW1lLnRoZW1lKTtcbiAgICAgICAgdGhpcy5fdGhlbWUgPSBsYW5ndWFnZS5jdXN0b21UaGVtZS5pZDtcblxuICAgICAgICBtb25hY28ubGFuZ3VhZ2VzLnJlZ2lzdGVyQ29tcGxldGlvbkl0ZW1Qcm92aWRlcihsYW5ndWFnZS5pZCwge1xuICAgICAgICAgIHByb3ZpZGVDb21wbGV0aW9uSXRlbXM6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBsYW5ndWFnZS5jb21wbGV0aW9uSXRlbVByb3ZpZGVyO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBjc3M6IEhUTUxTdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICBjc3MudHlwZSA9ICd0ZXh0L2Nzcyc7XG4gICAgICAgIGNzcy5pbm5lckhUTUwgPSBsYW5ndWFnZS5tb25hcmNoVG9rZW5zUHJvdmlkZXJDU1M7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY3NzKTtcbiAgICAgICAgdGhpcy5vbkVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkLmVtaXQodW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogc3R5bGU/OiBzdHJpbmdcbiAgICogY3NzIHN0eWxlIG9mIHRoZSBlZGl0b3Igb24gdGhlIHBhZ2VcbiAgICovXG4gIEBJbnB1dCgnZWRpdG9yU3R5bGUnKVxuICBzZXQgZWRpdG9yU3R5bGUoZWRpdG9yU3R5bGU6IHN0cmluZykge1xuICAgIHRoaXMuX2VkaXRvclN0eWxlID0gZWRpdG9yU3R5bGU7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3NldEVkaXRvclN0eWxlJywgeyBsYW5ndWFnZTogdGhpcy5fbGFuZ3VhZ2UsIHRoZW1lOiB0aGlzLl90aGVtZSwgc3R5bGU6IGVkaXRvclN0eWxlIH0pO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgICAgbGV0IGNvbnRhaW5lckRpdjogSFRNTERpdkVsZW1lbnQgPSB0aGlzLl9lZGl0b3JDb250YWluZXIubmF0aXZlRWxlbWVudDtcbiAgICAgICAgY29udGFpbmVyRGl2LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBlZGl0b3JTdHlsZSk7XG4gICAgICAgIGxldCBjdXJyZW50VmFsdWU6IHN0cmluZyA9IHRoaXMuX2VkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICB0aGlzLl9lZGl0b3IuZGlzcG9zZSgpO1xuICAgICAgICBsZXQgbXlEaXY6IEhUTUxEaXZFbGVtZW50ID0gdGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMuX2VkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKFxuICAgICAgICAgIG15RGl2LFxuICAgICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgIGxhbmd1YWdlOiB0aGlzLl9sYW5ndWFnZSxcbiAgICAgICAgICAgICAgdGhlbWU6IHRoaXMuX3RoZW1lLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yT3B0aW9ucyxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLl9lZGl0b3IuZ2V0TW9kZWwoKS5vbkRpZENoYW5nZUNvbnRlbnQoKGU6IGFueSkgPT4ge1xuICAgICAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSB0cnVlO1xuICAgICAgICAgIHRoaXMud3JpdGVWYWx1ZSh0aGlzLl9lZGl0b3IuZ2V0VmFsdWUoKSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXQgZWRpdG9yU3R5bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdG9yU3R5bGU7XG4gIH1cblxuICAvKipcbiAgICogdGhlbWU/OiBzdHJpbmdcbiAgICogVGhlbWUgdG8gYmUgYXBwbGllZCB0byBlZGl0b3JcbiAgICovXG4gIEBJbnB1dCgndGhlbWUnKVxuICBzZXQgdGhlbWUodGhlbWU6IHN0cmluZykge1xuICAgIHRoaXMuX3RoZW1lID0gdGhlbWU7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3NldEVkaXRvck9wdGlvbnMnLCB7IHRoZW1lOiB0aGVtZSB9KTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICAgIHRoaXMuX2VkaXRvci51cGRhdGVPcHRpb25zKHsgdGhlbWU6IHRoZW1lIH0pO1xuICAgICAgICB0aGlzLm9uRWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCh1bmRlZmluZWQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXQgdGhlbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fdGhlbWU7XG4gIH1cblxuICAvKipcbiAgICogZnVsbFNjcmVlbktleUJpbmRpbmc/OiBudW1iZXJcbiAgICogU2VlIGhlcmUgZm9yIGtleSBiaW5kaW5ncyBodHRwczovL21pY3Jvc29mdC5naXRodWIuaW8vbW9uYWNvLWVkaXRvci9hcGkvZW51bXMvbW9uYWNvLmtleWNvZGUuaHRtbFxuICAgKiBTZXRzIHRoZSBLZXlDb2RlIGZvciBzaG9ydGN1dHRpbmcgdG8gRnVsbHNjcmVlbiBtb2RlXG4gICAqL1xuICBASW5wdXQoJ2Z1bGxTY3JlZW5LZXlCaW5kaW5nJylcbiAgc2V0IGZ1bGxTY3JlZW5LZXlCaW5kaW5nKGtleWNvZGU6IG51bWJlcltdKSB7XG4gICAgdGhpcy5fa2V5Y29kZSA9IGtleWNvZGU7XG4gIH1cbiAgZ2V0IGZ1bGxTY3JlZW5LZXlCaW5kaW5nKCk6IG51bWJlcltdIHtcbiAgICByZXR1cm4gdGhpcy5fa2V5Y29kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBlZGl0b3JPcHRpb25zPzogT2JqZWN0XG4gICAqIE9wdGlvbnMgdXNlZCBvbiBlZGl0b3IgaW5zdGFudGlhdGlvbi4gQXZhaWxhYmxlIG9wdGlvbnMgbGlzdGVkIGhlcmU6XG4gICAqIGh0dHBzOi8vbWljcm9zb2Z0LmdpdGh1Yi5pby9tb25hY28tZWRpdG9yL2FwaS9pbnRlcmZhY2VzL21vbmFjby5lZGl0b3IuaWVkaXRvcm9wdGlvbnMuaHRtbFxuICAgKi9cbiAgQElucHV0KCdlZGl0b3JPcHRpb25zJylcbiAgc2V0IGVkaXRvck9wdGlvbnMoZWRpdG9yT3B0aW9uczogYW55KSB7XG4gICAgdGhpcy5fZWRpdG9yT3B0aW9ucyA9IGVkaXRvck9wdGlvbnM7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ3NldEVkaXRvck9wdGlvbnMnLCBlZGl0b3JPcHRpb25zKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICAgIHRoaXMuX2VkaXRvci51cGRhdGVPcHRpb25zKGVkaXRvck9wdGlvbnMpO1xuICAgICAgICB0aGlzLm9uRWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCh1bmRlZmluZWQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXQgZWRpdG9yT3B0aW9ucygpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl9lZGl0b3JPcHRpb25zO1xuICB9XG5cbiAgLyoqXG4gICAqIGxheW91dCBtZXRob2QgdGhhdCBjYWxscyBsYXlvdXQgbWV0aG9kIG9mIGVkaXRvciBhbmQgaW5zdHJ1Y3RzIHRoZSBlZGl0b3IgdG8gcmVtZWFzdXJlIGl0cyBjb250YWluZXJcbiAgICovXG4gIGxheW91dCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICAgIHRoaXMuX3dlYnZpZXcuc2VuZCgnbGF5b3V0Jyk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgICB0aGlzLl9lZGl0b3IubGF5b3V0KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaWYgaW4gRWxlY3Ryb24gbW9kZSBvciBub3RcbiAgICovXG4gIGdldCBpc0VsZWN0cm9uQXBwKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc0VsZWN0cm9uQXBwO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaWYgaW4gRnVsbCBTY3JlZW4gTW9kZSBvciBub3RcbiAgICovXG4gIGdldCBpc0Z1bGxTY3JlZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzRnVsbFNjcmVlbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBzZXRFZGl0b3JOb2RlTW9kdWxlRGlyT3ZlcnJpZGUgZnVuY3Rpb24gdGhhdCBvdmVycmlkZXMgd2hlcmUgdG8gbG9va1xuICAgKiBmb3IgdGhlIGVkaXRvciBub2RlX21vZHVsZS4gVXNlZCBpbiB0ZXN0cyBmb3IgRWxlY3Ryb24gb3IgYW55d2hlcmUgdGhhdCB0aGVcbiAgICogbm9kZV9tb2R1bGVzIGFyZSBub3QgaW4gdGhlIGV4cGVjdGVkIGxvY2F0aW9uLlxuICAgKi9cbiAgc2V0RWRpdG9yTm9kZU1vZHVsZURpck92ZXJyaWRlKGRpck92ZXJyaWRlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9lZGl0b3JOb2RlTW9kdWxlRGlyT3ZlcnJpZGUgPSBkaXJPdmVycmlkZTtcbiAgICB0aGlzLl9hcHBQYXRoID0gZGlyT3ZlcnJpZGU7XG4gIH1cblxuICAvKipcbiAgICogbmdPbkluaXQgb25seSB1c2VkIGZvciBFbGVjdHJvbiB2ZXJzaW9uIG9mIGVkaXRvclxuICAgKiBUaGlzIGlzIHdoZXJlIHRoZSB3ZWJ2aWV3IGlzIGNyZWF0ZWQgdG8gc2FuZGJveCBhd2F5IHRoZSBlZGl0b3JcbiAgICovXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIGxldCBlZGl0b3JIVE1MOiBzdHJpbmcgPSAnJztcbiAgICBpZiAodGhpcy5faXNFbGVjdHJvbkFwcCkge1xuICAgICAgZWRpdG9ySFRNTCA9IGA8IURPQ1RZUEUgaHRtbD5cbiAgICAgICAgICAgIDxodG1sIHN0eWxlPVwiaGVpZ2h0OjEwMCVcIj5cbiAgICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgICAgIDxtZXRhIGh0dHAtZXF1aXY9XCJYLVVBLUNvbXBhdGlibGVcIiBjb250ZW50PVwiSUU9ZWRnZVwiIC8+XG4gICAgICAgICAgICAgICAgPG1ldGEgaHR0cC1lcXVpdj1cIkNvbnRlbnQtVHlwZVwiIGNvbnRlbnQ9XCJ0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOFwiID5cbiAgICAgICAgICAgICAgICA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgZGF0YS1uYW1lPVwidnMvZWRpdG9yL2VkaXRvci5tYWluXCJcbiAgICAgICAgICAgICAgICAgICAgaHJlZj1cImZpbGU6Ly8ke3RoaXMuX2VkaXRvck5vZGVNb2R1bGVEaXJPdmVycmlkZX0vYXNzZXRzL21vbmFjby92cy9lZGl0b3IvZWRpdG9yLm1haW4uY3NzXCI+XG4gICAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgICA8Ym9keSBzdHlsZT1cImhlaWdodDoxMDAlO3dpZHRoOiAxMDAlO21hcmdpbjogMDtwYWRkaW5nOiAwO292ZXJmbG93OiBoaWRkZW47XCI+XG4gICAgICAgICAgICA8ZGl2IGlkPVwiJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn1cIiBzdHlsZT1cIndpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7JHt0aGlzLl9lZGl0b3JTdHlsZX1cIj48L2Rpdj5cbiAgICAgICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBpcGNSZW5kZXJlciBvZiBlbGVjdHJvbiBmb3IgY29tbXVuaWNhdGlvblxuICAgICAgICAgICAgICAgIGNvbnN0IHtpcGNSZW5kZXJlcn0gPSByZXF1aXJlKCdlbGVjdHJvbicpO1xuICAgICAgICAgICAgPC9zY3JpcHQ+XG4gICAgICAgICAgICA8c2NyaXB0IHNyYz1cImZpbGU6Ly8ke3RoaXMuX2VkaXRvck5vZGVNb2R1bGVEaXJPdmVycmlkZX0vYXNzZXRzL21vbmFjby92cy9sb2FkZXIuanNcIj48L3NjcmlwdD5cbiAgICAgICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICAgICAgICAgdmFyIGVkaXRvcjtcbiAgICAgICAgICAgICAgICB2YXIgdGhlbWUgPSAnJHt0aGlzLl90aGVtZX0nO1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9ICcke3RoaXMuX3ZhbHVlfSc7XG5cbiAgICAgICAgICAgICAgICByZXF1aXJlLmNvbmZpZyh7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VVcmw6ICcke3RoaXMuX2FwcFBhdGh9L2Fzc2V0cy9tb25hY28nXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2VsZi5tb2R1bGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgc2VsZi5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgcmVxdWlyZShbJ3ZzL2VkaXRvci9lZGl0b3IubWFpbiddLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yID0gbW9uYWNvLmVkaXRvci5jcmVhdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJcbiAgICAgICAgICAgICAgICAgICAgfScpLCBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhbmd1YWdlOiAnJHt0aGlzLmxhbmd1YWdlfScsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJyR7dGhpcy5fdGhlbWV9JyxcbiAgICAgICAgICAgICAgICAgICAgfSwgJHtKU09OLnN0cmluZ2lmeSh0aGlzLmVkaXRvck9wdGlvbnMpfSkpO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IuZ2V0TW9kZWwoKS5vbkRpZENoYW5nZUNvbnRlbnQoIChlKT0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJvbkVkaXRvckNvbnRlbnRDaGFuZ2VcIiwgZWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmFkZEFjdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gQW4gdW5pcXVlIGlkZW50aWZpZXIgb2YgdGhlIGNvbnRyaWJ1dGVkIGFjdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgICBpZDogJ2Z1bGxTY3JlZW4nLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIEEgbGFiZWwgb2YgdGhlIGFjdGlvbiB0aGF0IHdpbGwgYmUgcHJlc2VudGVkIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRnVsbCBTY3JlZW4nLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIEFuIG9wdGlvbmFsIGFycmF5IG9mIGtleWJpbmRpbmdzIGZvciB0aGUgYWN0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHRNZW51R3JvdXBJZDogJ25hdmlnYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICAgIGtleWJpbmRpbmdzOiBbJHt0aGlzLl9rZXljb2RlfV0sXG4gICAgICAgICAgICAgICAgICAgICAgY29udGV4dE1lbnVPcmRlcjogMS41LFxuICAgICAgICAgICAgICAgICAgICAgIC8vIE1ldGhvZCB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgd2hlbiB0aGUgYWN0aW9uIGlzIHRyaWdnZXJlZC5cbiAgICAgICAgICAgICAgICAgICAgICAvLyBAcGFyYW0gZWRpdG9yIFRoZSBlZGl0b3IgaW5zdGFuY2UgaXMgcGFzc2VkIGluIGFzIGEgY29udmluaWVuY2VcbiAgICAgICAgICAgICAgICAgICAgICBydW46IGZ1bmN0aW9uKGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWRpdG9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7dGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJ9Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0b3JEaXYud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IuYWRkQWN0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBBbiB1bmlxdWUgaWRlbnRpZmllciBvZiB0aGUgY29udHJpYnV0ZWQgYWN0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZXhpdGZ1bGxTY3JlZW4nLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIEEgbGFiZWwgb2YgdGhlIGFjdGlvbiB0aGF0IHdpbGwgYmUgcHJlc2VudGVkIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRXhpdCBGdWxsIFNjcmVlbicsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gQW4gb3B0aW9uYWwgYXJyYXkgb2Yga2V5YmluZGluZ3MgZm9yIHRoZSBhY3Rpb24uXG4gICAgICAgICAgICAgICAgICAgICAgY29udGV4dE1lbnVHcm91cElkOiAnbmF2aWdhdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAga2V5YmluZGluZ3M6IFs5XSxcbiAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0TWVudU9yZGVyOiAxLjUsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gTWV0aG9kIHRoYXQgd2lsbCBiZSBleGVjdXRlZCB3aGVuIHRoZSBhY3Rpb24gaXMgdHJpZ2dlcmVkLlxuICAgICAgICAgICAgICAgICAgICAgIC8vIEBwYXJhbSBlZGl0b3IgVGhlIGVkaXRvciBpbnN0YW5jZSBpcyBwYXNzZWQgaW4gYXMgYSBjb252aW5pZW5jZVxuICAgICAgICAgICAgICAgICAgICAgIHJ1bjogZnVuY3Rpb24oZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlZGl0b3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LndlYmtpdEV4aXRGdWxsc2NyZWVuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIuc2VuZFRvSG9zdChcIm9uRWRpdG9ySW5pdGlhbGl6ZWRcIiwgdGhpcy5fZWRpdG9yKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHVybiBiYWNrIHRoZSB2YWx1ZSBpbiB0aGUgZWRpdG9yIHRvIHRoZSBtYWludmlld1xuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdnZXRFZGl0b3JDb250ZW50JywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIuc2VuZFRvSG9zdChcImVkaXRvckNvbnRlbnRcIiwgZWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSB2YWx1ZSBvZiB0aGUgZWRpdG9yIGZyb20gd2hhdCB3YXMgc2VudCBmcm9tIHRoZSBtYWludmlld1xuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdzZXRFZGl0b3JDb250ZW50JywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpe1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5zZXRWYWx1ZShkYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgc3R5bGUgb2YgdGhlIGVkaXRvciBjb250YWluZXIgZGl2XG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ3NldEVkaXRvclN0eWxlJywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpe1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWRpdG9yRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7dGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJ9Jyk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvckRpdi5zdHlsZSA9IGRhdGEuc3R5bGU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50VmFsdWUgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yID0gbW9uYWNvLmVkaXRvci5jcmVhdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJcbiAgICAgICAgICAgICAgICAgICAgfScpLCBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYW5ndWFnZTogZGF0YS5sYW5ndWFnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiBkYXRhLnRoZW1lLFxuICAgICAgICAgICAgICAgICAgICB9LCAke0pTT04uc3RyaW5naWZ5KHRoaXMuZWRpdG9yT3B0aW9ucyl9KSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIG9wdGlvbnMgb2YgdGhlIGVkaXRvciBmcm9tIHdoYXQgd2FzIHNlbnQgZnJvbSB0aGUgbWFpbnZpZXdcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignc2V0RWRpdG9yT3B0aW9ucycsIGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLnVwZGF0ZU9wdGlvbnMoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJvbkVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkXCIsICcnKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgbGFuZ3VhZ2Ugb2YgdGhlIGVkaXRvciBmcm9tIHdoYXQgd2FzIHNlbnQgZnJvbSB0aGUgbWFpbnZpZXdcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignc2V0TGFuZ3VhZ2UnLCBmdW5jdGlvbihldmVudCwgZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50VmFsdWUgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yID0gbW9uYWNvLmVkaXRvci5jcmVhdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJyR7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZWRpdG9ySW5uZXJDb250YWluZXJcbiAgICAgICAgICAgICAgICAgICAgfScpLCBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYW5ndWFnZTogZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiB0aGVtZSxcbiAgICAgICAgICAgICAgICAgICAgfSwgJHtKU09OLnN0cmluZ2lmeSh0aGlzLmVkaXRvck9wdGlvbnMpfSkpO1xuICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5zZW5kVG9Ib3N0KFwib25FZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZFwiLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoXCJvbkVkaXRvckxhbmd1YWdlQ2hhbmdlZFwiLCAnJyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZWdpc3RlciBhIG5ldyBsYW5ndWFnZSB3aXRoIGVkaXRvclxuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdyZWdpc3Rlckxhbmd1YWdlJywgZnVuY3Rpb24oZXZlbnQsIGRhdGEpe1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudFZhbHVlID0gZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5kaXNwb3NlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmNvbXBsZXRpb25JdGVtUHJvdmlkZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcm92aWRlciA9IGRhdGEuY29tcGxldGlvbkl0ZW1Qcm92aWRlcltpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyLmtpbmQgPSBldmFsKHByb3ZpZGVyLmtpbmQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5tb25hcmNoVG9rZW5zUHJvdmlkZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtb25hcmNoVG9rZW5zID0gZGF0YS5tb25hcmNoVG9rZW5zUHJvdmlkZXJbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBtb25hcmNoVG9rZW5zWzBdID0gZXZhbChtb25hcmNoVG9rZW5zWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBtb25hY28ubGFuZ3VhZ2VzLnJlZ2lzdGVyKHsgaWQ6IGRhdGEuaWQgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbW9uYWNvLmxhbmd1YWdlcy5zZXRNb25hcmNoVG9rZW5zUHJvdmlkZXIoZGF0YS5pZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5pemVyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdDogZGF0YS5tb25hcmNoVG9rZW5zUHJvdmlkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gRGVmaW5lIGEgbmV3IHRoZW1lIHRoYXQgY29uc3RhaW5zIG9ubHkgcnVsZXMgdGhhdCBtYXRjaCB0aGlzIGxhbmd1YWdlXG4gICAgICAgICAgICAgICAgICAgIG1vbmFjby5lZGl0b3IuZGVmaW5lVGhlbWUoZGF0YS5jdXN0b21UaGVtZS5pZCwgZGF0YS5jdXN0b21UaGVtZS50aGVtZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoZW1lID0gZGF0YS5jdXN0b21UaGVtZS5pZDtcblxuICAgICAgICAgICAgICAgICAgICBtb25hY28ubGFuZ3VhZ2VzLnJlZ2lzdGVyQ29tcGxldGlvbkl0ZW1Qcm92aWRlcihkYXRhLmlkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlQ29tcGxldGlvbkl0ZW1zOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEuY29tcGxldGlvbkl0ZW1Qcm92aWRlclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgY3NzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICAgICAgICAgICAgICAgICAgICBjc3MudHlwZSA9IFwidGV4dC9jc3NcIjtcbiAgICAgICAgICAgICAgICAgICAgY3NzLmlubmVySFRNTCA9IGRhdGEubW9uYXJjaFRva2Vuc1Byb3ZpZGVyQ1NTO1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNzcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIuc2VuZFRvSG9zdChcIm9uRWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWRcIiwgJycpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gSW5zdHJ1Y3QgdGhlIGVkaXRvciB0byByZW1lYXN1cmUgaXRzIGNvbnRhaW5lclxuICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKCdsYXlvdXQnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IubGF5b3V0KCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJbnN0cnVjdCB0aGUgZWRpdG9yIGdvIHRvIGZ1bGwgc2NyZWVuIG1vZGVcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignc2hvd0Z1bGxTY3JlZW5FZGl0b3InLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBlZGl0b3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn0nKTtcbiAgICAgICAgICAgICAgICAgIGVkaXRvckRpdi53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gSW5zdHJ1Y3QgdGhlIGVkaXRvciBleGl0IGZ1bGwgc2NyZWVuIG1vZGVcbiAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbignZXhpdEZ1bGxTY3JlZW5FZGl0b3InLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBlZGl0b3JEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHt0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcn0nKTtcbiAgICAgICAgICAgICAgICAgIGVkaXRvckRpdi53ZWJraXRFeGl0RnVsbHNjcmVlbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oJ2Rpc3Bvc2UnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIG5lZWQgdG8gbWFudWFsbHkgcmVzaXplIHRoZSBlZGl0b3IgYW55IHRpbWUgdGhlIHdpbmRvdyBzaXplXG4gICAgICAgICAgICAgICAgLy8gY2hhbmdlcy4gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L21vbmFjby1lZGl0b3IvaXNzdWVzLzI4XG4gICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZnVuY3Rpb24gcmVzaXplRWRpdG9yKCkge1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IubGF5b3V0KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgICAgIDwvYm9keT5cbiAgICAgICAgICAgIDwvaHRtbD5gO1xuXG4gICAgICAvLyBkeW5hbWljYWxseSBjcmVhdGUgdGhlIEVsZWN0cm9uIFdlYnZpZXcgRWxlbWVudFxuICAgICAgLy8gdGhpcyB3aWxsIHNhbmRib3ggdGhlIG1vbmFjbyBjb2RlIGludG8gaXRzIG93biBET00gYW5kIGl0cyBvd25cbiAgICAgIC8vIGphdmFzY3JpcHQgaW5zdGFuY2UuIE5lZWQgdG8gZG8gdGhpcyB0byBhdm9pZCBwcm9ibGVtcyB3aXRoIG1vbmFjb1xuICAgICAgLy8gdXNpbmcgQU1EIFJlcXVpcmVzIGFuZCBFbGVjdHJvbiB1c2luZyBOb2RlIFJlcXVpcmVzXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9tb25hY28tZWRpdG9yL2lzc3Vlcy85MFxuICAgICAgdGhpcy5fd2VidmlldyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3dlYnZpZXcnKTtcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2V0QXR0cmlidXRlKCdub2RlaW50ZWdyYXRpb24nLCAndHJ1ZScpO1xuICAgICAgdGhpcy5fd2Vidmlldy5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGV3ZWJzZWN1cml0eScsICd0cnVlJyk7XG4gICAgICAvLyB0YWtlIHRoZSBodG1sIGNvbnRlbnQgZm9yIHRoZSB3ZWJ2aWV3IGFuZCBiYXNlNjQgZW5jb2RlIGl0IGFuZCB1c2UgYXMgdGhlIHNyYyB0YWdcbiAgICAgIHRoaXMuX3dlYnZpZXcuc2V0QXR0cmlidXRlKCdzcmMnLCAnZGF0YTp0ZXh0L2h0bWw7YmFzZTY0LCcgKyB3aW5kb3cuYnRvYShlZGl0b3JIVE1MKSk7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnZGlzcGxheTppbmxpbmUtZmxleDsgd2lkdGg6MTAwJTsgaGVpZ2h0OjEwMCUnKTtcbiAgICAgIC8vICB0aGlzLl93ZWJ2aWV3LmFkZEV2ZW50TGlzdGVuZXIoJ2RvbS1yZWFkeScsICgpID0+IHtcbiAgICAgIC8vICAgICB0aGlzLl93ZWJ2aWV3Lm9wZW5EZXZUb29scygpO1xuICAgICAgLy8gIH0pO1xuXG4gICAgICAvLyBQcm9jZXNzIHRoZSBkYXRhIGZyb20gdGhlIHdlYnZpZXdcbiAgICAgIHRoaXMuX3dlYnZpZXcuYWRkRXZlbnRMaXN0ZW5lcignaXBjLW1lc3NhZ2UnLCAoZXZlbnQ6IGFueSkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuY2hhbm5lbCA9PT0gJ2VkaXRvckNvbnRlbnQnKSB7XG4gICAgICAgICAgdGhpcy5fZnJvbUVkaXRvciA9IHRydWU7XG4gICAgICAgICAgdGhpcy53cml0ZVZhbHVlKGV2ZW50LmFyZ3NbMF0pO1xuICAgICAgICAgIHRoaXMuX3N1YmplY3QubmV4dCh0aGlzLl92YWx1ZSk7XG4gICAgICAgICAgdGhpcy5fc3ViamVjdC5jb21wbGV0ZSgpO1xuICAgICAgICAgIHRoaXMuX3N1YmplY3QgPSBuZXcgU3ViamVjdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmNoYW5uZWwgPT09ICdvbkVkaXRvckNvbnRlbnRDaGFuZ2UnKSB7XG4gICAgICAgICAgdGhpcy5fZnJvbUVkaXRvciA9IHRydWU7XG4gICAgICAgICAgdGhpcy53cml0ZVZhbHVlKGV2ZW50LmFyZ3NbMF0pO1xuICAgICAgICAgIGlmICh0aGlzLmluaXRpYWxDb250ZW50Q2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLmluaXRpYWxDb250ZW50Q2hhbmdlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmxheW91dCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5jaGFubmVsID09PSAnb25FZGl0b3JJbml0aWFsaXplZCcpIHtcbiAgICAgICAgICB0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgdGhpcy5fZWRpdG9yUHJveHkgPSB0aGlzLndyYXBFZGl0b3JDYWxscyh0aGlzLl9lZGl0b3IpO1xuICAgICAgICAgIHRoaXMub25FZGl0b3JJbml0aWFsaXplZC5lbWl0KHRoaXMuX2VkaXRvclByb3h5KTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5jaGFubmVsID09PSAnb25FZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZCcpIHtcbiAgICAgICAgICB0aGlzLm9uRWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCh1bmRlZmluZWQpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmNoYW5uZWwgPT09ICdvbkVkaXRvckxhbmd1YWdlQ2hhbmdlZCcpIHtcbiAgICAgICAgICB0aGlzLm9uRWRpdG9yTGFuZ3VhZ2VDaGFuZ2VkLmVtaXQodW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIGFwcGVuZCB0aGUgd2VidmlldyB0byB0aGUgRE9NXG4gICAgICB0aGlzLl9lZGl0b3JDb250YWluZXIubmF0aXZlRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl93ZWJ2aWV3KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogbmdBZnRlclZpZXdJbml0IG9ubHkgdXNlZCBmb3IgYnJvd3NlciB2ZXJzaW9uIG9mIGVkaXRvclxuICAgKiBUaGlzIGlzIHdoZXJlIHRoZSBBTUQgTG9hZGVyIHNjcmlwdHMgYXJlIGFkZGVkIHRvIHRoZSBicm93c2VyIGFuZCB0aGUgZWRpdG9yIHNjcmlwdHMgYXJlIFwicmVxdWlyZWRcIlxuICAgKi9cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5faXNFbGVjdHJvbkFwcCkge1xuICAgICAgbG9hZE1vbmFjbygpO1xuICAgICAgd2FpdFVudGlsTW9uYWNvUmVhZHkoKVxuICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveSkpXG4gICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuaW5pdE1vbmFjbygpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgbWVyZ2UoXG4gICAgICBmcm9tRXZlbnQod2luZG93LCAncmVzaXplJykucGlwZShkZWJvdW5jZVRpbWUoMTAwKSksXG4gICAgICB0aGlzLl93aWR0aFN1YmplY3QuYXNPYnNlcnZhYmxlKCkucGlwZShkaXN0aW5jdFVudGlsQ2hhbmdlZCgpKSxcbiAgICAgIHRoaXMuX2hlaWdodFN1YmplY3QuYXNPYnNlcnZhYmxlKCkucGlwZShkaXN0aW5jdFVudGlsQ2hhbmdlZCgpKSxcbiAgICApXG4gICAgICAucGlwZShcbiAgICAgICAgdGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3kpLFxuICAgICAgICBkZWJvdW5jZVRpbWUoMTAwKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICB0aGlzLmxheW91dCgpO1xuICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICAgIH0pO1xuICAgIHRpbWVyKDUwMCwgMjUwKVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3kpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9lbGVtZW50UmVmICYmIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkge1xuICAgICAgICAgIHRoaXMuX3dpZHRoU3ViamVjdC5uZXh0KCg8SFRNTEVsZW1lbnQ+dGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCk7XG4gICAgICAgICAgdGhpcy5faGVpZ2h0U3ViamVjdC5uZXh0KCg8SFRNTEVsZW1lbnQ+dGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLmRldGFjaCgpO1xuICAgIGlmICh0aGlzLl93ZWJ2aWV3KSB7XG4gICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2Rpc3Bvc2UnKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgdGhpcy5fZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgdGhpcy5fZGVzdHJveS5uZXh0KHRydWUpO1xuICAgIHRoaXMuX2Rlc3Ryb3kudW5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBzaG93RnVsbFNjcmVlbkVkaXRvciByZXF1ZXN0IGZvciBmdWxsIHNjcmVlbiBvZiBDb2RlIEVkaXRvciBiYXNlZCBvbiBpdHMgYnJvd3NlciB0eXBlLlxuICAgKi9cbiAgcHVibGljIHNob3dGdWxsU2NyZWVuRWRpdG9yKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgaWYgKHRoaXMuX3dlYnZpZXcpIHtcbiAgICAgICAgdGhpcy5fd2Vidmlldy5zZW5kKCdzaG93RnVsbFNjcmVlbkVkaXRvcicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgY29kZUVkaXRvckVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50ID0gdGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQgYXMgSFRNTERpdkVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGZ1bGxTY3JlZW5NYXA6IE9iamVjdCA9IHtcbiAgICAgICAgICAvLyBDaHJvbWVcbiAgICAgICAgICByZXF1ZXN0RnVsbHNjcmVlbjogKCkgPT4gY29kZUVkaXRvckVsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgICAvLyBTYWZhcmlcbiAgICAgICAgICB3ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbjogKCkgPT4gKDxhbnk+Y29kZUVkaXRvckVsZW1lbnQpLndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKCksXG4gICAgICAgICAgLy8gSUVcbiAgICAgICAgICBtc1JlcXVlc3RGdWxsc2NyZWVuOiAoKSA9PiAoPGFueT5jb2RlRWRpdG9yRWxlbWVudCkubXNSZXF1ZXN0RnVsbHNjcmVlbigpLFxuICAgICAgICAgIC8vIEZpcmVmb3hcbiAgICAgICAgICBtb3pSZXF1ZXN0RnVsbFNjcmVlbjogKCkgPT4gKDxhbnk+Y29kZUVkaXRvckVsZW1lbnQpLm1velJlcXVlc3RGdWxsU2NyZWVuKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgZm9yIChjb25zdCBoYW5kbGVyIG9mIE9iamVjdC5rZXlzKGZ1bGxTY3JlZW5NYXApKSB7XG4gICAgICAgICAgaWYgKGNvZGVFZGl0b3JFbGVtZW50W2hhbmRsZXJdKSB7XG4gICAgICAgICAgICBmdWxsU2NyZWVuTWFwW2hhbmRsZXJdKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2lzRnVsbFNjcmVlbiA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogZXhpdEZ1bGxTY3JlZW5FZGl0b3IgcmVxdWVzdCB0byBleGl0IGZ1bGwgc2NyZWVuIG9mIENvZGUgRWRpdG9yIGJhc2VkIG9uIGl0cyBicm93c2VyIHR5cGUuXG4gICAqL1xuICBwdWJsaWMgZXhpdEZ1bGxTY3JlZW5FZGl0b3IoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBpZiAodGhpcy5fd2Vidmlldykge1xuICAgICAgICB0aGlzLl93ZWJ2aWV3LnNlbmQoJ2V4aXRGdWxsU2NyZWVuRWRpdG9yJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBleGl0RnVsbFNjcmVlbk1hcDogb2JqZWN0ID0ge1xuICAgICAgICAgIC8vIENocm9tZVxuICAgICAgICAgIGV4aXRGdWxsc2NyZWVuOiAoKSA9PiBkb2N1bWVudC5leGl0RnVsbHNjcmVlbigpLFxuICAgICAgICAgIC8vIFNhZmFyaVxuICAgICAgICAgIHdlYmtpdEV4aXRGdWxsc2NyZWVuOiAoKSA9PiAoPGFueT5kb2N1bWVudCkud2Via2l0RXhpdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgICAvLyBGaXJlZm94XG4gICAgICAgICAgbW96Q2FuY2VsRnVsbFNjcmVlbjogKCkgPT4gKDxhbnk+ZG9jdW1lbnQpLm1vekNhbmNlbEZ1bGxTY3JlZW4oKSxcbiAgICAgICAgICAvLyBJRVxuICAgICAgICAgIG1zRXhpdEZ1bGxzY3JlZW46ICgpID0+ICg8YW55PmRvY3VtZW50KS5tc0V4aXRGdWxsc2NyZWVuKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgZm9yIChjb25zdCBoYW5kbGVyIG9mIE9iamVjdC5rZXlzKGV4aXRGdWxsU2NyZWVuTWFwKSkge1xuICAgICAgICAgIGlmIChkb2N1bWVudFtoYW5kbGVyXSkge1xuICAgICAgICAgICAgZXhpdEZ1bGxTY3JlZW5NYXBbaGFuZGxlcl0oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5faXNGdWxsU2NyZWVuID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogYWRkRnVsbFNjcmVlbk1vZGVDb21tYW5kIHVzZWQgdG8gYWRkIHRoZSBmdWxsc2NyZWVuIG9wdGlvbiB0byB0aGUgY29udGV4dCBtZW51XG4gICAqL1xuICBwcml2YXRlIGFkZEZ1bGxTY3JlZW5Nb2RlQ29tbWFuZCgpOiB2b2lkIHtcbiAgICB0aGlzLl9lZGl0b3IuYWRkQWN0aW9uKHtcbiAgICAgIC8vIEFuIHVuaXF1ZSBpZGVudGlmaWVyIG9mIHRoZSBjb250cmlidXRlZCBhY3Rpb24uXG4gICAgICBpZDogJ2Z1bGxTY3JlZW4nLFxuICAgICAgLy8gQSBsYWJlbCBvZiB0aGUgYWN0aW9uIHRoYXQgd2lsbCBiZSBwcmVzZW50ZWQgdG8gdGhlIHVzZXIuXG4gICAgICBsYWJlbDogJ0Z1bGwgU2NyZWVuJyxcbiAgICAgIC8vIEFuIG9wdGlvbmFsIGFycmF5IG9mIGtleWJpbmRpbmdzIGZvciB0aGUgYWN0aW9uLlxuICAgICAgY29udGV4dE1lbnVHcm91cElkOiAnbmF2aWdhdGlvbicsXG4gICAgICBrZXliaW5kaW5nczogdGhpcy5fa2V5Y29kZSxcbiAgICAgIGNvbnRleHRNZW51T3JkZXI6IDEuNSxcbiAgICAgIC8vIE1ldGhvZCB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgd2hlbiB0aGUgYWN0aW9uIGlzIHRyaWdnZXJlZC5cbiAgICAgIC8vIEBwYXJhbSBlZGl0b3IgVGhlIGVkaXRvciBpbnN0YW5jZSBpcyBwYXNzZWQgaW4gYXMgYSBjb252aW5pZW5jZVxuICAgICAgcnVuOiAoZWQ6IGFueSkgPT4ge1xuICAgICAgICB0aGlzLnNob3dGdWxsU2NyZWVuRWRpdG9yKCk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIHdyYXBFZGl0b3JDYWxscyB1c2VkIHRvIHByb3h5IGFsbCB0aGUgY2FsbHMgdG8gdGhlIG1vbmFjbyBlZGl0b3JcbiAgICogRm9yIGNhbGxzIGZvciBFbGVjdHJvbiB1c2UgdGhpcyB0byBjYWxsIHRoZSBlZGl0b3IgaW5zaWRlIHRoZSB3ZWJ2aWV3XG4gICAqL1xuICBwcml2YXRlIHdyYXBFZGl0b3JDYWxscyhvYmo6IGFueSk6IGFueSB7XG4gICAgbGV0IHRoYXQ6IGFueSA9IHRoaXM7XG4gICAgbGV0IGhhbmRsZXI6IGFueSA9IHtcbiAgICAgIGdldCh0YXJnZXQ6IGFueSwgcHJvcEtleTogYW55LCByZWNlaXZlcjogYW55KTogYW55IHtcbiAgICAgICAgcmV0dXJuIGFzeW5jICguLi5hcmdzOiBhbnkpOiBQcm9taXNlPGFueT4gPT4ge1xuICAgICAgICAgIGlmICh0aGF0Ll9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgaWYgKHRoYXQuX3dlYnZpZXcpIHtcbiAgICAgICAgICAgICAgY29uc3QgZXhlY3V0ZUphdmFTY3JpcHQ6IEZ1bmN0aW9uID0gKGNvZGU6IHN0cmluZykgPT5cbiAgICAgICAgICAgICAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICB0aGF0Ll93ZWJ2aWV3LmV4ZWN1dGVKYXZhU2NyaXB0KGNvZGUsIHJlc29sdmUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBsZXQgcmVzdWx0OiBhbnkgPSBhd2FpdCBleGVjdXRlSmF2YVNjcmlwdCgnZWRpdG9yLicgKyBwcm9wS2V5ICsgJygnICsgYXJncyArICcpJyk7XG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zdCBvcmlnTWV0aG9kOiBhbnkgPSB0YXJnZXRbcHJvcEtleV07XG4gICAgICAgICAgICAgIGxldCByZXN1bHQ6IGFueSA9IGF3YWl0IG9yaWdNZXRob2QuYXBwbHkodGhhdC5fZWRpdG9yLCBhcmdzKTtcbiAgICAgICAgICAgICAgLy8gc2luY2UgcnVubmluZyBqYXZhc2NyaXB0IGNvZGUgbWFudWFsbHkgbmVlZCB0byBmb3JjZSBBbmd1bGFyIHRvIGRldGVjdCBjaGFuZ2VzXG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoYXQuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lXG4gICAgICAgICAgICAgICAgICBpZiAoIXRoYXQuX2NoYW5nZURldGVjdG9yUmVmWydkZXN0cm95ZWQnXSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0Ll9jaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfTtcbiAgICByZXR1cm4gbmV3IFByb3h5KG9iaiwgaGFuZGxlcik7XG4gIH1cblxuICAvKipcbiAgICogaW5pdE1vbmFjbyBtZXRob2QgY3JlYXRlcyB0aGUgbW9uYWNvIGVkaXRvciBpbnRvIHRoZSBAVmlld0NoaWxkKCdlZGl0b3JDb250YWluZXInKVxuICAgKiBhbmQgZW1pdCB0aGUgb25FZGl0b3JJbml0aWFsaXplZCBldmVudC4gIFRoaXMgaXMgb25seSB1c2VkIGluIHRoZSBicm93c2VyIHZlcnNpb24uXG4gICAqL1xuICBwcml2YXRlIGluaXRNb25hY28oKTogdm9pZCB7XG4gICAgbGV0IGNvbnRhaW5lckRpdjogSFRNTERpdkVsZW1lbnQgPSB0aGlzLl9lZGl0b3JDb250YWluZXIubmF0aXZlRWxlbWVudDtcbiAgICBjb250YWluZXJEaXYuaWQgPSB0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcjtcbiAgICB0aGlzLl9lZGl0b3IgPSBtb25hY28uZWRpdG9yLmNyZWF0ZShcbiAgICAgIGNvbnRhaW5lckRpdixcbiAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgIHtcbiAgICAgICAgICB2YWx1ZTogdGhpcy5fdmFsdWUsXG4gICAgICAgICAgbGFuZ3VhZ2U6IHRoaXMubGFuZ3VhZ2UsXG4gICAgICAgICAgdGhlbWU6IHRoaXMuX3RoZW1lLFxuICAgICAgICB9LFxuICAgICAgICB0aGlzLmVkaXRvck9wdGlvbnMsXG4gICAgICApLFxuICAgICk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9lZGl0b3JQcm94eSA9IHRoaXMud3JhcEVkaXRvckNhbGxzKHRoaXMuX2VkaXRvcik7XG4gICAgICB0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICB0aGlzLm9uRWRpdG9ySW5pdGlhbGl6ZWQuZW1pdCh0aGlzLl9lZGl0b3JQcm94eSk7XG4gICAgfSk7XG4gICAgdGhpcy5fZWRpdG9yLmdldE1vZGVsKCkub25EaWRDaGFuZ2VDb250ZW50KChlOiBhbnkpID0+IHtcbiAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSB0cnVlO1xuICAgICAgdGhpcy53cml0ZVZhbHVlKHRoaXMuX2VkaXRvci5nZXRWYWx1ZSgpKTtcbiAgICAgIGlmICh0aGlzLmluaXRpYWxDb250ZW50Q2hhbmdlKSB7XG4gICAgICAgIHRoaXMuaW5pdGlhbENvbnRlbnRDaGFuZ2UgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sYXlvdXQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLmFkZEZ1bGxTY3JlZW5Nb2RlQ29tbWFuZCgpO1xuICB9XG59XG4iXX0=