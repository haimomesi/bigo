import { Injectable, Renderer2 } from '@angular/core';

@Injectable()
export class Renderer2Service {
  
  constructor(private renderer: Renderer2) { 

  }

  getRenderer(){
    return this.renderer;
  }
  
}
