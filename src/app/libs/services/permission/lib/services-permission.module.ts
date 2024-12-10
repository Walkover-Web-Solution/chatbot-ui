import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@NgModule({
    imports: [CommonModule],
})
export class ServicesPermissionModule {}

@Injectable({
    providedIn: ServicesPermissionModule,
})
export class MSG91PermissionService {
    private allowedPermissions = new Set<string>();
    public permissionChanged = new BehaviorSubject<number>(0);

    public addPermissions(permissions: string[]): void {
        permissions?.forEach((permission) => this.allowedPermissions.add(permission));
        this.permissionChanged.next(this.permissionChanged.getValue() + 1);
        console.log('addPermissions', this.permissionChanged.getValue());
    }

    public hasPermission(permission: string): Promise<boolean> {
        return Promise.resolve(this.allowedPermissions.has(permission));
    }

    public flushPermissions(): void {
        this.allowedPermissions.clear();
        this.permissionChanged.next(this.permissionChanged.getValue() + 1);
        console.log('flushPermissions', this.permissionChanged.getValue());
    }
}
