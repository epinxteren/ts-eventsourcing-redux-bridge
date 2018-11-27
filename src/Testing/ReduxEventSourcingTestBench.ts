import { EntityName } from '../ValueObject/EntityName';
import { EventSourcingTestBench } from 'ts-eventsourcing/Testing';
import { DomainEventAction, DomainEventMetadata } from '../ReadModel/DomainEventAction';
import { INITIAL_PLAYHEAD, Playhead } from '../ValueObject/Playhead';
import { List, Record, Map } from 'immutable';
import { Identity } from 'ts-eventsourcing/ValueObject/Identity';
import { actionForDomainMessage } from '../ReadModel/actions';
import { DomainEvent } from 'ts-eventsourcing/Domain/DomainEvent';
import { SerializableAction } from '../Redux/SerializableAction';
import { Reducer } from 'redux';
import { GateWayFactoryMock } from './GateWayFactoryMock';
import { ReduxReadModelTestContext } from './Context/ReduxReadModelTestContext';

export class ReduxEventSourcingTestBench extends EventSourcingTestBench {

  public static create(currentTime?: Date | string) {
    return new this(currentTime);
  }

  public getReduxReadModelTestContext<Id extends Identity, State extends Record<any>>(state: State, reducer: Reducer<State, SerializableAction>): ReduxReadModelTestContext<Id, State> {
    const name = Record.getDescriptiveName(state);
    let context: ReduxReadModelTestContext<Id, State> = this.models.getByName(name) as any;
    if (context) {
      if (!(context instanceof ReduxReadModelTestContext)) {
        throw new Error(`Test context with name ${name} is not an instanceof ReduxReadModelTestContext`);
      }
      return context;
    }
    context = new ReduxReadModelTestContext<Id, State>(state, reducer);
    this.models.map[name] = context;
    return context;
  }

  public createActionGatewayFactory<Id extends Identity, State extends Record<any>>(state: State, reducer: Reducer<State, SerializableAction>): GateWayFactoryMock<State, Id, any> {
    const context = this.getReduxReadModelTestContext<Id, State>(state, reducer);
    return context.gatewayFactory;
  }

  public getActionGateway<Id extends Identity, State extends Record<any>>(state: State): GateWayFactoryMock<State, Id, any> {
    const name = Record.getDescriptiveName(state);
    const context: ReduxReadModelTestContext<Id, State> = this.models.getByName(name) as any;
    if (!context) {
      throw new Error(`Context for ${name} state does not yet exists`);
    }
    if (!(context instanceof ReduxReadModelTestContext)) {
      throw new Error(`Test context with name ${name} is not an instanceof ReduxReadModelTestContext`);
    }
    return context.gatewayFactory;
  }

  public thenActionsShouldBeTransmitted<State extends Record<any>>(expectedActions: SerializableAction[], state?: State, options?: any) {
    return this.addTask(async () => {
      expect(await this.getTransmittedActions(state, options)).toEqual(expectedActions);
    });
  }

  public thenActionsShouldMatchSnapshot<State extends Record<any>>(state?: State, options?: any) {
    return this.addTask(async () => {
      expect(await this.getTransmittedActions(state, options)).toMatchSnapshot();
    });
  }

  public createAction<ReadModelId extends Identity, AggregateId extends Identity>(
    modelId: ReadModelId,
    aggregateId: AggregateId,
    entity: EntityName,
    event: DomainEvent,
    playhead: Playhead = 0,
    metadata: { entity?: string, [extraProps: string]: any } = {}):
    DomainEventAction<DomainEvent, ReadModelId, AggregateId, DomainEventMetadata<ReadModelId, AggregateId> & typeof metadata> {
    const domainMessage = this.domainMessageFactory.createDomainMessage<AggregateId>(aggregateId, event);
    const action = actionForDomainMessage<ReadModelId, AggregateId>(modelId, domainMessage, entity, metadata);
    action.metadata.playhead = playhead;
    return action;
  }

  public createActions<ReadModelId extends Identity, AggregateId extends Identity>(
    modelId: ReadModelId,
    aggregateId: AggregateId,
    entity: EntityName,
    events: DomainEvent[],
    startPlayhead: Playhead = INITIAL_PLAYHEAD,
    metadata: { entity?: string, [extraProps: string]: any } = {}) {
    let playhead = startPlayhead;
    return events.map((event: DomainEvent) => {
      playhead += 1;
      return this.createAction(modelId, aggregateId, entity, event, playhead, Object.assign({}, metadata));
    });
  }

  public getReduxReadModelTestContexts(): List<ReduxReadModelTestContext<Identity, any>> {
    return Map(this.models.map).filter((context) => {
      return context instanceof ReduxReadModelTestContext;
    }).toList() as any;
  }

  protected async getTransmittedActions<State extends Record<any>>(state?: State, options?: any) {
    await this.thenWaitUntilProcessed();
    let actionsActual: SerializableAction[] = [];
    if (state) {
      const gatewayFactory = this.getActionGateway(state);
      if (options) {
        actionsActual = gatewayFactory.getMock(options).getTransmittedActions();
      } else {
        actionsActual = gatewayFactory.gateways.map((gateway) => List(gateway.getTransmittedActions()))
          .flatten()
          .toList()
          .toArray();
      }
    } else {
      actionsActual = this
        .getReduxReadModelTestContexts()
        .map(context => context.gatewayFactory)
        .map((gatewayFactory) => gatewayFactory.gateways.map((gateway) => List(gateway.getTransmittedActions())))
        .flatten(0)
        .toList()
        .toArray();
    }
    return actionsActual;
  }

}
