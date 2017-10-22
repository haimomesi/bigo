import { Injectable } from "@angular/core";
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Design } from "../../shared/classes/design";
import { DesignService } from "../../services/design/design.service";
import { Observable } from "rxjs/Observable";

@Injectable()
export class DesignsResolver implements Resolve<Array<Design>> {
  constructor(private designService: DesignService) {}
 
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any>|Promise<any>|any {
    return this.designService.getDesigns();
  }
}