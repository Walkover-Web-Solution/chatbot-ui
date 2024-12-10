import { ApplicationRef, ComponentFactoryResolver, Injectable, Injector } from '@angular/core';
import { ArticlePopupComponent } from './article-popup.component';
import { NgElement, WithProperties } from '@angular/elements';
import { Observable } from 'rxjs';

@Injectable()
export class ArticlePopupService {
    constructor(
        private injector: Injector,
        private applicationRef: ApplicationRef,
        private componentFactoryResolver: ComponentFactoryResolver
    ) {}

    // Previous dynamic-loading method required you to set up infrastructure
    // before adding the popup to the DOM.
    // showAsComponent(message: string) {
    //   // Create element
    //   const popup = document.createElement('popup-component');
    //
    //   // Create the component and wire it up with the element
    //   const factory = this.componentFactoryResolver.resolveComponentFactory(ArticlePopupComponent);
    //   const popupComponentRef = factory.create(this.injector, [], popup);
    //
    //   // Attach to the view so that the change detector knows to run
    //   this.applicationRef.attachView(popupComponentRef.hostView);
    //
    //   // Listen to the close event
    //   popupComponentRef.instance.closed.subscribe(() => {
    //     document.body.removeChild(popup);
    //     this.applicationRef.detachView(popupComponentRef.hostView);
    //   });
    //
    //   // Set the message
    //   popupComponentRef.instance.message = message;
    //
    //   // Add to the DOM
    //   document.body.appendChild(popup);
    // }

    // This uses the new custom-element method to add the popup to the DOM.
    showAsElement(
        title: string,
        notification: {
            content: string;
            horizontal_position?: string;
            vertical_position?: string;
            isNotification?: boolean;
            width: string;
            height: string;
        }
    ) {
        // Create element
        const popupEl: NgElement & WithProperties<ArticlePopupComponent> = document.createElement(
            'popup-element'
        ) as any;

        // Listen to the close event
        popupEl.addEventListener('closed', () => document.body.removeChild(popupEl));

        // Set the message
        popupEl.message = notification?.content;
        popupEl.position = {
            horizontal_position: notification?.horizontal_position ?? 'center',
            vertical_position: notification?.vertical_position ?? 'center',
        };
        popupEl.size = {
            width: notification?.width,
            height: notification?.height,
        };
        if (Object.hasOwn(notification, 'isNotification')) {
            popupEl.isNotification = notification.isNotification;
        }
        popupEl.title = title;

        // Add to the DOM
        document.body.appendChild(popupEl);
    }
}
