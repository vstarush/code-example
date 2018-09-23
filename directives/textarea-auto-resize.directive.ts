import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appTextareaAutoResize]'
})

export class TextareaAutoResizeDirective {
  @Input('appTextareaAutoResize') value;

  constructor(private el: ElementRef) { }

  ngOnChanges() {
    this.el.nativeElement.value = this.value;
    this.el.nativeElement.style.height = 0 + 'px';
    this.el.nativeElement.style.height = this.el.nativeElement.scrollHeight + 'px';
  }
}
