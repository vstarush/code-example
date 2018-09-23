import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appGroupTasks]'
})

export class GroupTasksDirective {
  @Input('index') index: number;
  isVisible: boolean = true;

  constructor(private el: ElementRef) { }

  hide(): void {
    this.el.nativeElement.classList.remove('tasks-visible');
    this.isVisible = false;
  }

  show(): void {
    this.el.nativeElement.classList.add('tasks-visible');
    this.isVisible = true;
  }

}


