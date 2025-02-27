import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';

import { Observable } from 'rxjs';
import { CHAT_SECTION, IWidgetTeam } from '../../../model';
import { IAppState } from '../../../store';
import { select, Store } from '@ngrx/store';
import { getTeamAssignees, getWidgetTheme, selectAllTeams } from '../../../store/selectors';
import { distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import { isEqual } from 'lodash-es';
import * as actions from '../../../store/actions';
import { environment } from '../../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'msg91-team-list',
    templateUrl: './team-list.component.html',
    styleUrls: ['./team-list.component.scss'],
    standalone: false
})
export class TeamListComponent extends BaseComponent implements OnInit, OnDestroy {
    public teamAssignees$: { [teamID: number]: Observable<string[]> } = {};
    public teams$: Observable<IWidgetTeam[]>;
    appurl: string = environment.appUrl;
    public backgroundImage: any;
    public primaryColor: string;

    constructor(private store: Store<IAppState>, private sanitizer: DomSanitizer) {
        super();
    }

    ngOnInit() {
        this.teams$ = this.store.pipe(
            select(selectAllTeams),
            takeUntil(this.destroy$),
            distinctUntilChanged(isEqual),
            tap((x) => {
                if (x?.length) {
                    x.forEach((team) => {
                        this.teamAssignees$[team.id] = this.store.pipe(
                            select(getTeamAssignees(team.id)),
                            takeUntil(this.destroy$),
                            distinctUntilChanged(isEqual)
                        );
                    });
                }
            })
        );

        this.store
            .pipe(select(getWidgetTheme), takeUntil(this.destroy$), distinctUntilChanged(isEqual))
            .subscribe((res) => {
                if (res) {
                    this.backgroundImage = res.gradientHeader
                        ? this.transform(
                              `url( \'${this.appurl}assets/img/bg-branding.png\'), linear-gradient(211deg, ${res?.primaryColorDark} 44%, ${res?.primaryColorDark} 40.2%, ${res?.primaryColorLight} 116.5%, ${res?.primaryColorLight} 102.1%)`
                          )
                        : '';
                    this.primaryColor = res.primaryColor;
                }
            });
    }

    transform(style) {
        return this.sanitizer.bypassSecurityTrustStyle(style);
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    public selectTeam(id: number) {
        this.store.dispatch(actions.selectTeam({ teamId: id.toString() }));
        this.store.dispatch(actions.setChatScreen({ chatScreen: CHAT_SECTION.selectedChannel }));
    }

    public backToChat() {
        this.store.dispatch(actions.setChatScreen({ chatScreen: null }));
    }
}
