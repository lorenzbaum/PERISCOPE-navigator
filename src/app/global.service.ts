import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  version: string = 'v0.0.3';
  title: string = $localize`:App name|Name of the App:Privacy-friendliness Business Model Navigator`;
  get combinedTitle(): string {
    return `${this.title} (${this.version})`;
  }
}
