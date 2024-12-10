import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhoneNumberFormat } from 'google-libphonenumber';
import { PhoneNumberUtil } from 'google-libphonenumber';

@Pipe({
    name: 'mobileNumberFormat',
})
export class MobileNumberFormatPipe implements PipeTransform {
    transform(value: string): string {
        const phoneUtil = PhoneNumberUtil.getInstance();
        try {
            return phoneUtil.format(phoneUtil.parseAndKeepRawInput(value), PhoneNumberFormat.INTERNATIONAL);
        } catch (e) {
            return value;
        }
    }
}

@NgModule({
    imports: [CommonModule],
    declarations: [MobileNumberFormatPipe],
    exports: [MobileNumberFormatPipe],
    providers: [MobileNumberFormatPipe],
})
export class PipesMobileNumberFormatModule {}
