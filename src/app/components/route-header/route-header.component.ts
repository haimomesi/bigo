import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-route-header',
  templateUrl: './route-header.component.html',
  styleUrls: ['./route-header.component.scss']
})
export class RouteHeaderComponent implements OnInit {

  @Input() name: string;
  @Output() onAdd: EventEmitter<any> = new EventEmitter();

  appName: string = 'O';

  constructor(private router: Router) { }

  ngOnInit() {
  }

  add(): void {
    this.onAdd.emit();
  }

  home(): void {
    this.router.navigate(['']);
  }

}
