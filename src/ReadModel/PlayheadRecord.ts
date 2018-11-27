import { Record } from 'immutable';
import { INITIAL_PLAYHEAD, Playhead } from '../ValueObject/Playhead';
import { PlayheadError } from './Error/PlayheadError';

/**
 * Make all properties in T null able
 */
export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

export interface WithPlayheadInterface {
  readonly playhead: Playhead;
  setPlayhead(playhead?: Playhead): this;
  play(): this;
}

export function RecordWithPlayhead<T, DefaultProps = Nullable<T>>(defaultState: DefaultProps, name: string, initialPlayhead: Playhead = INITIAL_PLAYHEAD) {
  type WithPlayhead = { playhead: Playhead } & T;
  const Factory: any = Record<WithPlayhead>({ playhead: initialPlayhead, ...(defaultState as any) }, name);
  return class PlayheadRecord extends Factory {
    public setPlayhead(playhead?: Playhead): this {
      if (this.playhead + 1 !== playhead) {
        throw PlayheadError.doesNotMatch(this.playhead, playhead);
      }
      return this.set('playhead', playhead);
    }
  } as any as new (defaultProps?: DefaultProps) => (WithPlayheadInterface & Record<WithPlayhead> & WithPlayhead);
}
