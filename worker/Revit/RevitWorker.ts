const onLoad = (payload: Uint8Array) => {

}
const handleMap = {
  onLoad
}


self.onmessage = (event: MessageEvent) => {
  const { action, payload } = event.data;
  const handler = handleMap[action as keyof typeof handleMap];
  if (handler) handler(payload);

};