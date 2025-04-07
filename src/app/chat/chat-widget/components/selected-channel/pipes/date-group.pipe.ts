import { Pipe, PipeTransform } from '@angular/core';
import { IMessage } from '../../../../model';
import dayjs from 'dayjs';

@Pipe({
    name: 'DateGroup',
    standalone: false
})
export class DateGroupPipe implements PipeTransform {
    transform(value: IMessage[]): IMessage[][] {
        if (value?.length) {
            const result = [[]];
            let currentGroup = 0;
            for (let i = 0; i < value.length; i++) {
                if (value[i]?.timetoken) {
                    let timetoken =
                        typeof value[i]?.timetoken === 'string' ? +value[i]?.timetoken : value[i]?.timetoken;
                    const length = timetoken?.toString().length;
                    if (length > 13) {
                        timetoken = +timetoken?.toString().substr(0, 13);
                    }
                    let cgTimetoken;
                    if (result[currentGroup][0]) {
                        cgTimetoken =
                            typeof result[currentGroup][0]?.timetoken === 'string'
                                ? +result[currentGroup][0]?.timetoken
                                : result[currentGroup][0]?.timetoken;
                        const cglength = cgTimetoken.toString().length;
                        if (cglength > 13) {
                            cgTimetoken = +cgTimetoken?.toString().substr(0, 13);
                        }
                    } else {
                        cgTimetoken = +timetoken;
                    }
                    const currentGroupMoment = dayjs(cgTimetoken);
                    const currentMoment = dayjs(timetoken);
                    if (
                        currentMoment.diff(currentGroupMoment, 'hour') < 24 &&
                        currentGroupMoment.get('date') === currentMoment.get('date')
                    ) {
                        result[currentGroup].push(value[i]);
                    } else {
                        currentGroup = currentGroup + 1;
                        result[currentGroup] = [];
                        result[currentGroup].push(value[i]);
                    }
                }
            }
            return result;
        }
        return [[]];
    }
}
