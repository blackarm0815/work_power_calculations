interface Hardware {
  displayName: string | null;
  installStatus: number | null;
  sysUpdatedOn: number | null;
  trustRate: number | null;
}
const showHardware = (
  hardwareInput: Hardware,
) => {
  const outputPre = document.getElementById('result');
  if (outputPre !== null) {
    outputPre.innerText = JSON.stringify(hardwareInput, null, 2);
  }
};
const getFromServer = (
  rackSysId: string,
) => {
  let tempHardware: Hardware;
  // @ts-ignore
  this.data.rackSysId = rackSysId;
  // @ts-ignore
  this.data.getAlmHardware = true;
  // @ts-ignore
  this.server.update().then(() => {
    // @ts-ignore
    this.data.getAlmHardware = true;
    // @ts-ignore
    if (this.data.foundHardware !== undefined) {
      // @ts-ignore
      tempHardware = this.data.foundHardware;
      showHardware(tempHardware);
    }
  });
};
const goFindHardware = () => {
  const inputBox = <HTMLInputElement>document.getElementById('hardwareFinder');
  let isValidInput = false;
  if (inputBox !== null) {
    const givenHardwareSysId = inputBox.value;
    if (givenHardwareSysId !== '') {
      getFromServer(givenHardwareSysId);
      isValidInput = true;
    }
  }
  if (!isValidInput) {
    console.log('something went wrong');
  }
};
const setEventListener = () => {
  const goButton = document.getElementById('go');
  if (goButton !== null) {
    goButton.addEventListener('click', goFindHardware);
  }
};
setEventListener();
