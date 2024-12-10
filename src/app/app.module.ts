import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { ElementModule } from './element.module';
import { environment } from '../environments/environment';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AppComponent } from './app.component';

const conditional_imports = [];
if (environment.production) {
} else {
    conditional_imports.push(
        StoreDevtoolsModule.instrument({
            maxAge: 125,
            serialize: true,
        })
    );
}

@NgModule({
    imports: [BrowserModule, BrowserAnimationsModule, ElementModule, ...conditional_imports],
    declarations: [AppComponent],
    bootstrap: [AppComponent],
})
export class AppModule {}
