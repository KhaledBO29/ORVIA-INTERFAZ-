import { Component, input } from '@angular/core';
const paths: Record<string, string> = {
  home: 'm3 10 9-7 9 7 M5 9v12h5v-7h4v7h5V9',
  bank: 'm3 9 9-6 9 6H3 M5 12v6m5-6v6m4-6v6m5-6v6 M3 21h18',
  wallet: 'M4 6h15v14H4z M4 6V4h12 M15 11h6v5h-6z',
  box: 'm3 7 9-4 9 4-9 4-9-4 M3 7v12l9 4 9-4V7 M12 11v12 M7 5l10 4',
  cart: 'M2 3h3l3 13h11l3-10H6 M9 21h.01 M18 21h.01',
  users:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M17 4a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-4 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  file: 'M14 2H5v20h14V7z M14 2v6h5 M8 12h8 M8 16h6',
  truck:
    'M1 4h13v13H1z M14 9h5l4 5v3h-9 M8 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0 M21 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
  chart: 'M4 3v18h18 M8 15l4-6 4 3 5-8',
  check: 'M4 12l5 5L20 6',
  settings:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M10 2h4l1 3 3 1 3 3-1 3 1 3-3 3-3 1-1 3h-4l-1-3-3-1-3-3 1-3-1-3 3-3 3-1z',
  search: 'M20 20l-5-5 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  arrow: 'm9 5 7 7-7 7',
  calendar: 'M4 5h16v16H4z M8 2v6 M16 2v6 M4 10h16',
  plus: 'M12 4v16 M4 12h16',
  download: 'M12 3v12 m-5-5 5 5 5-5 M4 16v5h16v-5',
  close: 'm6 6 12 12 M6 18 18 6',
  help: 'M9 8a3 3 0 1 1 4 3v3 M12 17h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
};
@Component({
  selector: 'app-icon',
  template:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="path()" /></svg>',
  styles: [
    ':host{display:inline-flex;width:19px;height:19px;flex-shrink:0}svg{width:100%;height:100%}',
  ],
})
export class Icon {
  readonly name = input('box');
  path() {
    return paths[this.name()] ?? paths['box'];
  }
}
