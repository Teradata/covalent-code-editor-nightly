/**
 * @fileoverview added by tsickle
 * Generated from: code-editor.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, forwardRef, NgZone, ChangeDetectorRef, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { fromEvent, merge, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
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
import * as monaco from 'monaco-editor';
export class TdCodeEditorComponent {
    // tslint:disable-next-line:member-ordering
    /**
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
        (_) => { });
        this.onTouched = (/**
         * @return {?}
         */
        () => noop);
    }
    /**
     * value?: string
     * @param {?} value
     * @return {?}
     */
    set value(value) {
        if (value === this._value) {
            return;
        }
        this._value = value;
        if (this._componentInitialized) {
            this.applyValue();
        }
    }
    /**
     * @return {?}
     */
    get value() {
        return this._value;
    }
    /**
     * @return {?}
     */
    applyValue() {
        if (!this._fromEditor) {
            this._editor.setValue(this._value);
        }
        this._fromEditor = false;
        this.propagateChange(this._value);
        this.change.emit();
        this.editorValueChange.emit();
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
            setTimeout((/**
             * @return {?}
             */
            () => {
                this._subject.next(this._value);
                this._subject.complete();
                this._subject = new Subject();
            }));
            return this._subject.asObservable();
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
            this.applyLanguage();
        }
    }
    /**
     * @return {?}
     */
    get language() {
        return this._language;
    }
    /**
     * @return {?}
     */
    applyLanguage() {
        if (this._language) {
            monaco.editor.setModelLanguage(this._editor.getModel(), this._language);
            this.editorLanguageChanged.emit();
        }
    }
    /**
     * registerLanguage?: function
     * Registers a custom Language within the editor
     * @param {?} language
     * @return {?}
     */
    registerLanguage(language) {
        if (this._componentInitialized) {
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
    /**
     * style?: string
     * css style of the editor on the page
     * @param {?} editorStyle
     * @return {?}
     */
    set editorStyle(editorStyle) {
        this._editorStyle = editorStyle;
        if (this._componentInitialized) {
            this.applyStyle();
        }
    }
    /**
     * @return {?}
     */
    get editorStyle() {
        return this._editorStyle;
    }
    /**
     * @return {?}
     */
    applyStyle() {
        if (this._editorStyle) {
            /** @type {?} */
            const containerDiv = this._editorContainer.nativeElement;
            containerDiv.setAttribute('style', this._editorStyle);
        }
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
            this._editor.updateOptions({ theme });
            this.editorConfigurationChanged.emit();
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
            this._editor.updateOptions(editorOptions);
            this.editorConfigurationChanged.emit();
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
            this._editor.layout();
        }
    }
    /**
     * Returns if in Full Screen Mode or not
     * @return {?}
     */
    get isFullScreen() {
        return this._isFullScreen;
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        /** @type {?} */
        const containerDiv = this._editorContainer.nativeElement;
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
        () => {
            this.applyLanguage();
            this._fromEditor = true;
            this.applyValue();
            this.applyStyle();
            this.editorInitialized.emit(this._editor);
            this.editorConfigurationChanged.emit();
        }));
        this._editor.getModel().onDidChangeContent((/**
         * @param {?} e
         * @return {?}
         */
        (e) => {
            this._fromEditor = true;
            this.writeValue(this._editor.getValue());
            this.layout();
        }));
        this.addFullScreenModeCommand();
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
        if (this._editor) {
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
        this._isFullScreen = true;
    }
    /**
     * exitFullScreenEditor request to exit full screen of Code Editor based on its browser type.
     * @return {?}
     */
    exitFullScreenEditor() {
        if (this._componentInitialized) {
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
                styles: [":host{display:block;position:relative}:host .editorContainer{bottom:0;left:0;position:absolute;right:0;top:0}::ng-deep .monaco-aria-container{display:none}"]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS1lZGl0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3BsYXRmb3JtL2NvZGUtZWRpdG9yL2NvZGUtZWRpdG9yLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUNMLE1BQU0sRUFDTixZQUFZLEVBRVosU0FBUyxFQUNULFVBQVUsRUFDVixVQUFVLEVBQ1YsTUFBTSxFQUNOLGlCQUFpQixHQUVsQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsaUJBQWlCLEVBQXdCLE1BQU0sZ0JBQWdCLENBQUM7QUFDekUsT0FBTyxFQUFjLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMzQyxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDL0MsT0FBTyxFQUFFLFlBQVksRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7TUFFekUsSUFBSTs7O0FBQVEsR0FBRyxFQUFFO0lBQ3JCLGVBQWU7QUFDakIsQ0FBQyxDQUFBOzs7O0lBR0csYUFBYSxHQUFXLENBQUM7QUFDN0IsT0FBTyxLQUFLLE1BQU0sTUFBTSxlQUFlLENBQUM7QUFjeEMsTUFBTSxPQUFPLHFCQUFxQjs7Ozs7OztJQXdRaEMsWUFBb0IsSUFBWSxFQUFVLGtCQUFxQyxFQUFVLFdBQXVCO1FBQTVGLFNBQUksR0FBSixJQUFJLENBQVE7UUFBVSx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW1CO1FBQVUsZ0JBQVcsR0FBWCxXQUFXLENBQVk7UUF2UXhHLGFBQVEsR0FBcUIsSUFBSSxPQUFPLEVBQVcsQ0FBQztRQUNwRCxrQkFBYSxHQUFvQixJQUFJLE9BQU8sRUFBVSxDQUFDO1FBQ3ZELG1CQUFjLEdBQW9CLElBQUksT0FBTyxFQUFVLENBQUM7UUFFeEQsaUJBQVksR0FB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Ozs7O0lBQ3RCLDJEQUE0RDs7SUFFNUQsaURBQTZFOzs7Ozs7SUFNN0Usa0RBQTJFOzs7Ozs7SUFNM0UsMkRBQW9GOzs7Ozs7SUFNcEYsc0RBQStFOzs7Ozs7SUFNL0Usa0RBQTJFOzs7Ozs7SUFNM0UsdUNBQWdFOztJQUVoRSxnREFBaUM7O0lBQ2pDLDBDQUF1Qjs7Ozs7SUFvTlgscUNBQW9COzs7OztJQUFFLG1EQUE2Qzs7Ozs7SUFBRSw0Q0FBK0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21wb25lbnQsXG4gIElucHV0LFxuICBPdXRwdXQsXG4gIEV2ZW50RW1pdHRlcixcbiAgT25Jbml0LFxuICBWaWV3Q2hpbGQsXG4gIEVsZW1lbnRSZWYsXG4gIGZvcndhcmRSZWYsXG4gIE5nWm9uZSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIE9uRGVzdHJveSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOR19WQUxVRV9BQ0NFU1NPUiwgQ29udHJvbFZhbHVlQWNjZXNzb3IgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBmcm9tRXZlbnQsIG1lcmdlLCB0aW1lciB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZGVib3VuY2VUaW1lLCBkaXN0aW5jdFVudGlsQ2hhbmdlZCwgdGFrZVVudGlsIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5jb25zdCBub29wOiBhbnkgPSAoKSA9PiB7XG4gIC8vIGVtcHR5IG1ldGhvZFxufTtcblxuLy8gY291bnRlciBmb3IgaWRzIHRvIGFsbG93IGZvciBtdWx0aXBsZSBlZGl0b3JzIG9uIG9uZSBwYWdlXG5sZXQgdW5pcXVlQ291bnRlcjogbnVtYmVyID0gMDtcbmltcG9ydCAqIGFzIG1vbmFjbyBmcm9tICdtb25hY28tZWRpdG9yJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAndGQtY29kZS1lZGl0b3InLFxuICB0ZW1wbGF0ZVVybDogJy4vY29kZS1lZGl0b3IuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9jb2RlLWVkaXRvci5jb21wb25lbnQuc2NzcyddLFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IFRkQ29kZUVkaXRvckNvbXBvbmVudCksXG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICB9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBUZENvZGVFZGl0b3JDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9kZXN0cm95OiBTdWJqZWN0PGJvb2xlYW4+ID0gbmV3IFN1YmplY3Q8Ym9vbGVhbj4oKTtcbiAgcHJpdmF0ZSBfd2lkdGhTdWJqZWN0OiBTdWJqZWN0PG51bWJlcj4gPSBuZXcgU3ViamVjdDxudW1iZXI+KCk7XG4gIHByaXZhdGUgX2hlaWdodFN1YmplY3Q6IFN1YmplY3Q8bnVtYmVyPiA9IG5ldyBTdWJqZWN0PG51bWJlcj4oKTtcblxuICBwcml2YXRlIF9lZGl0b3JTdHlsZTogc3RyaW5nID0gJ3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7Ym9yZGVyOjFweCBzb2xpZCBncmV5Oyc7XG4gIHByaXZhdGUgX3ZhbHVlOiBzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSBfdGhlbWU6IHN0cmluZyA9ICd2cyc7XG4gIHByaXZhdGUgX2xhbmd1YWdlOiBzdHJpbmcgPSAnamF2YXNjcmlwdCc7XG4gIHByaXZhdGUgX3N1YmplY3Q6IFN1YmplY3Q8c3RyaW5nPiA9IG5ldyBTdWJqZWN0KCk7XG4gIHByaXZhdGUgX2VkaXRvcklubmVyQ29udGFpbmVyOiBzdHJpbmcgPSAnZWRpdG9ySW5uZXJDb250YWluZXInICsgdW5pcXVlQ291bnRlcisrO1xuICBwcml2YXRlIF9lZGl0b3I6IGFueTtcbiAgcHJpdmF0ZSBfZnJvbUVkaXRvcjogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9jb21wb25lbnRJbml0aWFsaXplZDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9lZGl0b3JPcHRpb25zOiBhbnkgPSB7fTtcbiAgcHJpdmF0ZSBfaXNGdWxsU2NyZWVuOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX2tleWNvZGU6IGFueTtcbiAgcHJpdmF0ZSBfcmVnaXN0ZXJlZExhbmd1YWdlc1N0eWxlczogSFRNTFN0eWxlRWxlbWVudFtdID0gW107XG5cbiAgQFZpZXdDaGlsZCgnZWRpdG9yQ29udGFpbmVyJywgeyBzdGF0aWM6IHRydWUgfSkgX2VkaXRvckNvbnRhaW5lcjogRWxlbWVudFJlZjtcblxuICAvKipcbiAgICogZWRpdG9ySW5pdGlhbGl6ZWQ6IGZ1bmN0aW9uKCRldmVudClcbiAgICogRXZlbnQgZW1pdHRlZCB3aGVuIGVkaXRvciBpcyBmaXJzdCBpbml0aWFsaXplZFxuICAgKi9cbiAgQE91dHB1dCgpIGVkaXRvckluaXRpYWxpemVkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIGVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkOiBmdW5jdGlvbigkZXZlbnQpXG4gICAqIEV2ZW50IGVtaXR0ZWQgd2hlbiBlZGl0b3IncyBjb25maWd1cmF0aW9uIGNoYW5nZXNcbiAgICovXG4gIEBPdXRwdXQoKSBlZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBlZGl0b3JMYW5ndWFnZUNoYW5nZWQ6IGZ1bmN0aW9uKCRldmVudClcbiAgICogRXZlbnQgZW1pdHRlZCB3aGVuIGVkaXRvcidzIExhbmd1YWdlIGNoYW5nZXNcbiAgICovXG4gIEBPdXRwdXQoKSBlZGl0b3JMYW5ndWFnZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAvKipcbiAgICogZWRpdG9yVmFsdWVDaGFuZ2U6IGZ1bmN0aW9uKCRldmVudClcbiAgICogRXZlbnQgZW1pdHRlZCBhbnkgdGltZSBzb21ldGhpbmcgY2hhbmdlcyB0aGUgZWRpdG9yIHZhbHVlXG4gICAqL1xuICBAT3V0cHV0KCkgZWRpdG9yVmFsdWVDaGFuZ2U6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAvKipcbiAgICogVGhlIGNoYW5nZSBldmVudCBub3RpZmllcyB5b3UgYWJvdXQgYSBjaGFuZ2UgaGFwcGVuaW5nIGluIGFuIGlucHV0IGZpZWxkLlxuICAgKiBTaW5jZSB0aGUgY29tcG9uZW50IGlzIG5vdCBhIG5hdGl2ZSBBbmd1bGFyIGNvbXBvbmVudCBoYXZlIHRvIHNwZWNpZml5IHRoZSBldmVudCBlbWl0dGVyIG91cnNlbGZcbiAgICovXG4gIEBPdXRwdXQoKSBjaGFuZ2U6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAgLyogdHNsaW50OmRpc2FibGUtbmV4dC1saW5lICovXG4gIHByb3BhZ2F0ZUNoYW5nZSA9IChfOiBhbnkpID0+IHt9O1xuICBvblRvdWNoZWQgPSAoKSA9PiBub29wO1xuXG4gIC8qKlxuICAgKiB2YWx1ZT86IHN0cmluZ1xuICAgKi9cbiAgQElucHV0KCd2YWx1ZScpXG4gIHNldCB2YWx1ZSh2YWx1ZTogc3RyaW5nKSB7XG4gICAgaWYgKHZhbHVlID09PSB0aGlzLl92YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgdGhpcy5hcHBseVZhbHVlKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IHZhbHVlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICB9XG5cbiAgYXBwbHlWYWx1ZSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2Zyb21FZGl0b3IpIHtcbiAgICAgIHRoaXMuX2VkaXRvci5zZXRWYWx1ZSh0aGlzLl92YWx1ZSk7XG4gICAgfVxuICAgIHRoaXMuX2Zyb21FZGl0b3IgPSBmYWxzZTtcbiAgICB0aGlzLnByb3BhZ2F0ZUNoYW5nZSh0aGlzLl92YWx1ZSk7XG4gICAgdGhpcy5jaGFuZ2UuZW1pdCgpO1xuICAgIHRoaXMuZWRpdG9yVmFsdWVDaGFuZ2UuZW1pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gICAqL1xuICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAvLyBkbyBub3Qgd3JpdGUgaWYgbnVsbCBvciB1bmRlZmluZWRcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmVcbiAgICBpZiAodmFsdWUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICB9XG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46IGFueSk6IHZvaWQge1xuICAgIHRoaXMucHJvcGFnYXRlQ2hhbmdlID0gZm47XG4gIH1cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46IGFueSk6IHZvaWQge1xuICAgIHRoaXMub25Ub3VjaGVkID0gZm47XG4gIH1cblxuICAvKipcbiAgICogZ2V0RWRpdG9yQ29udGVudD86IGZ1bmN0aW9uXG4gICAqIFJldHVybnMgdGhlIGNvbnRlbnQgd2l0aGluIHRoZSBlZGl0b3JcbiAgICovXG4gIGdldFZhbHVlKCk6IE9ic2VydmFibGU8c3RyaW5nPiB7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5fc3ViamVjdC5uZXh0KHRoaXMuX3ZhbHVlKTtcbiAgICAgICAgdGhpcy5fc3ViamVjdC5jb21wbGV0ZSgpO1xuICAgICAgICB0aGlzLl9zdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXMuX3N1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIGxhbmd1YWdlPzogc3RyaW5nXG4gICAqIGxhbmd1YWdlIHVzZWQgaW4gZWRpdG9yXG4gICAqL1xuICBASW5wdXQoJ2xhbmd1YWdlJylcbiAgc2V0IGxhbmd1YWdlKGxhbmd1YWdlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9sYW5ndWFnZSA9IGxhbmd1YWdlO1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgdGhpcy5hcHBseUxhbmd1YWdlKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGxhbmd1YWdlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2xhbmd1YWdlO1xuICB9XG5cbiAgYXBwbHlMYW5ndWFnZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fbGFuZ3VhZ2UpIHtcbiAgICAgIG1vbmFjby5lZGl0b3Iuc2V0TW9kZWxMYW5ndWFnZSh0aGlzLl9lZGl0b3IuZ2V0TW9kZWwoKSwgdGhpcy5fbGFuZ3VhZ2UpO1xuICAgICAgdGhpcy5lZGl0b3JMYW5ndWFnZUNoYW5nZWQuZW1pdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiByZWdpc3Rlckxhbmd1YWdlPzogZnVuY3Rpb25cbiAgICogUmVnaXN0ZXJzIGEgY3VzdG9tIExhbmd1YWdlIHdpdGhpbiB0aGUgZWRpdG9yXG4gICAqL1xuICByZWdpc3Rlckxhbmd1YWdlKGxhbmd1YWdlOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGZvciAoY29uc3QgcHJvdmlkZXIgb2YgbGFuZ3VhZ2UuY29tcGxldGlvbkl0ZW1Qcm92aWRlcikge1xuICAgICAgICAvKiB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmUgKi9cbiAgICAgICAgcHJvdmlkZXIua2luZCA9IGV2YWwocHJvdmlkZXIua2luZCk7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IG1vbmFyY2hUb2tlbnMgb2YgbGFuZ3VhZ2UubW9uYXJjaFRva2Vuc1Byb3ZpZGVyKSB7XG4gICAgICAgIC8qIHRzbGludDpkaXNhYmxlLW5leHQtbGluZSAqL1xuICAgICAgICBtb25hcmNoVG9rZW5zWzBdID0gZXZhbChtb25hcmNoVG9rZW5zWzBdKTtcbiAgICAgIH1cbiAgICAgIG1vbmFjby5sYW5ndWFnZXMucmVnaXN0ZXIoeyBpZDogbGFuZ3VhZ2UuaWQgfSk7XG5cbiAgICAgIG1vbmFjby5sYW5ndWFnZXMuc2V0TW9uYXJjaFRva2Vuc1Byb3ZpZGVyKGxhbmd1YWdlLmlkLCB7XG4gICAgICAgIHRva2VuaXplcjoge1xuICAgICAgICAgIHJvb3Q6IGxhbmd1YWdlLm1vbmFyY2hUb2tlbnNQcm92aWRlcixcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBEZWZpbmUgYSBuZXcgdGhlbWUgdGhhdCBjb25zdGFpbnMgb25seSBydWxlcyB0aGF0IG1hdGNoIHRoaXMgbGFuZ3VhZ2VcbiAgICAgIG1vbmFjby5lZGl0b3IuZGVmaW5lVGhlbWUobGFuZ3VhZ2UuY3VzdG9tVGhlbWUuaWQsIGxhbmd1YWdlLmN1c3RvbVRoZW1lLnRoZW1lKTtcbiAgICAgIHRoaXMuX3RoZW1lID0gbGFuZ3VhZ2UuY3VzdG9tVGhlbWUuaWQ7XG5cbiAgICAgIG1vbmFjby5sYW5ndWFnZXMucmVnaXN0ZXJDb21wbGV0aW9uSXRlbVByb3ZpZGVyKGxhbmd1YWdlLmlkLCB7XG4gICAgICAgIHByb3ZpZGVDb21wbGV0aW9uSXRlbXM6ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbGFuZ3VhZ2UuY29tcGxldGlvbkl0ZW1Qcm92aWRlcjtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBjc3M6IEhUTUxTdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgY3NzLnR5cGUgPSAndGV4dC9jc3MnO1xuICAgICAgY3NzLmlubmVySFRNTCA9IGxhbmd1YWdlLm1vbmFyY2hUb2tlbnNQcm92aWRlckNTUztcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY3NzKTtcbiAgICAgIHRoaXMuZWRpdG9yQ29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCgpO1xuICAgICAgdGhpcy5fcmVnaXN0ZXJlZExhbmd1YWdlc1N0eWxlcyA9IFsuLi50aGlzLl9yZWdpc3RlcmVkTGFuZ3VhZ2VzU3R5bGVzLCBjc3NdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBzdHlsZT86IHN0cmluZ1xuICAgKiBjc3Mgc3R5bGUgb2YgdGhlIGVkaXRvciBvbiB0aGUgcGFnZVxuICAgKi9cbiAgQElucHV0KCdlZGl0b3JTdHlsZScpXG4gIHNldCBlZGl0b3JTdHlsZShlZGl0b3JTdHlsZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fZWRpdG9yU3R5bGUgPSBlZGl0b3JTdHlsZTtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIHRoaXMuYXBwbHlTdHlsZSgpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBlZGl0b3JTdHlsZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9lZGl0b3JTdHlsZTtcbiAgfVxuXG4gIGFwcGx5U3R5bGUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2VkaXRvclN0eWxlKSB7XG4gICAgICBjb25zdCBjb250YWluZXJEaXY6IEhUTUxEaXZFbGVtZW50ID0gdGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICBjb250YWluZXJEaXYuc2V0QXR0cmlidXRlKCdzdHlsZScsIHRoaXMuX2VkaXRvclN0eWxlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogdGhlbWU/OiBzdHJpbmdcbiAgICogVGhlbWUgdG8gYmUgYXBwbGllZCB0byBlZGl0b3JcbiAgICovXG4gIEBJbnB1dCgndGhlbWUnKVxuICBzZXQgdGhlbWUodGhlbWU6IHN0cmluZykge1xuICAgIHRoaXMuX3RoZW1lID0gdGhlbWU7XG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkKSB7XG4gICAgICB0aGlzLl9lZGl0b3IudXBkYXRlT3B0aW9ucyh7IHRoZW1lIH0pO1xuICAgICAgdGhpcy5lZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZC5lbWl0KCk7XG4gICAgfVxuICB9XG4gIGdldCB0aGVtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl90aGVtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBmdWxsU2NyZWVuS2V5QmluZGluZz86IG51bWJlclxuICAgKiBTZWUgaGVyZSBmb3Iga2V5IGJpbmRpbmdzIGh0dHBzOi8vbWljcm9zb2Z0LmdpdGh1Yi5pby9tb25hY28tZWRpdG9yL2FwaS9lbnVtcy9tb25hY28ua2V5Y29kZS5odG1sXG4gICAqIFNldHMgdGhlIEtleUNvZGUgZm9yIHNob3J0Y3V0dGluZyB0byBGdWxsc2NyZWVuIG1vZGVcbiAgICovXG4gIEBJbnB1dCgnZnVsbFNjcmVlbktleUJpbmRpbmcnKVxuICBzZXQgZnVsbFNjcmVlbktleUJpbmRpbmcoa2V5Y29kZTogbnVtYmVyW10pIHtcbiAgICB0aGlzLl9rZXljb2RlID0ga2V5Y29kZTtcbiAgfVxuICBnZXQgZnVsbFNjcmVlbktleUJpbmRpbmcoKTogbnVtYmVyW10ge1xuICAgIHJldHVybiB0aGlzLl9rZXljb2RlO1xuICB9XG5cbiAgLyoqXG4gICAqIGVkaXRvck9wdGlvbnM/OiBvYmplY3RcbiAgICogT3B0aW9ucyB1c2VkIG9uIGVkaXRvciBpbnN0YW50aWF0aW9uLiBBdmFpbGFibGUgb3B0aW9ucyBsaXN0ZWQgaGVyZTpcbiAgICogaHR0cHM6Ly9taWNyb3NvZnQuZ2l0aHViLmlvL21vbmFjby1lZGl0b3IvYXBpL2ludGVyZmFjZXMvbW9uYWNvLmVkaXRvci5pZWRpdG9yb3B0aW9ucy5odG1sXG4gICAqL1xuICBASW5wdXQoJ2VkaXRvck9wdGlvbnMnKVxuICBzZXQgZWRpdG9yT3B0aW9ucyhlZGl0b3JPcHRpb25zOiBhbnkpIHtcbiAgICB0aGlzLl9lZGl0b3JPcHRpb25zID0gZWRpdG9yT3B0aW9ucztcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIHRoaXMuX2VkaXRvci51cGRhdGVPcHRpb25zKGVkaXRvck9wdGlvbnMpO1xuICAgICAgdGhpcy5lZGl0b3JDb25maWd1cmF0aW9uQ2hhbmdlZC5lbWl0KCk7XG4gICAgfVxuICB9XG4gIGdldCBlZGl0b3JPcHRpb25zKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRvck9wdGlvbnM7XG4gIH1cblxuICAvKipcbiAgICogbGF5b3V0IG1ldGhvZCB0aGF0IGNhbGxzIGxheW91dCBtZXRob2Qgb2YgZWRpdG9yIGFuZCBpbnN0cnVjdHMgdGhlIGVkaXRvciB0byByZW1lYXN1cmUgaXRzIGNvbnRhaW5lclxuICAgKi9cbiAgbGF5b3V0KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgdGhpcy5fZWRpdG9yLmxheW91dCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGlmIGluIEZ1bGwgU2NyZWVuIE1vZGUgb3Igbm90XG4gICAqL1xuICBnZXQgaXNGdWxsU2NyZWVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc0Z1bGxTY3JlZW47XG4gIH1cblxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWVtYmVyLW9yZGVyaW5nXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgem9uZTogTmdab25lLCBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHt9XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgY29uc3QgY29udGFpbmVyRGl2OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50O1xuICAgIGNvbnRhaW5lckRpdi5pZCA9IHRoaXMuX2VkaXRvcklubmVyQ29udGFpbmVyO1xuXG4gICAgdGhpcy5fZWRpdG9yID0gbW9uYWNvLmVkaXRvci5jcmVhdGUoXG4gICAgICBjb250YWluZXJEaXYsXG4gICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICB7XG4gICAgICAgICAgdmFsdWU6IHRoaXMuX3ZhbHVlLFxuICAgICAgICAgIGxhbmd1YWdlOiB0aGlzLmxhbmd1YWdlLFxuICAgICAgICAgIHRoZW1lOiB0aGlzLl90aGVtZSxcbiAgICAgICAgfSxcbiAgICAgICAgdGhpcy5lZGl0b3JPcHRpb25zLFxuICAgICAgKSxcbiAgICApO1xuICAgIHRoaXMuX2NvbXBvbmVudEluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuYXBwbHlMYW5ndWFnZSgpO1xuICAgICAgdGhpcy5fZnJvbUVkaXRvciA9IHRydWU7XG4gICAgICB0aGlzLmFwcGx5VmFsdWUoKTtcbiAgICAgIHRoaXMuYXBwbHlTdHlsZSgpO1xuICAgICAgdGhpcy5lZGl0b3JJbml0aWFsaXplZC5lbWl0KHRoaXMuX2VkaXRvcik7XG4gICAgICB0aGlzLmVkaXRvckNvbmZpZ3VyYXRpb25DaGFuZ2VkLmVtaXQoKTtcbiAgICB9KTtcbiAgICB0aGlzLl9lZGl0b3IuZ2V0TW9kZWwoKS5vbkRpZENoYW5nZUNvbnRlbnQoKGU6IGFueSkgPT4ge1xuICAgICAgdGhpcy5fZnJvbUVkaXRvciA9IHRydWU7XG4gICAgICB0aGlzLndyaXRlVmFsdWUodGhpcy5fZWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICAgdGhpcy5sYXlvdXQoKTtcbiAgICB9KTtcbiAgICB0aGlzLmFkZEZ1bGxTY3JlZW5Nb2RlQ29tbWFuZCgpO1xuXG4gICAgbWVyZ2UoXG4gICAgICBmcm9tRXZlbnQod2luZG93LCAncmVzaXplJykucGlwZShkZWJvdW5jZVRpbWUoMTAwKSksXG4gICAgICB0aGlzLl93aWR0aFN1YmplY3QuYXNPYnNlcnZhYmxlKCkucGlwZShkaXN0aW5jdFVudGlsQ2hhbmdlZCgpKSxcbiAgICAgIHRoaXMuX2hlaWdodFN1YmplY3QuYXNPYnNlcnZhYmxlKCkucGlwZShkaXN0aW5jdFVudGlsQ2hhbmdlZCgpKSxcbiAgICApXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveSksIGRlYm91bmNlVGltZSgxMDApKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMubGF5b3V0KCk7XG4gICAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgfSk7XG4gICAgdGltZXIoNTAwLCAyNTApXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveSkpXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2VsZW1lbnRSZWYgJiYgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSB7XG4gICAgICAgICAgdGhpcy5fd2lkdGhTdWJqZWN0Lm5leHQoKDxIVE1MRWxlbWVudD50aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoKTtcbiAgICAgICAgICB0aGlzLl9oZWlnaHRTdWJqZWN0Lm5leHQoKDxIVE1MRWxlbWVudD50aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYuZGV0YWNoKCk7XG4gICAgdGhpcy5fcmVnaXN0ZXJlZExhbmd1YWdlc1N0eWxlcy5mb3JFYWNoKChzdHlsZTogSFRNTFN0eWxlRWxlbWVudCkgPT4gc3R5bGUucmVtb3ZlKCkpO1xuICAgIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgIHRoaXMuX2VkaXRvci5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX2Rlc3Ryb3kubmV4dCh0cnVlKTtcbiAgICB0aGlzLl9kZXN0cm95LnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICAvKipcbiAgICogc2hvd0Z1bGxTY3JlZW5FZGl0b3IgcmVxdWVzdCBmb3IgZnVsbCBzY3JlZW4gb2YgQ29kZSBFZGl0b3IgYmFzZWQgb24gaXRzIGJyb3dzZXIgdHlwZS5cbiAgICovXG4gIHB1YmxpYyBzaG93RnVsbFNjcmVlbkVkaXRvcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29tcG9uZW50SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGNvbnN0IGNvZGVFZGl0b3JFbGVtZW50OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50IGFzIEhUTUxEaXZFbGVtZW50O1xuICAgICAgY29uc3QgZnVsbFNjcmVlbk1hcDogb2JqZWN0ID0ge1xuICAgICAgICAvLyBDaHJvbWVcbiAgICAgICAgcmVxdWVzdEZ1bGxzY3JlZW46ICgpID0+IGNvZGVFZGl0b3JFbGVtZW50LnJlcXVlc3RGdWxsc2NyZWVuKCksXG4gICAgICAgIC8vIFNhZmFyaVxuICAgICAgICB3ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbjogKCkgPT4gKDxhbnk+Y29kZUVkaXRvckVsZW1lbnQpLndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKCksXG4gICAgICAgIC8vIElFXG4gICAgICAgIG1zUmVxdWVzdEZ1bGxzY3JlZW46ICgpID0+ICg8YW55PmNvZGVFZGl0b3JFbGVtZW50KS5tc1JlcXVlc3RGdWxsc2NyZWVuKCksXG4gICAgICAgIC8vIEZpcmVmb3hcbiAgICAgICAgbW96UmVxdWVzdEZ1bGxTY3JlZW46ICgpID0+ICg8YW55PmNvZGVFZGl0b3JFbGVtZW50KS5tb3pSZXF1ZXN0RnVsbFNjcmVlbigpLFxuICAgICAgfTtcblxuICAgICAgZm9yIChjb25zdCBoYW5kbGVyIG9mIE9iamVjdC5rZXlzKGZ1bGxTY3JlZW5NYXApKSB7XG4gICAgICAgIGlmIChjb2RlRWRpdG9yRWxlbWVudFtoYW5kbGVyXSkge1xuICAgICAgICAgIGZ1bGxTY3JlZW5NYXBbaGFuZGxlcl0oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9pc0Z1bGxTY3JlZW4gPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIGV4aXRGdWxsU2NyZWVuRWRpdG9yIHJlcXVlc3QgdG8gZXhpdCBmdWxsIHNjcmVlbiBvZiBDb2RlIEVkaXRvciBiYXNlZCBvbiBpdHMgYnJvd3NlciB0eXBlLlxuICAgKi9cbiAgcHVibGljIGV4aXRGdWxsU2NyZWVuRWRpdG9yKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRJbml0aWFsaXplZCkge1xuICAgICAgY29uc3QgZXhpdEZ1bGxTY3JlZW5NYXA6IG9iamVjdCA9IHtcbiAgICAgICAgLy8gQ2hyb21lXG4gICAgICAgIGV4aXRGdWxsc2NyZWVuOiAoKSA9PiBkb2N1bWVudC5leGl0RnVsbHNjcmVlbigpLFxuICAgICAgICAvLyBTYWZhcmlcbiAgICAgICAgd2Via2l0RXhpdEZ1bGxzY3JlZW46ICgpID0+ICg8YW55PmRvY3VtZW50KS53ZWJraXRFeGl0RnVsbHNjcmVlbigpLFxuICAgICAgICAvLyBGaXJlZm94XG4gICAgICAgIG1vekNhbmNlbEZ1bGxTY3JlZW46ICgpID0+ICg8YW55PmRvY3VtZW50KS5tb3pDYW5jZWxGdWxsU2NyZWVuKCksXG4gICAgICAgIC8vIElFXG4gICAgICAgIG1zRXhpdEZ1bGxzY3JlZW46ICgpID0+ICg8YW55PmRvY3VtZW50KS5tc0V4aXRGdWxsc2NyZWVuKCksXG4gICAgICB9O1xuXG4gICAgICBmb3IgKGNvbnN0IGhhbmRsZXIgb2YgT2JqZWN0LmtleXMoZXhpdEZ1bGxTY3JlZW5NYXApKSB7XG4gICAgICAgIGlmIChkb2N1bWVudFtoYW5kbGVyXSkge1xuICAgICAgICAgIGV4aXRGdWxsU2NyZWVuTWFwW2hhbmRsZXJdKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5faXNGdWxsU2NyZWVuID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogYWRkRnVsbFNjcmVlbk1vZGVDb21tYW5kIHVzZWQgdG8gYWRkIHRoZSBmdWxsc2NyZWVuIG9wdGlvbiB0byB0aGUgY29udGV4dCBtZW51XG4gICAqL1xuICBwcml2YXRlIGFkZEZ1bGxTY3JlZW5Nb2RlQ29tbWFuZCgpOiB2b2lkIHtcbiAgICB0aGlzLl9lZGl0b3IuYWRkQWN0aW9uKHtcbiAgICAgIC8vIEFuIHVuaXF1ZSBpZGVudGlmaWVyIG9mIHRoZSBjb250cmlidXRlZCBhY3Rpb24uXG4gICAgICBpZDogJ2Z1bGxTY3JlZW4nLFxuICAgICAgLy8gQSBsYWJlbCBvZiB0aGUgYWN0aW9uIHRoYXQgd2lsbCBiZSBwcmVzZW50ZWQgdG8gdGhlIHVzZXIuXG4gICAgICBsYWJlbDogJ0Z1bGwgU2NyZWVuJyxcbiAgICAgIC8vIEFuIG9wdGlvbmFsIGFycmF5IG9mIGtleWJpbmRpbmdzIGZvciB0aGUgYWN0aW9uLlxuICAgICAgY29udGV4dE1lbnVHcm91cElkOiAnbmF2aWdhdGlvbicsXG4gICAgICBrZXliaW5kaW5nczogdGhpcy5fa2V5Y29kZSxcbiAgICAgIGNvbnRleHRNZW51T3JkZXI6IDEuNSxcbiAgICAgIC8vIE1ldGhvZCB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgd2hlbiB0aGUgYWN0aW9uIGlzIHRyaWdnZXJlZC5cbiAgICAgIC8vIEBwYXJhbSBlZGl0b3IgVGhlIGVkaXRvciBpbnN0YW5jZSBpcyBwYXNzZWQgaW4gYXMgYSBjb252aW5pZW5jZVxuICAgICAgcnVuOiAoZWQ6IGFueSkgPT4ge1xuICAgICAgICB0aGlzLnNob3dGdWxsU2NyZWVuRWRpdG9yKCk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG59XG4iXX0=