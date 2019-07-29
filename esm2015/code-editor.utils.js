/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Subject } from 'rxjs';
/**
 * Waits until monaco has been loaded so we can reference its global object.
 * @return {?}
 */
export function waitUntilMonacoReady() {
    /** @type {?} */
    let monacoReady$ = new Subject();
    // create interval to check if monaco has been loaded
    /** @type {?} */
    let interval = setInterval((/**
     * @return {?}
     */
    () => {
        if (isMonacoLoaded()) {
            // clear interval when monaco has been loaded
            clearInterval(interval);
            monacoReady$.next();
            monacoReady$.complete();
        }
    }), 100);
    return monacoReady$.asObservable();
}
/**
 * Check if monaco has been loaded
 * @return {?}
 */
export function isMonacoLoaded() {
    return typeof ((/** @type {?} */ (window))).monaco === 'object';
}
/**
 * Loads monaco
 * @return {?}
 */
export function loadMonaco() {
    // check if the script tag has been created in case another code component has done this already
    if (!document.getElementById('monaco-loader-script')) {
        /** @type {?} */
        const onGotAmdLoader = (/**
         * @return {?}
         */
        () => {
            // Load monaco
            ((/** @type {?} */ (window))).require.config({ paths: { vs: 'assets/monaco/vs' } });
            ((/** @type {?} */ (window))).require(['vs/editor/editor.main'], (/**
             * @return {?}
             */
            () => {
                // TODO
            }));
        });
        // Load AMD loader if necessary
        if (!((/** @type {?} */ (window))).require) {
            /** @type {?} */
            const loaderScript = document.createElement('script');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS1lZGl0b3IudXRpbHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AY292YWxlbnQvY29kZS1lZGl0b3IvIiwic291cmNlcyI6WyJjb2RlLWVkaXRvci51dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLE9BQU8sRUFBYyxNQUFNLE1BQU0sQ0FBQzs7Ozs7QUFLM0MsTUFBTSxVQUFVLG9CQUFvQjs7UUFDOUIsWUFBWSxHQUFrQixJQUFJLE9BQU8sRUFBUTs7O1FBR2pELFFBQVEsR0FBUSxXQUFXOzs7SUFBQyxHQUFHLEVBQUU7UUFDbkMsSUFBSSxjQUFjLEVBQUUsRUFBRTtZQUNwQiw2Q0FBNkM7WUFDN0MsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3hCLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNwQixZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDekI7SUFDSCxDQUFDLEdBQUUsR0FBRyxDQUFDO0lBQ1AsT0FBTyxZQUFZLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDckMsQ0FBQzs7Ozs7QUFLRCxNQUFNLFVBQVUsY0FBYztJQUM1QixPQUFPLE9BQU8sQ0FBQyxtQkFBSyxNQUFNLEVBQUEsQ0FBQyxDQUFDLE1BQU0sS0FBSyxRQUFRLENBQUM7QUFDbEQsQ0FBQzs7Ozs7QUFLRCxNQUFNLFVBQVUsVUFBVTtJQUN4QixnR0FBZ0c7SUFDaEcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsc0JBQXNCLENBQUMsRUFBRTs7Y0FDOUMsY0FBYzs7O1FBQWUsR0FBRyxFQUFFO1lBQ3RDLGNBQWM7WUFDZCxDQUFDLG1CQUFLLE1BQU0sRUFBQSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNwRSxDQUFDLG1CQUFLLE1BQU0sRUFBQSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsdUJBQXVCLENBQUM7OztZQUFFLEdBQUcsRUFBRTtnQkFDcEQsT0FBTztZQUNULENBQUMsRUFBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFBO1FBRUQsK0JBQStCO1FBQy9CLElBQUksQ0FBQyxDQUFDLG1CQUFLLE1BQU0sRUFBQSxDQUFDLENBQUMsT0FBTyxFQUFFOztrQkFDcEIsWUFBWSxHQUFzQixRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztZQUN4RSxZQUFZLENBQUMsRUFBRSxHQUFHLHNCQUFzQixDQUFDO1lBQ3pDLFlBQVksQ0FBQyxJQUFJLEdBQUcsaUJBQWlCLENBQUM7WUFDdEMsWUFBWSxDQUFDLEdBQUcsR0FBRyw0QkFBNEIsQ0FBQztZQUNoRCxZQUFZLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3RELFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ3pDO2FBQU07WUFDTCxjQUFjLEVBQUUsQ0FBQztTQUNsQjtLQUNGO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcblxuLyoqXG4gKiBXYWl0cyB1bnRpbCBtb25hY28gaGFzIGJlZW4gbG9hZGVkIHNvIHdlIGNhbiByZWZlcmVuY2UgaXRzIGdsb2JhbCBvYmplY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3YWl0VW50aWxNb25hY29SZWFkeSgpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgbGV0IG1vbmFjb1JlYWR5JDogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLy8gY3JlYXRlIGludGVydmFsIHRvIGNoZWNrIGlmIG1vbmFjbyBoYXMgYmVlbiBsb2FkZWRcbiAgbGV0IGludGVydmFsOiBhbnkgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgaWYgKGlzTW9uYWNvTG9hZGVkKCkpIHtcbiAgICAgIC8vIGNsZWFyIGludGVydmFsIHdoZW4gbW9uYWNvIGhhcyBiZWVuIGxvYWRlZFxuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICBtb25hY29SZWFkeSQubmV4dCgpO1xuICAgICAgbW9uYWNvUmVhZHkkLmNvbXBsZXRlKCk7XG4gICAgfVxuICB9LCAxMDApO1xuICByZXR1cm4gbW9uYWNvUmVhZHkkLmFzT2JzZXJ2YWJsZSgpO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIG1vbmFjbyBoYXMgYmVlbiBsb2FkZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTW9uYWNvTG9hZGVkKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gdHlwZW9mICg8YW55PndpbmRvdykubW9uYWNvID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBMb2FkcyBtb25hY29cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRNb25hY28oKTogdm9pZCB7XG4gIC8vIGNoZWNrIGlmIHRoZSBzY3JpcHQgdGFnIGhhcyBiZWVuIGNyZWF0ZWQgaW4gY2FzZSBhbm90aGVyIGNvZGUgY29tcG9uZW50IGhhcyBkb25lIHRoaXMgYWxyZWFkeVxuICBpZiAoIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb25hY28tbG9hZGVyLXNjcmlwdCcpKSB7XG4gICAgY29uc3Qgb25Hb3RBbWRMb2FkZXI6ICgpID0+IHZvaWQgPSAoKSA9PiB7XG4gICAgICAvLyBMb2FkIG1vbmFjb1xuICAgICAgKDxhbnk+d2luZG93KS5yZXF1aXJlLmNvbmZpZyh7IHBhdGhzOiB7IHZzOiAnYXNzZXRzL21vbmFjby92cycgfSB9KTtcbiAgICAgICg8YW55PndpbmRvdykucmVxdWlyZShbJ3ZzL2VkaXRvci9lZGl0b3IubWFpbiddLCAoKSA9PiB7XG4gICAgICAgIC8vIFRPRE9cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBMb2FkIEFNRCBsb2FkZXIgaWYgbmVjZXNzYXJ5XG4gICAgaWYgKCEoPGFueT53aW5kb3cpLnJlcXVpcmUpIHtcbiAgICAgIGNvbnN0IGxvYWRlclNjcmlwdDogSFRNTFNjcmlwdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgIGxvYWRlclNjcmlwdC5pZCA9ICdtb25hY28tbG9hZGVyLXNjcmlwdCc7XG4gICAgICBsb2FkZXJTY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICAgICAgbG9hZGVyU2NyaXB0LnNyYyA9ICdhc3NldHMvbW9uYWNvL3ZzL2xvYWRlci5qcyc7XG4gICAgICBsb2FkZXJTY3JpcHQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uR290QW1kTG9hZGVyKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobG9hZGVyU2NyaXB0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgb25Hb3RBbWRMb2FkZXIoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==