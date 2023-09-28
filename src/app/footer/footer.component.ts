import {Component, inject} from '@angular/core';
import {GlobalService} from "../global.service";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  private globalService = inject(GlobalService);
  protected readonly version = this.globalService.version;
  protected readonly title = this.globalService.title;
}
