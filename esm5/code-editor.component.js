/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { __read, __spread, __values } from "tslib";
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, forwardRef, NgZone, ChangeDetectorRef, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { fromEvent, merge, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
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
import * as monaco from 'monaco-editor';
var TdCodeEditorComponent = /** @class */ (function () {
    // tslint:disable-next-line:member-ordering
    function TdCodeEditorComponent(zone, _changeDetectorRef, _elementRef) {
        this.zone = zone;
        this._changeDetectorRef = _changeDetectorRef;
        this._elementRef = _elementRef;
        this._destroy = new Subject();
        this._widthSubject = new Subject();
        this._heightSubject = new Subject();
        this._editorStyle = 'width:100%;height:100%;border:1px solid grey;';
        this._value = '';
        this._theme = 'vs';
        this._language = 'javascript';
        this._subject = new Subject();
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
    }
    Object.defineProperty(TdCodeEditorComponent.prototype, "value", {
        get: /**
         * @return {?}
         */
        function () {
            return this._value;
        },
        /**
         * value?: string
         */
        set: /**
         * value?: string
         * @param {?} value
         * @return {?}
         */
        function (value) {
            if (value === this._value) {
                return;
            }
            this._value = value;
            if (this._componentInitialized) {
                this.applyValue();
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    TdCodeEditorComponent.prototype.applyValue = /**
     * @return {?}
     */
    function () {
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
            setTimeout((/**
             * @return {?}
             */
            function () {
                _this._subject.next(_this._value);
                _this._subject.complete();
                _this._subject = new Subject();
            }));
            return this._subject.asObservable();
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
            this._language = language;
            if (this._componentInitialized) {
                this.applyLanguage();
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    TdCodeEditorComponent.prototype.applyLanguage = /**
     * @return {?}
     */
    function () {
        if (this._language) {
            monaco.editor.setModelLanguage(this._editor.getModel(), this._language);
            this.editorLanguageChanged.emit();
        }
    };
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
            this._registeredLanguagesStyles = __spread(this._registeredLanguagesStyles, [css]);
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
            this._editorStyle = editorStyle;
            if (this._componentInitialized) {
                this.applyStyle();
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    TdCodeEditorComponent.prototype.applyStyle = /**
     * @return {?}
     */
    function () {
        if (this._editorStyle) {
            /** @type {?} */
            var containerDiv = this._editorContainer.nativeElement;
            containerDiv.setAttribute('style', this._editorStyle);
        }
    };
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
                this._editor.updateOptions({ theme: theme });
                this.editorConfigurationChanged.emit();
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
                this._editor.updateOptions(editorOptions);
                this.editorConfigurationChanged.emit();
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
            this._editor.layout();
        }
    };
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
     * @return {?}
     */
    TdCodeEditorComponent.prototype.ngOnInit = /**
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
        this._componentInitialized = true;
        setTimeout((/**
         * @return {?}
         */
        function () {
            _this.applyLanguage();
            _this._fromEditor = true;
            _this.applyValue();
            _this.applyStyle();
            _this.editorInitialized.emit(_this._editor);
            _this.editorConfigurationChanged.emit();
        }));
        this._editor.getModel().onDidChangeContent((/**
         * @param {?} e
         * @return {?}
         */
        function (e) {
            _this._fromEditor = true;
            _this.writeValue(_this._editor.getValue());
            _this.layout();
        }));
        this.addFullScreenModeCommand();
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
        this._registeredLanguagesStyles.forEach((/**
         * @param {?} style
         * @return {?}
         */
        function (style) { return style.remove(); }));
        if (this._editor) {
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
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS1lZGl0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGNvdmFsZW50L2NvZGUtZWRpdG9yLyIsInNvdXJjZXMiOlsiY29kZS1lZGl0b3IuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFlBQVksRUFFWixTQUFTLEVBQ1QsVUFBVSxFQUNWLFVBQVUsRUFDVixNQUFNLEVBQ04saUJBQWlCLEdBRWxCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxpQkFBaUIsRUFBd0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6RSxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvQyxPQUFPLEVBQUUsWUFBWSxFQUFFLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDOztJQUV6RSxJQUFJOzs7QUFBUTtJQUNoQixlQUFlO0FBQ2pCLENBQUMsQ0FBQTs7OztJQUdHLGFBQWEsR0FBVyxDQUFDO0FBQzdCLE9BQU8sS0FBSyxNQUFNLE1BQU0sZUFBZSxDQUFDO0FBRXhDO0lBbVJFLDJDQUEyQztJQUMzQywrQkFBb0IsSUFBWSxFQUFVLGtCQUFxQyxFQUFVLFdBQXVCO1FBQTVGLFNBQUksR0FBSixJQUFJLENBQVE7UUFBVSx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW1CO1FBQVUsZ0JBQVcsR0FBWCxXQUFXLENBQVk7UUF2UXhHLGFBQVEsR0FBcUIsSUFBSSxPQUFPLEVBQVcsQ0FBQztRQUNwRCxrQkFBYSxHQUFvQixJQUFJLE9BQU8sRUFBVSxDQUFDO1FBQ3ZELG1CQUFjLEdBQW9CLElBQUksT0FBTyxFQUFVLENBQUM7UUFFeEQsaUJBQVksR0FBVywrQ0FBK0MsQ0FBQztRQUN2RSxXQUFNLEdBQVcs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QkFBaUI7Z0JBSGpCLFVBQVU7OzttQ0FrRFQsU0FBUyxTQUFDLGlCQUFpQixFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtvQ0FNN0MsTUFBTTs2Q0FNTixNQUFNO3dDQU1OLE1BQU07b0NBTU4sTUFBTTt5QkFNTixNQUFNO3dCQVFOLEtBQUssU0FBQyxPQUFPOzJCQTZEYixLQUFLLFNBQUMsVUFBVTs4QkFnRWhCLEtBQUssU0FBQyxhQUFhO3dCQXVCbkIsS0FBSyxTQUFDLE9BQU87dUNBaUJiLEtBQUssU0FBQyxzQkFBc0I7Z0NBYTVCLEtBQUssU0FBQyxlQUFlOztJQW1LeEIsNEJBQUM7Q0FBQSxBQTFaRCxJQTBaQztTQTlZWSxxQkFBcUI7Ozs7OztJQUNoQyx5Q0FBNEQ7Ozs7O0lBQzVELDhDQUErRDs7Ozs7SUFDL0QsK0NBQWdFOzs7OztJQUVoRSw2Q0FBK0U7Ozs7O0lBQy9FLHVDQUE0Qjs7Ozs7SUFDNUIsdUNBQThCOzs7OztJQUM5QiwwQ0FBeUM7Ozs7O0lBQ3pDLHlDQUFrRDs7Ozs7SUFDbEQsc0RBQWlGOzs7OztJQUNqRix3Q0FBcUI7Ozs7O0lBQ3JCLDRDQUFxQzs7Ozs7SUFDckMsc0RBQStDOzs7OztJQUMvQywrQ0FBaUM7Ozs7O0lBQ2pDLDhDQUF1Qzs7Ozs7SUFDdkMseUNBQXNCOzs7OztJQUN0QiwyREFBNEQ7O0lBRTVELGlEQUE2RTs7Ozs7O0lBTTdFLGtEQUEyRTs7Ozs7O0lBTTNFLDJEQUFvRjs7Ozs7O0lBTXBGLHNEQUErRTs7Ozs7O0lBTS9FLGtEQUEyRTs7Ozs7O0lBTTNFLHVDQUFnRTs7SUFFaEUsZ0RBQWlDOztJQUNqQywwQ0FBdUI7Ozs7O0lBb05YLHFDQUFvQjs7Ozs7SUFBRSxtREFBNkM7Ozs7O0lBQUUsNENBQStCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9uZW50LFxuICBJbnB1dCxcbiAgT3V0cHV0LFxuICBFdmVudEVtaXR0ZXIsXG4gIE9uSW5pdCxcbiAgVmlld0NoaWxkLFxuICBFbGVtZW50UmVmLFxuICBmb3J3YXJkUmVmLFxuICBOZ1pvbmUsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBPbkRlc3Ryb3ksXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTkdfVkFMVUVfQUNDRVNTT1IsIENvbnRyb2xWYWx1ZUFjY2Vzc29yIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZnJvbUV2ZW50LCBtZXJnZSwgdGltZXIgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGRlYm91bmNlVGltZSwgZGlzdGluY3RVbnRpbENoYW5nZWQsIHRha2VVbnRpbCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuY29uc3Qgbm9vcDogYW55ID0gKCkgPT4ge1xuICAvLyBlbXB0eSBtZXRob2Rcbn07XG5cbi8vIGNvdW50ZXIgZm9yIGlkcyB0byBhbGxvdyBmb3IgbXVsdGlwbGUgZWRpdG9ycyBvbiBvbmUgcGFnZVxubGV0IHVuaXF1ZUNvdW50ZXI6IG51bWJlciA9IDA7XG5pbXBvcnQgKiBhcyBtb25hY28gZnJvbSAnbW9uYWNvLWVkaXRvcic7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3RkLWNvZGUtZWRpdG9yJyxcbiAgdGVtcGxhdGVVcmw6ICcuL2NvZGUtZWRpdG9yLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vY29kZS1lZGl0b3IuY29tcG9uZW50LnNjc3MnXSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG4gICAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBUZENvZGVFZGl0b3JDb21wb25lbnQpLFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgVGRDb2RlRWRpdG9yQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBDb250cm9sVmFsdWVBY2Nlc3NvciwgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBfZGVzdHJveTogU3ViamVjdDxib29sZWFuPiA9IG5ldyBTdWJqZWN0PGJvb2xlYW4+KCk7XG4gIHByaXZhdGUgX3dpZHRoU3ViamVjdDogU3ViamVjdDxudW1iZXI+ID0gbmV3IFN1YmplY3Q8bnVtYmVyPigpO1xuICBwcml2YXRlIF9oZWlnaHRTdWJqZWN0OiBTdWJqZWN0PG51bWJlcj4gPSBuZXcgU3ViamVjdDxudW1iZXI+KCk7XG5cbiAgcHJpdmF0ZSBfZWRpdG9yU3R5bGU6IHN0cmluZyA9ICd3aWR0aDoxMDAlO2hlaWdodDoxMDAlO2JvcmRlcjoxcHggc29saWQgZ3JleTsnO1xuICBwcml2YXRlIF92YWx1ZTogc3RyaW5nID0gJyc7XG4gIHByaXZhdGUgX3RoZW1lOiBzdHJpbmcgPSAndnMnO1xuICBwcml2YXRlIF9sYW5ndWFnZTogc3RyaW5nID0gJ2phdmFzY3JpcHQnO1xuICBwcml2YXRlIF9zdWJqZWN0OiBTdWJqZWN0PHN0cmluZz4gPSBuZXcgU3ViamVjdCgpO1xuICBwcml2YXRlIF9lZGl0b3JJbm5lckNvbnRhaW5lcjogc3RyaW5nID0gJ2VkaXRvcklubmVyQ29udGFpbmVyJyArIHVuaXF1ZUNvdW50ZXIrKztcbiAgcHJpdmF0ZSBfZWRpdG9yOiBhbnk7XG4gIHByaXZhdGUgX2Zyb21FZGl0b3I6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfY29tcG9uZW50SW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfZWRpdG9yT3B0aW9uczogYW55ID0ge307XG4gIHByaXZhdGUgX2lzRnVsbFNjcmVlbjogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9rZXljb2RlOiBhbnk7XG4gIHByaXZhdGUgX3JlZ2lzdGVyZWRMYW5ndWFnZXNTdHlsZXM6IEhUTUxTdHlsZUVsZW1lbnRbXSA9IFtdO1xuXG4gIEBWaWV3Q2hpbGQoJ2VkaXRvckNvbnRhaW5lcicsIHsgc3RhdGljOiB0cnVlIH0pIF9lZGl0b3JDb250YWluZXI6IEVsZW1lbnRSZWY7XG5cbiAgLyoqXG4gICAqIGVkaXRvckluaXRpYWxpemVkOiBmdW5jdGlvbigkZXZlbnQpXG4gICAqIEV2ZW50IGVtaXR0ZWQgd2hlbiBlZGl0b3IgaXMgZmlyc3QgaW5pdGlhbGl6ZWRcbiAgICovXG4gIEBPdXRwdXQoKSBlZGl0b3JJbml0aWFsaXplZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBlZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZDogZnVuY3Rpb24oJGV2ZW50KVxuICAgKiBFdmVudCBlbWl0dGVkIHdoZW4gZWRpdG9yJ3MgY29uZmlndXJhdGlvbiBjaGFuZ2VzXG4gICAqL1xuICBAT3V0cHV0KCkgZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAvKipcbiAgICogZWRpdG9yTGFuZ3VhZ2VDaGFuZ2VkOiBmdW5jdGlvbigkZXZlbnQpXG4gICAqIEV2ZW50IGVtaXR0ZWQgd2hlbiBlZGl0b3IncyBMYW5ndWFnZSBjaGFuZ2VzXG4gICAqL1xuICBAT3V0cHV0KCkgZWRpdG9yTGFuZ3VhZ2VDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIGVkaXRvclZhbHVlQ2hhbmdlOiBmdW5jdGlvbigkZXZlbnQpXG4gICAqIEV2ZW50IGVtaXR0ZWQgYW55IHRpbWUgc29tZXRoaW5nIGNoYW5nZXMgdGhlIGVkaXRvciB2YWx1ZVxuICAgKi9cbiAgQE91dHB1dCgpIGVkaXRvclZhbHVlQ2hhbmdlOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIFRoZSBjaGFuZ2UgZXZlbnQgbm90aWZpZXMgeW91IGFib3V0IGEgY2hhbmdlIGhhcHBlbmluZyBpbiBhbiBpbnB1dCBmaWVsZC5cbiAgICogU2luY2UgdGhlIGNvbXBvbmVudCBpcyBub3QgYSBuYXRpdmUgQW5ndWxhciBjb21wb25lbnQgaGF2ZSB0byBzcGVjaWZpeSB0aGUgZXZlbnQgZW1pdHRlciBvdXJzZWxmXG4gICAqL1xuICBAT3V0cHV0KCkgY2hhbmdlOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG4gIC8qIHRzbGludDpkaXNhYmxlLW5leHQtbGluZSAqL1xuICBwcm9wYWdhdGVDaGFuZ2UgPSAoXzogYW55KSA9PiB7fTtcbiAgb25Ub3VjaGVkID0gKCkgPT4gbm9vcDtcblxuICAvKipcbiAgICogdmFsdWU/OiBzdHJpbmdcbiAgICovXG4gIEBJbnB1dCgndmFsdWUnKVxuICBzZXQgdmFsdWUodmFsdWU6IHN0cmluZykge1xuICAgIGlmICh2YWx1ZSA9PT0gdGhpcy5fdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIHRoaXMuYXBwbHlWYWx1ZSgpO1xuICAgIH1cbiAgfVxuXG4gIGdldCB2YWx1ZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgfVxuXG4gIGFwcGx5VmFsdWUoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9mcm9tRWRpdG9yKSB7XG4gICAgICB0aGlzLl9lZGl0b3Iuc2V0VmFsdWUodGhpcy5fdmFsdWUpO1xuICAgIH1cbiAgICB0aGlzLl9mcm9tRWRpdG9yID0gZmFsc2U7XG4gICAgdGhpcy5wcm9wYWdhdGVDaGFuZ2UodGhpcy5fdmFsdWUpO1xuICAgIHRoaXMuY2hhbmdlLmVtaXQoKTtcbiAgICB0aGlzLmVkaXRvclZhbHVlQ2hhbmdlLmVtaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICAgKi9cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgLy8gZG8gbm90IHdyaXRlIGlmIG51bGwgb3IgdW5kZWZpbmVkXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lXG4gICAgaWYgKHZhbHVlICE9IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BhZ2F0ZUNoYW5nZSA9IGZuO1xuICB9XG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLm9uVG91Y2hlZCA9IGZuO1xuICB9XG5cbiAgLyoqXG4gICAqIGdldEVkaXRvckNvbnRlbnQ/OiBmdW5jdGlvblxuICAgKiBSZXR1cm5zIHRoZSBjb250ZW50IHdpdGhpbiB0aGUgZWRpdG9yXG4gICAqL1xuICBnZXRWYWx1ZSgpOiBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuX3N1YmplY3QubmV4dCh0aGlzLl92YWx1ZSk7XG4gICAgICAgIHRoaXMuX3N1YmplY3QuY29tcGxldGUoKTtcbiAgICAgICAgdGhpcy5fc3ViamVjdCA9IG5ldyBTdWJqZWN0KCk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzLl9zdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBsYW5ndWFnZT86IHN0cmluZ1xuICAgKiBsYW5ndWFnZSB1c2VkIGluIGVkaXRvclxuICAgKi9cbiAgQElucHV0KCdsYW5ndWFnZScpXG4gIHNldCBsYW5ndWFnZShsYW5ndWFnZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fbGFuZ3VhZ2UgPSBsYW5ndWFnZTtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIHRoaXMuYXBwbHlMYW5ndWFnZSgpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBsYW5ndWFnZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9sYW5ndWFnZTtcbiAgfVxuXG4gIGFwcGx5TGFuZ3VhZ2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2xhbmd1YWdlKSB7XG4gICAgICBtb25hY28uZWRpdG9yLnNldE1vZGVsTGFuZ3VhZ2UodGhpcy5fZWRpdG9yLmdldE1vZGVsKCksIHRoaXMuX2xhbmd1YWdlKTtcbiAgICAgIHRoaXMuZWRpdG9yTGFuZ3VhZ2VDaGFuZ2VkLmVtaXQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogcmVnaXN0ZXJMYW5ndWFnZT86IGZ1bmN0aW9uXG4gICAqIFJlZ2lzdGVycyBhIGN1c3RvbSBMYW5ndWFnZSB3aXRoaW4gdGhlIGVkaXRvclxuICAgKi9cbiAgcmVnaXN0ZXJMYW5ndWFnZShsYW5ndWFnZTogYW55KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBmb3IgKGNvbnN0IHByb3ZpZGVyIG9mIGxhbmd1YWdlLmNvbXBsZXRpb25JdGVtUHJvdmlkZXIpIHtcbiAgICAgICAgLyogdHNsaW50OmRpc2FibGUtbmV4dC1saW5lICovXG4gICAgICAgIHByb3ZpZGVyLmtpbmQgPSBldmFsKHByb3ZpZGVyLmtpbmQpO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCBtb25hcmNoVG9rZW5zIG9mIGxhbmd1YWdlLm1vbmFyY2hUb2tlbnNQcm92aWRlcikge1xuICAgICAgICAvKiB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmUgKi9cbiAgICAgICAgbW9uYXJjaFRva2Vuc1swXSA9IGV2YWwobW9uYXJjaFRva2Vuc1swXSk7XG4gICAgICB9XG4gICAgICBtb25hY28ubGFuZ3VhZ2VzLnJlZ2lzdGVyKHsgaWQ6IGxhbmd1YWdlLmlkIH0pO1xuXG4gICAgICBtb25hY28ubGFuZ3VhZ2VzLnNldE1vbmFyY2hUb2tlbnNQcm92aWRlcihsYW5ndWFnZS5pZCwge1xuICAgICAgICB0b2tlbml6ZXI6IHtcbiAgICAgICAgICByb290OiBsYW5ndWFnZS5tb25hcmNoVG9rZW5zUHJvdmlkZXIsXG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgICAgLy8gRGVmaW5lIGEgbmV3IHRoZW1lIHRoYXQgY29uc3RhaW5zIG9ubHkgcnVsZXMgdGhhdCBtYXRjaCB0aGlzIGxhbmd1YWdlXG4gICAgICBtb25hY28uZWRpdG9yLmRlZmluZVRoZW1lKGxhbmd1YWdlLmN1c3RvbVRoZW1lLmlkLCBsYW5ndWFnZS5jdXN0b21UaGVtZS50aGVtZSk7XG4gICAgICB0aGlzLl90aGVtZSA9IGxhbmd1YWdlLmN1c3RvbVRoZW1lLmlkO1xuXG4gICAgICBtb25hY28ubGFuZ3VhZ2VzLnJlZ2lzdGVyQ29tcGxldGlvbkl0ZW1Qcm92aWRlcihsYW5ndWFnZS5pZCwge1xuICAgICAgICBwcm92aWRlQ29tcGxldGlvbkl0ZW1zOiAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGxhbmd1YWdlLmNvbXBsZXRpb25JdGVtUHJvdmlkZXI7XG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgY3NzOiBIVE1MU3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgIGNzcy50eXBlID0gJ3RleHQvY3NzJztcbiAgICAgIGNzcy5pbm5lckhUTUwgPSBsYW5ndWFnZS5tb25hcmNoVG9rZW5zUHJvdmlkZXJDU1M7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNzcyk7XG4gICAgICB0aGlzLmVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkLmVtaXQoKTtcbiAgICAgIHRoaXMuX3JlZ2lzdGVyZWRMYW5ndWFnZXNTdHlsZXMgPSBbLi4udGhpcy5fcmVnaXN0ZXJlZExhbmd1YWdlc1N0eWxlcywgY3NzXTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogc3R5bGU/OiBzdHJpbmdcbiAgICogY3NzIHN0eWxlIG9mIHRoZSBlZGl0b3Igb24gdGhlIHBhZ2VcbiAgICovXG4gIEBJbnB1dCgnZWRpdG9yU3R5bGUnKVxuICBzZXQgZWRpdG9yU3R5bGUoZWRpdG9yU3R5bGU6IHN0cmluZykge1xuICAgIHRoaXMuX2VkaXRvclN0eWxlID0gZWRpdG9yU3R5bGU7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICB0aGlzLmFwcGx5U3R5bGUoKTtcbiAgICB9XG4gIH1cblxuICBnZXQgZWRpdG9yU3R5bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdG9yU3R5bGU7XG4gIH1cblxuICBhcHBseVN0eWxlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9lZGl0b3JTdHlsZSkge1xuICAgICAgY29uc3QgY29udGFpbmVyRGl2OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50O1xuICAgICAgY29udGFpbmVyRGl2LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCB0aGlzLl9lZGl0b3JTdHlsZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHRoZW1lPzogc3RyaW5nXG4gICAqIFRoZW1lIHRvIGJlIGFwcGxpZWQgdG8gZWRpdG9yXG4gICAqL1xuICBASW5wdXQoJ3RoZW1lJylcbiAgc2V0IHRoZW1lKHRoZW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLl90aGVtZSA9IHRoZW1lO1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgdGhpcy5fZWRpdG9yLnVwZGF0ZU9wdGlvbnMoeyB0aGVtZSB9KTtcbiAgICAgIHRoaXMuZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCgpO1xuICAgIH1cbiAgfVxuICBnZXQgdGhlbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fdGhlbWU7XG4gIH1cblxuICAvKipcbiAgICogZnVsbFNjcmVlbktleUJpbmRpbmc/OiBudW1iZXJcbiAgICogU2VlIGhlcmUgZm9yIGtleSBiaW5kaW5ncyBodHRwczovL21pY3Jvc29mdC5naXRodWIuaW8vbW9uYWNvLWVkaXRvci9hcGkvZW51bXMvbW9uYWNvLmtleWNvZGUuaHRtbFxuICAgKiBTZXRzIHRoZSBLZXlDb2RlIGZvciBzaG9ydGN1dHRpbmcgdG8gRnVsbHNjcmVlbiBtb2RlXG4gICAqL1xuICBASW5wdXQoJ2Z1bGxTY3JlZW5LZXlCaW5kaW5nJylcbiAgc2V0IGZ1bGxTY3JlZW5LZXlCaW5kaW5nKGtleWNvZGU6IG51bWJlcltdKSB7XG4gICAgdGhpcy5fa2V5Y29kZSA9IGtleWNvZGU7XG4gIH1cbiAgZ2V0IGZ1bGxTY3JlZW5LZXlCaW5kaW5nKCk6IG51bWJlcltdIHtcbiAgICByZXR1cm4gdGhpcy5fa2V5Y29kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBlZGl0b3JPcHRpb25zPzogb2JqZWN0XG4gICAqIE9wdGlvbnMgdXNlZCBvbiBlZGl0b3IgaW5zdGFudGlhdGlvbi4gQXZhaWxhYmxlIG9wdGlvbnMgbGlzdGVkIGhlcmU6XG4gICAqIGh0dHBzOi8vbWljcm9zb2Z0LmdpdGh1Yi5pby9tb25hY28tZWRpdG9yL2FwaS9pbnRlcmZhY2VzL21vbmFjby5lZGl0b3IuaWVkaXRvcm9wdGlvbnMuaHRtbFxuICAgKi9cbiAgQElucHV0KCdlZGl0b3JPcHRpb25zJylcbiAgc2V0IGVkaXRvck9wdGlvbnMoZWRpdG9yT3B0aW9uczogYW55KSB7XG4gICAgdGhpcy5fZWRpdG9yT3B0aW9ucyA9IGVkaXRvck9wdGlvbnM7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICB0aGlzLl9lZGl0b3IudXBkYXRlT3B0aW9ucyhlZGl0b3JPcHRpb25zKTtcbiAgICAgIHRoaXMuZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCgpO1xuICAgIH1cbiAgfVxuICBnZXQgZWRpdG9yT3B0aW9ucygpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl9lZGl0b3JPcHRpb25zO1xuICB9XG5cbiAgLyoqXG4gICAqIGxheW91dCBtZXRob2QgdGhhdCBjYWxscyBsYXlvdXQgbWV0aG9kIG9mIGVkaXRvciBhbmQgaW5zdHJ1Y3RzIHRoZSBlZGl0b3IgdG8gcmVtZWFzdXJlIGl0cyBjb250YWluZXJcbiAgICovXG4gIGxheW91dCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIHRoaXMuX2VkaXRvci5sYXlvdXQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBpZiBpbiBGdWxsIFNjcmVlbiBNb2RlIG9yIG5vdFxuICAgKi9cbiAgZ2V0IGlzRnVsbFNjcmVlbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNGdWxsU2NyZWVuO1xuICB9XG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1lbWJlci1vcmRlcmluZ1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHpvbmU6IE5nWm9uZSwgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLCBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7fVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRhaW5lckRpdjogSFRNTERpdkVsZW1lbnQgPSB0aGlzLl9lZGl0b3JDb250YWluZXIubmF0aXZlRWxlbWVudDtcbiAgICBjb250YWluZXJEaXYuaWQgPSB0aGlzLl9lZGl0b3JJbm5lckNvbnRhaW5lcjtcblxuICAgIHRoaXMuX2VkaXRvciA9IG1vbmFjby5lZGl0b3IuY3JlYXRlKFxuICAgICAgY29udGFpbmVyRGl2LFxuICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAge1xuICAgICAgICAgIHZhbHVlOiB0aGlzLl92YWx1ZSxcbiAgICAgICAgICBsYW5ndWFnZTogdGhpcy5sYW5ndWFnZSxcbiAgICAgICAgICB0aGVtZTogdGhpcy5fdGhlbWUsXG4gICAgICAgIH0sXG4gICAgICAgIHRoaXMuZWRpdG9yT3B0aW9ucyxcbiAgICAgICksXG4gICAgKTtcbiAgICB0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCA9IHRydWU7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLmFwcGx5TGFuZ3VhZ2UoKTtcbiAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSB0cnVlO1xuICAgICAgdGhpcy5hcHBseVZhbHVlKCk7XG4gICAgICB0aGlzLmFwcGx5U3R5bGUoKTtcbiAgICAgIHRoaXMuZWRpdG9ySW5pdGlhbGl6ZWQuZW1pdCh0aGlzLl9lZGl0b3IpO1xuICAgICAgdGhpcy5lZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZC5lbWl0KCk7XG4gICAgfSk7XG4gICAgdGhpcy5fZWRpdG9yLmdldE1vZGVsKCkub25EaWRDaGFuZ2VDb250ZW50KChlOiBhbnkpID0+IHtcbiAgICAgIHRoaXMuX2Zyb21FZGl0b3IgPSB0cnVlO1xuICAgICAgdGhpcy53cml0ZVZhbHVlKHRoaXMuX2VkaXRvci5nZXRWYWx1ZSgpKTtcbiAgICAgIHRoaXMubGF5b3V0KCk7XG4gICAgfSk7XG4gICAgdGhpcy5hZGRGdWxsU2NyZWVuTW9kZUNvbW1hbmQoKTtcblxuICAgIG1lcmdlKFxuICAgICAgZnJvbUV2ZW50KHdpbmRvdywgJ3Jlc2l6ZScpLnBpcGUoZGVib3VuY2VUaW1lKDEwMCkpLFxuICAgICAgdGhpcy5fd2lkdGhTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpLnBpcGUoZGlzdGluY3RVbnRpbENoYW5nZWQoKSksXG4gICAgICB0aGlzLl9oZWlnaHRTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpLnBpcGUoZGlzdGluY3RVbnRpbENoYW5nZWQoKSksXG4gICAgKVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3kpLCBkZWJvdW5jZVRpbWUoMTAwKSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICB0aGlzLmxheW91dCgpO1xuICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICAgIH0pO1xuICAgIHRpbWVyKDUwMCwgMjUwKVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3kpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9lbGVtZW50UmVmICYmIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkge1xuICAgICAgICAgIHRoaXMuX3dpZHRoU3ViamVjdC5uZXh0KCg8SFRNTEVsZW1lbnQ+dGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCk7XG4gICAgICAgICAgdGhpcy5faGVpZ2h0U3ViamVjdC5uZXh0KCg8SFRNTEVsZW1lbnQ+dGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLmRldGFjaCgpO1xuICAgIHRoaXMuX3JlZ2lzdGVyZWRMYW5ndWFnZXNTdHlsZXMuZm9yRWFjaCgoc3R5bGU6IEhUTUxTdHlsZUVsZW1lbnQpID0+IHN0eWxlLnJlbW92ZSgpKTtcbiAgICBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICB0aGlzLl9lZGl0b3IuZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9kZXN0cm95Lm5leHQodHJ1ZSk7XG4gICAgdGhpcy5fZGVzdHJveS51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIHNob3dGdWxsU2NyZWVuRWRpdG9yIHJlcXVlc3QgZm9yIGZ1bGwgc2NyZWVuIG9mIENvZGUgRWRpdG9yIGJhc2VkIG9uIGl0cyBicm93c2VyIHR5cGUuXG4gICAqL1xuICBwdWJsaWMgc2hvd0Z1bGxTY3JlZW5FZGl0b3IoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBjb25zdCBjb2RlRWRpdG9yRWxlbWVudDogSFRNTERpdkVsZW1lbnQgPSB0aGlzLl9lZGl0b3JDb250YWluZXIubmF0aXZlRWxlbWVudCBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICAgIGNvbnN0IGZ1bGxTY3JlZW5NYXA6IG9iamVjdCA9IHtcbiAgICAgICAgLy8gQ2hyb21lXG4gICAgICAgIHJlcXVlc3RGdWxsc2NyZWVuOiAoKSA9PiBjb2RlRWRpdG9yRWxlbWVudC5yZXF1ZXN0RnVsbHNjcmVlbigpLFxuICAgICAgICAvLyBTYWZhcmlcbiAgICAgICAgd2Via2l0UmVxdWVzdEZ1bGxzY3JlZW46ICgpID0+ICg8YW55PmNvZGVFZGl0b3JFbGVtZW50KS53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbigpLFxuICAgICAgICAvLyBJRVxuICAgICAgICBtc1JlcXVlc3RGdWxsc2NyZWVuOiAoKSA9PiAoPGFueT5jb2RlRWRpdG9yRWxlbWVudCkubXNSZXF1ZXN0RnVsbHNjcmVlbigpLFxuICAgICAgICAvLyBGaXJlZm94XG4gICAgICAgIG1velJlcXVlc3RGdWxsU2NyZWVuOiAoKSA9PiAoPGFueT5jb2RlRWRpdG9yRWxlbWVudCkubW96UmVxdWVzdEZ1bGxTY3JlZW4oKSxcbiAgICAgIH07XG5cbiAgICAgIGZvciAoY29uc3QgaGFuZGxlciBvZiBPYmplY3Qua2V5cyhmdWxsU2NyZWVuTWFwKSkge1xuICAgICAgICBpZiAoY29kZUVkaXRvckVsZW1lbnRbaGFuZGxlcl0pIHtcbiAgICAgICAgICBmdWxsU2NyZWVuTWFwW2hhbmRsZXJdKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5faXNGdWxsU2NyZWVuID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBleGl0RnVsbFNjcmVlbkVkaXRvciByZXF1ZXN0IHRvIGV4aXQgZnVsbCBzY3JlZW4gb2YgQ29kZSBFZGl0b3IgYmFzZWQgb24gaXRzIGJyb3dzZXIgdHlwZS5cbiAgICovXG4gIHB1YmxpYyBleGl0RnVsbFNjcmVlbkVkaXRvcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGNvbnN0IGV4aXRGdWxsU2NyZWVuTWFwOiBvYmplY3QgPSB7XG4gICAgICAgIC8vIENocm9tZVxuICAgICAgICBleGl0RnVsbHNjcmVlbjogKCkgPT4gZG9jdW1lbnQuZXhpdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgLy8gU2FmYXJpXG4gICAgICAgIHdlYmtpdEV4aXRGdWxsc2NyZWVuOiAoKSA9PiAoPGFueT5kb2N1bWVudCkud2Via2l0RXhpdEZ1bGxzY3JlZW4oKSxcbiAgICAgICAgLy8gRmlyZWZveFxuICAgICAgICBtb3pDYW5jZWxGdWxsU2NyZWVuOiAoKSA9PiAoPGFueT5kb2N1bWVudCkubW96Q2FuY2VsRnVsbFNjcmVlbigpLFxuICAgICAgICAvLyBJRVxuICAgICAgICBtc0V4aXRGdWxsc2NyZWVuOiAoKSA9PiAoPGFueT5kb2N1bWVudCkubXNFeGl0RnVsbHNjcmVlbigpLFxuICAgICAgfTtcblxuICAgICAgZm9yIChjb25zdCBoYW5kbGVyIG9mIE9iamVjdC5rZXlzKGV4aXRGdWxsU2NyZWVuTWFwKSkge1xuICAgICAgICBpZiAoZG9jdW1lbnRbaGFuZGxlcl0pIHtcbiAgICAgICAgICBleGl0RnVsbFNjcmVlbk1hcFtoYW5kbGVyXSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2lzRnVsbFNjcmVlbiA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIGFkZEZ1bGxTY3JlZW5Nb2RlQ29tbWFuZCB1c2VkIHRvIGFkZCB0aGUgZnVsbHNjcmVlbiBvcHRpb24gdG8gdGhlIGNvbnRleHQgbWVudVxuICAgKi9cbiAgcHJpdmF0ZSBhZGRGdWxsU2NyZWVuTW9kZUNvbW1hbmQoKTogdm9pZCB7XG4gICAgdGhpcy5fZWRpdG9yLmFkZEFjdGlvbih7XG4gICAgICAvLyBBbiB1bmlxdWUgaWRlbnRpZmllciBvZiB0aGUgY29udHJpYnV0ZWQgYWN0aW9uLlxuICAgICAgaWQ6ICdmdWxsU2NyZWVuJyxcbiAgICAgIC8vIEEgbGFiZWwgb2YgdGhlIGFjdGlvbiB0aGF0IHdpbGwgYmUgcHJlc2VudGVkIHRvIHRoZSB1c2VyLlxuICAgICAgbGFiZWw6ICdGdWxsIFNjcmVlbicsXG4gICAgICAvLyBBbiBvcHRpb25hbCBhcnJheSBvZiBrZXliaW5kaW5ncyBmb3IgdGhlIGFjdGlvbi5cbiAgICAgIGNvbnRleHRNZW51R3JvdXBJZDogJ25hdmlnYXRpb24nLFxuICAgICAga2V5YmluZGluZ3M6IHRoaXMuX2tleWNvZGUsXG4gICAgICBjb250ZXh0TWVudU9yZGVyOiAxLjUsXG4gICAgICAvLyBNZXRob2QgdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGFjdGlvbiBpcyB0cmlnZ2VyZWQuXG4gICAgICAvLyBAcGFyYW0gZWRpdG9yIFRoZSBlZGl0b3IgaW5zdGFuY2UgaXMgcGFzc2VkIGluIGFzIGEgY29udmluaWVuY2VcbiAgICAgIHJ1bjogKGVkOiBhbnkpID0+IHtcbiAgICAgICAgdGhpcy5zaG93RnVsbFNjcmVlbkVkaXRvcigpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfVxufVxuIl19