import { EventEmitter, OnInit, ElementRef, NgZone, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { Observable } from 'rxjs';
export declare class TdCodeEditorComponent implements OnInit, ControlValueAccessor, OnDestroy {
    private zone;
    private _changeDetectorRef;
    private _elementRef;
    private _destroy;
    private _widthSubject;
    private _heightSubject;
    private _editorStyle;
    private _value;
    private _theme;
    private _language;
    private _subject;
    private _editorInnerContainer;
    private _editor;
    private _fromEditor;
    private _componentInitialized;
    private _editorOptions;
    private _isFullScreen;
    private _keycode;
    private _registeredLanguagesStyles;
    _editorContainer: ElementRef;
    /**
     * editorInitialized: function($event)
     * Event emitted when editor is first initialized
     */
    editorInitialized: EventEmitter<void>;
    /**
     * editorConfigurationChanged: function($event)
     * Event emitted when editor's configuration changes
     */
    editorConfigurationChanged: EventEmitter<void>;
    /**
     * editorLanguageChanged: function($event)
     * Event emitted when editor's Language changes
     */
    editorLanguageChanged: EventEmitter<void>;
    /**
     * editorValueChange: function($event)
     * Event emitted any time something changes the editor value
     */
    editorValueChange: EventEmitter<void>;
    /**
     * The change event notifies you about a change happening in an input field.
     * Since the component is not a native Angular component have to specifiy the event emitter ourself
     */
    change: EventEmitter<void>;
    propagateChange: (_: any) => void;
    onTouched: () => any;
    /**
     * value?: string
     */
    set value(value: string);
    get value(): string;
    applyValue(): void;
    /**
     * Implemented as part of ControlValueAccessor.
     */
    writeValue(value: any): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    /**
     * getEditorContent?: function
     * Returns the content within the editor
     */
    getValue(): Observable<string>;
    /**
     * language?: string
     * language used in editor
     */
    set language(language: string);
    get language(): string;
    applyLanguage(): void;
    /**
     * registerLanguage?: function
     * Registers a custom Language within the editor
     */
    registerLanguage(language: any): void;
    /**
     * style?: string
     * css style of the editor on the page
     */
    set editorStyle(editorStyle: string);
    get editorStyle(): string;
    applyStyle(): void;
    /**
     * theme?: string
     * Theme to be applied to editor
     */
    set theme(theme: string);
    get theme(): string;
    /**
     * fullScreenKeyBinding?: number
     * See here for key bindings https://microsoft.github.io/monaco-editor/api/enums/monaco.keycode.html
     * Sets the KeyCode for shortcutting to Fullscreen mode
     */
    set fullScreenKeyBinding(keycode: number[]);
    get fullScreenKeyBinding(): number[];
    /**
     * editorOptions?: object
     * Options used on editor instantiation. Available options listed here:
     * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditoroptions.html
     */
    set editorOptions(editorOptions: any);
    get editorOptions(): any;
    /**
     * layout method that calls layout method of editor and instructs the editor to remeasure its container
     */
    layout(): void;
    /**
     * Returns if in Full Screen Mode or not
     */
    get isFullScreen(): boolean;
    constructor(zone: NgZone, _changeDetectorRef: ChangeDetectorRef, _elementRef: ElementRef);
    ngOnInit(): void;
    ngOnDestroy(): void;
    /**
     * showFullScreenEditor request for full screen of Code Editor based on its browser type.
     */
    showFullScreenEditor(): void;
    /**
     * exitFullScreenEditor request to exit full screen of Code Editor based on its browser type.
     */
    exitFullScreenEditor(): void;
    /**
     * addFullScreenModeCommand used to add the fullscreen option to the context menu
     */
    private addFullScreenModeCommand;
}
