import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: "log"
})
export class LogPipe implements PipeTransform {
  public transform(value: any[]): void {
    console.log(...value);
    return;
  }
}



  