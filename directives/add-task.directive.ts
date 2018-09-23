import { Directive, ElementRef, AfterContentInit, Input, ContentChildren, QueryList} from '@angular/core';

@Directive({selector: '[appAddTaskLabel]'})

export class appAddTaskLabelDirective {
  @Input('index') index: number;
  
  constructor(private el: ElementRef){}

  hide(): void {
    this.el.nativeElement.style.display = 'none';
  }

  show(): void {
    this.el.nativeElement.style.display = 'block';
  }
}


@Directive({selector: '[appAddTaskInput]'})

export class appAddTaskInputDirective {
  @Input('index') index: number;
  
  constructor(private el: ElementRef){}

  isEmpty(): boolean {
    return this.el.nativeElement.value === '';
  }
}


@Directive({selector: '[appAddTaskGroup]'})

export class AddTaskGroupDirective implements AfterContentInit {
  @Input('index') index: number;
  @ContentChildren(AddTaskGroupDirective) addTaskGroups : QueryList<AddTaskGroupDirective>
  
  constructor(private el: ElementRef) {}

  ngAfterContentInit() {
    this.addTaskGroups.toArray();
    this.addTaskGroups.map(group => group.hide());
  }

  hide(): void {
    this.el.nativeElement.style.display = 'none';
  }

  show(): void {
    this.el.nativeElement.style.display = 'block';
  }

}