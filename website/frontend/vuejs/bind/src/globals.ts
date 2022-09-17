import { reactive, ref, Ref } from 'vue'
import { ChannelDto } from './chat/dto/ChannelDto'

// let channels : ChannelDto[] = [];
// export const store : ChannelDto[] = reactive({
//   chans: []
// })

export const chansRef : Ref<ChannelDto[]> = ref([]);

export function printChans(chans: ChannelDto[]) {
  chans.forEach((chan : ChannelDto) => {
      console.log(`channelName = ${chan.name}`);
      chan.printMsgs();
  });
}
const nbChanNR : Ref<number[]> = ref([]);
function resetNbChanNR() {
	nbChanNR.value = [];
}
const chanDone = ref(false);
function chanReaded(index : number, readed: boolean) {
	chansRef.value[index].readed = readed;
}
