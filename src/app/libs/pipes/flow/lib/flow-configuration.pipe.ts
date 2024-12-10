import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'flowConfiguration',
})
export class FlowConfigurationData implements PipeTransform {
    transform(configData: Array<any>, configName: string, requiredKey: string = 'value') {
        if (!configData || !configData?.length) {
            return '';
        }
        return configData.find((config) => config.name === configName)?.[requiredKey];
    }
}
