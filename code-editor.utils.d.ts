import { Observable } from 'rxjs';
/**
 * Waits until monaco has been loaded so we can reference its global object.
 */
export declare function waitUntilMonacoReady(): Observable<void>;
/**
 * Check if monaco has been loaded
 */
export declare function isMonacoLoaded(): boolean;
/**
 * Loads monaco
 */
export declare function loadMonaco(): void;
