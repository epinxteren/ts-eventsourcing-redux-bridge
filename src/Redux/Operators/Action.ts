import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CommandAction } from '../CommandAction';

export function ofType(...type: string[]) {
  return (input: Observable<CommandAction>) => {
    return input.pipe(filter(action => type.indexOf(action.type) >= 0));
  };
}
