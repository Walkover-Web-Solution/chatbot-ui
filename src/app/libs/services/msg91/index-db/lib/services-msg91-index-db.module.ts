import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { INDEX_DB_CONFIG } from './config';
import { IndexDbConfig } from './types';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91IndexDbModule {
    static forRoot(dbConfig: IndexDbConfig): ModuleWithProviders<ServicesMsg91IndexDbModule> {
        return {
            ngModule: ServicesMsg91IndexDbModule,
            providers: [ServicesMsg91IndexDbModule, { provide: INDEX_DB_CONFIG, useValue: dbConfig }],
        };
    }
}
