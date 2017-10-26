import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable()
export class SharedService {
  
  //public mainLoading: boolean = false;
  public socket = io(environment.resource);
  
  constructor() {}
  
}