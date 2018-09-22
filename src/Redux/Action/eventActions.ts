export const EVENT_DESERIALIZE_FAILED = 'event deserialization failed';

export function eventDeserializationFailed(json: string) {
  return {
    type: EVENT_DESERIALIZE_FAILED,
    json,
  };
}
