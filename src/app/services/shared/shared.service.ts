import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Design } from '../../shared/classes/design';
//import WebSocket from 'ws';

@Injectable()
export class SharedService {
  
  //public mainLoading: boolean = false;
  public socketId;
  public socket;
  public refresh: boolean;
  public designs = [];
  
  constructor() {
    let ws_type = environment.production ? 'wss' : 'ws';
    this.socketId = this.newGuid();
    this.socket= new WebSocket(`${ws_type}://${environment.resource}/?socketId=${this.socketId}`);
  }

  newGuid() {
    return 'xxxxxxxxxxxxyxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}
  
}