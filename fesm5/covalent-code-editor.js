import { __values, __awaiter, __generator } from 'tslib';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject, fromEvent, merge, timer } from 'rxjs';
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, forwardRef, NgZone, ChangeDetectorRef, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
/**
 * Waits until monaco has been loaded so we can reference its global object.
 * @return {?}
 */
function waitUntilMonacoReady() {
    /** @type {?} */
    var monacoReady$ = new Subject();
    // create interval to check if monaco has been loaded
    /** @type {?} */
    var interval = setInterval(function () {
        if (isMonacoLoaded()) {
            // clear interval when monaco has been loaded
            clearInterval(interval);
            monacoReady$.next();
            monacoReady$.complete();
        }
    }, 100);
    return monacoReady$.asObservable();
}
/**
 * Check if monaco has been loaded
 * @return {?}
 */
function isMonacoLoaded() {
    return typeof (((/** @type {?} */ (window))).monaco) === 'object';
}
/**
 * Loads monaco
 * @return {?}
 */
function loadMonaco() {
    // check if the script tag has been created in case another code component has done this already
    if (!document.getElementById('monaco-loader-script')) {
        /** @type {?} */
        var onGotAmdLoader = function () {
            // Load monaco
            ((/** @type {?} */ (window))).require.config({ paths: { 'vs': 'assets/monaco/vs' } });
            ((/** @type {?} */ (window))).require(['vs/editor/editor.main'], function () {
                // TODO
            });
        };
        // Load AMD loader if necessary
        if (!((/** @type {?} */ (window))).require) {
            /** @type {?} */
            var loaderScript = document.createElement('script');
            loaderScript.id = 'monaco-loader-script';
            loaderScript.type = 'text/javascript';
            loaderScript.src = 'assets/monaco/vs/loader.js';
            loaderScript.addEventListener('load', onGotAmdLoader);
            document.body.appendChild(loaderScript);
        }
        else {
            onGotAmdLoader();
        }
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
/** @type {?} */
var noop = function () {
    // empty method
};
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
                    for (var _b = __values(Object.keys(fullScreenMap)), _c = _b.next(); !_c.done; _c = _b.next()) {
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
                    for (var _b = __values(Object.keys(exitFullScreenMap)), _c = _b.next(); !_c.done; _c = _b.next()) {
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
                    return __awaiter(_this, void 0, void 0, function () {
                        var executeJavaScript, result, origMethod, result;
                        return __generator(this, function (_a) {
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
var CovalentCodeEditorModule = /** @class */ (function () {
    function CovalentCodeEditorModule() {
    }
    /**
     * @return {?}
     */
    CovalentCodeEditorModule.forRoot = /**
     * @return {?}
     */
    function () {
        return {
            ngModule: CovalentCodeEditorModule,
            providers: [],
        };
    };
    CovalentCodeEditorModule.decorators = [
        { type: NgModule, args: [{
                    imports: [
                        CommonModule,
                    ],
                    declarations: [
                        TdCodeEditorComponent,
                    ],
                    exports: [
                        TdCodeEditorComponent,
                    ],
                    entryComponents: [],
                    bootstrap: [TdCodeEditorComponent],
                },] }
    ];
    return CovalentCodeEditorModule;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */

export { TdCodeEditorComponent, CovalentCodeEditorModule, waitUntilMonacoReady, isMonacoLoaded, loadMonaco };

//# sourceMappingURL=covalent-code-editor.js.map