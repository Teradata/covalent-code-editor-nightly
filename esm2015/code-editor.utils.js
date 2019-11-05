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
    const monacoReady$ = new Subject();
    // create interval to check if monaco has been loaded
    /** @type {?} */
    const interval = setInterval((/**
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS1lZGl0b3IudXRpbHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AY292YWxlbnQvY29kZS1lZGl0b3IvIiwic291cmNlcyI6WyJjb2RlLWVkaXRvci51dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLE9BQU8sRUFBYyxNQUFNLE1BQU0sQ0FBQzs7Ozs7QUFLM0MsTUFBTSxVQUFVLG9CQUFvQjs7VUFDNUIsWUFBWSxHQUFrQixJQUFJLE9BQU8sRUFBUTs7O1VBR2pELFFBQVEsR0FBUSxXQUFXOzs7SUFBQyxHQUFHLEVBQUU7UUFDckMsSUFBSSxjQUFjLEVBQUUsRUFBRTtZQUNwQiw2Q0FBNkM7WUFDN0MsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3hCLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNwQixZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDekI7SUFDSCxDQUFDLEdBQUUsR0FBRyxDQUFDO0lBQ1AsT0FBTyxZQUFZLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDckMsQ0FBQzs7Ozs7QUFLRCxNQUFNLFVBQVUsY0FBYztJQUM1QixPQUFPLE9BQU8sQ0FBQyxtQkFBSyxNQUFNLEVBQUEsQ0FBQyxDQUFDLE1BQU0sS0FBSyxRQUFRLENBQUM7QUFDbEQsQ0FBQzs7Ozs7QUFLRCxNQUFNLFVBQVUsVUFBVTtJQUN4QixnR0FBZ0c7SUFDaEcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsc0JBQXNCLENBQUMsRUFBRTs7Y0FDOUMsY0FBYzs7O1FBQWUsR0FBRyxFQUFFO1lBQ3RDLGNBQWM7WUFDZCxDQUFDLG1CQUFLLE1BQU0sRUFBQSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNwRSxDQUFDLG1CQUFLLE1BQU0sRUFBQSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsdUJBQXVCLENBQUM7OztZQUFFLEdBQUcsRUFBRTtnQkFDcEQsT0FBTztZQUNULENBQUMsRUFBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFBO1FBRUQsK0JBQStCO1FBQy9CLElBQUksQ0FBQyxDQUFDLG1CQUFLLE1BQU0sRUFBQSxDQUFDLENBQUMsT0FBTyxFQUFFOztrQkFDcEIsWUFBWSxHQUFzQixRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztZQUN4RSxZQUFZLENBQUMsRUFBRSxHQUFHLHNCQUFzQixDQUFDO1lBQ3pDLFlBQVksQ0FBQyxJQUFJLEdBQUcsaUJBQWlCLENBQUM7WUFDdEMsWUFBWSxDQUFDLEdBQUcsR0FBRyw0QkFBNEIsQ0FBQztZQUNoRCxZQUFZLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3RELFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ3pDO2FBQU07WUFDTCxjQUFjLEVBQUUsQ0FBQztTQUNsQjtLQUNGO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcblxuLyoqXG4gKiBXYWl0cyB1bnRpbCBtb25hY28gaGFzIGJlZW4gbG9hZGVkIHNvIHdlIGNhbiByZWZlcmVuY2UgaXRzIGdsb2JhbCBvYmplY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3YWl0VW50aWxNb25hY29SZWFkeSgpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgY29uc3QgbW9uYWNvUmVhZHkkOiBTdWJqZWN0PHZvaWQ+ID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvLyBjcmVhdGUgaW50ZXJ2YWwgdG8gY2hlY2sgaWYgbW9uYWNvIGhhcyBiZWVuIGxvYWRlZFxuICBjb25zdCBpbnRlcnZhbDogYW55ID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgIGlmIChpc01vbmFjb0xvYWRlZCgpKSB7XG4gICAgICAvLyBjbGVhciBpbnRlcnZhbCB3aGVuIG1vbmFjbyBoYXMgYmVlbiBsb2FkZWRcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgbW9uYWNvUmVhZHkkLm5leHQoKTtcbiAgICAgIG1vbmFjb1JlYWR5JC5jb21wbGV0ZSgpO1xuICAgIH1cbiAgfSwgMTAwKTtcbiAgcmV0dXJuIG1vbmFjb1JlYWR5JC5hc09ic2VydmFibGUoKTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBtb25hY28gaGFzIGJlZW4gbG9hZGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc01vbmFjb0xvYWRlZCgpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiAoPGFueT53aW5kb3cpLm1vbmFjbyA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogTG9hZHMgbW9uYWNvXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkTW9uYWNvKCk6IHZvaWQge1xuICAvLyBjaGVjayBpZiB0aGUgc2NyaXB0IHRhZyBoYXMgYmVlbiBjcmVhdGVkIGluIGNhc2UgYW5vdGhlciBjb2RlIGNvbXBvbmVudCBoYXMgZG9uZSB0aGlzIGFscmVhZHlcbiAgaWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9uYWNvLWxvYWRlci1zY3JpcHQnKSkge1xuICAgIGNvbnN0IG9uR290QW1kTG9hZGVyOiAoKSA9PiB2b2lkID0gKCkgPT4ge1xuICAgICAgLy8gTG9hZCBtb25hY29cbiAgICAgICg8YW55PndpbmRvdykucmVxdWlyZS5jb25maWcoeyBwYXRoczogeyB2czogJ2Fzc2V0cy9tb25hY28vdnMnIH0gfSk7XG4gICAgICAoPGFueT53aW5kb3cpLnJlcXVpcmUoWyd2cy9lZGl0b3IvZWRpdG9yLm1haW4nXSwgKCkgPT4ge1xuICAgICAgICAvLyBUT0RPXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gTG9hZCBBTUQgbG9hZGVyIGlmIG5lY2Vzc2FyeVxuICAgIGlmICghKDxhbnk+d2luZG93KS5yZXF1aXJlKSB7XG4gICAgICBjb25zdCBsb2FkZXJTY3JpcHQ6IEhUTUxTY3JpcHRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICBsb2FkZXJTY3JpcHQuaWQgPSAnbW9uYWNvLWxvYWRlci1zY3JpcHQnO1xuICAgICAgbG9hZGVyU2NyaXB0LnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JztcbiAgICAgIGxvYWRlclNjcmlwdC5zcmMgPSAnYXNzZXRzL21vbmFjby92cy9sb2FkZXIuanMnO1xuICAgICAgbG9hZGVyU2NyaXB0LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbkdvdEFtZExvYWRlcik7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxvYWRlclNjcmlwdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9uR290QW1kTG9hZGVyKCk7XG4gICAgfVxuICB9XG59XG4iXX0=