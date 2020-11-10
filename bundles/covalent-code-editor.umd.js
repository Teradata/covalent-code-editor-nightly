(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/forms'), require('rxjs'), require('rxjs/operators'), require('monaco-editor'), require('@angular/common')) :
    typeof define === 'function' && define.amd ? define('@covalent/code-editor', ['exports', '@angular/core', '@angular/forms', 'rxjs', 'rxjs/operators', 'monaco-editor', '@angular/common'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.covalent = global.covalent || {}, global.covalent['code-editor'] = {}), global.ng.core, global.ng.forms, global.rxjs, global.rxjs.operators, global.monaco, global.ng.common));
}(this, (function (exports, core, forms, rxjs, operators, monaco, common) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    ;
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }
    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    /** @type {?} */
    var noop = ( /**
     * @return {?}
     */function () {
        // empty method
    });
    var ɵ0 = noop;
    // counter for ids to allow for multiple editors on one page
    /** @type {?} */
    var uniqueCounter = 0;
    var TdCodeEditorComponent = /** @class */ (function () {
        // tslint:disable-next-line:member-ordering
        /**
         * @param {?} zone
         * @param {?} _changeDetectorRef
         * @param {?} _elementRef
         */
        function TdCodeEditorComponent(zone, _changeDetectorRef, _elementRef) {
            this.zone = zone;
            this._changeDetectorRef = _changeDetectorRef;
            this._elementRef = _elementRef;
            this._destroy = new rxjs.Subject();
            this._widthSubject = new rxjs.Subject();
            this._heightSubject = new rxjs.Subject();
            this._editorStyle = 'width:100%;height:100%;border:1px solid grey;';
            this._value = '';
            this._theme = 'vs';
            this._language = 'javascript';
            this._subject = new rxjs.Subject();
            this._editorInnerContainer = 'editorInnerContainer' + uniqueCounter++;
            this._fromEditor = false;
            this._componentInitialized = false;
            this._editorOptions = {};
            this._isFullScreen = false;
            this._registeredLanguagesStyles = [];
            /**
             * editorInitialized: function($event)
             * Event emitted when editor is first initialized
             */
            this.editorInitialized = new core.EventEmitter();
            /**
             * editorConfigurationChanged: function($event)
             * Event emitted when editor's configuration changes
             */
            this.editorConfigurationChanged = new core.EventEmitter();
            /**
             * editorLanguageChanged: function($event)
             * Event emitted when editor's Language changes
             */
            this.editorLanguageChanged = new core.EventEmitter();
            /**
             * editorValueChange: function($event)
             * Event emitted any time something changes the editor value
             */
            this.editorValueChange = new core.EventEmitter();
            /**
             * The change event notifies you about a change happening in an input field.
             * Since the component is not a native Angular component have to specifiy the event emitter ourself
             */
            this.change = new core.EventEmitter();
            /* tslint:disable-next-line */
            this.propagateChange = ( /**
             * @param {?} _
             * @return {?}
             */function (_) { });
            this.onTouched = ( /**
             * @return {?}
             */function () { return noop; });
        }
        Object.defineProperty(TdCodeEditorComponent.prototype, "value", {
            /**
             * @return {?}
             */
            get: function () {
                return this._value;
            },
            /**
             * value?: string
             * @param {?} value
             * @return {?}
             */
            set: function (value) {
                if (value === this._value) {
                    return;
                }
                this._value = value;
                if (this._componentInitialized) {
                    this.applyValue();
                }
            },
            enumerable: false,
            configurable: true
        });
        /**
         * @return {?}
         */
        TdCodeEditorComponent.prototype.applyValue = function () {
            if (!this._fromEditor) {
                this._editor.setValue(this._value);
            }
            this._fromEditor = false;
            this.propagateChange(this._value);
            this.change.emit();
            this.editorValueChange.emit();
        };
        /**
         * Implemented as part of ControlValueAccessor.
         * @param {?} value
         * @return {?}
         */
        TdCodeEditorComponent.prototype.writeValue = function (value) {
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
        TdCodeEditorComponent.prototype.registerOnChange = function (fn) {
            this.propagateChange = fn;
        };
        /**
         * @param {?} fn
         * @return {?}
         */
        TdCodeEditorComponent.prototype.registerOnTouched = function (fn) {
            this.onTouched = fn;
        };
        /**
         * getEditorContent?: function
         * Returns the content within the editor
         * @return {?}
         */
        TdCodeEditorComponent.prototype.getValue = function () {
            var _this = this;
            if (this._componentInitialized) {
                setTimeout(( /**
                 * @return {?}
                 */function () {
                    _this._subject.next(_this._value);
                    _this._subject.complete();
                    _this._subject = new rxjs.Subject();
                }));
                return this._subject.asObservable();
            }
        };
        Object.defineProperty(TdCodeEditorComponent.prototype, "language", {
            /**
             * @return {?}
             */
            get: function () {
                return this._language;
            },
            /**
             * language?: string
             * language used in editor
             * @param {?} language
             * @return {?}
             */
            set: function (language) {
                this._language = language;
                if (this._componentInitialized) {
                    this.applyLanguage();
                }
            },
            enumerable: false,
            configurable: true
        });
        /**
         * @return {?}
         */
        TdCodeEditorComponent.prototype.applyLanguage = function () {
            if (this._language) {
                monaco.editor.setModelLanguage(this._editor.getModel(), this._language);
                this.editorLanguageChanged.emit();
            }
        };
        /**
         * registerLanguage?: function
         * Registers a custom Language within the editor
         * @param {?} language
         * @return {?}
         */
        TdCodeEditorComponent.prototype.registerLanguage = function (language) {
            var e_1, _a, e_2, _b;
            if (this._componentInitialized) {
                try {
                    for (var _c = __values(language.completionItemProvider), _d = _c.next(); !_d.done; _d = _c.next()) {
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
                    for (var _e = __values(language.monarchTokensProvider), _f = _e.next(); !_f.done; _f = _e.next()) {
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
                    provideCompletionItems: ( /**
                     * @return {?}
                     */function () {
                        return language.completionItemProvider;
                    }),
                });
                /** @type {?} */
                var css = document.createElement('style');
                css.type = 'text/css';
                css.innerHTML = language.monarchTokensProviderCSS;
                document.body.appendChild(css);
                this.editorConfigurationChanged.emit();
                this._registeredLanguagesStyles = __spread(this._registeredLanguagesStyles, [css]);
            }
        };
        Object.defineProperty(TdCodeEditorComponent.prototype, "editorStyle", {
            /**
             * @return {?}
             */
            get: function () {
                return this._editorStyle;
            },
            /**
             * style?: string
             * css style of the editor on the page
             * @param {?} editorStyle
             * @return {?}
             */
            set: function (editorStyle) {
                this._editorStyle = editorStyle;
                if (this._componentInitialized) {
                    this.applyStyle();
                }
            },
            enumerable: false,
            configurable: true
        });
        /**
         * @return {?}
         */
        TdCodeEditorComponent.prototype.applyStyle = function () {
            if (this._editorStyle) {
                /** @type {?} */
                var containerDiv = this._editorContainer.nativeElement;
                containerDiv.setAttribute('style', this._editorStyle);
            }
        };
        Object.defineProperty(TdCodeEditorComponent.prototype, "theme", {
            /**
             * @return {?}
             */
            get: function () {
                return this._theme;
            },
            /**
             * theme?: string
             * Theme to be applied to editor
             * @param {?} theme
             * @return {?}
             */
            set: function (theme) {
                this._theme = theme;
                if (this._componentInitialized) {
                    this._editor.updateOptions({ theme: theme });
                    this.editorConfigurationChanged.emit();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TdCodeEditorComponent.prototype, "fullScreenKeyBinding", {
            /**
             * @return {?}
             */
            get: function () {
                return this._keycode;
            },
            /**
             * fullScreenKeyBinding?: number
             * See here for key bindings https://microsoft.github.io/monaco-editor/api/enums/monaco.keycode.html
             * Sets the KeyCode for shortcutting to Fullscreen mode
             * @param {?} keycode
             * @return {?}
             */
            set: function (keycode) {
                this._keycode = keycode;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TdCodeEditorComponent.prototype, "editorOptions", {
            /**
             * @return {?}
             */
            get: function () {
                return this._editorOptions;
            },
            /**
             * editorOptions?: object
             * Options used on editor instantiation. Available options listed here:
             * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditoroptions.html
             * @param {?} editorOptions
             * @return {?}
             */
            set: function (editorOptions) {
                this._editorOptions = editorOptions;
                if (this._componentInitialized) {
                    this._editor.updateOptions(editorOptions);
                    this.editorConfigurationChanged.emit();
                }
            },
            enumerable: false,
            configurable: true
        });
        /**
         * layout method that calls layout method of editor and instructs the editor to remeasure its container
         * @return {?}
         */
        TdCodeEditorComponent.prototype.layout = function () {
            if (this._componentInitialized) {
                this._editor.layout();
            }
        };
        Object.defineProperty(TdCodeEditorComponent.prototype, "isFullScreen", {
            /**
             * Returns if in Full Screen Mode or not
             * @return {?}
             */
            get: function () {
                return this._isFullScreen;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * @return {?}
         */
        TdCodeEditorComponent.prototype.ngOnInit = function () {
            var _this = this;
            /** @type {?} */
            var containerDiv = this._editorContainer.nativeElement;
            containerDiv.id = this._editorInnerContainer;
            this._editor = monaco.editor.create(containerDiv, Object.assign({
                value: this._value,
                language: this.language,
                theme: this._theme,
            }, this.editorOptions));
            this._componentInitialized = true;
            setTimeout(( /**
             * @return {?}
             */function () {
                _this.applyLanguage();
                _this._fromEditor = true;
                _this.applyValue();
                _this.applyStyle();
                _this.editorInitialized.emit(_this._editor);
                _this.editorConfigurationChanged.emit();
            }));
            this._editor.getModel().onDidChangeContent(( /**
             * @param {?} e
             * @return {?}
             */function (e) {
                _this._fromEditor = true;
                _this.writeValue(_this._editor.getValue());
                _this.layout();
            }));
            this.addFullScreenModeCommand();
            rxjs.merge(rxjs.fromEvent(window, 'resize').pipe(operators.debounceTime(100)), this._widthSubject.asObservable().pipe(operators.distinctUntilChanged()), this._heightSubject.asObservable().pipe(operators.distinctUntilChanged()))
                .pipe(operators.takeUntil(this._destroy), operators.debounceTime(100))
                .subscribe(( /**
         * @return {?}
         */function () {
                _this.layout();
                _this._changeDetectorRef.markForCheck();
            }));
            rxjs.timer(500, 250)
                .pipe(operators.takeUntil(this._destroy))
                .subscribe(( /**
         * @return {?}
         */function () {
                if (_this._elementRef && _this._elementRef.nativeElement) {
                    _this._widthSubject.next((( /** @type {?} */(_this._elementRef.nativeElement))).getBoundingClientRect().width);
                    _this._heightSubject.next((( /** @type {?} */(_this._elementRef.nativeElement))).getBoundingClientRect().height);
                }
            }));
        };
        /**
         * @return {?}
         */
        TdCodeEditorComponent.prototype.ngOnDestroy = function () {
            this._changeDetectorRef.detach();
            this._registeredLanguagesStyles.forEach(( /**
             * @param {?} style
             * @return {?}
             */function (style) { return style.remove(); }));
            if (this._editor) {
                this._editor.dispose();
            }
            this._destroy.next(true);
            this._destroy.unsubscribe();
        };
        /**
         * showFullScreenEditor request for full screen of Code Editor based on its browser type.
         * @return {?}
         */
        TdCodeEditorComponent.prototype.showFullScreenEditor = function () {
            var e_3, _a;
            if (this._componentInitialized) {
                /** @type {?} */
                var codeEditorElement_1 = ( /** @type {?} */(this._editorContainer.nativeElement));
                /** @type {?} */
                var fullScreenMap = {
                    // Chrome
                    requestFullscreen: ( /**
                     * @return {?}
                     */function () { return codeEditorElement_1.requestFullscreen(); }),
                    // Safari
                    webkitRequestFullscreen: ( /**
                     * @return {?}
                     */function () { return (( /** @type {?} */(codeEditorElement_1))).webkitRequestFullscreen(); }),
                    // IE
                    msRequestFullscreen: ( /**
                     * @return {?}
                     */function () { return (( /** @type {?} */(codeEditorElement_1))).msRequestFullscreen(); }),
                    // Firefox
                    mozRequestFullScreen: ( /**
                     * @return {?}
                     */function () { return (( /** @type {?} */(codeEditorElement_1))).mozRequestFullScreen(); }),
                };
                try {
                    for (var _b = __values(Object.keys(fullScreenMap)), _c = _b.next(); !_c.done; _c = _b.next()) {
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
            this._isFullScreen = true;
        };
        /**
         * exitFullScreenEditor request to exit full screen of Code Editor based on its browser type.
         * @return {?}
         */
        TdCodeEditorComponent.prototype.exitFullScreenEditor = function () {
            var e_4, _a;
            if (this._componentInitialized) {
                /** @type {?} */
                var exitFullScreenMap = {
                    // Chrome
                    exitFullscreen: ( /**
                     * @return {?}
                     */function () { return document.exitFullscreen(); }),
                    // Safari
                    webkitExitFullscreen: ( /**
                     * @return {?}
                     */function () { return (( /** @type {?} */(document))).webkitExitFullscreen(); }),
                    // Firefox
                    mozCancelFullScreen: ( /**
                     * @return {?}
                     */function () { return (( /** @type {?} */(document))).mozCancelFullScreen(); }),
                    // IE
                    msExitFullscreen: ( /**
                     * @return {?}
                     */function () { return (( /** @type {?} */(document))).msExitFullscreen(); }),
                };
                try {
                    for (var _b = __values(Object.keys(exitFullScreenMap)), _c = _b.next(); !_c.done; _c = _b.next()) {
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
            this._isFullScreen = false;
        };
        /**
         * addFullScreenModeCommand used to add the fullscreen option to the context menu
         * @private
         * @return {?}
         */
        TdCodeEditorComponent.prototype.addFullScreenModeCommand = function () {
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
                run: ( /**
                 * @param {?} ed
                 * @return {?}
                 */function (ed) {
                    _this.showFullScreenEditor();
                }),
            });
        };
        return TdCodeEditorComponent;
    }());
    TdCodeEditorComponent.decorators = [
        { type: core.Component, args: [{
                    selector: 'td-code-editor',
                    template: "<div class=\"editorContainer\" #editorContainer></div>\n",
                    providers: [
                        {
                            provide: forms.NG_VALUE_ACCESSOR,
                            useExisting: core.forwardRef(( /**
                             * @return {?}
                             */function () { return TdCodeEditorComponent; })),
                            multi: true,
                        },
                    ],
                    styles: [":host{display:block;position:relative}:host .editorContainer{bottom:0;left:0;position:absolute;right:0;top:0}::ng-deep .monaco-aria-container{display:none}"]
                }] }
    ];
    /** @nocollapse */
    TdCodeEditorComponent.ctorParameters = function () { return [
        { type: core.NgZone },
        { type: core.ChangeDetectorRef },
        { type: core.ElementRef }
    ]; };
    TdCodeEditorComponent.propDecorators = {
        _editorContainer: [{ type: core.ViewChild, args: ['editorContainer', { static: true },] }],
        editorInitialized: [{ type: core.Output }],
        editorConfigurationChanged: [{ type: core.Output }],
        editorLanguageChanged: [{ type: core.Output }],
        editorValueChange: [{ type: core.Output }],
        change: [{ type: core.Output }],
        value: [{ type: core.Input, args: ['value',] }],
        language: [{ type: core.Input, args: ['language',] }],
        editorStyle: [{ type: core.Input, args: ['editorStyle',] }],
        theme: [{ type: core.Input, args: ['theme',] }],
        fullScreenKeyBinding: [{ type: core.Input, args: ['fullScreenKeyBinding',] }],
        editorOptions: [{ type: core.Input, args: ['editorOptions',] }]
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
        TdCodeEditorComponent.prototype._editor;
        /**
         * @type {?}
         * @private
         */
        TdCodeEditorComponent.prototype._fromEditor;
        /**
         * @type {?}
         * @private
         */
        TdCodeEditorComponent.prototype._componentInitialized;
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

    /**
     * @fileoverview added by tsickle
     * Generated from: code-editor.module.ts
     * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    var CovalentCodeEditorModule = /** @class */ (function () {
        function CovalentCodeEditorModule() {
        }
        return CovalentCodeEditorModule;
    }());
    CovalentCodeEditorModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [common.CommonModule],
                    declarations: [TdCodeEditorComponent],
                    exports: [TdCodeEditorComponent],
                    bootstrap: [TdCodeEditorComponent],
                },] }
    ];

    /**
     * @fileoverview added by tsickle
     * Generated from: public-api.ts
     * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */

    /**
     * @fileoverview added by tsickle
     * Generated from: index.ts
     * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */

    /**
     * @fileoverview added by tsickle
     * Generated from: covalent-code-editor.ts
     * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */

    exports.CovalentCodeEditorModule = CovalentCodeEditorModule;
    exports.TdCodeEditorComponent = TdCodeEditorComponent;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=covalent-code-editor.umd.js.map
