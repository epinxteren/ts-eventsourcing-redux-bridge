import {DeepPartial, Store} from "redux";
import {SerializableAction} from "../SerializableAction";

export interface StoreFactory<S, A extends SerializableAction> {

  create(): Store<S, A>;

  createFromState(state: DeepPartial<S>): Store<S, A>;

}
