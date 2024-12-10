import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

@Pipe({
    name: 'relativeTime',
    pure: true,
})
export class RelativeTimePipe implements PipeTransform {
    transform(date: string, diff: boolean, format: string): string {
        if (!diff) {
            if (date) {
                const time = format && format?.length ? dayjs(date).format(format) : dayjs(date);
                const relativeTime = dayjs(time).fromNow();
                return relativeTime;
            } else {
                return '-';
            }
        } else {
            if (date) {
                const date1 = dayjs.utc(date);
                const date2 = dayjs.utc(dayjs().format());
                const diffInSeconds = date2.diff(date1, 'second');
                const diffInMinutes = date2.diff(date1, 'minute');
                const diffInHours = date2.diff(date1, 'hour');
                if (diffInSeconds < 60) {
                    return `${diffInSeconds} sec`;
                } else if (diffInMinutes < 60) {
                    const remainingSeconds = diffInSeconds % 60;
                    return `${diffInMinutes} min ${remainingSeconds} sec`;
                } else {
                    const remainingMinutes = diffInMinutes % 60;
                    const remainingSeconds = diffInSeconds % 60;
                    return `${diffInHours} hrs ${remainingMinutes} min ${remainingSeconds} sec`;
                }
            } else {
                return '-';
            }
        }
    }
}

@NgModule({
    imports: [],
    declarations: [RelativeTimePipe],
    exports: [RelativeTimePipe],
})
export class PipesRelativeTimePipeModule {
    public static forRoot(): ModuleWithProviders<PipesRelativeTimePipeModule> {
        return {
            ngModule: PipesRelativeTimePipeModule,
            providers: [RelativeTimePipe],
        };
    }
}
