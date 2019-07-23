/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
import { Subject } from 'rxjs';
/**
 * Waits until monaco has been loaded so we can reference its global object.
 * @return {?}
 */
export function waitUntilMonacoReady() {
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
export function isMonacoLoaded() {
    return typeof (((/** @type {?} */ (window))).monaco) === 'object';
}
/**
 * Loads monaco
 * @return {?}
 */
export function loadMonaco() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS1lZGl0b3IudXRpbHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AY292YWxlbnQvY29kZS1lZGl0b3IvIiwic291cmNlcyI6WyJjb2RlLWVkaXRvci51dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLE9BQU8sRUFBYyxNQUFNLE1BQU0sQ0FBQzs7Ozs7QUFLM0MsTUFBTSxVQUFVLG9CQUFvQjs7UUFDOUIsWUFBWSxHQUFrQixJQUFJLE9BQU8sRUFBUTs7O1FBR2pELFFBQVEsR0FBUSxXQUFXLENBQUM7UUFDOUIsSUFBSSxjQUFjLEVBQUUsRUFBRTtZQUNwQiw2Q0FBNkM7WUFDN0MsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3hCLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNwQixZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDekI7SUFDSCxDQUFDLEVBQUUsR0FBRyxDQUFDO0lBQ1AsT0FBTyxZQUFZLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDckMsQ0FBQzs7Ozs7QUFLRCxNQUFNLFVBQVUsY0FBYztJQUM1QixPQUFPLE9BQU0sQ0FBQyxDQUFDLG1CQUFLLE1BQU0sRUFBQSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssUUFBUSxDQUFDO0FBQ25ELENBQUM7Ozs7O0FBS0QsTUFBTSxVQUFVLFVBQVU7SUFDeEIsZ0dBQWdHO0lBQ2hHLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLHNCQUFzQixDQUFDLEVBQUU7O1lBQzlDLGNBQWMsR0FBZTtZQUNqQyxjQUFjO1lBQ2QsQ0FBQyxtQkFBSyxNQUFNLEVBQUEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDdEUsQ0FBQyxtQkFBSyxNQUFNLEVBQUEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLHVCQUF1QixDQUFDLEVBQUU7Z0JBQy9DLE9BQU87WUFDVCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCwrQkFBK0I7UUFDL0IsSUFBSSxDQUFDLENBQUMsbUJBQUssTUFBTSxFQUFBLENBQUMsQ0FBQyxPQUFPLEVBQUU7O2dCQUNwQixZQUFZLEdBQXNCLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO1lBQ3hFLFlBQVksQ0FBQyxFQUFFLEdBQUcsc0JBQXNCLENBQUM7WUFDekMsWUFBWSxDQUFDLElBQUksR0FBRyxpQkFBaUIsQ0FBQztZQUN0QyxZQUFZLENBQUMsR0FBRyxHQUFHLDRCQUE0QixDQUFDO1lBQ2hELFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDdEQsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDekM7YUFBTTtZQUNMLGNBQWMsRUFBRSxDQUFDO1NBQ2xCO0tBQ0Y7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3ViamVjdCwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuXG4vKipcbiAqIFdhaXRzIHVudGlsIG1vbmFjbyBoYXMgYmVlbiBsb2FkZWQgc28gd2UgY2FuIHJlZmVyZW5jZSBpdHMgZ2xvYmFsIG9iamVjdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdhaXRVbnRpbE1vbmFjb1JlYWR5KCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICBsZXQgbW9uYWNvUmVhZHkkOiBTdWJqZWN0PHZvaWQ+ID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvLyBjcmVhdGUgaW50ZXJ2YWwgdG8gY2hlY2sgaWYgbW9uYWNvIGhhcyBiZWVuIGxvYWRlZFxuICBsZXQgaW50ZXJ2YWw6IGFueSA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICBpZiAoaXNNb25hY29Mb2FkZWQoKSkge1xuICAgICAgLy8gY2xlYXIgaW50ZXJ2YWwgd2hlbiBtb25hY28gaGFzIGJlZW4gbG9hZGVkXG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgIG1vbmFjb1JlYWR5JC5uZXh0KCk7XG4gICAgICBtb25hY29SZWFkeSQuY29tcGxldGUoKTtcbiAgICB9XG4gIH0sIDEwMCk7XG4gIHJldHVybiBtb25hY29SZWFkeSQuYXNPYnNlcnZhYmxlKCk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgbW9uYWNvIGhhcyBiZWVuIGxvYWRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNNb25hY29Mb2FkZWQoKTogYm9vbGVhbiB7XG4gIHJldHVybiB0eXBlb2YoKDxhbnk+d2luZG93KS5tb25hY28pID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBMb2FkcyBtb25hY29cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRNb25hY28oKTogdm9pZCB7XG4gIC8vIGNoZWNrIGlmIHRoZSBzY3JpcHQgdGFnIGhhcyBiZWVuIGNyZWF0ZWQgaW4gY2FzZSBhbm90aGVyIGNvZGUgY29tcG9uZW50IGhhcyBkb25lIHRoaXMgYWxyZWFkeVxuICBpZiAoIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb25hY28tbG9hZGVyLXNjcmlwdCcpKSB7XG4gICAgY29uc3Qgb25Hb3RBbWRMb2FkZXI6ICgpID0+IHZvaWQgPSAoKSA9PiB7XG4gICAgICAvLyBMb2FkIG1vbmFjb1xuICAgICAgKDxhbnk+d2luZG93KS5yZXF1aXJlLmNvbmZpZyh7IHBhdGhzOiB7ICd2cyc6ICdhc3NldHMvbW9uYWNvL3ZzJyB9IH0pO1xuICAgICAgKDxhbnk+d2luZG93KS5yZXF1aXJlKFsndnMvZWRpdG9yL2VkaXRvci5tYWluJ10sICgpID0+IHtcbiAgICAgICAgLy8gVE9ET1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIExvYWQgQU1EIGxvYWRlciBpZiBuZWNlc3NhcnlcbiAgICBpZiAoISg8YW55PndpbmRvdykucmVxdWlyZSkge1xuICAgICAgY29uc3QgbG9hZGVyU2NyaXB0OiBIVE1MU2NyaXB0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgbG9hZGVyU2NyaXB0LmlkID0gJ21vbmFjby1sb2FkZXItc2NyaXB0JztcbiAgICAgIGxvYWRlclNjcmlwdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG4gICAgICBsb2FkZXJTY3JpcHQuc3JjID0gJ2Fzc2V0cy9tb25hY28vdnMvbG9hZGVyLmpzJztcbiAgICAgIGxvYWRlclNjcmlwdC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgb25Hb3RBbWRMb2FkZXIpO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsb2FkZXJTY3JpcHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvbkdvdEFtZExvYWRlcigpO1xuICAgIH1cbiAgfVxufVxuIl19