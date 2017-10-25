import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

@Injectable()
export class SharedService {

  //public mainLoading: boolean = false;
  public socket = io('http://localhost:3000');
  
  constructor() {}

}
