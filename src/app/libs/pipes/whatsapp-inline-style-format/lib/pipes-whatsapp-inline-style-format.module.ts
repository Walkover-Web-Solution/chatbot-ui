import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';
import { FORMAT_WHATSAPP_BODY } from '@msg91/models/whatsapp-models';

@Pipe({
    name: 'whatsAppInlineStyleFormat',
    standalone: false
})
export class WhatsappInlineStyleFormat implements PipeTransform {
    public formatWhatsAppBody = FORMAT_WHATSAPP_BODY;

    transform(value: any): string {
        if (value) {
            let formattedContent = value;
            for (let key in this.formatWhatsAppBody) {
                if (formattedContent?.text && formattedContent?.text?.body !== null) {
                    formattedContent = formattedContent?.text?.body?.replaceAll(
                        this.formatWhatsAppBody[key]?.regex,
                        this.formatWhatsAppBody[key]?.replace
                    );
                } else {
                    formattedContent = formattedContent.replaceAll(
                        this.formatWhatsAppBody[key]?.regex,
                        this.formatWhatsAppBody[key]?.replace
                    );
                }
            }
            return formattedContent;
        }
        return value;
    }
}

@NgModule({
    declarations: [WhatsappInlineStyleFormat],
    exports: [WhatsappInlineStyleFormat],
})
export class PipesWhatsappInlineStyleFormatModule {
    public static forRoot(): ModuleWithProviders<PipesWhatsappInlineStyleFormatModule> {
        return {
            ngModule: PipesWhatsappInlineStyleFormatModule,
            providers: [WhatsappInlineStyleFormat],
        };
    }
}
