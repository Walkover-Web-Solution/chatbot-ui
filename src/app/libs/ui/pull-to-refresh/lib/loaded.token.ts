import { InjectionToken } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';

export const LOADED = new InjectionToken<Observable<unknown>>('Stream that emits when loading is over', {
    factory: () => EMPTY,
});
