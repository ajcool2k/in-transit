/*
 * OProc Loader soll aus JSON Dateien/ Objekten die für Oproc sinnvollen Daten extrahieren
 *
 * useage:
 *    ol = new OprocLoader( jsonObject )
 *      or
 *    ol = new OprocLoader( )
 *    ol.fromFile( path )
 *
 * than get some data from it:
 *    let allStakeholder = ol.getStakeholder();
 *    let allChildProcesses = ol.getProcesses();
 *
 */

import { h, Component } from 'preact';
export default class Oproc extends Component {
  constructor( json ) {
    super();
    this.oproc = json;
    console.log("loading Oproc..", this.test_loading_ok() );
  }

  // TESTS //
  test_loading_ok() {
    if( this.oproc.system.id  != '' && this.oproc.system.id != undefined) {
      return 'success';
    }
    else {
      return 'failed';
    }
  }
  // /TESTS //

  subprocessNames(){
    let names = this.oproc.process.childs.map(child => child.name);
    return names;
  }


  processHead(outputFlag) {
    var head = {
      "comment" : this.oproc.process._comment,
      "id": this.oproc.process.id,
      "initiator": this.oproc.process.initiator,
    }
    if( this.oproc.process.reference != '' && this.oproc.process.reference != undefined)
      head.reference = this.oproc.process.reference;

    if(outputFlag == 'str')
      return "comment: "+head.comment+"\nid: "+head.id+"\ninitiator: "+head.initiator;
    else
      return head;
  }
}