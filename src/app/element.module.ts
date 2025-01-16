import { ChatModule, ChatWidgetComponent } from './chat';
import { ApplicationRef, DoBootstrap, Injector, NgModule } from '@angular/core';
import { createCustomElement, NgElement, WithProperties } from '@angular/elements';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { MatDialogModule } from '@angular/material/dialog';

const conditional_imports = [];
if (environment.production) {
} else {
    conditional_imports.push(
        StoreDevtoolsModule.instrument({
            maxAge: 25,
            serialize: true,
        })
    );
}
declare let window;

function documentReady(fn) {
    // see if DOM is already available
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

window['initChatWidget'] = (config, delay = 5000) => {
    documentReady(() => {
        if (config?.widgetToken) {
            const chatwidget = document.createElement('chat-widget') as NgElement & WithProperties<ChatWidgetComponent>;
            chatwidget.widgetToken = config.widgetToken;
            chatwidget.name = config.name;
            chatwidget.number = config.number;
            chatwidget.mail = config.mail;
            chatwidget.additionalData = config;
            chatwidget.unique_id = config.unique_id;
            chatwidget.user_jwt_token = config.user_jwt_token;
            chatwidget.delay = delay;
            chatwidget.isMobileSDK = config?.isMobileSDK ? config?.isMobileSDK : false;
            chatwidget.sdkConfig = config?.sdkConfig;
            chatwidget.hideUpload = config?.hide_upload;
            chatwidget.botConfig =
                config?.bot_type && config?.bot_id
                    ? {
                          bot_type: config?.bot_type,
                          bot_id: config?.bot_id,
                          type: 'trial_bot',
                          session_id: `trial-${config?.bot_type}-${config?.bot_id}-${new Date().getTime()}`,
                      }
                    : null;
            chatwidget.widgetClientData = config?.widgetClientData;
            if (config?.isMobileSDK && config?.widgetClose) {
                chatwidget.widgetClose = config?.widgetClose;
            }
            document.getElementsByTagName('body')[0].append(chatwidget);

            const viewportMetaTag = document.createElement('meta');
            viewportMetaTag.setAttribute('name', 'viewport');
            viewportMetaTag.setAttribute('id', 'viewportMetaTagRef');
            viewportMetaTag.setAttribute(
                'content',
                'width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no'
            );
            document.getElementsByTagName('head')[0].appendChild(viewportMetaTag);
        } else {
            throw Error('widgetToken is missing !');
        }
    });
};

@NgModule({
    imports: [BrowserModule, BrowserAnimationsModule, MatDialogModule, ChatModule, ...conditional_imports],
    exports: [ChatModule],
})
export class ElementModule implements DoBootstrap {
    constructor(private injector: Injector) {
        if (!environment.production) {
            if (!customElements.get('chat-widget')) {
                const chatWidget = <any>createCustomElement(ChatWidgetComponent, {
                    injector: this.injector,
                });
                customElements.define('chat-widget', chatWidget);
            }
        }
    }

    ngDoBootstrap(appRef: ApplicationRef) {
        if (!customElements.get('chat-widget')) {
            const chatWidget = <any>createCustomElement(ChatWidgetComponent, {
                injector: this.injector,
            });
            customElements.define('chat-widget', chatWidget);
        }
    }
}
