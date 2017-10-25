import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Design } from '../../shared/classes/design';
import 'rxjs/add/operator/toPromise';
import { AuthHttp } from 'angular2-jwt';

@Injectable()
export class DesignService {

  private backendUrl = 'api/';

  constructor(private http: Http, private authHttp: AuthHttp) {}

  // Implement a method to get the public deals
  getDesigns() {
    return this.authHttp
      .get(this.backendUrl + 'designs')
      .toPromise()
      .then(response=>response.json() as Array<Design>[])
      .catch(this.handleError);
  }

  create(design: Design) {

    const formData: any = new FormData();

    formData.append("guid", design.guid);
    formData.append("title", design.title);
    formData.append("keywords", design.keywords);
    formData.append("frontPrint_1800_2400", design.frontPrint_1800_2400, design.frontPrint_1800_2400['name']);
    formData.append("frontPrint_1500_1800", design.frontPrint_1500_1800, design.frontPrint_1500_1800['name']);
    formData.append("frontPrint_1500_1500", design.frontPrint_1500_1500, design.frontPrint_1500_1500['name']);
    formData.append("socketId", design.socketId);
    
    return this.authHttp.post(this.backendUrl + 'design/create', formData).toPromise();
  }

  // Implement a method to handle errors if any
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

}
