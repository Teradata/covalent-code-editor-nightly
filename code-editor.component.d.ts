import { EventEmitter, OnInit, AfterViewInit, ElementRef, NgZone, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { Observable } from 'rxjs';
export declare class TdCodeEditorComponent implements OnInit, AfterViewInit, ControlValueAccessor, OnDestroy {
    private zone;
    private _changeDetectorRef;
    private _elementRef;
    private _destroy;
    private _widthSubject;
    private _heightSubject;
    private _editorStyle;
    private _appPath;
    private _isElectronApp;
    private _webview;
    private _value;
    private _theme;
    private _language;
    private _subject;
    private _editorInnerContainer;
    private _editorNodeModuleDirOverride;
    private _editor;
    private _editorProxy;
    private _componentInitialized;
    private _fromEditor;
    private _editorOptions;
    private _isFullScreen;
    private _keycode;
    private _setValueTimeout;
    private initialContentChange;
    _editorContainer: ElementRef;
    /**
     * automaticLayout?: boolean
     * @deprecated in favor of our own resize implementation.
     */
    automaticLayout: boolean;
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
     * Set if using Electron mode when object is created
     */
    constructor(zone: NgZone, _changeDetectorRef: ChangeDetectorRef, _elementRef: ElementRef);
    /**
     * value?: string
     * Value in the Editor after async getEditorContent was called
     */
    value: string;
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
    language: string;
    /**
     * registerLanguage?: function
     * Registers a custom Language within the editor
     */
    registerLanguage(language: any): void;
    /**
     * style?: string
     * css style of the editor on the page
     */
    editorStyle: string;
    /**
     * theme?: string
     * Theme to be applied to editor
     */
    theme: string;
    /**
     * fullScreenKeyBinding?: number
     * See here for key bindings https://microsoft.github.io/monaco-editor/api/enums/monaco.keycode.html
     * Sets the KeyCode for shortcutting to Fullscreen mode
     */
    fullScreenKeyBinding: number[];
    /**
     * editorOptions?: object
     * Options used on editor instantiation. Available options listed here:
     * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditoroptions.html
     */
    editorOptions: any;
    /**
     * layout method that calls layout method of editor and instructs the editor to remeasure its container
     */
    layout(): void;
    /**
     * Returns if in Electron mode or not
     */
    readonly isElectronApp: boolean;
    /**
     * Returns if in Full Screen Mode or not
     */
    readonly isFullScreen: boolean;
    /**
     * setEditorNodeModuleDirOverride function that overrides where to look
     * for the editor node_module. Used in tests for Electron or anywhere that the
     * node_modules are not in the expected location.
     */
    setEditorNodeModuleDirOverride(dirOverride: string): void;
    /**
     * ngOnInit only used for Electron version of editor
     * This is where the webview is created to sandbox away the editor
     */
    ngOnInit(): void;
    /**
     * ngAfterViewInit only used for browser version of editor
     * This is where the AMD Loader scripts are added to the browser and the editor scripts are "required"
     */
    ngAfterViewInit(): void;
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
    /**
     * wrapEditorCalls used to proxy all the calls to the monaco editor
     * For calls for Electron use this to call the editor inside the webview
     */
    private wrapEditorCalls;
    /**
     * initMonaco method creates the monaco editor into the @ViewChild('editorContainer')
     * and emit the editorInitialized event.  This is only used in the browser version.
     */
    private initMonaco;
}
