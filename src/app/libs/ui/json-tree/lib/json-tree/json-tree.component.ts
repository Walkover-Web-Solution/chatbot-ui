import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { KeyValuePairSelectionEvent } from '../..';

@Component({
    selector: 'msg91-json-tree',
    templateUrl: './json-tree.component.html',
    styleUrls: ['./json-tree.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonTreeComponent {
    /** JSON data */
    @Input() jsonData: { [key: string]: any };
    /** Object key classes  */
    @Input() classesForKey: string = '';
    /** Object value classes. */
    @Input() classesForValue: string = '';
    /** Checkbox classes. */
    @Input() classesForCheckbox: string = '';
    /** Object key value wrapper classes. */
    @Input() classesForKeyPairWrapper: string = 'nested';
    /** Event on Key Value Pair selection */
    @Output() keyValueSelected = new EventEmitter<KeyValuePairSelectionEvent>();

    /**
     * Event emitted on checkbox value change
     *
     * @param {KeyValuePairSelectionEvent} response
     * @memberof JsonTreeComponent
     */
    public checkboxValueChange(response: KeyValuePairSelectionEvent) {
        this.keyValueSelected.emit(response);
    }
}
