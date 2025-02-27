import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';
import { IFeedbackMessage, IPostFeedback, Ratings } from '../../../../../model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../../../../environments/environment';

@Component({
    selector: 'msg91-feedback-form',
    templateUrl: './feedback-form.component.html',
    styleUrls: ['./feedback-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class FeedbackFormComponent extends BaseComponent implements OnInit, OnDestroy, OnChanges {
    @Input() message: IFeedbackMessage;
    @Input() dynamicValue: any;
    @Input() feedbackSetting: { text: string; logo: string };
    @Output() postFeedback: EventEmitter<IPostFeedback> = new EventEmitter<IPostFeedback>();
    feedbackForm: FormGroup = new FormGroup({
        feedback_msg: new FormControl('', [Validators.required]),
        rating: new FormControl('', [Validators.required]),
        token: new FormControl('', [Validators.required]),
    });
    ratings = Ratings;
    appurl: string = environment.appUrl;
    variableMapping = {};

    constructor() {
        super();
    }

    ngOnInit() {
        if ((this.message as IFeedbackMessage)?.feedbackGiven) {
            this.feedbackForm.patchValue({
                feedback_msg: (this.message as IFeedbackMessage)?.feedback_msg || '',
                rating: (this.message as IFeedbackMessage)?.rating,
                token: (this.message as IFeedbackMessage)?.token,
            });
            this.feedbackForm.updateValueAndValidity();
            // this.confirmFeedback = true;
        } else {
            this.feedbackForm.patchValue({
                token: (this.message as IFeedbackMessage)?.token,
            });
        }
        this.feedbackForm.updateValueAndValidity();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.dynamicValue?.currentValue && this.dynamicValue && Object.keys(this.dynamicValue)?.length) {
            for (let key in this.dynamicValue) {
                this.variableMapping[`##${key}##`] = this.dynamicValue[key];
            }
        }
    }

    selectRating(ratingType: string) {
        if (this.message?.feedbackGiven) {
            return;
        }
        this.feedbackForm.get('rating')?.setValue(ratingType);
        this.feedbackForm.get('rating')?.updateValueAndValidity();
        this.feedbackForm?.updateValueAndValidity();
        // console.log(ratingType);
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    submit() {
        if (!this.feedbackForm.invalid) {
            const message: IPostFeedback = this.feedbackForm.getRawValue();
            this.postFeedback.next(message);
        }
    }
}
