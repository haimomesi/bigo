import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-designs',
  templateUrl: './designs.component.html',
  styleUrls: ['./designs.component.scss'],
  host: { 'class': 'router-space' }
})
export class DesignsComponent implements OnInit {
  
  constructor() { }

  ngOnInit() {
  }

  addDesign(){
    alert('Design Add');
  }

}
